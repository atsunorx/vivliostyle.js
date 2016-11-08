/**
 * Copyright 2016 Vivliostyle Inc.
 * @fileoverview Plugin mechanism
 */
goog.provide("vivliostyle.plugin");

goog.require("vivliostyle.namespace");
goog.require("vivliostyle.logging");

goog.scope(function() {

    /**
     * Type of implemented hooks.
     * @enum {string}
     */
    vivliostyle.plugin.HOOKS = {
        /**
         * Called when a single property declaration is parsed.
         *
         * The hook is called with an object with the following properties:
         *   {string} name: Property name
         *   {!adapt.css.Val} value: Property value
         *   {boolean} important: Whether '!important' flag is present or not
         * Functions called by this hook are expected to return a value with the same type as the above.
         * The declaration is then replaced by the returned value.
         *
         * Note that a shorthand declaration is not directly passed to this hook.
         * After the shorthand declaration is interpreted and broken into non-shorthand declarations, the hook is called for each of the non-shorthand declarations.
         */
        "SIMPLE_PROPERTY": "SIMPLE_PROPERTY",

        /**
         * Called before creating a text node for modifying a text content.
         *
         * The hook is called with an object with the following properties:
         *   {adapt.vtree.NodeContext} nodeContext
         *   {string} sourceTextContent
         *
         * Functions called by this hook are expected to return a adapt.task.Result.<string>.
         * The text content is then replaced by the returned value.
         */
        "PREPROCESS_TEXT_CONTENT": "PREPROCESS_TEXT_CONTENT",

        /**
         * Called before creating a element for modifying a element style.
         *
         * The hook is called with an object with the following properties:
         *   {adapt.vtree.NodeContext} nodeContext
         *   {!Object} style
         */
        "PREPROCESS_ELEMENT_STYLE": "PREPROCESS_ELEMENT_STYLE",

        /**
         * Called before geting adapt.csscasc.polyfilledInheritedProps.
         *
         * The hook return a array of polyfilled inherited property name.
         */
        "POLYFILLED_INHERITED_PROPS": "POLYFILLED_INHERITED_PROPS"
    };

    /** @const */ var HOOKS = vivliostyle.plugin.HOOKS;

    /**
     * @typedef {function(
     *   adapt.vtree.NodeContext,
     *   string
     * ):adapt.task.Result.<string>}
     */
    vivliostyle.plugin.PreProcessTextContentHook;

    /**
     * @typedef {function(
     *   adapt.vtree.NodeContext,
     *   !Object
     * ):undefined}
     */
    vivliostyle.plugin.PreProcessElementStyleHook;

    /**
     * @typedef {function():!Array.<string>}
     */
    vivliostyle.plugin.PolyfilledInheritedPropsHook;

    /**
     * @private
     * @const
     * @type {Object<string, !Array<!function(...)>>}
     */
    vivliostyle.plugin.hooks = {};

    /**
     * Register a function to a hook with the specified name.
     * The registered function is called at appropriate timings by the core code.
     * Arguments passed to the function depend on the hook.
     * When multiple functions are registered, they are called by the order in which they are registered.
     * @param {string} name Name of the hook.
     * @param {!function(...)} fn Function to be registered to the hook.
     */
    vivliostyle.plugin.registerHook = function(name, fn) {
        if (!HOOKS[name]) {
            vivliostyle.logging.logger.warn(new Error("Skipping unknown plugin hook '" + name + "'."));
        } else {
            var hooksForName = vivliostyle.plugin.hooks[name];
            if (!hooksForName) {
                hooksForName = vivliostyle.plugin.hooks[name] = [];
            }
            hooksForName.push(fn);
        }
    };

    /**
     * Remove a function already registered to the specified name.
     * Note that even if the same function are registered multiple times, this method removes only the first one.
     * @param {string} name Name of the hook.
     * @param {!function(...)} fn Function to be removed from the hook.
     */
    vivliostyle.plugin.removeHook = function(name, fn) {
        if (!HOOKS[name]) {
            vivliostyle.logging.logger.warn(new Error("Ignoring unknown plugin hook '" + name + "'."));
        } else {
            var hooksForName = vivliostyle.plugin.hooks[name];
            if (hooksForName) {
                var index = hooksForName.indexOf(fn);
                if (index >= 0) {
                    hooksForName.splice(index, 1);
                }
            }
        }
    };

    /**
     * Get all hooks registered to the specified name.
     * This method is for internal use (from the core code).
     * @param {string} name
     * @returns {!Array.<!function(...)>}
     */
    vivliostyle.plugin.getHooksForName = function(name) {
        var hooksForName = vivliostyle.plugin.hooks[name];
        return hooksForName || [];
    };

    vivliostyle.namespace.exportSymbol("vivliostyle.plugin.registerHook", vivliostyle.plugin.registerHook);
    vivliostyle.namespace.exportSymbol("vivliostyle.plugin.removeHook", vivliostyle.plugin.removeHook);
});
