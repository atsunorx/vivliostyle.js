describe("layout", function() {

    describe("adapt.layout.TextNodeBreaker", function() {

        var breaker;
        var textNode, nodeContext;
        var column, checkPoints, edgePosition;
        beforeEach(function() {
            breaker = new adapt.layout.TextNodeBreaker();

            textNode = {
                length: 17,
                data: 'abcdeabcde\u00ADf ghij',
                replaceData: function() {}
            };
            spyOn(textNode, 'replaceData').and.callThrough();

            nodeContext = new adapt.vtree.NodeContext({}, null, 3);
            nodeContext.preprocessedTextContent =
                [[0, 'abcdeabcde'], [1, '\u00AD'], [0, 'f gh'], [1, '\u00AD'], [0, 'j']];
            nodeContext.hyphenateCharacter = '_';
            nodeContext.offsetInNode = 0;

            column = {
                findAcceptableBreakInside: function(checkPoints, edgePosition) {}
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
            it("removes a string after split point and inserts a hyphenation character when splits a text node at soft-hyphen character.", function() {
                var newContext = breaker.breakTextNode(textNode, nodeContext, 13, column, checkPoints, edgePosition);
                expect(newContext.offsetInNode).toEqual(11);
                expect(newContext.preprocessedTextContent).toEqual(newContext.preprocessedTextContent);
                expect(textNode.replaceData).toHaveBeenCalledWith(10, 7, '_');
                expect(column.findAcceptableBreakInside).not.toHaveBeenCalled();
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
        });

        describe("#resolveHyphenateCharacter", function() {
            it("returns a value of `hyphenateCharacter` in the nodeContext.", function() {
                expect(breaker.resolveHyphenateCharacter({
                    hyphenateCharacter: 'a',
                    parent: { hyphenateCharacter: 'b' }
                })).toEqual('a');
            });
            it("returns a value of `hyphenateCharacter` in the parent nodeContext if nodeContext's `hyphenateCharacter` is undefined.", function() {
                expect(breaker.resolveHyphenateCharacter({
                    parent: { hyphenateCharacter: 'b' }
                })).toEqual('b');
            });
            it("returns a default value if `hyphenateCharacter` of nodeContext and parent nodeContext are undefined.", function() {
                expect(breaker.resolveHyphenateCharacter({})).toEqual('-');
            });
        });

    });

});
