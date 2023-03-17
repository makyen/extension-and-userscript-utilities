//name:         executeInPage
//description:  Executes a function in the page context, duplicating the function and provided objects into the page.
//version:      1.0.1

//All of the utilities are placed under a single object. This is to pollute the global
//  namespace as little as possible. For easier access, it's common for me to then use
//  something like:
//    const executeInPage = makyenUtilities.executeInPage;

/* globals makyenUtilities */
if (typeof makyenUtilities === 'undefined') {
    makyenUtilities = {}; // eslint-disable-line no-implicit-globals,no-global-assign
}

makyenUtilities.executeInPage = function(functionToRunInPage, leaveInPage, id) { // + additional arguments for functionToRunInPage
    'use strict';
    //Execute a function in the page context.
    // Any additional arguments passed to this function are passed into the page to the
    // functionToRunInPage.
    // Such arguments must be Object, Array, functions, RegExp,
    // Date, and/or other primitives (Boolean, null, undefined,
    // Number, String, but not Symbol).  Circular references are
    // not supported. Prototypes are not copied.
    // Using () => doesn't set arguments, so can't use it to define this function.
    // This has to be done without jQuery, as jQuery creates the script
    // within this context, not the page context, which results in
    // permission denied to run the function.
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
    newScript.textContent = '(' + functionToRunInPage.toString() + ').apply(null,' +
            convertToText(args) + ');';
    (document.head || document.documentElement).appendChild(newScript);
    if (!leaveInPage) {
        //Synchronous scripts are executed immediately and can be immediately removed.
        //Scripts with asynchronous functionality *may* need to remain in the page
        //  until complete. Exactly what's needed depends on actual usage.
        newScript.parentNode.removeChild(newScript);
    }
    return newScript;
};
