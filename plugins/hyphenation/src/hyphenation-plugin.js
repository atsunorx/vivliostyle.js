
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
     *  leftmin: number,
     *  rightmin: number,
     *  patterns: !Object,
     *  exceptions: string
     * }}
     */
    var HypherDictionary;

    /**
     * @typedef {{
     *  hyphenateLimitChars: Array.<(number|null)>,
     *  hyphens: (string|null),
     *  lang: (string|null)
     * }}
     */
    vivliostyle.plugins.hyphenation.StyleAndLang;

    /**
     * @typedef {{
     *  instance: Hypher,
     *  defaultLeftmin: number,
     *  defaultRightmin: number
     * }}
     */
    vivliostyle.plugins.hyphenation.HypherCache;

    /**
     * @param {adapt.net.Response} response
     * @param {adapt.net.JSONStore} store
     * @return {!adapt.task.Result.<adapt.base.JSON>}
     */
    vivliostyle.plugins.hyphenation.parseDictionary = function(response, store) {
        if (response.status >= 400) return adapt.task.newResult(/** @type {adapt.base.JSON} */ (null));
        return /** @type {!adapt.task.Result.<adapt.base.JSON>} */ (adapt.net.parseJSONResource(response, store));
    };

    /**
     * @constructor
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore = function() {
        /** @type {!adapt.net.ResourceStore.<adapt.base.JSON>} */ this.store =
            new adapt.net.ResourceStore(
                vivliostyle.plugins.hyphenation.parseDictionary,
                adapt.net.XMLHttpRequestResponseType.TEXT);
    };

    /**
     * @param {!string} lang
     * @return {!adapt.task.Result.<HypherDictionary>}
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.load = function(lang) {
        return this.loadDictionary(lang).thenAsync(function(dictionary) {
            if (dictionary && this.exceptionFileUrl != null) {
                return this.loadAndMergeExceptions(dictionary, lang);
            } else {
                return adapt.task.newResult(dictionary);
            }
        }.bind(this));
    };

    /**
     * @private
     * @param {!string} lang
     * @return {!adapt.task.Result.<HypherDictionary>}
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.loadDictionary = function(lang) {
        var url = this.resolveDictionaryUrl(lang);
        return /** @type  {!adapt.task.Result.<HypherDictionary>} */ (this.store.load(url, false));
    };

    /**
     * @private
     * @param {HypherDictionary} dictionary
     * @param {!string} lang
     * @return {!adapt.task.Result.<HypherDictionary>}
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.loadAndMergeExceptions = function(dictionary, lang) {
        return this.store.load(this.exceptionFileUrl, false).thenAsync(function(exceptions) {
            if (exceptions) {
                var exceptionWords = this.collectExceptionWords(lang, exceptions);
                dictionary['exceptions'] = dictionary['exceptions']
                    ? dictionary['exceptions'] + "," + exceptionWords.join(",")
                    : exceptionWords.join(",");
            }
            return adapt.task.newResult(dictionary);
        }.bind(this));
    };
    /**
     * @private
     * @param {!string} lang
     * @param {!Object.<string, Array.<string>>} exceptions
     * @return {!Array.<string>}
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.collectExceptionWords = function(lang, exceptions) {
        if (!exceptions) return [];
        var key = null;
        Object.keys(exceptions).forEach(function(k) {
            if (k.toLowerCase() === lang.toLowerCase()) key = k;
        });
        var words = {};
        this.collectWords(exceptions['all'], words);
        if (key != null) this.collectWords(exceptions[/** @type {string}*/ (key)], words);
        return Object.keys(words).reduce(function(r, k) {
            r.push(words[k]);
            return r;
        }, []).sort();
    };
    /**
     * @private
     * @param {Array.<string>} exceptionWords
     * @param {!Object.<string,string>} words
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.collectWords = function(exceptionWords, words) {
        if (!exceptionWords) return;
        exceptionWords.forEach(function(word) {
            var stripped = word.replace(/\|/g, '');
            words[stripped] = word.replace(/\|/g, '\u2027');
        });
    };

    /**
     * @param {string} exceptionFileUrl
     */
    vivliostyle.plugins.hyphenation.HyphenationDictionaryStore.prototype.setExcpetionFileUrl = function(exceptionFileUrl) {
        exceptionFileUrl = adapt.base.resolveURL(exceptionFileUrl, adapt.base.baseURL);
        if (this.exceptionFileUrl !== exceptionFileUrl) {
            if (this.exceptionFileUrl) this.store.delete(this.exceptionFileUrl);
            this.exceptionFileUrl = exceptionFileUrl;
        }
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
        /** @type {Object.<string, vivliostyle.plugins.hyphenation.HypherCache>} */
        this.hypherCache = {};
    };

    /**
     * @param {!string} string
     * @param {!string} lang
     * @param {(number|null)=} min
     * @param {(number|null)=} leftmin
     * @param {(number|null)=} rightmin
     * @return {!adapt.task.Result.<string>}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.hyphenate = function(string, lang, min, leftmin, rightmin) {
        /** @type {!adapt.task.Frame.<string>} */ var frame =
            adapt.task.newFrame("hyphenate");
        this.getHypherInstance(lang).then(function(cache) {
            if (cache.instance == null) {
                frame.finish(string);
                return;
            }
            try {
                this.setHyphenationLimitChars(cache, leftmin, rightmin);
                var processed = cache.instance.hyphenateText(string, min);
                frame.finish(processed);
            } finally {
                this.resetHyphenationLimitChars(cache);
            }
        }.bind(this));
        return frame.result();
    };

    /**
     * @param {vivliostyle.plugins.hyphenation.HypherCache} cache
     * @param {(number|null)=} leftmin
     * @param {(number|null)=} rightmin
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.setHyphenationLimitChars = function(cache, leftmin, rightmin) {
        if (!cache.instance) return;
        if (leftmin  != null) /** @suppress {const} */ cache.instance.leftMin  = leftmin;
        if (rightmin != null) /** @suppress {const} */ cache.instance.rightMin = rightmin;
    };

    /**
     * @param {vivliostyle.plugins.hyphenation.HypherCache} cache
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.resetHyphenationLimitChars = function(cache) {
        if (!cache.instance) return;
        /** @suppress {const} */ cache.instance.leftMin  = cache.defaultLeftmin;
        /** @suppress {const} */ cache.instance.rightMin = cache.defaultRightmin;
    };

    /**
     * @param {string} lang
     * @return {adapt.task.Result.<vivliostyle.plugins.hyphenation.HypherCache>}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.getHypherInstance = function(lang) {
        if (this.hypherCache[lang]) return adapt.task.newResult(this.hypherCache[lang]);
        /** @type {!adapt.task.Frame.<vivliostyle.plugins.hyphenation.HypherCache>} */ var frame =
            adapt.task.newFrame("getHypherInstance");
        this.dictionaryStore.load(lang).then(function(dictionary) {
            if (dictionary == null) {
                this.hypherCache[lang] = {
                    instance: null,
                    defaultLeftmin: -1,
                    defaultRightmin: -1
                };
            } else {
                this.hypherCache[lang] = {
                    instance: new Hypher(dictionary),
                    defaultLeftmin: dictionary['leftmin'],
                    defaultRightmin: dictionary['rightmin']
                };
            }
            frame.finish(this.hypherCache[lang]);
        }.bind(this));
        return frame.result();
    };

    /**
     * @param {adapt.vtree.NodeContext} context
     * @param {!string} string
     * @return {!adapt.task.Result.<string>}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.hyphenateTextNodeContent = function(context, string) {
        if (/^[\s]*$/.test(string)) return adapt.task.newResult(string);

        var styleAndLang = this.extractElementStyleAndLang(context);
        if (styleAndLang['hyphens'] !== "auto") return adapt.task.newResult(string);
        if (!styleAndLang['lang']) return adapt.task.newResult(string);
        var hyphenateLimitChars = styleAndLang['hyphenateLimitChars'];
        return this.hyphenate(string, styleAndLang['lang'],
            hyphenateLimitChars ? hyphenateLimitChars[0] :null,
            hyphenateLimitChars ? hyphenateLimitChars[1] :null,
            hyphenateLimitChars ? hyphenateLimitChars[2] :null);
    };

    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @return {!vivliostyle.plugins.hyphenation.StyleAndLang}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.extractElementStyleAndLang = function(context) {
        /** @type {!vivliostyle.plugins.hyphenation.StyleAndLang} */ var styleAndLang = {
            'lang': null, 'hyphens': null, 'hyphenateLimitChars': null
        };
        var collectors = [
            new vivliostyle.plugins.hyphenation.PropertyCollector(styleAndLang, "hyphens"),
            new vivliostyle.plugins.hyphenation.PropertyCollector(styleAndLang, "hyphenateLimitChars"),
            new vivliostyle.plugins.hyphenation.PropertyCollector(styleAndLang, "lang")
        ];
        [context, context.parent].some(function(cont) {
            if (!cont) return true;
            collectors.forEach(function(c) { c.collect(cont); });
            return collectors.every(function(c) { return c.isCollected(); });
        });
        return styleAndLang;
    };

    /**
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessElementStyle = function(context, computedStyle) {
        if (!context.inheritedProps) return;
        this.preprocessHyphens(context, computedStyle);
        this.preprocessHyphenateLimitChars(context, computedStyle);
        this.preprocessHyphenateCharacter(context, computedStyle);
    };

    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphens = function(context, computedStyle) {
        var hyphens = context.inheritedProps["hyphens"];
        if (!hyphens) return;
        context['hyphens'] = hyphens;
        if (hyphens === "none") {
            computedStyle["hyphens"] = adapt.css.ident.none;
        } else {
            computedStyle["hyphens"] = adapt.css.ident.manual;
        }
    };
    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphenateLimitChars = function(context, computedStyle) {
        var hyphenateLimitChars =
            /** @type {adapt.css.Val|string|number} */ (context.inheritedProps["hyphenate-limit-chars"]);
        if (!hyphenateLimitChars) return;
        if (typeof hyphenateLimitChars === 'number') {
            context['hyphenateLimitChars'] = [hyphenateLimitChars, null, null];
            return;
        }
        if (hyphenateLimitChars === 'auto') {
            context['hyphenateLimitChars'] = [null, null, null];
            return;
        }
        if (!hyphenateLimitChars.isSpaceList
            || !hyphenateLimitChars.isSpaceList()
            || hyphenateLimitChars.values.length == 0) {
            return;
        }
        /** @type {adapt.css.Val} */ var min      = hyphenateLimitChars.values[0];
        /** @type {adapt.css.Val} */ var leftmin  = null;
        /** @type {adapt.css.Val} */ var rightmin = leftmin;
        if (hyphenateLimitChars.values.length >= 2) {
            leftmin = rightmin = hyphenateLimitChars.values[1];
        }
        if (hyphenateLimitChars.values.length >= 3) {
            rightmin = hyphenateLimitChars.values[2];
        }
        context['hyphenateLimitChars'] = [
            this.extractInt(min),
            this.extractInt(leftmin),
            this.extractInt(rightmin)
        ];
    };
    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphenateCharacter = function(context, computedStyle) {
        var hyphenateCharacter = /** @type {adapt.css.Val|string} */ (context.inheritedProps["hyphenate-character"]);
        if (!hyphenateCharacter) return;
        if (typeof hyphenateCharacter === 'string') {
            computedStyle["hyphenate-character"] =
                adapt.css.getName(hyphenateCharacter);
        } else {
            context.hyphenateCharacter = hyphenateCharacter.str;
            computedStyle["hyphenate-character"] = hyphenateCharacter;
        }
    };
    /**
     * @private
     * @param {adapt.css.Val} val
     * @return {number|null}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.extractInt = function(val) {
        if (!val || !val.isNum()) return null;
        return val.num;
    };

    /**
     * @param {adapt.base.JSON} command
     * @return {{needResize:(?boolean|undefined), needRefresh:(?boolean|undefined)}}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.configure = function(command) {
        if (typeof command["hyphenationExceptionFileUrl"] == "string"
            && command["hyphenationExceptionFileUrl"] !== this.dictionaryStore.exceptionFileUrl) {
            this.dictionaryStore.setExcpetionFileUrl(command["hyphenationExceptionFileUrl"]);
            return { needResize: true };
        }
        return {};
    };

    /**
     * @return {!Array.<string>}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.getPolyfilledInheritedProps = function() {
        return [
            "hyphens",
            "hyphenate-character",
            "hyphenate-limit-chars"
        ];
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
        plugin.registerHook(plugin.HOOKS.POLYFILLED_INHERITED_PROPS,
            this.getPolyfilledInheritedProps.bind(this));
        plugin.registerHook(plugin.HOOKS.CONFIGURATION,
            this.configure.bind(this));
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
        if (this.isCollected()) return;
        var value = context[this.key];
        if (value !== undefined) {
            this.styleAndLang[this.key] = value;
        }
    };
    /**
     * @return {boolean}
     */
    vivliostyle.plugins.hyphenation.PropertyCollector.prototype.isCollected = function() {
        return this.styleAndLang[this.key] != null;
    };

    vivliostyle.plugins.hyphenation.hyphenator =
        new vivliostyle.plugins.hyphenation.Hyphenator();
    vivliostyle.plugins.hyphenation.hyphenator.registerHooks();
});
