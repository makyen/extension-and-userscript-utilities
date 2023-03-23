//name:         executeInPage
//description:  Executes a function or code text in the page context, duplicating the function and provided objects into the page.
//version:      1.1.0

//  For easier access, it's common to use something like:
//    const executeInPage = makyenUtilities.executeInPage;

/* globals makyenUtilities */
(function (userscriptScope, featuresObj) {
    //All of the utilities are placed under a single object. This is to pollute the global
    //  namespace as little as possible.
    //Old versions of some makyenUtilities used implict global creation.  At least in
    //  Firefox using Tampermonkey, doing that leaks into the real window global.  From the
    //  point of view of the makyenUtilities, that can result in different versions of the
    //  utilities being leaked from one userscript or another and/or masking the implicitly
    //  created makyenUtilities Object once another is created in the current global scope.
    //  This was resolved by explicitly finding the userscriptScope, but we accomodate
    //  potential older versions of some scripts by incorporating whatever exists in the
    //  actual global scope into the makyenUtilities in the userscriptScope while overwriting
    //  any properties we're modifying/creating in this script.
    const maybeImplicitlyCreatedMakyenUtilities = makyenUtilities; // eslint-disable-line no-undef
    userscriptScope.makyenUtilities = Object.assign({}, maybeImplicitlyCreatedMakyenUtilities || {}, userscriptScope.makyenUtilities || {}, featuresObj);
})(this, (function () {
    function executeInPage(toRunInPage, leaveInPage, id) { // + additional arguments for toRunInPage (if a function)
        'use strict';
        /* Execute code in the page context.
         *  toRunInPage can be:
         *    Function   If a Function, then any arguments beyond id are passed to
         *                 that function in the page context.
         *    String     If a String, then the text is placed verbatim in a <script>.
         *
         * When a Function is provided as toRunInPage, any additional arguments passed to this
         * executeInPage are placed into the page and passed to the toRunInPage function.
         *   Such arguments can be:
         *     Object, Array, Function, RegExp, Date, and/or
         *     other primitives (including Boolean, null, undefined,
         *     Number, String, but not Symbol).
         *   Circular references are not supported.
         *   Prototypes are not copied.
         *
         * Using () => doesn't set arguments, so can't use it to define this function.
         * This has to be done without jQuery, as jQuery creates the script
         * within this context, not the page context, which results in
         * permission denied to run the function.
         */
        function convertToText(toTextArgs) {
            //This uses the fact that the arguments are converted to text which is
            //  interpreted within a <script>. That means we can create other types of
            //  objects by recreating their normal JavaScript representation.
            //  It's actually easier to do this without JSON.stringify() for the whole
            //  Object/Array.
            let asText = '';
            let level = 0;

            function lineSeparator(adj, isntLast) {
                level += adj - ((typeof isntLast === 'undefined' || isntLast) ? 0 : 1);
                asText += (isntLast ? ',' : '') + '\n' + (new Array((level * 2) + 1)).join('');
            }

            function recurseObject(obj) {
                if (Array.isArray(obj)) {
                    asText += '[';
                    lineSeparator(1);
                    obj.forEach(function(value, index, array) {
                        recurseObject(value);
                        lineSeparator(0, index !== array.length - 1);
                    });
                    asText += ']';
                } else if (obj === null) {
                    asText += 'null';
                } else if (obj === void (0)) {
                    //undefined
                    asText += 'void(0)';
                } else if (Number.isNaN(obj)) {
                    //Special cases for Number
                    //Not a Number (NaN)
                    asText += 'Number.NaN';
                } else if (obj === 1 / 0) {
                    // +Infinity
                    asText += '1/0';
                } else if (obj === 1 / -0) {
                    // -Infinity
                    asText += '1/-0';
                } else if (obj instanceof RegExp || typeof obj === 'function') {
                    //function
                    asText += obj.toString();
                } else if (obj instanceof Date) {
                    asText += 'new Date("' + obj.toJSON() + '")';
                } else if (typeof obj === 'object') {
                    asText += '{';
                    lineSeparator(1);
                    Object.keys(obj).forEach(function(prop, index, array) {
                        asText += JSON.stringify(prop) + ': ';
                        recurseObject(obj[prop]);
                        lineSeparator(0, index !== array.length - 1);
                    });
                    asText += '}';
                } else if (['boolean', 'number', 'string'].indexOf(typeof obj) > -1) {
                    asText += JSON.stringify(obj);
                } else {
                    console.log('Didn\'t handle: typeof obj:', typeof obj, '::  obj:', obj);
                }
            }
            recurseObject(toTextArgs);
            return asText;
        }
        const newScript = document.createElement('script');
        if (typeof id === 'string' && id) {
            newScript.id = id;
        }
        const args = [];
        //Using .slice(), or other Array methods, on arguments prevents optimization.
        for (let index = 3; index < arguments.length; index++) {
            args.push(arguments[index]);
        }
        if (typeof toRunInPage === 'function') {
            newScript.textContent = '(' + toRunInPage.toString() + ').apply(null,' +
                convertToText(args) + ');';
        } else if (typeof toRunInPage === 'string') {
            newScript.textContent = toRunInPage;
        }
        (document.head || document.documentElement).appendChild(newScript);
        if (!leaveInPage) {
            //Synchronous scripts are executed immediately and can be immediately removed.
            //Scripts with asynchronous functionality *may* need to remain in the page
            //  until complete. Exactly what's needed depends on actual usage.
            newScript.parentNode.removeChild(newScript);
        }
        return newScript;
    }

    return {executeInPage};
})());
