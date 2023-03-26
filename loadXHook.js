//name:              Load XHook
//description:       Loads XHook into the page and passes handlers to/from it.
//version:           1.0.0
//base location:     makyenUtilities.xhook
//
//requires:          makyenUtilities.executeInPage (version >= 1.2.0)
//uses code from:    https://github.com/jpillora/xhook

/*
 * XHook allows you to add before and after hooks to XHR and fetch requests made in the page context.
 *
 * Requires: https://cdn.jsdelivr.net/gh/makyen/extension-and-userscript-utilities@3b1b0aeae424bfca448d72d60a3dc998d5c53406/executeInPage.js
 * or later.
 *
 */

/* globals makyenUtilities */ //eslint-disable-line no-redeclare

(function (userscriptScope, featuresObj) {
    //All of the utilities are placed under a single object. This is to pollute the global
    //  namespace as little as possible.
    userscriptScope.makyenUtilities = Object.assign({}, userscriptScope.makyenUtilities || {}, featuresObj);
})(this, (function () {
    'use strict';
    const xhook = (function() {
        /* While it might be notably more overhead to have, potentially, several XHook instances
         *   loaded into the page, it's quite a bit cleaner for each script which is using
         *   this to not need to be concerned about another script enabling/disabling XHook in
         *   its entirety. Having a separate instance of XHook for each script loading this
         *   makes it substantially less likely that there will be cross-script interference.
         */
        function getAnIdent() {
            return Date.now().toString() + Math.random().toString().slice(2);
        }
        const thisInstanceId = getAnIdent();

        /* The XHook code has been modified to escape (\\|`|\$\{) where used in the code
         *    and to add ${thisInstanceId} to the global xhook variable name.
         * Source URL: https://jpillora.com/xhook/dist/xhook.min.js
         * Convert to string: https://regex101.com/r/fbo0lu/1
         */
        const xhookCodeText = `
//XHook - v1.5.5 - https://github.com/jpillora/xhook
//Jaime Pillora <dev@jpillora.com> - MIT Copyright 2022
var xhook${thisInstanceId}=function(){"use strict";Array.prototype.indexOf||(Array.prototype.indexOf=function(e){for(let t=0;t<this.length;t++){if(this[t]===e)return t}return-1});const e=(e,t)=>Array.prototype.slice.call(e,t);let t=null;"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?t=self:"undefined"!=typeof global?t=global:window&&(t=window);const n="undefined"!=typeof navigator&&navigator.useragent?navigator.userAgent:"";let o=null;(/msie (\\d+)/.test(n.toLowerCase())||/trident\\/.*; rv:(\\d+)/.test(n.toLowerCase()))&&(o=parseInt(RegExp.$1,10));const r=t,s=t.document,a=["load","loadend","loadstart"],i=["progress","abort","error","timeout"],c=e=>["returnValue","totalSize","position"].includes(e),u=function(e,t){for(let n in e){if(c(n))continue;const o=e[n];try{t[n]=o}catch(e){}}return t},l=function(e,t,n){const o=e=>function(o){const r={};for(let e in o){if(c(e))continue;const s=o[e];r[e]=s===t?n:s}return n.dispatchEvent(e,r)};for(let r of Array.from(e))n._has(r)&&(t[\`on\${r}\`]=o(r))},d=function(e){if(s&&null!=s.createEventObject){const t=s.createEventObject();return t.type=e,t}try{return new Event(e)}catch(t){return{type:e}}},f=function(t){let n={};const o=e=>n[e]||[],r={addEventListener:function(e,t,r){n[e]=o(e),n[e].indexOf(t)>=0||(r=void 0===r?n[e].length:r,n[e].splice(r,0,t))},removeEventListener:function(e,t){if(void 0===e)return void(n={});void 0===t&&(n[e]=[]);const r=o(e).indexOf(t);-1!==r&&o(e).splice(r,1)},dispatchEvent:function(){const n=e(arguments),s=n.shift();t||(n[0]=u(n[0],d(s)));const a=r[\`on\${s}\`];a&&a.apply(r,n);const i=o(s).concat(o("*"));for(let e=0;e<i.length;e++){i[e].apply(r,n)}},_has:e=>!(!n[e]&&!r[\`on\${e}\`])};return t&&(r.listeners=t=>e(o(t)),r.on=r.addEventListener,r.off=r.removeEventListener,r.fire=r.dispatchEvent,r.once=function(e,t){var n=function(){return r.off(e,n),t.apply(null,arguments)};return r.on(e,n)},r.destroy=()=>n={}),r};var p=function(e,t){let n;switch(null==t&&(t={}),typeof e){case"object":var o=[];for(let t in e){const r=e[t];n=t.toLowerCase(),o.push(\`\${n}:\\t\${r}\`)}return o.join("\\n")+"\\n";case"string":o=e.split("\\n");for(let e of Array.from(o))if(/([^:]+):\\s*(.+)/.test(e)){n=null!=RegExp.$1?RegExp.$1.toLowerCase():void 0;const e=RegExp.$2;null==t[n]&&(t[n]=e)}return t}return[]};const h=f(!0),v=e=>void 0===e?null:e,y=r.XMLHttpRequest,E=function(){const e=new y,t={};let n,r,s,c=null;var d=0;const E=function(){if(s.status=c||e.status,-1===c&&o<10||(s.statusText=e.statusText),-1===c);else{const t=p(e.getAllResponseHeaders());for(let e in t){const n=t[e];if(!s.headers[e]){const t=e.toLowerCase();s.headers[t]=n}}}},g=function(){b.status=s.status,b.statusText=s.statusText},m=function(){n||b.dispatchEvent("load",{}),b.dispatchEvent("loadend",{}),n&&(b.readyState=0)},x=function(e){for(;e>d&&d<4;)b.readyState=++d,1===d&&b.dispatchEvent("loadstart",{}),2===d&&g(),4===d&&(g(),"text"in s&&(b.responseText=s.text),"xml"in s&&(b.responseXML=s.xml),"data"in s&&(b.response=s.data),"finalUrl"in s&&(b.responseURL=s.finalUrl)),b.dispatchEvent("readystatechange",{}),4===d&&(!1===t.async?m():setTimeout(m,0))},L=function(e){if(4!==e)return void x(e);const n=h.listeners("after");var o=function(){if(n.length>0){const e=n.shift();2===e.length?(e(t,s),o()):3===e.length&&t.async?e(t,s,o):o()}else x(4)};o()};var b=f();t.xhr=b,e.onreadystatechange=function(t){try{2===e.readyState&&E()}catch(e){}4===e.readyState&&(r=!1,E(),function(){if(e.responseType&&"text"!==e.responseType)"document"===e.responseType?(s.xml=e.responseXML,s.data=e.responseXML):s.data=e.response;else{s.text=e.responseText,s.data=e.responseText;try{s.xml=e.responseXML}catch(e){}}"responseURL"in e&&(s.finalUrl=e.responseURL)}()),L(e.readyState)};const w=function(){n=!0};b.addEventListener("error",w),b.addEventListener("timeout",w),b.addEventListener("abort",w),b.addEventListener("progress",(function(t){d<3?L(3):e.readyState<=3&&b.dispatchEvent("readystatechange",{})})),"withCredentials"in e&&(b.withCredentials=!1),b.status=0;for(let e of Array.from(i.concat(a)))b[\`on\${e}\`]=null;if(b.open=function(e,o,a,i,c){d=0,n=!1,r=!1,t.headers={},t.headerNames={},t.status=0,t.method=e,t.url=o,t.async=!1!==a,t.user=i,t.pass=c,s={},s.headers={},L(1)},b.send=function(n){let o,c;for(o of["type","timeout","withCredentials"])c="type"===o?"responseType":o,c in b&&(t[o]=b[c]);t.body=n;const d=h.listeners("before");var f=function(){if(!d.length)return function(){for(o of(l(i,e,b),b.upload&&l(i.concat(a),e.upload,b.upload),r=!0,e.open(t.method,t.url,t.async,t.user,t.pass),["type","timeout","withCredentials"]))c="type"===o?"responseType":o,o in t&&(e[c]=t[o]);for(let n in t.headers){const o=t.headers[n];n&&e.setRequestHeader(n,o)}e.send(t.body)}();const n=function(e){if("object"==typeof e&&("number"==typeof e.status||"number"==typeof s.status))return u(e,s),"data"in e||(e.data=e.response||e.text),void L(4);f()};n.head=function(e){u(e,s),L(2)},n.progress=function(e){u(e,s),L(3)};const p=d.shift();1===p.length?n(p(t)):2===p.length&&t.async?p(t,n):n()};f()},b.abort=function(){c=-1,r?e.abort():b.dispatchEvent("abort",{})},b.setRequestHeader=function(e,n){const o=null!=e?e.toLowerCase():void 0,r=t.headerNames[o]=t.headerNames[o]||e;t.headers[r]&&(n=t.headers[r]+", "+n),t.headers[r]=n},b.getResponseHeader=e=>v(s.headers[e?e.toLowerCase():void 0]),b.getAllResponseHeaders=()=>v(p(s.headers)),e.overrideMimeType&&(b.overrideMimeType=function(){e.overrideMimeType.apply(e,arguments)}),e.upload){let e=f();b.upload=e,t.upload=e}return b.UNSENT=0,b.OPENED=1,b.HEADERS_RECEIVED=2,b.LOADING=3,b.DONE=4,b.response="",b.responseText="",b.responseXML=null,b.readyState=0,b.statusText="",b};E.UNSENT=0,E.OPENED=1,E.HEADERS_RECEIVED=2,E.LOADING=3,E.DONE=4;var g={patch(){y&&(r.XMLHttpRequest=E)},unpatch(){y&&(r.XMLHttpRequest=y)},Native:y,Xhook:E};const m=r.fetch,x=function(e,t){null==t&&(t={headers:{}});let n=null;e instanceof Request?n=e:t.url=e;const o=h.listeners("before"),r=h.listeners("after");return new Promise((function(e,s){let a=e;const i=function(){return t.headers&&(t.headers=new Headers(t.headers)),n||(n=new Request(t.url,t)),u(t,n)};var c=function(e){if(!r.length)return a(e);const t=r.shift();return 2===t.length?(t(i(),e),c(e)):3===t.length?t(i(),e,c):c(e)};const l=function(t){if(void 0!==t){const n=new Response(t.body||t.text,t);return e(n),void c(n)}d()};var d=function(){if(!o.length)return void f();const e=o.shift();return 1===e.length?l(e(t)):2===e.length?e(i(),l):void 0},f=()=>m(i()).then((e=>c(e))).catch((function(e){return a=s,c(e),s(e)}));d()}))};var L={patch(){m&&(r.fetch=x)},unpatch(){m&&(r.fetch=m)},Native:m,Xhook:x};const b=h;return b.EventEmitter=f,b.before=function(e,t){if(e.length<1||e.length>2)throw"invalid hook";return b.on("before",e,t)},b.after=function(e,t){if(e.length<2||e.length>3)throw"invalid hook";return b.on("after",e,t)},b.enable=function(){g.patch(),L.patch()},b.disable=function(){g.unpatch(),L.unpatch()},b.XMLHttpRequest=g.Native,b.fetch=L.Native,b.headers=p,b.enable(),b}();
//# sourceMappingURL=xhook.min.js.map
`

        const xhookId = `makyen-XHook-js-${thisInstanceId}`;
        const xhookLoadedClass = `makyen-XHook-loaded-${thisInstanceId}`;
        let leaveInPage = false;

        // For debugging, it might be desired to not remove the <script> elements used to
        // run code in the page context.
        function setLeaveInPage(value) {
            leaveInPage = value;
        }

        // Loads XHook into the page for this userscript/extension
        function load() {
            const haveLoadedXHook = document.getElementById(xhookId) !== null || document.documentElement.classList.contains(xhookLoadedClass);
            if (!haveLoadedXHook) {
                makyenUtilities.executeInPage(xhookCodeText, leaveInPage, xhookId);
                document.documentElement.classList.add(xhookLoadedClass);
            }
        }

        // Add an in-page before handler
        function before(handler, index) {
            // Adds a before handler in the page context. The request can be modified.
            runMethod('before', handler, index);
        }

        // Add an in-page after handler
        function after(handler, index) {
            // Adds an after handler in the page context. The request can be modified.
            runMethod('after', handler, index);
        }

        // Enable this instance of XHook. Does not affect other instances used by other userscripts/extensions.
        function enable() {
            // Enables XHook
            runMethod('enable');
        }

        // Disable this instance of XHook. Does not affect other instances used by other userscripts/extensions.
        function disable() {
            // Disables XHook
            runMethod('disable');
        }

        // Run an XHook method in this instance of XHook in the page context.
        function runMethod(outerMethod, outerHandler, outerIndex) {
            function inPageRunXHookMethod(instanceId, method, handler, index) {
                const argsWithoutMethod = [...arguments].slice(2);
                window[`xhook${instanceId}`][method].apply(this, argsWithoutMethod);
            }
            makyenUtilities.executeInPage(inPageRunXHookMethod, leaveInPage, `${xhookId}-${outerMethod}-${Date.now()}`, thisInstanceId, ...arguments);
        }

        // Convenience function:  installs a before handler which logs requests. You can call
        // logBefore() more than once to see the request prior to it being sent to your own
        // before handler and subsequent to your before handler changing the request.
        function logBefore() {
            function inPageLogXHookBefore(request) {
                console.log('XHookBefore:', '::  request:', request);
            }
            before(inPageLogXHookBefore);
        }

        // Convenience function:  installs an after handler which logs requests and
        // responses. You can call logAfer() more than once to see the request and response
        // prior to it being sent to your own after handler and subsequent your after
        // handler changing the response.
        function logAfter() {
            function inPageLogXHookAfter(request, response) {
                console.log('XHookAfter:', '::  request:', request, '::  response:', response);
            }
            after(inPageLogXHookAfter);
        }

        return {
            version: '1.0.0',
            xhookVersion: '1.5.5',
            instanceId: thisInstanceId,
            load,
            before,
            after,
            enable,
            disable,
            runMethod,
            setLeaveInPage,
            logBefore,
            logAfter,
        };
    })();

    return {xhook};
})());

/* Typical use is:
    //@require     https://cdn.jsdelivr.net/gh/makyen/extension-and-userscript-utilities@3b1b0aeae424bfca448d72d60a3dc998d5c53406/executeInPage.js
    //@require     https://cdn.jsdelivr.net/gh/makyen/extension-and-userscript-utilities@< commit ID >/loadXHook.js
    makyenUtilities.xhook.load();
 */
