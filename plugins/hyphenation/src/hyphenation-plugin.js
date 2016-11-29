
/**
 * Copyright 2016 Vivliostyle Inc.
 * @fileoverview Hyphenation plugin
 */
goog.provide("vivliostyle.plugins.hyphenation");

goog.require("vivliostyle.plugin");

goog.scope(function() {

    /* eslint-disable global-require */
    var Hypher = require("node_modules/hypher/lib/hypher");
    var fastdiff = require('node_modules/fast-diff/diff');
    /* eslint-enable global-require */

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


    var wordRegexp = (/[a-zA-Z0-9_\-\u0027\u00AD\u00DF-\u00EA\u00EB\u00EC-\u00EF\u00F1-\u00F6\u00F8-\u00FD\u0101\u0103\u0105\u0107\u0109\u010D\u010F\u0111\u0113\u0117\u0119\u011B\u011D\u011F\u0123\u0125\u012B\u012F\u0131\u0135\u0137\u013C\u013E\u0142\u0144\u0146\u0148\u0151\u0153\u0155\u0159\u015B\u015D\u015F\u0161\u0165\u016B\u016D\u016F\u0171\u0173\u017A\u017C\u017E\u017F\u0219\u021B\u02BC\u0390\u03AC-\u03CE\u03F2\u0401\u0410-\u044F\u0451\u0454\u0456\u0457\u045E\u0491\u0531-\u0556\u0561-\u0587\u0902\u0903\u0905-\u090B\u090E-\u0910\u0912\u0914-\u0928\u092A-\u0939\u093E-\u0943\u0946-\u0948\u094A-\u094D\u0982\u0983\u0985-\u098B\u098F\u0990\u0994-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BE-\u09C3\u09C7\u09C8\u09CB-\u09CD\u09D7\u0A02\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A14-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A82\u0A83\u0A85-\u0A8B\u0A8F\u0A90\u0A94-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABE-\u0AC3\u0AC7\u0AC8\u0ACB-\u0ACD\u0B02\u0B03\u0B05-\u0B0B\u0B0F\u0B10\u0B14-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3E-\u0B43\u0B47\u0B48\u0B4B-\u0B4D\u0B57\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C02\u0C03\u0C05-\u0C0B\u0C0E-\u0C10\u0C12\u0C14-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3E-\u0C43\u0C46-\u0C48\u0C4A-\u0C4D\u0C82\u0C83\u0C85-\u0C8B\u0C8E-\u0C90\u0C92\u0C94-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBE-\u0CC3\u0CC6-\u0CC8\u0CCA-\u0CCD\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D3E-\u0D43\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D60\u0D61\u0D7A-\u0D7F\u1F00-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB2-\u1FB4\u1FB6\u1FB7\u1FBD\u1FBF\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD2\u1FD3\u1FD6\u1FD7\u1FE2-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u200D\u2010\u2013\u2014\u2019\u2212]/);

    /**
     * @param {string} char
     * @return {boolean}
     */
    vivliostyle.plugins.hyphenation.isWordBoundary = function(char) {
        return !(wordRegexp.test(char));
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
        this.preprocessHyphenateLimitLast(context, computedStyle);
        this.preprocessHyphenateLimitLines(context, computedStyle);
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
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphenateLimitLast = function(context, computedStyle) {
        var hyphenateLimitLast = /** @type {adapt.css.Val|string} */ (context.inheritedProps["hyphenate-limit-last"]);
        if (!hyphenateLimitLast) return;
        if (typeof hyphenateLimitLast === 'string') {
            context['hyphenateLimitLast'] = hyphenateLimitLast;
            computedStyle["hyphenate-limit-last"] =
                adapt.css.getName(hyphenateLimitLast);
        }
    };
    /**
     * @private
     * @param {adapt.vtree.NodeContext} context
     * @param {!Object} computedStyle
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.preprocessHyphenateLimitLines = function(context, computedStyle) {
        var hyphenateLimitLines = /** @type {adapt.css.Val|string} */ (context.inheritedProps["hyphenate-limit-lines"]);
        if (!hyphenateLimitLines) return;
        if (typeof hyphenateLimitLines === 'string') {
            computedStyle["hyphenate-limit-lines"] =
                adapt.css.getName(hyphenateLimitLines);
        } else if (typeof hyphenateLimitLines === 'number') {
            context['hyphenateLimitLines'] = hyphenateLimitLines;
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
            "hyphenate-limit-chars",
            "hyphenate-limit-last",
            "hyphenate-limit-lines"
        ];
    };

    /**
     * @param {adapt.vtree.NodeContext} nodeContext
     * @return {adapt.layout.TextNodeBreaker}
     */
    vivliostyle.plugins.hyphenation.Hyphenator.prototype.resolveTextNodeBreaker = function(nodeContext) {
        if (nodeContext['hyphenateLimitLast'] === "column") {
            return vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.instance;
        }
        if (nodeContext['hyphenateLimitLast'] == null
            && nodeContext.parent
            && nodeContext.parent['hyphenateLimitLast'] === "column") {
            return vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.instance;
        }
        return null;
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
        plugin.registerHook(plugin.HOOKS.RESOLVE_TEXT_NODE_BREAKER,
            this.resolveTextNodeBreaker.bind(this));
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

    /**
     * @constructor
     * @extends {adapt.layout.TextNodeBreaker}
     */
    vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker = function() {
        adapt.layout.TextNodeBreaker.call(this);
    };
    goog.inherits(vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker,
        adapt.layout.TextNodeBreaker);

    /**
     * @param {Text} textNode
     * @param {string} text
     * @param {number} viewIndex
     */
    vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.prototype.tryToBreakPreviousWordBoundary = function(
        textNode, text, viewIndex) {
        var index = this.findWordBoundary(text, viewIndex, true);
        if (index > 0) {
            textNode.replaceData(index, text.length - index, '');
            return index+1;
        } else {
            return -1;
        }
    };

    /**
     * @param {number} checkpointIndex
     * @param {Array.<adapt.vtree.NodeContext>} checkPoints
     */
    vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.prototype.tryToBreakPreviousNode = function(
        checkpointIndex, checkPoints) {
        for (var i=checkpointIndex-1; i>=0; i--) {
            if (checkPoints[i] && checkPoints[i].after) {
                return checkPoints[i];
            }
        }
        return null;
    };

    /**
     * @param {string} text
     * @param {number} index
     * @param {boolean} isFindPrevious
     * @return {number}
     */
    vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.prototype.findWordBoundary = function(text, index, isFindPrevious) {
        var step  = isFindPrevious ? -1 : 1;
        var limit = isFindPrevious
            ? function(i) { return i >= 0; }
            : function(i) { return i < text.length; };
        for (var i=index; limit(i); i+=step) {
            if (vivliostyle.plugins.hyphenation.isWordBoundary(text.charAt(i))) return i;
        }
        return isFindPrevious ? 0 : text.length;
    };


    /**
     * @override
     */
    vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.prototype.breakTextNode = function(
        textNode, nodeContext, low, checkPoints, checkpointIndex, force) {
        if (force) {
            return goog.base(this, 'breakTextNode', textNode,
                nodeContext, low, checkPoints, checkpointIndex, force);
        }
        if (nodeContext.after) {
            nodeContext.offsetInNode = textNode.length;
        } else {
            // Character with index low is the last one that fits.
            var viewIndex = low - nodeContext.boxOffset;
            var text = textNode.data;
            if (text.charCodeAt(viewIndex) == 0xAD || text.charAt(viewIndex) == '-') {
                viewIndex = this.tryToBreakPreviousWordBoundary(textNode, text, viewIndex);
                if (viewIndex == -1) {
                    return this.tryToBreakPreviousNode(checkpointIndex, checkPoints);
                }
            } else {
                viewIndex = this.breakAfterOtherCharacter(textNode, text, viewIndex, nodeContext);
            }
            if (viewIndex > 0) {
                nodeContext = this.updateNodeContext(nodeContext, viewIndex, textNode);
            }
        }
        return nodeContext;
    };

    vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker.instance =
        new vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker();

    vivliostyle.plugins.hyphenation.hyphenator =
        new vivliostyle.plugins.hyphenation.Hyphenator();
    vivliostyle.plugins.hyphenation.hyphenator.registerHooks();
});
