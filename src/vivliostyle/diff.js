/**
 * Copyright 2016 Vivliostyle Inc.
 * @fileoverview Diff utility
 */
goog.provide("vivliostyle.diff");

goog.require("vivliostyle.namespace");
var fastdiff = require('node_modules/fast-diff/diff');

goog.scope(function() {

    "use strict";

    /**
     * @typedef {Array.<(number|string)>}
     */
    vivliostyle.diff.Change;

    /**
     * @param {string} textA
     * @param {string} textB
     * @returns {Array.<vivliostyle.diff.Change>}
     */
    vivliostyle.diff.diffChars = function(textA, textB) {
        return fastdiff(textA, textB, 0);
    };

    /**
     * @param {Array.<vivliostyle.diff.Change>} changes
     * @param {number} oldIndex
     * @returns {number}
     */
    vivliostyle.diff.resolveNewIndex = function(changes, oldIndex) {
        return vivliostyle.diff.resolveIndex(changes, oldIndex, 1);
    };

    /**
     * @param {Array.<vivliostyle.diff.Change>} changes
     * @param {number} newIndex
     * @returns {number}
     */
    vivliostyle.diff.resolveOldIndex = function(changes, newIndex) {
        return vivliostyle.diff.resolveIndex(changes, newIndex, -1);
    };

    /**
     * @private
     * @param {Array.<vivliostyle.diff.Change>} changes
     * @param {number} index
     * @param {number} coef
     * @returns {number}
     */
    vivliostyle.diff.resolveIndex = function(changes, index, coef) {
        var diff     = 0;
        var current  = 0;
        changes.some(function(change) {
            for (var i=0; i<change[1].length; i++) {
                switch (change[0]*coef) {
                    case fastdiff.INSERT:
                        diff++;
                        break;
                    case fastdiff.DELETE:
                        diff--;
                        current++;
                        break;
                    case fastdiff.EQUAL:
                        current++;
                        break;
                }
                if (current > index) return true;
            }
            return false;
        });
        return Math.max(Math.min(index, current-1) + diff, 0);
    };

});
