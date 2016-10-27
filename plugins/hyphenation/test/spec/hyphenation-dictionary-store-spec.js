describe("vivliostyle.plugins.hyphenation", function() {
    describe("HyphenationDictionaryStore", function() {

        var originalBaseUrl;
        var target;
        beforeEach(function() {
            originalBaseUrl = adapt.base.baseURL;
            adapt.base.baseURL = "./";
            target = new vivliostyle.plugins.hyphenation.HyphenationDictionaryStore();
        });
        afterEach(function() {
            adapt.base.baseURL = originalBaseUrl;
        });

        describe("#resolveDictionaryUrl", function() {
            it("resolves a hyphenation dictionary url for language", function() {
                expect(target.resolveDictionaryUrl("pl")).toBe(
                    "./plugins/hyphenation/resources/pl.js");
                expect(target.resolveDictionaryUrl("en-us")).toBe(
                    "./plugins/hyphenation/resources/en-us.js");
                expect(target.resolveDictionaryUrl("ja-JP")).toBe(
                    "./plugins/hyphenation/resources/ja-JP.js");
            });
        });
    });
});
