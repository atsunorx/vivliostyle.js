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
                    "./plugins/hyphenation/resources/pl.json");
                expect(target.resolveDictionaryUrl("en-US")).toBe(
                    "./plugins/hyphenation/resources/en-us.json");
                expect(target.resolveDictionaryUrl("ja-jp")).toBe(
                    "./plugins/hyphenation/resources/ja-jp.json");
            });
        });
    });
});
