describe("vivliostyle.plugins.hyphenation", function() {
    describe("ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker", function() {

        var breaker;
        var textNode, nodeContext;
        var checkPoints;
        beforeEach(function() {
            breaker = new vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker();
            textNode = {
                length: 17,
                data: 'abcd abcde\u00ADf gh\u00ADj',
                replaceData: function() {}
            };
            spyOn(textNode, 'replaceData').and.callThrough();

            nodeContext = new adapt.vtree.NodeContext({}, null, 3);
            nodeContext.hyphenateCharacter = '_';
            nodeContext.offsetInNode = 0;

            checkPoints = []; // dummy
        });
        afterEach(function() {
            textNode.replaceData.calls.reset();
        });

        describe("#breakTextNode", function() {
            it("increments `offsetInNode` when nodeContext#after is true.", function() {
                nodeContext.after = true;
                var newContext = breaker.breakTextNode(textNode, nodeContext, 8, checkPoints, 1);
                expect(newContext.offsetInNode).toEqual(17);
                expect(textNode.replaceData).not.toHaveBeenCalled();
            });
            it("removes characters character after the word boundary before the soft hyphen when splits a text node at the soft-hyphen character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, checkPoints, 1);
                expect(newContext.offsetInNode).toEqual(5);
                expect(textNode.replaceData).toHaveBeenCalledWith(4, 13, '');
            });
            it("removes characters character after the word boundary before the hyphen when splits a text node at the hyphen character.", function() {
                textNode.data = 'abcd abcde\u00ADf gh-j';
                var newContext = breaker.breakTextNode(textNode, nodeContext, 18, checkPoints, 1);
                expect(newContext.offsetInNode).toEqual(13);
                expect(textNode.replaceData).toHaveBeenCalledWith(12, 5, '');
            });
            it("returns null when splits a text node at the soft hyphen character in the first line.", function() {
                textNode.data = 'abcdeabcde\u00ADf gh\u00ADj';
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, checkPoints, 1);
                expect(newContext).toEqual(null);
                expect(textNode.replaceData).not.toHaveBeenCalled();
            });
            it("returns null when splits a text node at the soft hyphen character in the first line.", function() {
                textNode.data = 'abcdeabcde-f gh-j';
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, checkPoints, 1);
                expect(newContext).toEqual(null);
                expect(textNode.replaceData).not.toHaveBeenCalled();
            });
            it("removes characters after split point and inserts a hyphenation character when splits a text node at the space character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 15, checkPoints, 1);
                expect(newContext.offsetInNode).toEqual(13);
                expect(textNode.replaceData).toHaveBeenCalledWith(13, 4, '');
            });
            it("removes characters after split point and inserts a hyphenation character when splits a text node at the normal character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 10, checkPoints, 1);
                expect(newContext.offsetInNode).toEqual(8);
                expect(textNode.replaceData).toHaveBeenCalledWith(8, 9, '_');
            });
        });

    });
});
