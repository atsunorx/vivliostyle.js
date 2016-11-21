describe("vivliostyle.plugins.hyphenation", function() {
    describe("ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker", function() {

        var breaker;
        var textNode, nodeContext;
        var column, checkPoints, edgePosition;
        beforeEach(function() {
            breaker = new vivliostyle.plugins.hyphenation.ForbidHyphenationAtTheEndOfColumnsTextNodeBreaker();
            textNode = {
                length: 17,
                data: 'abcdeabcde\u00ADf gh\u00ADj',
                replaceData: function() {}
            };
            spyOn(textNode, 'replaceData').and.callThrough();

            nodeContext = new adapt.vtree.NodeContext({}, null, 3);
            nodeContext.preprocessedTextContent =
                [[0, 'abcdeabcde'], [1, '\u00AD'], [0, 'f gh'], [1, '\u00AD'], [0, 'j']];
            nodeContext.hyphenateCharacter = '_';
            nodeContext.offsetInNode = 0;

            column = {
                findAcceptableBreakInside: function(checkPoints, edgePosition) {
                    textNode.data = 'abcdeabcdef gh\u00ADj';
                    return {
                        offsetInNode: 12,
                        preprocessedTextContent: [[0, 'abcdeabcdef gh'], [1, '\u00AD'], [0, 'j']]
                    };
                }
            };
            spyOn(column, 'findAcceptableBreakInside').and.callThrough();

            checkPoints = edgePosition = {}; // dummy
        });
        afterEach(function() {
            textNode.replaceData.calls.reset();
            column.findAcceptableBreakInside.calls.reset();
        });

        describe("#breakTextNode", function() {
            it("increments `offsetInNode` when nodeContext#after is true.", function() {
                nodeContext.after = true;
                var newContext = breaker.breakTextNode(textNode, nodeContext, 8, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(17);
                expect(newContext.preprocessedTextContent).toEqual(newContext.preprocessedTextContent);
                expect(textNode.replaceData).not.toHaveBeenCalled();
                expect(column.findAcceptableBreakInside).not.toHaveBeenCalled();
            });
            it("removes a trailing soft hyphen and re-calculates the split position when splits a text node at soft-hyphen character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(12);
                expect(newContext.preprocessedTextContent).toEqual([[0, 'abcdeabcdef gh'], [1, '\u00AD'], [0, 'j']]);
                expect(textNode.replaceData).toHaveBeenCalledWith(10, 1, '');
                expect(column.findAcceptableBreakInside).toHaveBeenCalledWith(checkPoints, edgePosition);
            });
            it("removes a string after split point and inserts a hyphenation character when splits a text node at space character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 15, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(13);
                expect(newContext.preprocessedTextContent).toEqual(newContext.preprocessedTextContent);
                expect(textNode.replaceData).toHaveBeenCalledWith(13, 4, '');
                expect(column.findAcceptableBreakInside).not.toHaveBeenCalled();
            });
            it("removes a string after split point and inserts a hyphenation character when splits a text node at normal character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 10, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(8);
                expect(newContext.preprocessedTextContent).toEqual(newContext.preprocessedTextContent);
                expect(textNode.replaceData).toHaveBeenCalledWith(8, 9, '_');
                expect(column.findAcceptableBreakInside).not.toHaveBeenCalled();
            });
            it("updates preprocessedTextContent if text node content is modified in the previous step.", function() {
                textNode.data = 'abcdeabcdef gh\u00ADj';
                textNode.length = 16;
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(11);
                expect(newContext.preprocessedTextContent).toEqual([[0, 'abcdeabcdef gh'], [1, '\u00AD'], [0, 'j']]);
                expect(textNode.replaceData).toHaveBeenCalledWith(11, 5, '');
                expect(column.findAcceptableBreakInside).not.toHaveBeenCalled();
            });
            it("updates preprocessedTextContent if text node content is modified and splited in the previous step.", function() {
                textNode.data = 'abcdeabcdef g';
                textNode.length = 13;
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(11);
                expect(newContext.preprocessedTextContent).toEqual([[0, 'abcdeabcdef gh'], [1, '\u00AD'], [0, 'j']]);
                expect(textNode.replaceData).toHaveBeenCalledWith(11, 2, '');
                expect(column.findAcceptableBreakInside).not.toHaveBeenCalled();
            });
        });

    });
});
