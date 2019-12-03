/**
 * Little helper for loading (and rendering) mustache templates. Desgined to work
 * with jquery and requirejs (and mustache, obviously!)
 * 
 * by Luke (medialight.com.au)
 */
(function (root, factory) {
    "use strict";
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS module is defined  (needs testing!)
        module.exports = factory(require("jquery"), require("mustache"));
    } else if (typeof define === "function" && define.amd) {
        // AMD module is defined
        // Register as an anonymous AMD module:
        define(["jquery", "mustache"], factory);

    } else {
        // 
        root.tashwax = factory(root.jQuery, root.Mustache);
    }

}(this, function ($, Mustache) {

    return {
        urlBase: '', // base url for templates 
        loadQueue: [], // templates to load
        loader: '<div class="spinner"></div>',
        templateCache: {}, // cache of loaded templates 
        setUrlBase: function (url) {
            this.urlBase = url;
            return this; // for chaining
        },
        /**
         * Load a template; If the template has already been loaded (and is in
         * the memory cache) make the callback immediately. Otherwise, wait until
         * until the template is loaded.
         * 
         * @param {type} src
         * @param {type} callback
         * @returns {undefined}
         */
        loadTemplate: function (src, callback) {
            // if we have already loaded a template, use it
            if (this.templateCache[src]) {
                callback(this.templateCache[src], src);
            } else {
                // otherwise load (if not alreayd in the load queue)
                var me = this;
                if (!this.inLoadQueue(src)) {
                    // add to queue and load it
                    this.loadQueue.push({src: src, callback: callback});
                    var url = this.urlBase + src;
                    $.get(url, {src: src}, function (template, textStatus, jqXhr) {
                        me.templateCache[src] = template;
                        me.callQueue(src, template);
                    });
                } else {
                    // The src is already queued for loading (so a GET request will have already been made, 
                    // therefore we dont need to make another ajax call... but we still add to the queue 
                    // so this callback can get made when the src is loaded)
                    this.loadQueue.push({src: src, callback: callback});
                }
            }
            return this;
        },
        /**
         * Load a template and render the result into an element or make a callback
         * 
         * @param {type} src
         * @param {type} data
         * @param {type} $target is either a jQuery object or a callback function
         * @returns {undefined}
         */
        loadAndRender: function (src, data, target) {
            if (target instanceof jQuery) {
                // target is a jquery wrapped element (hopefully!)
                target.html(this.loader);
            }
            this.loadTemplate(src, function (tpl) {
                if (target instanceof jQuery) {
                    target.html(Mustache.render(tpl, data));
                } else {
                    // assume its a callback function ?
                    if (target && {}.toString.call(target) === '[object Function]')
                    {
                        target(Mustache.render(tpl, data));
                    }
                }
            });
        },
        /**
         * Render 'in memory' template 
         * @param {type} tpl
         * @param {type} data
         * @returns {unresolved}
         */
        render: function (tpl, data) {
            return Mustache.render(tpl, data);
        },
        /**
         * Check if the template (src) is in the queue
         * @param {type} src
         * @returns {Boolean}
         */
        inLoadQueue: function (src) {
            var i, mx = this.loadQueue.length;
            for (i = 0; i < mx; i++) {
                if (this.loadQueue[i].src === src) {
                    return true;
                }
            }
        },
        /**
         * Template for specific src has loaded... so make callbacks for anything
         * in the queue waiting for that template (and removed them)
         * 
         * @param {type} src
         * @param {type} template
         * @returns {undefined}
         */
        callQueue: function (src, template) {
            var i, mx = this.loadQueue.length, newQ = [];
            for (i = 0; i < mx; i++) {
                if (this.loadQueue[i].src === src) {
                    this.loadQueue[i].callback(template, src);
                } else {
                    newQ.push(this.loadQueue[i]);
                }
            }
            this.loadQueue = newQ;
        }
    };
}));
