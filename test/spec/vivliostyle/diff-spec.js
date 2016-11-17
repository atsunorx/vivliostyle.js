describe("diff", function() {

    describe("#diff", function() {
        it("calculates differences of two blocks of text.", function() {
            expect(vivliostyle.diff.diffChars('aあb', 'aあb')).toEqual(
                [[0, 'aあb']]);
            expect(vivliostyle.diff.diffChars('aあb', 'axあいうb')).toEqual(
                [[0, 'a'], [1, 'x'], [0, 'あ'], [1, 'いう'], [0, 'b']]);
            expect(vivliostyle.diff.diffChars('aあb', 'xxaあbいう')).toEqual(
                [[1, 'xx'], [0, 'aあb'], [1, 'いう']]);
            expect(vivliostyle.diff.diffChars('axあいうb', 'aあb')).toEqual(
                [[0, 'a'], [-1, 'x'], [0, 'あ'], [-1, 'いう'], [0, 'b']]);
            expect(vivliostyle.diff.diffChars('xxaあbいう', 'aあb')).toEqual(
                [[-1, 'xx'], [0, 'aあb'], [-1, 'いう']]);

            expect(vivliostyle.diff.diffChars('abc', 'efg')).toEqual(
                [[-1, 'abc'], [1, 'efg']]);
            expect(vivliostyle.diff.diffChars('aabbaacc', 'aaabacc')).toEqual(
                [[0, 'aa'], [-1, 'b'], [1, 'a'], [0, 'b'], [-1, 'a'], [0, 'acc']]);
        });
    });

    describe("#resolveNewIndex", function() {
        it("resolves new index from old index.", function() {
            var diff = vivliostyle.diff.diffChars('abc', 'a-b-c');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(4);

            diff = vivliostyle.diff.diffChars('a-b-c', 'abc');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 6)).toBe(2);

            diff = vivliostyle.diff.diffChars('あいう', '漢あいう字');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(3);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(4);

            diff = vivliostyle.diff.diffChars('漢あいう字', 'あいう');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 6)).toBe(2);

            diff = vivliostyle.diff.diffChars('aabb--cc', 'aa--bbcc');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(5);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(5);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(5);
            expect(vivliostyle.diff.resolveNewIndex(diff, 6)).toBe(6);
            expect(vivliostyle.diff.resolveNewIndex(diff, 7)).toBe(7);
            expect(vivliostyle.diff.resolveNewIndex(diff, 8)).toBe(7);
            expect(vivliostyle.diff.resolveNewIndex(diff, 9)).toBe(7);

            diff = vivliostyle.diff.diffChars('aa--bbcc', 'aabb--cc');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(5);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(5);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(5);
            expect(vivliostyle.diff.resolveNewIndex(diff, 6)).toBe(6);
            expect(vivliostyle.diff.resolveNewIndex(diff, 7)).toBe(7);
            expect(vivliostyle.diff.resolveNewIndex(diff, 8)).toBe(7);
            expect(vivliostyle.diff.resolveNewIndex(diff, 9)).toBe(7);

            diff = vivliostyle.diff.diffChars('あいう漢字', '漢字えお');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(1);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(3);
            expect(vivliostyle.diff.resolveNewIndex(diff, 6)).toBe(3);

            diff = vivliostyle.diff.diffChars('漢字えお', 'あいう漢字');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(3);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(4);

            diff = vivliostyle.diff.diffChars('abc', 'fghij');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(4);

            diff = vivliostyle.diff.diffChars('fghij', 'abc');
            expect(vivliostyle.diff.resolveNewIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 2)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 3)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 4)).toBe(0);
            expect(vivliostyle.diff.resolveNewIndex(diff, 5)).toBe(2);
            expect(vivliostyle.diff.resolveNewIndex(diff, 6)).toBe(2);
        });
    });

    describe("#resolveOldIndex", function() {
        it("resolves old index from new index.", function() {
            var diff = vivliostyle.diff.diffChars('abc', 'a-b-c');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 6)).toBe(2);

            diff = vivliostyle.diff.diffChars('a-b-c', 'abc');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(4);

            diff = vivliostyle.diff.diffChars('あいう', '漢あいう字');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 6)).toBe(2);

            diff = vivliostyle.diff.diffChars('漢あいう字', 'あいう');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(3);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(4);

            diff = vivliostyle.diff.diffChars('aabb--cc', 'aa--bbcc');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(3);
            expect(vivliostyle.diff.resolveOldIndex(diff, 6)).toBe(6);
            expect(vivliostyle.diff.resolveOldIndex(diff, 7)).toBe(7);
            expect(vivliostyle.diff.resolveOldIndex(diff, 8)).toBe(7);
            expect(vivliostyle.diff.resolveOldIndex(diff, 9)).toBe(7);

            diff = vivliostyle.diff.diffChars('aa--bbcc', 'aabb--cc');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(3);
            expect(vivliostyle.diff.resolveOldIndex(diff, 6)).toBe(6);
            expect(vivliostyle.diff.resolveOldIndex(diff, 7)).toBe(7);
            expect(vivliostyle.diff.resolveOldIndex(diff, 8)).toBe(7);
            expect(vivliostyle.diff.resolveOldIndex(diff, 9)).toBe(7);

            diff = vivliostyle.diff.diffChars('あいう漢字', '漢字えお');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(3);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(4);

            diff = vivliostyle.diff.diffChars('漢字えお', 'あいう漢字');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(0);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(1);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(3);
            expect(vivliostyle.diff.resolveOldIndex(diff, 6)).toBe(3);

            diff = vivliostyle.diff.diffChars('abc', 'fghij');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 5)).toBe(2);
            expect(vivliostyle.diff.resolveOldIndex(diff, 6)).toBe(2);

            diff = vivliostyle.diff.diffChars('fghij', 'abc');
            expect(vivliostyle.diff.resolveOldIndex(diff, 0)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 1)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 2)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 3)).toBe(4);
            expect(vivliostyle.diff.resolveOldIndex(diff, 4)).toBe(4);

        });
    });

});
