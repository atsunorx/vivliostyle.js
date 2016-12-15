describe("vivliostyle.plugins.hyphenation", function() {
    describe("#isWordBoundary", function() {
        it("' ' is a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary(' ')).toEqual(true);
        });
        it("'\\t' is a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\t')).toEqual(true);
        });
        it("'\\r' is a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\r')).toEqual(true);
        });
        it("'\\n' is a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\n')).toEqual(true);
        });
        it("'-' is not a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('-')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\u2010')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\u2014')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\u2013')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\u2212')).toEqual(false);
        });
        it("'\\u00AD' is not a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('\u00AD')).toEqual(false);
        });
        it("'a-zA-Z0-9' is not a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('a')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('z')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('A')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('Z')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('0')).toEqual(false);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('9')).toEqual(false);
        });
        it("'あ', '漢' is a word boundary.", function() {
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('あ')).toEqual(true);
            expect(vivliostyle.plugins.hyphenation.isWordBoundary('漢')).toEqual(true);
        });
    });
});
