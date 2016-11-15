describe("vivliostyle.plugins.hyphenation", function() {
    describe("HyphenationDictionaryStore", function() {

        var originalBaseUrl;
        var target;
        var store;
        var resourceMap;
        beforeEach(function() {
            originalBaseUrl = adapt.base.baseURL;
            adapt.base.baseURL = "./";
            resourceMap = {
                "./plugins/hyphenation/resources/en.json": {
                    'id': 'en',
                    'leftmin': 3,
                    'rightmin': 3,
                    'patterns': {
                        2 : "aaaa"
                    }
                },
                "./plugins/hyphenation/resources/pl.json": {
                    'id': 'pl',
                    'leftmin': 3,
                    'rightmin': 3,
                    'patterns': {
                        2 : "aaaa"
                    },
                    "exceptions": "con\u2027tent"
                },
                "./exceptions.json": {
                    all: ["hyphe|na|tion", "oppo|tu|ni|ties"],
                    "en-us": ["hyphe|na|ti|on", "lan|guage"],
                    "en": ["con|tent"],
                    "pl": ["ex|ception"]
                }
            };
            target = new vivliostyle.plugins.hyphenation.HyphenationDictionaryStore();
            store = {
                load: function(url) {
                    return adapt.task.newResult(resourceMap[url] || null);
                },
                delete: function(url) {}
            };
            spyOn(store, 'load').and.callThrough();
            spyOn(store, 'delete').and.callThrough();
            target.store = store;
        });
        afterEach(function() {
            adapt.base.baseURL = originalBaseUrl;
            store.load.calls.reset();
            store.delete.calls.reset();
        });

        describe("#resolveDictionaryUrl", function() {
            it("resolves a hyphenation dictionary url for language", function() {
                expect(target.resolveDictionaryUrl("pl")).toBe(
                    "./plugins/hyphenation/resources/pl.json");
                expect(target.resolveDictionaryUrl("en-US")).toBe(
                    "./plugins/hyphenation/resources/en-us.json");
                expect(target.resolveDictionaryUrl("ja-jp")).toBe(
                    "./plugins/hyphenation/resources/ja-jp.json");
            });
        });

        describe("#collectExceptionWords", function() {
            it("collects exception words for language", function() {
                var exceptions = {
                    all: ["hyphe|na|tion", "oppo|tu|ni|ties"],
                    "en-us": ["hyphe|na|ti|on", "lan|guage"],
                    "en": ["con|tent"],
                    "pl": ["ex|ception"]
                };
                expect(target.collectExceptionWords('en-US', exceptions)).toEqual([
                    "hyphe\u2027na\u2027ti\u2027on", "lan\u2027guage", "oppo\u2027tu\u2027ni\u2027ties"
                ]);
                expect(target.collectExceptionWords('en', exceptions)).toEqual([
                    "con\u2027tent", "hyphe\u2027na\u2027tion", "oppo\u2027tu\u2027ni\u2027ties"
                ]);
                expect(target.collectExceptionWords('ja', exceptions)).toEqual([
                    "hyphe\u2027na\u2027tion", "oppo\u2027tu\u2027ni\u2027ties"
                ]);

                exceptions = {
                    "en-us": ["hyphe|na|ti|on", "lan|guage"],
                    "en": ["con|tent"],
                    "pl": ["ex|ception"]
                };
                expect(target.collectExceptionWords('en-Us', exceptions)).toEqual([
                    "hyphe\u2027na\u2027ti\u2027on", "lan\u2027guage"
                ]);
                expect(target.collectExceptionWords('en', exceptions)).toEqual([
                    "con\u2027tent"
                ]);
                expect(target.collectExceptionWords('ja', exceptions)).toEqual([]);
            });
            it("returns an empty array when excpetions is null.", function() {
                expect(target.collectExceptionWords('en-US', null)).toEqual([]);
            });
        });

        describe("#load", function() {
            it("loads a dictionary for lang.", function(cb) {
                adapt.task.start(function() {
                    target.load("en").then(function(result) {
                        expect(result).toEqual({
                            'id': 'en',
                            'leftmin': 3,
                            'rightmin': 3,
                            'patterns': {
                                2 : "aaaa"
                            }
                        });
                        expect(store.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("loads a dictionary and an exception file when the excpetionFileUrl is spcified.", function(cb) {
                adapt.task.start(function() {
                    target.setExcpetionFileUrl("exceptions.json");
                    target.load("en").then(function(result) {
                        expect(result).toEqual({
                            'id': 'en',
                            'leftmin': 3,
                            'rightmin': 3,
                            'patterns': {
                                2 : "aaaa"
                            },
                            'exceptions': "con\u2027tent,hyphe\u2027na\u2027tion,oppo\u2027tu\u2027ni\u2027ties"
                        });
                        expect(store.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("merges exception words when exceptions is specified in a dictionary.", function(cb) {
                adapt.task.start(function() {
                    target.setExcpetionFileUrl("exceptions.json");
                    target.load("pl").then(function(result) {
                        expect(result).toEqual({
                            'id': 'pl',
                            'leftmin': 3,
                            'rightmin': 3,
                            'patterns': {
                                2 : "aaaa"
                            },
                            'exceptions': "con\u2027tent,ex\u2027ception,hyphe\u2027na\u2027tion,oppo\u2027tu\u2027ni\u2027ties"
                        });
                        expect(store.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("retuns a plain dictionary when the excpetionFileUrl can not loaded.", function(cb) {
                adapt.task.start(function() {
                    target.setExcpetionFileUrl("unknown.json");
                    target.load("en").then(function(result) {
                        expect(result).toEqual({
                            'id': 'en',
                            'leftmin': 3,
                            'rightmin': 3,
                            'patterns': {
                                2 : "aaaa"
                            }
                        });
                        expect(store.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("returns null when can not load a dictionary.", function(cb) {
                adapt.task.start(function() {
                    target.setExcpetionFileUrl("exceptions.json");
                    target.load("unknown").then(function(result) {
                        expect(result).toEqual(null);
                        expect(store.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("resets exceptions resource when excpetionFileUrl is changed.", function(cb) {
                adapt.task.start(function() {
                    target.setExcpetionFileUrl("exceptions.json");
                    target.load("pl").then(function(result) {
                        target.setExcpetionFileUrl("exceptions.json");
                        expect(store.delete).not.toHaveBeenCalled();
                        target.setExcpetionFileUrl("exceptions2.json");
                        expect(store.delete).toHaveBeenCalled();
                        cb();
                    });
                });
            });
        });

    });
});
