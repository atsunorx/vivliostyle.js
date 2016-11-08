describe("vivliostyle.plugins.hyphenation", function() {
    describe("Hyphenator", function() {

        var dictionary = {
            'id': 'la',
            'leftmin': 3,
            'rightmin': 3,
            'patterns': {
                2 : "æ1œ11b1c1d1f1g1h1j1k1l1m1n1p1r1t1v1x1z",
                3 : "2bb2bdb2l2bm2bnb2r2bt2bs2b_2ccc2l2cm2cn2cqc2r2cs2ct2cz2c_2dd2dg2dmd2r2ds2dv2d_2fff2l2fnf2r2ft2f_2gg2gd2gfg2l2gmg2ng2r2gs2gv2g_2hp2ht2h_2kk2lb2lc2ld2lf2lg2lk2ll2lm2ln2lp2lq2lr2ls2lt2lv2l_2mm2mb2mp2ml2mn2mq2mr2mv2m_2nb2nc2nd2nf2ng2nl2nm2nn2np2nq2nr2ns2nt2nv2nx2n_p2hp2l2pn2ppp2r2ps2pt2pz2p_2rb2rc2rd2rf2rgr2h2rl2rm2rn2rp2rq2rr2rs2rt2rv2rz2r_1s22s_2tb2tc2td2tf2tgt2ht2lt2r2tm2tn2tp2tq2tt2tv2t_v2lv2r2vv2xt2xx2x_2z_",
                4 : "a1iaa1iea1ioa1iuae1aae1oae1ue1iuio1io1iao1ieo1ioo1iuuo3uc2h2k2h22php2pht1qu22s3s2stb2stc2std2stf2stg2stm2stn2stp2stq2sts2stt2stv2st_a1uaa1uea1uia1uoa1uue1uae1uee1uie1uoe1uui1uai1uei1uii1uoi1uuo1uao1ueo1uio1uoo1uuu1uau1ueu1uiu1uou1uu",
                5 : "_e2x1_o2b3l3f2tn2s3mn2s3f2s3ph2st3l",
                6 : "_a2b3l_anti13p2sic3p2neua2l1uaa2l1uea2l1uia2l1uoa2l1uue2l1uae2l1uee2l1uie2l1uoe2l1uui2l1uai2l1uei2l1uii2l1uoi2l1uuo2l1uao2l1ueo2l1uio2l1uoo2l1uuu2l1uau2l1ueu2l1uiu2l1uou2l1uua2m1uaa2m1uea2m1uia2m1uoa2m1uue2m1uae2m1uee2m1uie2m1uoe2m1uui2m1uai2m1uei2m1uii2m1uoi2m1uuo2m1uao2m1ueo2m1uio2m1uoo2m1uuu2m1uau2m1ueu2m1uiu2m1uou2m1uua2n1uaa2n1uea2n1uia2n1uoa2n1uue2n1uae2n1uee2n1uie2n1uoe2n1uui2n1uai2n1uei2n1uii2n1uoi2n1uuo2n1uao2n1ueo2n1uio2n1uoo2n1uuu2n1uau2n1ueu2n1uiu2n1uou2n1uua2r1uaa2r1uea2r1uia2r1uoa2r1uue2r1uae2r1uee2r1uie2r1uoe2r1uui2r1uai2r1uei2r1uii2r1uoi2r1uuo2r1uao2r1ueo2r1uio2r1uoo2r1uuu2r1uau2r1ueu2r1uiu2r1uou2r1uu",
                7 : "_para1i_para1u_su2b3r2s3que_2s3dem_",
                8 : "_su2b3lu",
                9 : "_anti3m2n_circu2m1_co2n1iun",
                10 : "_di2s3cine"                }
        };
        var target;
        var dictionaryStore;
        beforeEach(function() {
            target = new vivliostyle.plugins.hyphenation.Hyphenator();
            dictionaryStore = {
                load: function(lang) {
                    return adapt.task.newResult(lang == "en" ? dictionary : null);
                }
            };
            spyOn(dictionaryStore, 'load').and.callThrough();
            target.dictionaryStore = dictionaryStore;
        });
        afterEach(function() {
            dictionaryStore.load.calls.reset();
        });

        describe("#preprocessElementStyle", function() {
            var context;
            var style;
            beforeEach(function() {
                context = {};
                style = {};
            });
            it("inserts 'hyphens:auto' to a context when hyphens property is 'auto' and modify hyphens to 'manual'.", function() {
                context.inheritedProps = {
                    hyphens: 'auto'
                };
                target.preprocessElementStyle(context, style);

                expect(context.hyphens).toEqual('auto');
                expect(style).toEqual({
                    hyphens: adapt.css.ident.manual
                });
            });
            it("do nothing when hyphens property is 'manual'.", function() {
                context.inheritedProps = {
                    hyphens: 'manual'
                };
                target.preprocessElementStyle(context, style);

                expect(context.hyphens).toEqual('manual');
                expect(style).toEqual({
                    hyphens: adapt.css.ident.manual
                });
            });
            it("do nothing when hyphens property is 'none'.", function() {
                context.inheritedProps = {
                    hyphens: 'none'
                };
                target.preprocessElementStyle(context, style);

                expect(context.hyphens).toEqual('none');
                expect(style).toEqual({
                    hyphens: adapt.css.ident.none
                });
            });
            it("do nothing when hyphens property is undefined.", function() {
                target.preprocessElementStyle(context, style);

                expect(context).toEqual({
                });
                expect(style).toEqual({
                });
            });

            it("inserts 'hyphenateLimitChars' to a context when hyphenate-limit-chars property is 'auto 1 2'.", function() {
                context.inheritedProps = {
                    "hyphenate-limit-chars": new adapt.css.SpaceList([
                        adapt.css.ident.auto,
                        new adapt.css.Int(1),
                        new adapt.css.Int(2)
                    ])
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual([null, 1, 2]);
            });
            it("inserts 'hyphenateLimitChars' to a context when hyphenate-limit-chars property is '10 2'.", function() {
                context.inheritedProps = {
                    "hyphenate-limit-chars": new adapt.css.SpaceList([
                        new adapt.css.Int(10),
                        new adapt.css.Int(2)
                    ])
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual([10, 2, 2]);
            });
            it("inserts 'hyphenateLimitChars' to a context when hyphenate-limit-chars property is '10'.", function() {
                context.inheritedProps = {
                    "hyphenate-limit-chars": 10
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual([10, null, null]);
            });
            it("inserts 'hyphenateLimitChars' to a context when hyphenate-limit-chars property is 'auto auto auto'.", function() {
                context.inheritedProps = {
                    "hyphenate-limit-chars": new adapt.css.SpaceList([
                        adapt.css.ident.auto,
                        adapt.css.ident.auto,
                        adapt.css.ident.auto
                    ])
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual([null, null, null]);
            });
            it("inserts 'hyphenateLimitChars' to a context when hyphenate-limit-chars property is 'auto auto'.", function() {
                context.inheritedProps = {
                    "hyphenate-limit-chars": new adapt.css.SpaceList([
                        adapt.css.ident.auto,
                        adapt.css.ident.auto
                    ])
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual([null, null, null]);
            });
            it("inserts 'hyphenateLimitChars' to a context when hyphenate-limit-chars property is 'auto'.", function() {
                context.inheritedProps = {
                    "hyphenate-limit-chars": "auto"
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual([null, null, null]);
            });
            it("do nothing when hyphenate-limit-chars property is undefined.", function() {
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateLimitChars).toEqual(undefined);
            });

            it("inserts 'hyphenateCharacter' to a context when hyphenate-character property is '_'.", function() {
                context.inheritedProps = {
                    "hyphenate-character": new adapt.css.Str("_")
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateCharacter).toEqual("_");
                expect(style["hyphenate-character"].str).toEqual("_");
            });
            it("do nothing when  hyphenate-character property is auto.", function() {
                context.inheritedProps = {
                    "hyphenate-character": 'auto'
                };
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateCharacter).toEqual(undefined);
                expect(style["hyphenate-character"]).toEqual(adapt.css.ident.auto);
            });
            it("do nothing when  hyphenate-character property is undfined.", function() {
                target.preprocessElementStyle(context, style);
                expect(context.hyphenateCharacter).toEqual(undefined);
                expect(style["hyphenate-character"]).toEqual(undefined);
            });
        });

        describe("#extractElementStyleAndLang", function() {
            it("extracts required properties from a context.", function() {
                expect(target.extractElementStyleAndLang({
                    hyphens: 'auto',
                    hyphenateLimitChars: [null, 2, 3],
                    lang: "en"
                })).toEqual({
                    hyphens: 'auto',
                    hyphenateLimitChars: [null, 2, 3],
                    lang: "en"
                });

                expect(target.extractElementStyleAndLang({
                    hyphens: "none",
                    parent: {
                        hyphenateLimitChars: [10, 2, 3],
                        lang: "pl",
                        parent: {
                            hyphens: "auto",
                            lang: "en"
                        }
                    }
                })).toEqual({
                    hyphens: "none",
                    hyphenateLimitChars: [10, 2, 3],
                    lang: "pl"
                });

                expect(target.extractElementStyleAndLang({
                })).toEqual({
                    hyphens: null,
                    hyphenateLimitChars: null,
                    lang: null
                });

                expect(target.extractElementStyleAndLang({
                    parent: {
                        parent: {
                            hyphens: "auto",
                            hyphenateLimitChars: [10, 2, 3]
                        }
                    }
                })).toEqual({
                    hyphens: null,
                    hyphenateLimitChars: null,
                    lang: null
                });

                expect(target.extractElementStyleAndLang({
                    hyphenateLimitChars: [null, null, null],
                    parent: {
                        hyphens: "auto",
                        hyphenateLimitChars: [12, 2, 3],
                        parent: {
                            hyphens: "auto",
                            hyphenateLimitChars: [13, 2, 3]
                        }
                    }
                })).toEqual({
                    hyphens: "auto",
                    hyphenateLimitChars: [null, null, null],
                    lang: null
                });

                expect(target.extractElementStyleAndLang({
                    hyphens: "none",
                    hyphenateLimitChars: [null, null, null],
                    parent: {
                        hyphens: "auto",
                        hyphenateLimitChars: [12, 2, 3],
                        parent: {
                            hyphens: "manual",
                            hyphenateLimitChars: [13, 2, 3]
                        }
                    }
                })).toEqual({
                    hyphens: "none",
                    hyphenateLimitChars: [null, null, null],
                    lang: null
                });
            });
        });

        describe("#hyphenate", function() {
            it("hyphenate a string when dictionary is not null.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenate("breaking characters before hyphenation opportunities", "en").then(function(result) {
                        expect(result).toEqual("brea\u00ADking cha\u00ADrac\u00ADters before hyphe\u00ADna\u00ADtion oppor\u00ADtu\u00ADni\u00ADties");
                        expect(dictionaryStore.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("can limit the minimum number of characters in a hyphenated word designated by arguments.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenate("breaking characters before hyphenation opportunities", "en", 8).then(function(result) {
                        expect(result).toEqual("breaking cha\u00ADrac\u00ADters before hyphe\u00ADna\u00ADtion oppor\u00ADtu\u00ADni\u00ADties");
                        expect(dictionaryStore.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("can limit the minimum number of characters before the hyphen designated by arguments.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenate("breaking characters before hyphenation opportunities", "en", 4, 6).then(function(result) {
                        expect(result).toEqual("breaking charac\u00ADters before hyphena\u00ADtion opportu\u00ADni\u00ADties");
                        expect(dictionaryStore.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("can limit the minimum number of characters after the hyphen designated by arguments.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenate("breaking characters before hyphenation opportunities", "en", 4, 3, 6).then(function(result) {
                        expect(result).toEqual("breaking cha\u00ADracters before hyphe\u00ADnation oppor\u00ADtu\u00ADnities");
                        expect(dictionaryStore.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("do nothing when dictionary is null.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenate("breaking characters before hyphenation opportunities", "ja").then(function(result) {
                        expect(result).toEqual("breaking characters before hyphenation opportunities");
                        expect(dictionaryStore.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("do nothing when a word contains a soft hyphen.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenate("b\u00ADreaking characters before hyphenatio\u00ADn opportunities", "en").then(function(result) {
                        expect(result).toEqual("b\u00ADreaking cha\u00ADrac\u00ADters before hyphenatio\u00ADn oppor\u00ADtu\u00ADni\u00ADties");
                        expect(dictionaryStore.load).toHaveBeenCalled();
                        cb();
                    });
                });
            });
        });

        describe("#hyphenateTextNodeContent", function() {
            var context;
            beforeEach(function() {
                context = {
                    hyphens: 'auto',
                    lang: "en"
                };
            });

            it("hyphenate a text content.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenateTextNodeContent(context, "breaking characters before hyphenation opportunities").then(function(result) {
                        expect(result).toEqual("brea\u00ADking cha\u00ADrac\u00ADters before hyphe\u00ADna\u00ADtion oppor\u00ADtu\u00ADni\u00ADties");
                        expect(dictionaryStore.load).toHaveBeenCalledWith("en");
                        cb();
                    });
                });
            });
            it("can limit the minimum number of characters in a hyphenated word designated by hyphenateLimitChars.", function(cb) {
                adapt.task.start(function() {
                    context.hyphenateLimitChars = [8, 5, 5];
                    target.hyphenateTextNodeContent(context, "breaking characters before hyphenation opportunities").then(function(result) {
                        expect(result).toEqual("breaking characters before hyphe\u00ADnation oppor\u00ADtu\u00ADnities");
                        expect(dictionaryStore.load).toHaveBeenCalledWith("en");
                        cb();
                    });
                });
            });
            it("do nothing when string is space-only.", function(cb) {
                adapt.task.start(function() {
                    target.hyphenateTextNodeContent(context, " \t\r\n ").then(function(result) {
                        expect(result).toEqual(" \t\r\n ");
                        expect(dictionaryStore.load).not.toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("do nothing when hyphens is not 'auto'.", function(cb) {
                context.hyphens = null;
                adapt.task.start(function() {
                    target.hyphenateTextNodeContent(context, "breaking characters before hyphenation opportunities").then(function(result) {
                        expect(result).toEqual("breaking characters before hyphenation opportunities");
                        expect(dictionaryStore.load).not.toHaveBeenCalled();
                        cb();
                    });
                });
            });
            it("do nothing when lang is null.", function(cb) {
                context.lang = null;
                adapt.task.start(function() {
                    target.hyphenateTextNodeContent(context, "breaking characters before hyphenation opportunities").then(function(result) {
                        expect(result).toEqual("breaking characters before hyphenation opportunities");
                        expect(dictionaryStore.load).not.toHaveBeenCalled();
                        cb();
                    });
                });
            });
        });

        describe("#getPolyfilledInheritedProps", function() {
            it("returns a array of polyfilled inherited property names.", function() {
                expect(target.getPolyfilledInheritedProps()).toEqual([
                    "hyphens",
                    "hyphenate-character",
                    "hyphenate-limit-chars"
                ]);
            });
        });
    });
});
