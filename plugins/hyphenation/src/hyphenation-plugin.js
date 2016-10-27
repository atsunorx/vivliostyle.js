
/**
 * Copyright 2016 Vivliostyle Inc.
 * @fileoverview Hyphenation plugin
 */
goog.provide("vivliostyle.plugins.hyphenation");
require("node_modules/hypher/lib/hypher");

goog.require("vivliostyle.plugin");

goog.scope(function() {

    /**
     * @constructor
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore = function() {
        /** @type {!adapt.net.JSONStore} */ this.jsonStore =
            adapt.net.newJSONStore();
    };

    /**
     * @param {!string} lang
     * @return {!adapt.task.Result.<adapt.base.JSON>}
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.load = function(lang) {
        var url = this.resolveDictionaryUrl(lang);
        return this.jsonStore.load(url);
    };

    /**
     * @param {!string} lang
     * @return {!string} url
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.resolveDictionaryUrl = function(lang) {
        return adapt.base.resolveURL(lang + ".js",
            adapt.base.baseURL  + "plugins/hyphenation/resources/");
    };


});
