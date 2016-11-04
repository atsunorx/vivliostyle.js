
/**
 * Copyright 2016 Vivliostyle Inc.
 * @fileoverview Hyphenation plugin
 */
goog.provide("vivliostyle.plugins.hyphenation");

goog.require("vivliostyle.plugin");
var Hypher = require("node_modules/hypher/lib/hypher");

goog.scope(function() {

    /**
     * @typedef {{
     *  leftmin: !number,
     *  rightmin: !number,
     *  patterns: !Object
     * }}
     */
    var HypherDictionary;

    /**
     * @typedef {{
     *  hyphensLeftmin: (number|null),
     *  hyphensRightmin: (number|null),
     *  hyphens: (string|null),
     *  lang: (string|null)
     * }}
     */
    vivliostyle.plugins.hyphenation.StyleAndLang = {};


    /**
     * @param {adapt.net.Response} response
     * @param {adapt.net.JSONStore} store
     * @return {!adapt.task.Result.<HypherDictionary>}
     */
    vivliostyle.plugins.hyphenation.parseDictionary = function(response, store) {
        if (response.status >= 400) return adapt.task.newResult(/** @type {HypherDictionary} */ (null));
        return /** @type {!adapt.task.Result.<HypherDictionary>} */ (adapt.net.parseJSONResource(response, store));
    };

    /**
     * @constructor
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore = function() {
        /** @type {!adapt.net.ResourceStore.<HypherDictionary>} */ this.store =
            new adapt.net.ResourceStore(
                vivliostyle.plugins.hyphenation.parseDictionary,
                adapt.net.XMLHttpRequestResponseType.TEXT);
    };

    /**
     * @param {!string} lang
     * @return {!adapt.task.Result.<HypherDictionary>}
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.load = function(lang) {
        var url = this.resolveDictionaryUrl(lang);
        return this.store.load(url, false);
    };

    /**
     * @param {!string} lang
     * @return {!string} url
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.resolveDictionaryUrl = function(lang) {
        return adapt.base.resolveURL(lang.toLowerCase() + ".json",
            adapt.base.baseURL  + "plugins/hyphenation/resources/");
    };


    /**
     * @constructor
     */
    vivliostyle.plugins.hyphenation.Hyphenator = function() {
        /** @type {!vivliostyle.plugins.hyphenation.HyphenationDictionaryStore} */ this.dictionaryStore =
            new vivliostyle.plugins.hyphenation.HyphenationDictionaryStore();
    };

    /**
     * @param {!string} string
     * @param {!string} lang
     * @param {(number|null)=} leftmin
     * @param {(number|null)=} rightmin
     * @return {!adapt.task.Result.<string>}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.hyphenate = function(string, lang, leftmin, rightmin) {
        /** @type {!adapt.task.Frame.<string>} */ var frame =
            adapt.task.newFrame("hyphenate");
        this.dictionaryStore.load(lang).then(function(dictionary) {
            if (dictionary == null) {
                frame.finish(string);
                return;
            }
            var original = {
                leftmin:  dictionary.leftmin,
                rightmin: dictionary.rightmin
            };
            try {
                this.setHyphenationLimitChars(dictionary, leftmin, rightmin);
                var processed = new Hypher(dictionary).hyphenateText(string);
                frame.finish(processed);
            } finally {
                this.resetHyphenationLimitChars(dictionary, original);
            }
        }.bind(this));
        return frame.result();
    };

    /**
     * @param {!HypherDictionary} dictionary
     * @param {(number|null)=} leftmin
     * @param {(number|null)=} rightmin
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.setHyphenationLimitChars = function(dictionary, leftmin, rightmin) {
        if (leftmin  != null) dictionary.leftmin  = leftmin;
        if (rightmin != null) dictionary.rightmin = rightmin;
    };

    /**
     * @param {!HypherDictionary} dictionary
     * @param {{leftmin:(number|null), rightmin:(number|null)}} original
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.resetHyphenationLimitChars = function(dictionary, original) {
        dictionary.leftmin  = original.leftmin;
        dictionary.rightmin = original.rightmin;
    };

    /**
     * @param {adapt.vtree.NodeContext} context
     * @param {!string} string
     * @return {!adapt.task.Result.<string>}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.hyphenateTextNodeContent = function(context, string) {
        if (/^[\s]*$/.test(string)) return adapt.task.newResult(string);

        var styleAndLang = this.extractElementStyleAndLang(context);
        if (styleAndLang.hyphens != "auto") return adapt.task.newResult(string);
        if (!styleAndLang.lang) return adapt.task.newResult(string);
        return this.hyphenate(string, styleAndLang.lang,
            styleAndLang.hyphensLeftmin, styleAndLang.hyphensRightmin);
    };

    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @return {!vivliostyle.plugins.hyphenation.StyleAndLang}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.extractElementStyleAndLang = function(context) {
        /** @type {!vivliostyle.plugins.hyphenation.StyleAndLang} */ var styleAndLang = {
            lang: null, hyphens: null,
            hyphensLeftmin: null, hyphensRightmin: null
        };
        var collectors = [
            new vivliostyle.plugins.hyphenation.StyleCollector(styleAndLang, "hyphens"),
            new vivliostyle.plugins.hyphenation.StyleCollector(styleAndLang, "hyphensLeftmin"),
            new vivliostyle.plugins.hyphenation.StyleCollector(styleAndLang, "hyphensRightmin"),
            new vivliostyle.plugins.hyphenation.LangCollector(styleAndLang)
        ];
        while (context) {
            collectors.forEach(function(c) { c.collect(context); });
            if (collectors.every(function(c) { return c.isCollected(); })) {
                return styleAndLang;
            }
            context = context.parent;
        }
        return styleAndLang;
    };

    /**
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessElementStyle = function(context, computedStyle) {
        this.preprocessHyphens(context, computedStyle);
        this.preprocessHyphenateLimitChars(context, computedStyle);
    };

    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphens = function(context, computedStyle) {
        var hyphens = computedStyle["hyphens"];
        if (!hyphens || !hyphens.isIdent()) return
        context.hyphens = hyphens.name;
        if (hyphens === adapt.css.ident.auto) {
            computedStyle["hyphens"] = adapt.css.ident.manual;
        }
    };
    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphenateLimitChars = function(context, computedStyle) {
        var hyphenateLimitChars = computedStyle["hyphenate-limit-chars"];
        if (!hyphenateLimitChars
            || !hyphenateLimitChars.isSpaceList()
            || hyphenateLimitChars.values.length <= 1) {
            return;
        }
        /** @type {adapt.css.Val} */ var leftmin  = hyphenateLimitChars.values[1];
        /** @type {adapt.css.Val} */ var rightmin = leftmin;
        if (hyphenateLimitChars.values.length >= 3) {
            rightmin = hyphenateLimitChars.values[2];
        }
        context.hyphensLeftmin  = this.extactInt(leftmin);
        context.hyphensRightmin = this.extactInt(rightmin);
    };

    /**
     * @private
     * @param {adapt.css.Val} val
     * @return {number|null}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.extactInt = function(val) {
        if (!val || !val.isNum()) return null;
        return val.num;
    };

    /**
     *
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.registerHooks = function() {
        var plugin = vivliostyle.plugin;
        plugin.registerHook(plugin.HOOKS.PREPROCESS_TEXT_CONTENT,
            this.hyphenateTextNodeContent.bind(this));
        plugin.registerHook(plugin.HOOKS.PREPROCESS_ELEMENT_STYLE,
            this.preprocessElementStyle.bind(this));
    };

    /**
     * @constructor
     * @param {!vivliostyle.plugins.hyphenation.StyleAndLang} styleAndLang
     * @param {!string} key
     */
    vivliostyle.plugins.hyphenation.PropertyCollector = function(styleAndLang, key) {
        this.styleAndLang = styleAndLang;
        this.key = key;
    };
    /**
     * @param {adapt.vtree.NodeContext} context
     */
    vivliostyle.plugins.hyphenation.PropertyCollector.prototype.collect = function(context) {
    };
    /**
     * @return {boolean}
     */
    vivliostyle.plugins.hyphenation.PropertyCollector.prototype.isCollected = function() {
        return this.styleAndLang[this.key] != null;
    };

    /**
     * @constructor
     * @param {!vivliostyle.plugins.hyphenation.StyleAndLang} styleAndLang
     * @param {!string} styleName
     * @extends {vivliostyle.plugins.hyphenation.PropertyCollector}
     */
    vivliostyle.plugins.hyphenation.StyleCollector = function(styleAndLang, styleName) {
        vivliostyle.plugins.hyphenation.PropertyCollector.call(
            this, styleAndLang, styleName);
    };
    goog.inherits(vivliostyle.plugins.hyphenation.StyleCollector,
        vivliostyle.plugins.hyphenation.PropertyCollector);

    /**
     * @override
     * @param {adapt.vtree.NodeContext} context
     */
    vivliostyle.plugins.hyphenation.StyleCollector.prototype.collect = function(context) {
        if (this.isCollected()) return;
        var style = context[this.key];
        if (style) {
            this.styleAndLang[this.key] = style;
        }
    };

    /**
     * @constructor
     * @param {!vivliostyle.plugins.hyphenation.StyleAndLang} styleAndLang
     * @extends {vivliostyle.plugins.hyphenation.PropertyCollector}
     */
    vivliostyle.plugins.hyphenation.LangCollector = function(styleAndLang) {
        vivliostyle.plugins.hyphenation.PropertyCollector.call(
            this, styleAndLang, "lang");
    };
    goog.inherits(vivliostyle.plugins.hyphenation.LangCollector,
        vivliostyle.plugins.hyphenation.PropertyCollector);
    /**
     * @override
     * @param {adapt.vtree.NodeContext} context
     */
    vivliostyle.plugins.hyphenation.LangCollector.prototype.collect = function(context) {
        if (this.isCollected()) return;
        if (context.sourceNode && context.sourceNode.lang) {
            this.styleAndLang[this.key] = context.sourceNode.lang;
        }
    };

    vivliostyle.plugins.hyphenation.hyphenator =
        new vivliostyle.plugins.hyphenation.Hyphenator();
    vivliostyle.plugins.hyphenation.hyphenator.registerHooks();
});
