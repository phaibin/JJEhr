/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var K = YAHOO.env.ua, C = YAHOO.util.Dom, Z = YAHOO.util.Event, H = YAHOO.lang, T = "DIV", P = "hd", M = "bd", O = "ft", X = "LI", A = "disabled", D = "mouseover", F = "mouseout", U = "mousedown", G = "mouseup", V = "click", B = "keydown", N = "keyup", I = "keypress", L = "clicktohide", S = "position", Q = "dynamic", Y = "showdelay", J = "selected", E = "visible", W = "UL", R = "MenuManager";
    YAHOO.widget.MenuManager = function () {
        var l = false, d = {}, o = {}, h = {}, c = {"click":"clickEvent", "mousedown":"mouseDownEvent", "mouseup":"mouseUpEvent", "mouseover":"mouseOverEvent", "mouseout":"mouseOutEvent", "keydown":"keyDownEvent", "keyup":"keyUpEvent", "keypress":"keyPressEvent", "focus":"focusEvent", "focusin":"focusEvent", "blur":"blurEvent", "focusout":"blurEvent"}, i = null;

        function b(r) {
            var p, q;
            if (r && r.tagName) {
                switch (r.tagName.toUpperCase()) {
                    case T:
                        p = r.parentNode;
                        if ((C.hasClass(r, P) || C.hasClass(r, M) || C.hasClass(r, O)) && p && p.tagName && p.tagName.toUpperCase() == T) {
                            q = p;
                        } else {
                            q = r;
                        }
                        break;
                    case X:
                        q = r;
                        break;
                    default:
                        p = r.parentNode;
                        if (p) {
                            q = b(p);
                        }
                        break;
                }
            }
            return q;
        }

        function e(t) {
            var p = Z.getTarget(t), q = b(p), u = true, w = t.type, x, r, s, z, y;
            if (q) {
                r = q.tagName.toUpperCase();
                if (r == X) {
                    s = q.id;
                    if (s && h[s]) {
                        z = h[s];
                        y = z.parent;
                    }
                } else {
                    if (r == T) {
                        if (q.id) {
                            y = d[q.id];
                        }
                    }
                }
            }
            if (y) {
                x = c[w];
                if (w == "click" && (K.gecko && y.platform != "mac") && t.button > 0) {
                    u = false;
                }
                if (u && z && !z.cfg.getProperty(A)) {
                    z[x].fire(t);
                }
                if (u) {
                    y[x].fire(t, z);
                }
            } else {
                if (w == U) {
                    for (var v in o) {
                        if (H.hasOwnProperty(o, v)) {
                            y = o[v];
                            if (y.cfg.getProperty(L) && !(y instanceof YAHOO.widget.MenuBar) && y.cfg.getProperty(S) == Q) {
                                y.hide();
                                if (K.ie && p.focus && (K.ie < 9)) {
                                    p.setActive();
                                }
                            } else {
                                if (y.cfg.getProperty(Y) > 0) {
                                    y._cancelShowDelay();
                                }
                                if (y.activeItem) {
                                    y.activeItem.blur();
                                    y.activeItem.cfg.setProperty(J, false);
                                    y.activeItem = null;
                                }
                            }
                        }
                    }
                }
            }
        }

        function n(q, p, r) {
            if (d[r.id]) {
                this.removeMenu(r);
            }
        }

        function k(q, p) {
            var r = p[1];
            if (r) {
                i = r;
            }
        }

        function f(q, p) {
            i = null;
        }

        function a(r, q) {
            var p = q[0], s = this.id;
            if (p) {
                o[s] = this;
            } else {
                if (o[s]) {
                    delete o[s];
                }
            }
        }

        function j(q, p) {
            m(this);
        }

        function m(q) {
            var p = q.id;
            if (p && h[p]) {
                if (i == q) {
                    i = null;
                }
                delete h[p];
                q.destroyEvent.unsubscribe(j);
            }
        }

        function g(q, p) {
            var s = p[0], r;
            if (s instanceof YAHOO.widget.MenuItem) {
                r = s.id;
                if (!h[r]) {
                    h[r] = s;
                    s.destroyEvent.subscribe(j);
                }
            }
        }

        return{addMenu:function (q) {
            var p;
            if (q instanceof YAHOO.widget.Menu && q.id && !d[q.id]) {
                d[q.id] = q;
                if (!l) {
                    p = document;
                    Z.on(p, D, e, this, true);
                    Z.on(p, F, e, this, true);
                    Z.on(p, U, e, this, true);
                    Z.on(p, G, e, this, true);
                    Z.on(p, V, e, this, true);
                    Z.on(p, B, e, this, true);
                    Z.on(p, N, e, this, true);
                    Z.on(p, I, e, this, true);
                    Z.onFocus(p, e, this, true);
                    Z.onBlur(p, e, this, true);
                    l = true;
                }
                q.cfg.subscribeToConfigEvent(E, a);
                q.destroyEvent.subscribe(n, q, this);
                q.itemAddedEvent.subscribe(g);
                q.focusEvent.subscribe(k);
                q.blurEvent.subscribe(f);
            }
        }, removeMenu:function (s) {
            var q, p, r;
            if (s) {
                q = s.id;
                if ((q in d) && (d[q] == s)) {
                    p = s.getItems();
                    if (p && p.length > 0) {
                        r = p.length - 1;
                        do {
                            m(p[r]);
                        } while (r--);
                    }
                    delete d[q];
                    if ((q in o) && (o[q] == s)) {
                        delete o[q];
                    }
                    if (s.cfg) {
                        s.cfg.unsubscribeFromConfigEvent(E, a);
                    }
                    s.destroyEvent.unsubscribe(n, s);
                    s.itemAddedEvent.unsubscribe(g);
                    s.focusEvent.unsubscribe(k);
                    s.blurEvent.unsubscribe(f);
                }
            }
        }, hideVisible:function () {
            var p;
            for (var q in o) {
                if (H.hasOwnProperty(o, q)) {
                    p = o[q];
                    if (!(p instanceof YAHOO.widget.MenuBar) && p.cfg.getProperty(S) == Q) {
                        p.hide();
                    }
                }
            }
        }, getVisible:function () {
            return o;
        }, getMenus:function () {
            return d;
        }, getMenu:function (q) {
            var p;
            if (q in d) {
                p = d[q];
            }
            return p;
        }, getMenuItem:function (q) {
            var p;
            if (q in h) {
                p = h[q];
            }
            return p;
        }, getMenuItemGroup:function (t) {
            var q = C.get(t), p, v, u, r, s;
            if (q && q.tagName && q.tagName.toUpperCase() == W) {
                v = q.firstChild;
                if (v) {
                    p = [];
                    do {
                        r = v.id;
                        if (r) {
                            u = this.getMenuItem(r);
                            if (u) {
                                p[p.length] = u;
                            }
                        }
                    } while ((v = v.nextSibling));
                    if (p.length > 0) {
                        s = p;
                    }
                }
            }
            return s;
        }, getFocusedMenuItem:function () {
            return i;
        }, getFocusedMenu:function () {
            var p;
            if (i) {
                p = i.parent.getRoot();
            }
            return p;
        }, toString:function () {
            return R;
        }};
    }();
})();
(function () {
    var AM = YAHOO.lang, Aq = "Menu", G = "DIV", K = "div", Am = "id", AH = "SELECT", e = "xy", R = "y", Ax = "UL", L = "ul", AJ = "first-of-type", k = "LI", h = "OPTGROUP", Az = "OPTION", Ah = "disabled", AY = "none", y = "selected", At = "groupindex", i = "index", O = "submenu", Au = "visible", AX = "hidedelay", Ac = "position", AD = "dynamic", C = "static", An = AD + "," + C, Q = "url", M = "#", V = "target", AU = "maxheight", T = "topscrollbar", x = "bottomscrollbar", d = "_", P = T + d + Ah, E = x + d + Ah, b = "mousemove", Av = "showdelay", c = "submenuhidedelay", AF = "iframe", w = "constraintoviewport", A4 = "preventcontextoverlap", AO = "submenualignment", Z = "autosubmenudisplay", AC = "clicktohide", g = "container", j = "scrollincrement", Aj = "minscrollheight", A2 = "classname", Ag = "shadow", Ar = "keepopen", A0 = "hd", D = "hastitle", p = "context", u = "", Ak = "mousedown", Ae = "keydown", Ao = "height", U = "width", AQ = "px", Ay = "effect", AE = "monitorresize", AW = "display", AV = "block", J = "visibility", z = "absolute", AS = "zindex", l = "yui-menu-body-scrolled", AK = "&#32;", A1 = " ", Ai = "mouseover", H = "mouseout", AR = "itemAdded", n = "itemRemoved", AL = "hidden", s = "yui-menu-shadow", AG = s + "-visible", m = s + A1 + AG;
    YAHOO.widget.Menu = function (A6, A5) {
        if (A5) {
            this.parent = A5.parent;
            this.lazyLoad = A5.lazyLoad || A5.lazyload;
            this.itemData = A5.itemData || A5.itemdata;
        }
        YAHOO.widget.Menu.superclass.constructor.call(this, A6, A5);
    };
    function B(A6) {
        var A5 = false;
        if (AM.isString(A6)) {
            A5 = (An.indexOf((A6.toLowerCase())) != -1);
        }
        return A5;
    }

    var f = YAHOO.util.Dom, AA = YAHOO.util.Event, Aw = YAHOO.widget.Module, AB = YAHOO.widget.Overlay, r = YAHOO.widget.Menu, A3 = YAHOO.widget.MenuManager, F = YAHOO.util.CustomEvent, As = YAHOO.env.ua, Ap, AT = false, Ad, Ab = [
        ["mouseOverEvent", Ai],
        ["mouseOutEvent", H],
        ["mouseDownEvent", Ak],
        ["mouseUpEvent", "mouseup"],
        ["clickEvent", "click"],
        ["keyPressEvent", "keypress"],
        ["keyDownEvent", Ae],
        ["keyUpEvent", "keyup"],
        ["focusEvent", "focus"],
        ["blurEvent", "blur"],
        ["itemAddedEvent", AR],
        ["itemRemovedEvent", n]
    ], AZ = {key:Au, value:false, validator:AM.isBoolean}, AP = {key:w, value:true, validator:AM.isBoolean, supercedes:[AF, "x", R, e]}, AI = {key:A4, value:true, validator:AM.isBoolean, supercedes:[w]}, S = {key:Ac, value:AD, validator:B, supercedes:[Au, AF]}, A = {key:AO, value:["tl", "tr"]}, t = {key:Z, value:true, validator:AM.isBoolean, suppressEvent:true}, Y = {key:Av, value:250, validator:AM.isNumber, suppressEvent:true}, q = {key:AX, value:0, validator:AM.isNumber, suppressEvent:true}, v = {key:c, value:250, validator:AM.isNumber, suppressEvent:true}, o = {key:AC, value:true, validator:AM.isBoolean, suppressEvent:true}, AN = {key:g, suppressEvent:true}, Af = {key:j, value:1, validator:AM.isNumber, supercedes:[AU], suppressEvent:true}, N = {key:Aj, value:90, validator:AM.isNumber, supercedes:[AU], suppressEvent:true}, X = {key:AU, value:0, validator:AM.isNumber, supercedes:[AF], suppressEvent:true}, W = {key:A2, value:null, validator:AM.isString, suppressEvent:true}, a = {key:Ah, value:false, validator:AM.isBoolean, suppressEvent:true}, I = {key:Ag, value:true, validator:AM.isBoolean, suppressEvent:true, supercedes:[Au]}, Al = {key:Ar, value:false, validator:AM.isBoolean};

    function Aa(A5) {
        Ad = AA.getTarget(A5);
    }

    YAHOO.lang.extend(r, AB, {CSS_CLASS_NAME:"yuimenu", ITEM_TYPE:null, GROUP_TITLE_TAG_NAME:"h6", OFF_SCREEN_POSITION:"-999em", _useHideDelay:false, _bHandledMouseOverEvent:false, _bHandledMouseOutEvent:false, _aGroupTitleElements:null, _aItemGroups:null, _aListElements:null, _nCurrentMouseX:0, _bStopMouseEventHandlers:false, _sClassName:null, lazyLoad:false, itemData:null, activeItem:null, parent:null, srcElement:null, init:function (A7, A6) {
        this._aItemGroups = [];
        this._aListElements = [];
        this._aGroupTitleElements = [];
        if (!this.ITEM_TYPE) {
            this.ITEM_TYPE = YAHOO.widget.MenuItem;
        }
        var A5;
        if (AM.isString(A7)) {
            A5 = f.get(A7);
        } else {
            if (A7.tagName) {
                A5 = A7;
            }
        }
        if (A5 && A5.tagName) {
            switch (A5.tagName.toUpperCase()) {
                case G:
                    this.srcElement = A5;
                    if (!A5.id) {
                        A5.setAttribute(Am, f.generateId());
                    }
                    r.superclass.init.call(this, A5);
                    this.beforeInitEvent.fire(r);
                    break;
                case AH:
                    this.srcElement = A5;
                    r.superclass.init.call(this, f.generateId());
                    this.beforeInitEvent.fire(r);
                    break;
            }
        } else {
            r.superclass.init.call(this, A7);
            this.beforeInitEvent.fire(r);
        }
        if (this.element) {
            f.addClass(this.element, this.CSS_CLASS_NAME);
            this.initEvent.subscribe(this._onInit);
            this.beforeRenderEvent.subscribe(this._onBeforeRender);
            this.renderEvent.subscribe(this._onRender);
            this.beforeShowEvent.subscribe(this._onBeforeShow);
            this.hideEvent.subscribe(this._onHide);
            this.showEvent.subscribe(this._onShow);
            this.beforeHideEvent.subscribe(this._onBeforeHide);
            this.mouseOverEvent.subscribe(this._onMouseOver);
            this.mouseOutEvent.subscribe(this._onMouseOut);
            this.clickEvent.subscribe(this._onClick);
            this.keyDownEvent.subscribe(this._onKeyDown);
            this.keyPressEvent.subscribe(this._onKeyPress);
            this.blurEvent.subscribe(this._onBlur);
            if (!AT) {
                AA.onFocus(document, Aa);
                AT = true;
            }
            if ((As.gecko && As.gecko < 1.9) || (As.webkit && As.webkit < 523)) {
                this.cfg.subscribeToConfigEvent(R, this._onYChange);
            }
            if (A6) {
                this.cfg.applyConfig(A6, true);
            }
            A3.addMenu(this);
            this.initEvent.fire(r);
        }
    }, _initSubTree:function () {
        var A6 = this.srcElement, A5, A8, BB, BC, BA, A9, A7;
        if (A6) {
            A5 = (A6.tagName && A6.tagName.toUpperCase());
            if (A5 == G) {
                BC = this.body.firstChild;
                if (BC) {
                    A8 = 0;
                    BB = this.GROUP_TITLE_TAG_NAME.toUpperCase();
                    do {
                        if (BC && BC.tagName) {
                            switch (BC.tagName.toUpperCase()) {
                                case BB:
                                    this._aGroupTitleElements[A8] = BC;
                                    break;
                                case Ax:
                                    this._aListElements[A8] = BC;
                                    this._aItemGroups[A8] = [];
                                    A8++;
                                    break;
                            }
                        }
                    } while ((BC = BC.nextSibling));
                    if (this._aListElements[0]) {
                        f.addClass(this._aListElements[0], AJ);
                    }
                }
            }
            BC = null;
            if (A5) {
                switch (A5) {
                    case G:
                        BA = this._aListElements;
                        A9 = BA.length;
                        if (A9 > 0) {
                            A7 = A9 - 1;
                            do {
                                BC = BA[A7].firstChild;
                                if (BC) {
                                    do {
                                        if (BC && BC.tagName && BC.tagName.toUpperCase() == k) {
                                            this.addItem(new this.ITEM_TYPE(BC, {parent:this}), A7);
                                        }
                                    } while ((BC = BC.nextSibling));
                                }
                            } while (A7--);
                        }
                        break;
                    case AH:
                        BC = A6.firstChild;
                        do {
                            if (BC && BC.tagName) {
                                switch (BC.tagName.toUpperCase()) {
                                    case h:
                                    case Az:
                                        this.addItem(new this.ITEM_TYPE(BC, {parent:this}));
                                        break;
                                }
                            }
                        } while ((BC = BC.nextSibling));
                        break;
                }
            }
        }
    }, _getFirstEnabledItem:function () {
        var A5 = this.getItems(), A9 = A5.length, A8, A7;
        for (var A6 = 0; A6 < A9; A6++) {
            A8 = A5[A6];
            if (A8 && !A8.cfg.getProperty(Ah) && A8.element.style.display != AY) {
                A7 = A8;
                break;
            }
        }
        return A7;
    }, _addItemToGroup:function (BA, BB, BF) {
        var BD, BG, A8, BE, A9, A6, A7, BC;

        function A5(BH, BI) {
            return(BH[BI] || A5(BH, (BI + 1)));
        }

        if (BB instanceof this.ITEM_TYPE) {
            BD = BB;
            BD.parent = this;
        } else {
            if (AM.isString(BB)) {
                BD = new this.ITEM_TYPE(BB, {parent:this});
            } else {
                if (AM.isObject(BB)) {
                    BB.parent = this;
                    BD = new this.ITEM_TYPE(BB.text, BB);
                }
            }
        }
        if (BD) {
            if (BD.cfg.getProperty(y)) {
                this.activeItem = BD;
            }
            BG = AM.isNumber(BA) ? BA : 0;
            A8 = this._getItemGroup(BG);
            if (!A8) {
                A8 = this._createItemGroup(BG);
            }
            if (AM.isNumber(BF)) {
                A9 = (BF >= A8.length);
                if (A8[BF]) {
                    A8.splice(BF, 0, BD);
                } else {
                    A8[BF] = BD;
                }
                BE = A8[BF];
                if (BE) {
                    if (A9 && (!BE.element.parentNode || BE.element.parentNode.nodeType == 11)) {
                        this._aListElements[BG].appendChild(BE.element);
                    } else {
                        A6 = A5(A8, (BF + 1));
                        if (A6 && (!BE.element.parentNode || BE.element.parentNode.nodeType == 11)) {
                            this._aListElements[BG].insertBefore(BE.element, A6.element);
                        }
                    }
                    BE.parent = this;
                    this._subscribeToItemEvents(BE);
                    this._configureSubmenu(BE);
                    this._updateItemProperties(BG);
                    this.itemAddedEvent.fire(BE);
                    this.changeContentEvent.fire();
                    BC = BE;
                }
            } else {
                A7 = A8.length;
                A8[A7] = BD;
                BE = A8[A7];
                if (BE) {
                    if (!f.isAncestor(this._aListElements[BG], BE.element)) {
                        this._aListElements[BG].appendChild(BE.element);
                    }
                    BE.element.setAttribute(At, BG);
                    BE.element.setAttribute(i, A7);
                    BE.parent = this;
                    BE.index = A7;
                    BE.groupIndex = BG;
                    this._subscribeToItemEvents(BE);
                    this._configureSubmenu(BE);
                    if (A7 === 0) {
                        f.addClass(BE.element, AJ);
                    }
                    this.itemAddedEvent.fire(BE);
                    this.changeContentEvent.fire();
                    BC = BE;
                }
            }
        }
        return BC;
    }, _removeItemFromGroupByIndex:function (A8, A6) {
        var A7 = AM.isNumber(A8) ? A8 : 0, A9 = this._getItemGroup(A7), BB, BA, A5;
        if (A9) {
            BB = A9.splice(A6, 1);
            BA = BB[0];
            if (BA) {
                this._updateItemProperties(A7);
                if (A9.length === 0) {
                    A5 = this._aListElements[A7];
                    if (A5 && A5.parentNode) {
                        A5.parentNode.removeChild(A5);
                    }
                    this._aItemGroups.splice(A7, 1);
                    this._aListElements.splice(A7, 1);
                    A5 = this._aListElements[0];
                    if (A5) {
                        f.addClass(A5, AJ);
                    }
                }
                this.itemRemovedEvent.fire(BA);
                this.changeContentEvent.fire();
            }
        }
        return BA;
    }, _removeItemFromGroupByValue:function (A8, A5) {
        var BA = this._getItemGroup(A8), BB, A9, A7, A6;
        if (BA) {
            BB = BA.length;
            A9 = -1;
            if (BB > 0) {
                A6 = BB - 1;
                do {
                    if (BA[A6] == A5) {
                        A9 = A6;
                        break;
                    }
                } while (A6--);
                if (A9 > -1) {
                    A7 = this._removeItemFromGroupByIndex(A8, A9);
                }
            }
        }
        return A7;
    }, _updateItemProperties:function (A6) {
        var A7 = this._getItemGroup(A6), BA = A7.length, A9, A8, A5;
        if (BA > 0) {
            A5 = BA - 1;
            do {
                A9 = A7[A5];
                if (A9) {
                    A8 = A9.element;
                    A9.index = A5;
                    A9.groupIndex = A6;
                    A8.setAttribute(At, A6);
                    A8.setAttribute(i, A5);
                    f.removeClass(A8, AJ);
                }
            } while (A5--);
            if (A8) {
                f.addClass(A8, AJ);
            }
        }
    }, _createItemGroup:function (A7) {
        var A5, A6;
        if (!this._aItemGroups[A7]) {
            this._aItemGroups[A7] = [];
            A5 = document.createElement(L);
            this._aListElements[A7] = A5;
            A6 = this._aItemGroups[A7];
        }
        return A6;
    }, _getItemGroup:function (A7) {
        var A5 = AM.isNumber(A7) ? A7 : 0, A8 = this._aItemGroups, A6;
        if (A5 in A8) {
            A6 = A8[A5];
        }
        return A6;
    }, _configureSubmenu:function (A5) {
        var A6 = A5.cfg.getProperty(O);
        if (A6) {
            this.cfg.configChangedEvent.subscribe(this._onParentMenuConfigChange, A6, true);
            this.renderEvent.subscribe(this._onParentMenuRender, A6, true);
        }
    }, _subscribeToItemEvents:function (A5) {
        A5.destroyEvent.subscribe(this._onMenuItemDestroy, A5, this);
        A5.cfg.configChangedEvent.subscribe(this._onMenuItemConfigChange, A5, this);
    }, _onVisibleChange:function (A7, A6) {
        var A5 = A6[0];
        if (A5) {
            f.addClass(this.element, Au);
        } else {
            f.removeClass(this.element, Au);
        }
    }, _cancelHideDelay:function () {
        var A5 = this.getRoot()._hideDelayTimer;
        if (A5) {
            A5.cancel();
        }
    }, _execHideDelay:function () {
        this._cancelHideDelay();
        var A5 = this.getRoot();
        A5._hideDelayTimer = AM.later(A5.cfg.getProperty(AX), this, function () {
            if (A5.activeItem) {
                if (A5.hasFocus()) {
                    A5.activeItem.focus();
                }
                A5.clearActiveItem();
            }
            if (A5 == this && !(this instanceof YAHOO.widget.MenuBar) && this.cfg.getProperty(Ac) == AD) {
                this.hide();
            }
        });
    }, _cancelShowDelay:function () {
        var A5 = this.getRoot()._showDelayTimer;
        if (A5) {
            A5.cancel();
        }
    }, _execSubmenuHideDelay:function (A7, A6, A5) {
        A7._submenuHideDelayTimer = AM.later(50, this, function () {
            if (this._nCurrentMouseX > (A6 + 10)) {
                A7._submenuHideDelayTimer = AM.later(A5, A7, function () {
                    this.hide();
                });
            } else {
                A7.hide();
            }
        });
    }, _disableScrollHeader:function () {
        if (!this._bHeaderDisabled) {
            f.addClass(this.header, P);
            this._bHeaderDisabled = true;
        }
    }, _disableScrollFooter:function () {
        if (!this._bFooterDisabled) {
            f.addClass(this.footer, E);
            this._bFooterDisabled = true;
        }
    }, _enableScrollHeader:function () {
        if (this._bHeaderDisabled) {
            f.removeClass(this.header, P);
            this._bHeaderDisabled = false;
        }
    }, _enableScrollFooter:function () {
        if (this._bFooterDisabled) {
            f.removeClass(this.footer, E);
            this._bFooterDisabled = false;
        }
    }, _onMouseOver:function (BH, BA) {
        var BI = BA[0], BE = BA[1], A5 = AA.getTarget(BI), A9 = this.getRoot(), BG = this._submenuHideDelayTimer, A6, A8, BD, A7, BC, BB;
        var BF = function () {
            if (this.parent.cfg.getProperty(y)) {
                this.show();
            }
        };
        if (!this._bStopMouseEventHandlers) {
            if (!this._bHandledMouseOverEvent && (A5 == this.element || f.isAncestor(this.element, A5))) {
                if (this._useHideDelay) {
                    this._cancelHideDelay();
                }
                this._nCurrentMouseX = 0;
                AA.on(this.element, b, this._onMouseMove, this, true);
                if (!(BE && f.isAncestor(BE.element, AA.getRelatedTarget(BI)))) {
                    this.clearActiveItem();
                }
                if (this.parent && BG) {
                    BG.cancel();
                    this.parent.cfg.setProperty(y, true);
                    A6 = this.parent.parent;
                    A6._bHandledMouseOutEvent = true;
                    A6._bHandledMouseOverEvent = false;
                }
                this._bHandledMouseOverEvent = true;
                this._bHandledMouseOutEvent = false;
            }
            if (BE && !BE.handledMouseOverEvent && !BE.cfg.getProperty(Ah) && (A5 == BE.element || f.isAncestor(BE.element, A5))) {
                A8 = this.cfg.getProperty(Av);
                BD = (A8 > 0);
                if (BD) {
                    this._cancelShowDelay();
                }
                A7 = this.activeItem;
                if (A7) {
                    A7.cfg.setProperty(y, false);
                }
                BC = BE.cfg;
                BC.setProperty(y, true);
                if (this.hasFocus() || A9._hasFocus) {
                    BE.focus();
                    A9._hasFocus = false;
                }
                if (this.cfg.getProperty(Z)) {
                    BB = BC.getProperty(O);
                    if (BB) {
                        if (BD) {
                            A9._showDelayTimer = AM.later(A9.cfg.getProperty(Av), BB, BF);
                        } else {
                            BB.show();
                        }
                    }
                }
                BE.handledMouseOverEvent = true;
                BE.handledMouseOutEvent = false;
            }
        }
    }, _onMouseOut:function (BD, A7) {
        var BE = A7[0], BB = A7[1], A8 = AA.getRelatedTarget(BE), BC = false, BA, A9, A5, A6;
        if (!this._bStopMouseEventHandlers) {
            if (BB && !BB.cfg.getProperty(Ah)) {
                BA = BB.cfg;
                A9 = BA.getProperty(O);
                if (A9 && (A8 == A9.element || f.isAncestor(A9.element, A8))) {
                    BC = true;
                }
                if (!BB.handledMouseOutEvent && ((A8 != BB.element && !f.isAncestor(BB.element, A8)) || BC)) {
                    if (!BC) {
                        BB.cfg.setProperty(y, false);
                        if (A9) {
                            A5 = this.cfg.getProperty(c);
                            A6 = this.cfg.getProperty(Av);
                            if (!(this instanceof YAHOO.widget.MenuBar) && A5 > 0 && A5 >= A6) {
                                this._execSubmenuHideDelay(A9, AA.getPageX(BE), A5);
                            } else {
                                A9.hide();
                            }
                        }
                    }
                    BB.handledMouseOutEvent = true;
                    BB.handledMouseOverEvent = false;
                }
            }
            if (!this._bHandledMouseOutEvent) {
                if (this._didMouseLeave(A8) || BC) {
                    if (this._useHideDelay) {
                        this._execHideDelay();
                    }
                    AA.removeListener(this.element, b, this._onMouseMove);
                    this._nCurrentMouseX = AA.getPageX(BE);
                    this._bHandledMouseOutEvent = true;
                    this._bHandledMouseOverEvent = false;
                }
            }
        }
    }, _didMouseLeave:function (A5) {
        return(A5 === this._shadow || (A5 != this.element && !f.isAncestor(this.element, A5)));
    }, _onMouseMove:function (A6, A5) {
        if (!this._bStopMouseEventHandlers) {
            this._nCurrentMouseX = AA.getPageX(A6);
        }
    }, _onClick:function (BG, A7) {
        var BH = A7[0], BB = A7[1], BD = false, A9, BE, A6, A5, BA, BC, BF;
        var A8 = function () {
            A6 = this.getRoot();
            if (A6 instanceof YAHOO.widget.MenuBar || A6.cfg.getProperty(Ac) == C) {
                A6.clearActiveItem();
            } else {
                A6.hide();
            }
        };
        if (BB) {
            if (BB.cfg.getProperty(Ah)) {
                AA.preventDefault(BH);
                A8.call(this);
            } else {
                A9 = BB.cfg.getProperty(O);
                BA = BB.cfg.getProperty(Q);
                if (BA) {
                    BC = BA.indexOf(M);
                    BF = BA.length;
                    if (BC != -1) {
                        BA = BA.substr(BC, BF);
                        BF = BA.length;
                        if (BF > 1) {
                            A5 = BA.substr(1, BF);
                            BE = YAHOO.widget.MenuManager.getMenu(A5);
                            if (BE) {
                                BD = (this.getRoot() === BE.getRoot());
                            }
                        } else {
                            if (BF === 1) {
                                BD = true;
                            }
                        }
                    }
                }
                if (BD && !BB.cfg.getProperty(V)) {
                    AA.preventDefault(BH);
                    if (As.webkit) {
                        BB.focus();
                    } else {
                        BB.focusEvent.fire();
                    }
                }
                if (!A9 && !this.cfg.getProperty(Ar)) {
                    A8.call(this);
                }
            }
        }
    }, _stopMouseEventHandlers:function () {
        this._bStopMouseEventHandlers = true;
        AM.later(10, this, function () {
            this._bStopMouseEventHandlers = false;
        });
    }, _onKeyDown:function (BJ, BD) {
        var BG = BD[0], BF = BD[1], BC, BH, A6, A9, BK, A5, BN, A8, BI, A7, BE, BM, BA, BB;
        if (this._useHideDelay) {
            this._cancelHideDelay();
        }
        if (BF && !BF.cfg.getProperty(Ah)) {
            BH = BF.cfg;
            A6 = this.parent;
            switch (BG.keyCode) {
                case 38:
                case 40:
                    BK = (BG.keyCode == 38) ? BF.getPreviousEnabledSibling() : BF.getNextEnabledSibling();
                    if (BK) {
                        this.clearActiveItem();
                        BK.cfg.setProperty(y, true);
                        BK.focus();
                        if (this.cfg.getProperty(AU) > 0 || f.hasClass(this.body, l)) {
                            A5 = this.body;
                            BN = A5.scrollTop;
                            A8 = A5.offsetHeight;
                            BI = this.getItems();
                            A7 = BI.length - 1;
                            BE = BK.element.offsetTop;
                            if (BG.keyCode == 40) {
                                if (BE >= (A8 + BN)) {
                                    A5.scrollTop = BE - A8;
                                } else {
                                    if (BE <= BN) {
                                        A5.scrollTop = 0;
                                    }
                                }
                                if (BK == BI[A7]) {
                                    A5.scrollTop = BK.element.offsetTop;
                                }
                            } else {
                                if (BE <= BN) {
                                    A5.scrollTop = BE - BK.element.offsetHeight;
                                } else {
                                    if (BE >= (BN + A8)) {
                                        A5.scrollTop = BE;
                                    }
                                }
                                if (BK == BI[0]) {
                                    A5.scrollTop = 0;
                                }
                            }
                            BN = A5.scrollTop;
                            BM = A5.scrollHeight - A5.offsetHeight;
                            if (BN === 0) {
                                this._disableScrollHeader();
                                this._enableScrollFooter();
                            } else {
                                if (BN == BM) {
                                    this._enableScrollHeader();
                                    this._disableScrollFooter();
                                } else {
                                    this._enableScrollHeader();
                                    this._enableScrollFooter();
                                }
                            }
                        }
                    }
                    AA.preventDefault(BG);
                    this._stopMouseEventHandlers();
                    break;
                case 39:
                    BC = BH.getProperty(O);
                    if (BC) {
                        if (!BH.getProperty(y)) {
                            BH.setProperty(y, true);
                        }
                        BC.show();
                        BC.setInitialFocus();
                        BC.setInitialSelection();
                    } else {
                        A9 = this.getRoot();
                        if (A9 instanceof YAHOO.widget.MenuBar) {
                            BK = A9.activeItem.getNextEnabledSibling();
                            if (BK) {
                                A9.clearActiveItem();
                                BK.cfg.setProperty(y, true);
                                BC = BK.cfg.getProperty(O);
                                if (BC) {
                                    BC.show();
                                    BC.setInitialFocus();
                                } else {
                                    BK.focus();
                                }
                            }
                        }
                    }
                    AA.preventDefault(BG);
                    this._stopMouseEventHandlers();
                    break;
                case 37:
                    if (A6) {
                        BA = A6.parent;
                        if (BA instanceof YAHOO.widget.MenuBar) {
                            BK = BA.activeItem.getPreviousEnabledSibling();
                            if (BK) {
                                BA.clearActiveItem();
                                BK.cfg.setProperty(y, true);
                                BC = BK.cfg.getProperty(O);
                                if (BC) {
                                    BC.show();
                                    BC.setInitialFocus();
                                } else {
                                    BK.focus();
                                }
                            }
                        } else {
                            this.hide();
                            A6.focus();
                        }
                    }
                    AA.preventDefault(BG);
                    this._stopMouseEventHandlers();
                    break;
            }
        }
        if (BG.keyCode == 27) {
            if (this.cfg.getProperty(Ac) == AD) {
                this.hide();
                if (this.parent) {
                    this.parent.focus();
                } else {
                    BB = this._focusedElement;
                    if (BB && BB.focus) {
                        try {
                            BB.focus();
                        } catch (BL) {
                        }
                    }
                }
            } else {
                if (this.activeItem) {
                    BC = this.activeItem.cfg.getProperty(O);
                    if (BC && BC.cfg.getProperty(Au)) {
                        BC.hide();
                        this.activeItem.focus();
                    } else {
                        this.activeItem.blur();
                        this.activeItem.cfg.setProperty(y, false);
                    }
                }
            }
            AA.preventDefault(BG);
        }
    }, _onKeyPress:function (A7, A6) {
        var A5 = A6[0];
        if (A5.keyCode == 40 || A5.keyCode == 38) {
            AA.preventDefault(A5);
        }
    }, _onBlur:function (A6, A5) {
        if (this._hasFocus) {
            this._hasFocus = false;
        }
    }, _onYChange:function (A6, A5) {
        var A8 = this.parent, BA, A7, A9;
        if (A8) {
            BA = A8.parent.body.scrollTop;
            if (BA > 0) {
                A9 = (this.cfg.getProperty(R) - BA);
                f.setY(this.element, A9);
                A7 = this.iframe;
                if (A7) {
                    f.setY(A7, A9);
                }
                this.cfg.setProperty(R, A9, true);
            }
        }
    }, _onScrollTargetMouseOver:function (BB, BE) {
        var BD = this._bodyScrollTimer;
        if (BD) {
            BD.cancel();
        }
        this._cancelHideDelay();
        var A7 = AA.getTarget(BB), A9 = this.body, A8 = this.cfg.getProperty(j), A5, A6;

        function BC() {
            var BF = A9.scrollTop;
            if (BF < A5) {
                A9.scrollTop = (BF + A8);
                this._enableScrollHeader();
            } else {
                A9.scrollTop = A5;
                this._bodyScrollTimer.cancel();
                this._disableScrollFooter();
            }
        }

        function BA() {
            var BF = A9.scrollTop;
            if (BF > 0) {
                A9.scrollTop = (BF - A8);
                this._enableScrollFooter();
            } else {
                A9.scrollTop = 0;
                this._bodyScrollTimer.cancel();
                this._disableScrollHeader();
            }
        }

        if (f.hasClass(A7, A0)) {
            A6 = BA;
        } else {
            A5 = A9.scrollHeight - A9.offsetHeight;
            A6 = BC;
        }
        this._bodyScrollTimer = AM.later(10, this, A6, null, true);
    }, _onScrollTargetMouseOut:function (A7, A5) {
        var A6 = this._bodyScrollTimer;
        if (A6) {
            A6.cancel();
        }
        this._cancelHideDelay();
    }, _onInit:function (A6, A5) {
        this.cfg.subscribeToConfigEvent(Au, this._onVisibleChange);
        var A7 = !this.parent, A8 = this.lazyLoad;
        if (((A7 && !A8) || (A7 && (this.cfg.getProperty(Au) || this.cfg.getProperty(Ac) == C)) || (!A7 && !A8)) && this.getItemGroups().length === 0) {
            if (this.srcElement) {
                this._initSubTree();
            }
            if (this.itemData) {
                this.addItems(this.itemData);
            }
        } else {
            if (A8) {
                this.cfg.fireQueue();
            }
        }
    }, _onBeforeRender:function (A8, A7) {
        var A9 = this.element, BC = this._aListElements.length, A6 = true, BB = 0, A5, BA;
        if (BC > 0) {
            do {
                A5 = this._aListElements[BB];
                if (A5) {
                    if (A6) {
                        f.addClass(A5, AJ);
                        A6 = false;
                    }
                    if (!f.isAncestor(A9, A5)) {
                        this.appendToBody(A5);
                    }
                    BA = this._aGroupTitleElements[BB];
                    if (BA) {
                        if (!f.isAncestor(A9, BA)) {
                            A5.parentNode.insertBefore(BA, A5);
                        }
                        f.addClass(A5, D);
                    }
                }
                BB++;
            } while (BB < BC);
        }
    }, _onRender:function (A6, A5) {
        if (this.cfg.getProperty(Ac) == AD) {
            if (!this.cfg.getProperty(Au)) {
                this.positionOffScreen();
            }
        }
    }, _onBeforeShow:function (A7, A6) {
        var A9, BC, A8, BA = this.cfg.getProperty(g);
        if (this.lazyLoad && this.getItemGroups().length === 0) {
            if (this.srcElement) {
                this._initSubTree();
            }
            if (this.itemData) {
                if (this.parent && this.parent.parent && this.parent.parent.srcElement && this.parent.parent.srcElement.tagName.toUpperCase() == AH) {
                    A9 = this.itemData.length;
                    for (BC = 0; BC < A9; BC++) {
                        if (this.itemData[BC].tagName) {
                            this.addItem((new this.ITEM_TYPE(this.itemData[BC])));
                        }
                    }
                } else {
                    this.addItems(this.itemData);
                }
            }
            A8 = this.srcElement;
            if (A8) {
                if (A8.tagName.toUpperCase() == AH) {
                    if (f.inDocument(A8)) {
                        this.render(A8.parentNode);
                    } else {
                        this.render(BA);
                    }
                } else {
                    this.render();
                }
            } else {
                if (this.parent) {
                    this.render(this.parent.element);
                } else {
                    this.render(BA);
                }
            }
        }
        var BB = this.parent, A5;
        if (!BB && this.cfg.getProperty(Ac) == AD) {
            this.cfg.refireEvent(e);
        }
        if (BB) {
            A5 = BB.parent.cfg.getProperty(AO);
            this.cfg.setProperty(p, [BB.element, A5[0], A5[1]]);
            this.align();
        }
    }, getConstrainedY:function (BH) {
        var BS = this, BO = BS.cfg.getProperty(p), BV = BS.cfg.getProperty(AU), BR, BG = {"trbr":true, "tlbl":true, "bltl":true, "brtr":true}, BA = (BO && BG[BO[1] + BO[2]]), BC = BS.element, BW = BC.offsetHeight, BQ = AB.VIEWPORT_OFFSET, BL = f.getViewportHeight(), BP = f.getDocumentScrollTop(), BM = (BS.cfg.getProperty(Aj) + BQ < BL), BU, BD, BJ, BK, BF = false, BE, A7, BI = BP + BQ, A9 = BP + BL - BW - BQ, A5 = BH;
        var BB = function () {
            var BX;
            if ((BS.cfg.getProperty(R) - BP) > BJ) {
                BX = (BJ - BW);
            } else {
                BX = (BJ + BK);
            }
            BS.cfg.setProperty(R, (BX + BP), true);
            return BX;
        };
        var A8 = function () {
            if ((BS.cfg.getProperty(R) - BP) > BJ) {
                return(A7 - BQ);
            } else {
                return(BE - BQ);
            }
        };
        var BN = function () {
            var BX;
            if ((BS.cfg.getProperty(R) - BP) > BJ) {
                BX = (BJ + BK);
            } else {
                BX = (BJ - BC.offsetHeight);
            }
            BS.cfg.setProperty(R, (BX + BP), true);
        };
        var A6 = function () {
            BS._setScrollHeight(this.cfg.getProperty(AU));
            BS.hideEvent.unsubscribe(A6);
        };
        var BT = function () {
            var Ba = A8(), BX = (BS.getItems().length > 0), BZ, BY;
            if (BW > Ba) {
                BZ = BX ? BS.cfg.getProperty(Aj) : BW;
                if ((Ba > BZ) && BX) {
                    BR = Ba;
                } else {
                    BR = BV;
                }
                BS._setScrollHeight(BR);
                BS.hideEvent.subscribe(A6);
                BN();
                if (Ba < BZ) {
                    if (BF) {
                        BB();
                    } else {
                        BB();
                        BF = true;
                        BY = BT();
                    }
                }
            } else {
                if (BR && (BR !== BV)) {
                    BS._setScrollHeight(BV);
                    BS.hideEvent.subscribe(A6);
                    BN();
                }
            }
            return BY;
        };
        if (BH < BI || BH > A9) {
            if (BM) {
                if (BS.cfg.getProperty(A4) && BA) {
                    BD = BO[0];
                    BK = BD.offsetHeight;
                    BJ = (f.getY(BD) - BP);
                    BE = BJ;
                    A7 = (BL - (BJ + BK));
                    BT();
                    A5 = BS.cfg.getProperty(R);
                } else {
                    if (!(BS instanceof YAHOO.widget.MenuBar) && BW >= BL) {
                        BU = (BL - (BQ * 2));
                        if (BU > BS.cfg.getProperty(Aj)) {
                            BS._setScrollHeight(BU);
                            BS.hideEvent.subscribe(A6);
                            BN();
                            A5 = BS.cfg.getProperty(R);
                        }
                    } else {
                        if (BH < BI) {
                            A5 = BI;
                        } else {
                            if (BH > A9) {
                                A5 = A9;
                            }
                        }
                    }
                }
            } else {
                A5 = BQ + BP;
            }
        }
        return A5;
    }, _onHide:function (A6, A5) {
        if (this.cfg.getProperty(Ac) === AD) {
            this.positionOffScreen();
        }
    }, _onShow:function (BD, BB) {
        var A5 = this.parent, A7, A8, BA, A6;

        function A9(BF) {
            var BE;
            if (BF.type == Ak || (BF.type == Ae && BF.keyCode == 27)) {
                BE = AA.getTarget(BF);
                if (BE != A7.element || !f.isAncestor(A7.element, BE)) {
                    A7.cfg.setProperty(Z, false);
                    AA.removeListener(document, Ak, A9);
                    AA.removeListener(document, Ae, A9);
                }
            }
        }

        function BC(BF, BE, BG) {
            this.cfg.setProperty(U, u);
            this.hideEvent.unsubscribe(BC, BG);
        }

        if (A5) {
            A7 = A5.parent;
            if (!A7.cfg.getProperty(Z) && (A7 instanceof YAHOO.widget.MenuBar || A7.cfg.getProperty(Ac) == C)) {
                A7.cfg.setProperty(Z, true);
                AA.on(document, Ak, A9);
                AA.on(document, Ae, A9);
            }
            if ((this.cfg.getProperty("x") < A7.cfg.getProperty("x")) && (As.gecko && As.gecko < 1.9) && !this.cfg.getProperty(U)) {
                A8 = this.element;
                BA = A8.offsetWidth;
                A8.style.width = BA + AQ;
                A6 = (BA - (A8.offsetWidth - BA)) + AQ;
                this.cfg.setProperty(U, A6);
                this.hideEvent.subscribe(BC, A6);
            }
        }
        if (this === this.getRoot() && this.cfg.getProperty(Ac) === AD) {
            this._focusedElement = Ad;
            this.focus();
        }
    }, _onBeforeHide:function (A7, A6) {
        var A5 = this.activeItem, A9 = this.getRoot(), BA, A8;
        if (A5) {
            BA = A5.cfg;
            BA.setProperty(y, false);
            A8 = BA.getProperty(O);
            if (A8) {
                A8.hide();
            }
        }
        if (As.ie && this.cfg.getProperty(Ac) === AD && this.parent) {
            A9._hasFocus = this.hasFocus();
        }
        if (A9 == this) {
            A9.blur();
        }
    }, _onParentMenuConfigChange:function (A6, A5, A9) {
        var A7 = A5[0][0], A8 = A5[0][1];
        switch (A7) {
            case AF:
            case w:
            case AX:
            case Av:
            case c:
            case AC:
            case Ay:
            case A2:
            case j:
            case AU:
            case Aj:
            case AE:
            case Ag:
            case A4:
            case Ar:
                A9.cfg.setProperty(A7, A8);
                break;
            case AO:
                if (!(this.parent.parent instanceof YAHOO.widget.MenuBar)) {
                    A9.cfg.setProperty(A7, A8);
                }
                break;
        }
    }, _onParentMenuRender:function (A6, A5, BB) {
        var A8 = BB.parent.parent, A7 = A8.cfg, A9 = {constraintoviewport:A7.getProperty(w), xy:[0, 0], clicktohide:A7.getProperty(AC), effect:A7.getProperty(Ay), showdelay:A7.getProperty(Av), hidedelay:A7.getProperty(AX), submenuhidedelay:A7.getProperty(c), classname:A7.getProperty(A2), scrollincrement:A7.getProperty(j), maxheight:A7.getProperty(AU), minscrollheight:A7.getProperty(Aj), iframe:A7.getProperty(AF), shadow:A7.getProperty(Ag), preventcontextoverlap:A7.getProperty(A4), monitorresize:A7.getProperty(AE), keepopen:A7.getProperty(Ar)}, BA;
        if (!(A8 instanceof YAHOO.widget.MenuBar)) {
            A9[AO] = A7.getProperty(AO);
        }
        BB.cfg.applyConfig(A9);
        if (!this.lazyLoad) {
            BA = this.parent.element;
            if (this.element.parentNode == BA) {
                this.render();
            } else {
                this.render(BA);
            }
        }
    }, _onMenuItemDestroy:function (A7, A6, A5) {
        this._removeItemFromGroupByValue(A5.groupIndex, A5);
    }, _onMenuItemConfigChange:function (A7, A6, A5) {
        var A9 = A6[0][0], BA = A6[0][1], A8;
        switch (A9) {
            case y:
                if (BA === true) {
                    this.activeItem = A5;
                }
                break;
            case O:
                A8 = A6[0][1];
                if (A8) {
                    this._configureSubmenu(A5);
                }
                break;
        }
    }, configVisible:function (A7, A6, A8) {
        var A5, A9;
        if (this.cfg.getProperty(Ac) == AD) {
            r.superclass.configVisible.call(this, A7, A6, A8);
        } else {
            A5 = A6[0];
            A9 = f.getStyle(this.element, AW);
            f.setStyle(this.element, J, Au);
            if (A5) {
                if (A9 != AV) {
                    this.beforeShowEvent.fire();
                    f.setStyle(this.element, AW, AV);
                    this.showEvent.fire();
                }
            } else {
                if (A9 == AV) {
                    this.beforeHideEvent.fire();
                    f.setStyle(this.element, AW, AY);
                    this.hideEvent.fire();
                }
            }
        }
    }, configPosition:function (A7, A6, BA) {
        var A9 = this.element, A8 = A6[0] == C ? C : z, BB = this.cfg, A5;
        f.setStyle(A9, Ac, A8);
        if (A8 == C) {
            f.setStyle(A9, AW, AV);
            BB.setProperty(Au, true);
        } else {
            f.setStyle(A9, J, AL);
        }
        if (A8 == z) {
            A5 = BB.getProperty(AS);
            if (!A5 || A5 === 0) {
                BB.setProperty(AS, 1);
            }
        }
    }, configIframe:function (A6, A5, A7) {
        if (this.cfg.getProperty(Ac) == AD) {
            r.superclass.configIframe.call(this, A6, A5, A7);
        }
    }, configHideDelay:function (A6, A5, A7) {
        var A8 = A5[0];
        this._useHideDelay = (A8 > 0);
    }, configContainer:function (A6, A5, A8) {
        var A7 = A5[0];
        if (AM.isString(A7)) {
            this.cfg.setProperty(g, f.get(A7), true);
        }
    }, _clearSetWidthFlag:function () {
        this._widthSetForScroll = false;
        this.cfg.unsubscribeFromConfigEvent(U, this._clearSetWidthFlag);
    }, _subscribeScrollHandlers:function (A6, A5) {
        var A8 = this._onScrollTargetMouseOver;
        var A7 = this._onScrollTargetMouseOut;
        AA.on(A6, Ai, A8, this, true);
        AA.on(A6, H, A7, this, true);
        AA.on(A5, Ai, A8, this, true);
        AA.on(A5, H, A7, this, true);
    }, _unsubscribeScrollHandlers:function (A6, A5) {
        var A8 = this._onScrollTargetMouseOver;
        var A7 = this._onScrollTargetMouseOut;
        AA.removeListener(A6, Ai, A8);
        AA.removeListener(A6, H, A7);
        AA.removeListener(A5, Ai, A8);
        AA.removeListener(A5, H, A7);
    }, _setScrollHeight:function (BF) {
        var BC = BF, BB = false, BG = false, A8, A9, BE, A6, A5, BD, BA, A7;
        if (this.getItems().length > 0) {
            A8 = this.element;
            A9 = this.body;
            BE = this.header;
            A6 = this.footer;
            A5 = this.cfg.getProperty(Aj);
            if (BC > 0 && BC < A5) {
                BC = A5;
            }
            f.setStyle(A9, Ao, u);
            f.removeClass(A9, l);
            A9.scrollTop = 0;
            BG = ((As.gecko && As.gecko < 1.9) || As.ie);
            if (BC > 0 && BG && !this.cfg.getProperty(U)) {
                BA = A8.offsetWidth;
                A8.style.width = BA + AQ;
                A7 = (BA - (A8.offsetWidth - BA)) + AQ;
                this.cfg.unsubscribeFromConfigEvent(U, this._clearSetWidthFlag);
                this.cfg.setProperty(U, A7);
                this._widthSetForScroll = true;
                this.cfg.subscribeToConfigEvent(U, this._clearSetWidthFlag);
            }
            if (BC > 0 && (!BE && !A6)) {
                this.setHeader(AK);
                this.setFooter(AK);
                BE = this.header;
                A6 = this.footer;
                f.addClass(BE, T);
                f.addClass(A6, x);
                A8.insertBefore(BE, A9);
                A8.appendChild(A6);
            }
            BD = BC;
            if (BE && A6) {
                BD = (BD - (BE.offsetHeight + A6.offsetHeight));
            }
            if ((BD > 0) && (A9.offsetHeight > BC)) {
                f.addClass(A9, l);
                f.setStyle(A9, Ao, (BD + AQ));
                if (!this._hasScrollEventHandlers) {
                    this._subscribeScrollHandlers(BE, A6);
                    this._hasScrollEventHandlers = true;
                }
                this._disableScrollHeader();
                this._enableScrollFooter();
                BB = true;
            } else {
                if (BE && A6) {
                    if (this._widthSetForScroll) {
                        this._widthSetForScroll = false;
                        this.cfg.unsubscribeFromConfigEvent(U, this._clearSetWidthFlag);
                        this.cfg.setProperty(U, u);
                    }
                    this._enableScrollHeader();
                    this._enableScrollFooter();
                    if (this._hasScrollEventHandlers) {
                        this._unsubscribeScrollHandlers(BE, A6);
                        this._hasScrollEventHandlers = false;
                    }
                    A8.removeChild(BE);
                    A8.removeChild(A6);
                    this.header = null;
                    this.footer = null;
                    BB = true;
                }
            }
            if (BB) {
                this.cfg.refireEvent(AF);
                this.cfg.refireEvent(Ag);
            }
        }
    }, _setMaxHeight:function (A6, A5, A7) {
        this._setScrollHeight(A7);
        this.renderEvent.unsubscribe(this._setMaxHeight);
    }, configMaxHeight:function (A6, A5, A7) {
        var A8 = A5[0];
        if (this.lazyLoad && !this.body && A8 > 0) {
            this.renderEvent.subscribe(this._setMaxHeight, A8, this);
        } else {
            this._setScrollHeight(A8);
        }
    }, configClassName:function (A7, A6, A8) {
        var A5 = A6[0];
        if (this._sClassName) {
            f.removeClass(this.element, this._sClassName);
        }
        f.addClass(this.element, A5);
        this._sClassName = A5;
    }, _onItemAdded:function (A6, A5) {
        var A7 = A5[0];
        if (A7) {
            A7.cfg.setProperty(Ah, true);
        }
    }, configDisabled:function (A7, A6, BA) {
        var A9 = A6[0], A5 = this.getItems(), BB, A8;
        if (AM.isArray(A5)) {
            BB = A5.length;
            if (BB > 0) {
                A8 = BB - 1;
                do {
                    A5[A8].cfg.setProperty(Ah, A9);
                } while (A8--);
            }
            if (A9) {
                this.clearActiveItem(true);
                f.addClass(this.element, Ah);
                this.itemAddedEvent.subscribe(this._onItemAdded);
            } else {
                f.removeClass(this.element, Ah);
                this.itemAddedEvent.unsubscribe(this._onItemAdded);
            }
        }
    }, _sizeShadow:function () {
        var A6 = this.element, A5 = this._shadow;
        if (A5 && A6) {
            if (A5.style.width && A5.style.height) {
                A5.style.width = u;
                A5.style.height = u;
            }
            A5.style.width = (A6.offsetWidth + 6) + AQ;
            A5.style.height = (A6.offsetHeight + 1) + AQ;
        }
    }, _replaceShadow:function () {
        this.element.appendChild(this._shadow);
    }, _addShadowVisibleClass:function () {
        f.addClass(this._shadow, AG);
    }, _removeShadowVisibleClass:function () {
        f.removeClass(this._shadow, AG);
    }, _removeShadow:function () {
        var A5 = (this._shadow && this._shadow.parentNode);
        if (A5) {
            A5.removeChild(this._shadow);
        }
        this.beforeShowEvent.unsubscribe(this._addShadowVisibleClass);
        this.beforeHideEvent.unsubscribe(this._removeShadowVisibleClass);
        this.cfg.unsubscribeFromConfigEvent(U, this._sizeShadow);
        this.cfg.unsubscribeFromConfigEvent(Ao, this._sizeShadow);
        this.cfg.unsubscribeFromConfigEvent(AU, this._sizeShadow);
        this.cfg.unsubscribeFromConfigEvent(AU, this._replaceShadow);
        this.changeContentEvent.unsubscribe(this._sizeShadow);
        Aw.textResizeEvent.unsubscribe(this._sizeShadow);
    }, _createShadow:function () {
        var A6 = this._shadow, A5;
        if (!A6) {
            A5 = this.element;
            if (!Ap) {
                Ap = document.createElement(K);
                Ap.className = m;
            }
            A6 = Ap.cloneNode(false);
            A5.appendChild(A6);
            this._shadow = A6;
            this.beforeShowEvent.subscribe(this._addShadowVisibleClass);
            this.beforeHideEvent.subscribe(this._removeShadowVisibleClass);
            if (As.ie) {
                AM.later(0, this, function () {
                    this._sizeShadow();
                    this.syncIframe();
                });
                this.cfg.subscribeToConfigEvent(U, this._sizeShadow);
                this.cfg.subscribeToConfigEvent(Ao, this._sizeShadow);
                this.cfg.subscribeToConfigEvent(AU, this._sizeShadow);
                this.changeContentEvent.subscribe(this._sizeShadow);
                Aw.textResizeEvent.subscribe(this._sizeShadow, this, true);
                this.destroyEvent.subscribe(function () {
                    Aw.textResizeEvent.unsubscribe(this._sizeShadow, this);
                });
            }
            this.cfg.subscribeToConfigEvent(AU, this._replaceShadow);
        }
    }, _shadowBeforeShow:function () {
        if (this._shadow) {
            this._replaceShadow();
            if (As.ie) {
                this._sizeShadow();
            }
        } else {
            this._createShadow();
        }
        this.beforeShowEvent.unsubscribe(this._shadowBeforeShow);
    }, configShadow:function (A6, A5, A7) {
        var A8 = A5[0];
        if (A8 && this.cfg.getProperty(Ac) == AD) {
            if (this.cfg.getProperty(Au)) {
                if (this._shadow) {
                    this._replaceShadow();
                    if (As.ie) {
                        this._sizeShadow();
                    }
                } else {
                    this._createShadow();
                }
            } else {
                this.beforeShowEvent.subscribe(this._shadowBeforeShow);
            }
        } else {
            if (!A8) {
                this.beforeShowEvent.unsubscribe(this._shadowBeforeShow);
                this._removeShadow();
            }
        }
    }, initEvents:function () {
        r.superclass.initEvents.call(this);
        var A6 = Ab.length - 1, A7, A5;
        do {
            A7 = Ab[A6];
            A5 = this.createEvent(A7[1]);
            A5.signature = F.LIST;
            this[A7[0]] = A5;
        } while (A6--);
    }, positionOffScreen:function () {
        var A6 = this.iframe, A7 = this.element, A5 = this.OFF_SCREEN_POSITION;
        A7.style.top = u;
        A7.style.left = u;
        if (A6) {
            A6.style.top = A5;
            A6.style.left = A5;
        }
    }, getRoot:function () {
        var A7 = this.parent, A6, A5;
        if (A7) {
            A6 = A7.parent;
            A5 = A6 ? A6.getRoot() : this;
        } else {
            A5 = this;
        }
        return A5;
    }, toString:function () {
        var A6 = Aq, A5 = this.id;
        if (A5) {
            A6 += (A1 + A5);
        }
        return A6;
    }, setItemGroupTitle:function (BA, A9) {
        var A8, A7, A6, A5;
        if (AM.isString(BA) && BA.length > 0) {
            A8 = AM.isNumber(A9) ? A9 : 0;
            A7 = this._aGroupTitleElements[A8];
            if (A7) {
                A7.innerHTML = BA;
            } else {
                A7 = document.createElement(this.GROUP_TITLE_TAG_NAME);
                A7.innerHTML = BA;
                this._aGroupTitleElements[A8] = A7;
            }
            A6 = this._aGroupTitleElements.length - 1;
            do {
                if (this._aGroupTitleElements[A6]) {
                    f.removeClass(this._aGroupTitleElements[A6], AJ);
                    A5 = A6;
                }
            } while (A6--);
            if (A5 !== null) {
                f.addClass(this._aGroupTitleElements[A5], AJ);
            }
            this.changeContentEvent.fire();
        }
    }, addItem:function (A5, A6) {
        return this._addItemToGroup(A6, A5);
    }, addItems:function (A9, A8) {
        var BB, A5, BA, A6, A7;
        if (AM.isArray(A9)) {
            BB = A9.length;
            A5 = [];
            for (A6 = 0; A6 < BB; A6++) {
                BA = A9[A6];
                if (BA) {
                    if (AM.isArray(BA)) {
                        A5[A5.length] = this.addItems(BA, A6);
                    } else {
                        A5[A5.length] = this._addItemToGroup(A8, BA);
                    }
                }
            }
            if (A5.length) {
                A7 = A5;
            }
        }
        return A7;
    }, insertItem:function (A5, A6, A7) {
        return this._addItemToGroup(A7, A5, A6);
    }, removeItem:function (A5, A7) {
        var A8, A6;
        if (!AM.isUndefined(A5)) {
            if (A5 instanceof YAHOO.widget.MenuItem) {
                A8 = this._removeItemFromGroupByValue(A7, A5);
            } else {
                if (AM.isNumber(A5)) {
                    A8 = this._removeItemFromGroupByIndex(A7, A5);
                }
            }
            if (A8) {
                A8.destroy();
                A6 = A8;
            }
        }
        return A6;
    }, getItems:function () {
        var A8 = this._aItemGroups, A6, A7, A5 = [];
        if (AM.isArray(A8)) {
            A6 = A8.length;
            A7 = ((A6 == 1) ? A8[0] : (Array.prototype.concat.apply(A5, A8)));
        }
        return A7;
    }, getItemGroups:function () {
        return this._aItemGroups;
    }, getItem:function (A6, A7) {
        var A8, A5;
        if (AM.isNumber(A6)) {
            A8 = this._getItemGroup(A7);
            if (A8) {
                A5 = A8[A6];
            }
        }
        return A5;
    }, getSubmenus:function () {
        var A6 = this.getItems(), BA = A6.length, A5, A7, A9, A8;
        if (BA > 0) {
            A5 = [];
            for (A8 = 0; A8 < BA; A8++) {
                A9 = A6[A8];
                if (A9) {
                    A7 = A9.cfg.getProperty(O);
                    if (A7) {
                        A5[A5.length] = A7;
                    }
                }
            }
        }
        return A5;
    }, clearContent:function () {
        var A9 = this.getItems(), A6 = A9.length, A7 = this.element, A8 = this.body, BD = this.header, A5 = this.footer, BC, BB, BA;
        if (A6 > 0) {
            BA = A6 - 1;
            do {
                BC = A9[BA];
                if (BC) {
                    BB = BC.cfg.getProperty(O);
                    if (BB) {
                        this.cfg.configChangedEvent.unsubscribe(this._onParentMenuConfigChange, BB);
                        this.renderEvent.unsubscribe(this._onParentMenuRender, BB);
                    }
                    this.removeItem(BC, BC.groupIndex);
                }
            } while (BA--);
        }
        if (BD) {
            AA.purgeElement(BD);
            A7.removeChild(BD);
        }
        if (A5) {
            AA.purgeElement(A5);
            A7.removeChild(A5);
        }
        if (A8) {
            AA.purgeElement(A8);
            A8.innerHTML = u;
        }
        this.activeItem = null;
        this._aItemGroups = [];
        this._aListElements = [];
        this._aGroupTitleElements = [];
        this.cfg.setProperty(U, null);
    }, destroy:function (A5) {
        this.clearContent();
        this._aItemGroups = null;
        this._aListElements = null;
        this._aGroupTitleElements = null;
        r.superclass.destroy.call(this, A5);
    }, setInitialFocus:function () {
        var A5 = this._getFirstEnabledItem();
        if (A5) {
            A5.focus();
        }
    }, setInitialSelection:function () {
        var A5 = this._getFirstEnabledItem();
        if (A5) {
            A5.cfg.setProperty(y, true);
        }
    }, clearActiveItem:function (A7) {
        if (this.cfg.getProperty(Av) > 0) {
            this._cancelShowDelay();
        }
        var A5 = this.activeItem, A8, A6;
        if (A5) {
            A8 = A5.cfg;
            if (A7) {
                A5.blur();
                this.getRoot()._hasFocus = true;
            }
            A8.setProperty(y, false);
            A6 = A8.getProperty(O);
            if (A6) {
                A6.hide();
            }
            this.activeItem = null;
        }
    }, focus:function () {
        if (!this.hasFocus()) {
            this.setInitialFocus();
        }
    }, blur:function () {
        var A5;
        if (this.hasFocus()) {
            A5 = A3.getFocusedMenuItem();
            if (A5) {
                A5.blur();
            }
        }
    }, hasFocus:function () {
        return(A3.getFocusedMenu() == this.getRoot());
    }, _doItemSubmenuSubscribe:function (A6, A5, A8) {
        var A9 = A5[0], A7 = A9.cfg.getProperty(O);
        if (A7) {
            A7.subscribe.apply(A7, A8);
        }
    }, _doSubmenuSubscribe:function (A6, A5, A8) {
        var A7 = this.cfg.getProperty(O);
        if (A7) {
            A7.subscribe.apply(A7, A8);
        }
    }, subscribe:function () {
        r.superclass.subscribe.apply(this, arguments);
        r.superclass.subscribe.call(this, AR, this._doItemSubmenuSubscribe, arguments);
        var A5 = this.getItems(), A9, A8, A6, A7;
        if (A5) {
            A9 = A5.length;
            if (A9 > 0) {
                A7 = A9 - 1;
                do {
                    A8 = A5[A7];
                    A6 = A8.cfg.getProperty(O);
                    if (A6) {
                        A6.subscribe.apply(A6, arguments);
                    } else {
                        A8.cfg.subscribeToConfigEvent(O, this._doSubmenuSubscribe, arguments);
                    }
                } while (A7--);
            }
        }
    }, unsubscribe:function () {
        r.superclass.unsubscribe.apply(this, arguments);
        r.superclass.unsubscribe.call(this, AR, this._doItemSubmenuSubscribe, arguments);
        var A5 = this.getItems(), A9, A8, A6, A7;
        if (A5) {
            A9 = A5.length;
            if (A9 > 0) {
                A7 = A9 - 1;
                do {
                    A8 = A5[A7];
                    A6 = A8.cfg.getProperty(O);
                    if (A6) {
                        A6.unsubscribe.apply(A6, arguments);
                    } else {
                        A8.cfg.unsubscribeFromConfigEvent(O, this._doSubmenuSubscribe, arguments);
                    }
                } while (A7--);
            }
        }
    }, initDefaultConfig:function () {
        r.superclass.initDefaultConfig.call(this);
        var A5 = this.cfg;
        A5.addProperty(AZ.key, {handler:this.configVisible, value:AZ.value, validator:AZ.validator});
        A5.addProperty(AP.key, {handler:this.configConstrainToViewport, value:AP.value, validator:AP.validator, supercedes:AP.supercedes});
        A5.addProperty(AI.key, {value:AI.value, validator:AI.validator, supercedes:AI.supercedes});
        A5.addProperty(S.key, {handler:this.configPosition, value:S.value, validator:S.validator, supercedes:S.supercedes});
        A5.addProperty(A.key, {value:A.value, suppressEvent:A.suppressEvent});
        A5.addProperty(t.key, {value:t.value, validator:t.validator, suppressEvent:t.suppressEvent});
        A5.addProperty(Y.key, {value:Y.value, validator:Y.validator, suppressEvent:Y.suppressEvent});
        A5.addProperty(q.key, {handler:this.configHideDelay, value:q.value, validator:q.validator, suppressEvent:q.suppressEvent});
        A5.addProperty(v.key, {value:v.value, validator:v.validator, suppressEvent:v.suppressEvent});
        A5.addProperty(o.key, {value:o.value, validator:o.validator, suppressEvent:o.suppressEvent});
        A5.addProperty(AN.key, {handler:this.configContainer, value:document.body, suppressEvent:AN.suppressEvent});
        A5.addProperty(Af.key, {value:Af.value, validator:Af.validator, supercedes:Af.supercedes, suppressEvent:Af.suppressEvent});
        A5.addProperty(N.key, {value:N.value, validator:N.validator, supercedes:N.supercedes, suppressEvent:N.suppressEvent});
        A5.addProperty(X.key, {handler:this.configMaxHeight, value:X.value, validator:X.validator, suppressEvent:X.suppressEvent, supercedes:X.supercedes});
        A5.addProperty(W.key, {handler:this.configClassName, value:W.value, validator:W.validator, supercedes:W.supercedes});
        A5.addProperty(a.key, {handler:this.configDisabled, value:a.value, validator:a.validator, suppressEvent:a.suppressEvent});
        A5.addProperty(I.key, {handler:this.configShadow, value:I.value, validator:I.validator});
        A5.addProperty(Al.key, {value:Al.value, validator:Al.validator});
    }});
})();
(function () {
    YAHOO.widget.MenuItem = function (AS, AR) {
        if (AS) {
            if (AR) {
                this.parent = AR.parent;
                this.value = AR.value;
                this.id = AR.id;
            }
            this.init(AS, AR);
        }
    };
    var x = YAHOO.util.Dom, j = YAHOO.widget.Module, AB = YAHOO.widget.Menu, c = YAHOO.widget.MenuItem, AK = YAHOO.util.CustomEvent, k = YAHOO.env.ua, AQ = YAHOO.lang, AL = "text", O = "#", Q = "-", L = "helptext", n = "url", AH = "target", A = "emphasis", N = "strongemphasis", b = "checked", w = "submenu", H = "disabled", B = "selected", P = "hassubmenu", U = "checked-disabled", AI = "hassubmenu-disabled", AD = "hassubmenu-selected", T = "checked-selected", q = "onclick", J = "classname", AJ = "", i = "OPTION", v = "OPTGROUP", K = "LI", AE = "href", r = "SELECT", X = "DIV", AN = '<em class="helptext">', a = "<em>", I = "</em>", W = "<strong>", y = "</strong>", Y = "preventcontextoverlap", h = "obj", AG = "scope", t = "none", V = "visible", E = " ", m = "MenuItem", AA = "click", D = "show", M = "hide", S = "li", AF = '<a href="#"></a>', p = [
        ["mouseOverEvent", "mouseover"],
        ["mouseOutEvent", "mouseout"],
        ["mouseDownEvent", "mousedown"],
        ["mouseUpEvent", "mouseup"],
        ["clickEvent", AA],
        ["keyPressEvent", "keypress"],
        ["keyDownEvent", "keydown"],
        ["keyUpEvent", "keyup"],
        ["focusEvent", "focus"],
        ["blurEvent", "blur"],
        ["destroyEvent", "destroy"]
    ], o = {key:AL, value:AJ, validator:AQ.isString, suppressEvent:true}, s = {key:L, supercedes:[AL], suppressEvent:true}, G = {key:n, value:O, suppressEvent:true}, AO = {key:AH, suppressEvent:true}, AP = {key:A, value:false, validator:AQ.isBoolean, suppressEvent:true, supercedes:[AL]}, d = {key:N, value:false, validator:AQ.isBoolean, suppressEvent:true, supercedes:[AL]}, l = {key:b, value:false, validator:AQ.isBoolean, suppressEvent:true, supercedes:[H, B]}, F = {key:w, suppressEvent:true, supercedes:[H, B]}, AM = {key:H, value:false, validator:AQ.isBoolean, suppressEvent:true, supercedes:[AL, B]}, f = {key:B, value:false, validator:AQ.isBoolean, suppressEvent:true}, u = {key:q, suppressEvent:true}, AC = {key:J, value:null, validator:AQ.isString, suppressEvent:true}, z = {key:"keylistener", value:null, suppressEvent:true}, C = null, e = {};
    var Z = function (AU, AT) {
        var AR = e[AU];
        if (!AR) {
            e[AU] = {};
            AR = e[AU];
        }
        var AS = AR[AT];
        if (!AS) {
            AS = AU + Q + AT;
            AR[AT] = AS;
        }
        return AS;
    };
    var g = function (AR) {
        x.addClass(this.element, Z(this.CSS_CLASS_NAME, AR));
        x.addClass(this._oAnchor, Z(this.CSS_LABEL_CLASS_NAME, AR));
    };
    var R = function (AR) {
        x.removeClass(this.element, Z(this.CSS_CLASS_NAME, AR));
        x.removeClass(this._oAnchor, Z(this.CSS_LABEL_CLASS_NAME, AR));
    };
    c.prototype = {CSS_CLASS_NAME:"yuimenuitem", CSS_LABEL_CLASS_NAME:"yuimenuitemlabel", SUBMENU_TYPE:null, _oAnchor:null, _oHelpTextEM:null, _oSubmenu:null, _oOnclickAttributeValue:null, _sClassName:null, constructor:c, index:null, groupIndex:null, parent:null, element:null, srcElement:null, value:null, browser:j.prototype.browser, id:null, init:function (AR, Ab) {
        if (!this.SUBMENU_TYPE) {
            this.SUBMENU_TYPE = AB;
        }
        this.cfg = new YAHOO.util.Config(this);
        this.initDefaultConfig();
        var AX = this.cfg, AY = O, AT, Aa, AZ, AS, AV, AU, AW;
        if (AQ.isString(AR)) {
            this._createRootNodeStructure();
            AX.queueProperty(AL, AR);
        } else {
            if (AR && AR.tagName) {
                switch (AR.tagName.toUpperCase()) {
                    case i:
                        this._createRootNodeStructure();
                        AX.queueProperty(AL, AR.text);
                        AX.queueProperty(H, AR.disabled);
                        this.value = AR.value;
                        this.srcElement = AR;
                        break;
                    case v:
                        this._createRootNodeStructure();
                        AX.queueProperty(AL, AR.label);
                        AX.queueProperty(H, AR.disabled);
                        this.srcElement = AR;
                        this._initSubTree();
                        break;
                    case K:
                        AZ = x.getFirstChild(AR);
                        if (AZ) {
                            AY = AZ.getAttribute(AE, 2);
                            AS = AZ.getAttribute(AH);
                            AV = AZ.innerHTML;
                        }
                        this.srcElement = AR;
                        this.element = AR;
                        this._oAnchor = AZ;
                        AX.setProperty(AL, AV, true);
                        AX.setProperty(n, AY, true);
                        AX.setProperty(AH, AS, true);
                        this._initSubTree();
                        break;
                }
            }
        }
        if (this.element) {
            AU = (this.srcElement || this.element).id;
            if (!AU) {
                AU = this.id || x.generateId();
                this.element.id = AU;
            }
            this.id = AU;
            x.addClass(this.element, this.CSS_CLASS_NAME);
            x.addClass(this._oAnchor, this.CSS_LABEL_CLASS_NAME);
            AW = p.length - 1;
            do {
                Aa = p[AW];
                AT = this.createEvent(Aa[1]);
                AT.signature = AK.LIST;
                this[Aa[0]] = AT;
            } while (AW--);
            if (Ab) {
                AX.applyConfig(Ab);
            }
            AX.fireQueue();
        }
    }, _createRootNodeStructure:function () {
        var AR, AS;
        if (!C) {
            C = document.createElement(S);
            C.innerHTML = AF;
        }
        AR = C.cloneNode(true);
        AR.className = this.CSS_CLASS_NAME;
        AS = AR.firstChild;
        AS.className = this.CSS_LABEL_CLASS_NAME;
        this.element = AR;
        this._oAnchor = AS;
    }, _initSubTree:function () {
        var AX = this.srcElement, AT = this.cfg, AV, AU, AS, AR, AW;
        if (AX.childNodes.length > 0) {
            if (this.parent.lazyLoad && this.parent.srcElement && this.parent.srcElement.tagName.toUpperCase() == r) {
                AT.setProperty(w, {id:x.generateId(), itemdata:AX.childNodes});
            } else {
                AV = AX.firstChild;
                AU = [];
                do {
                    if (AV && AV.tagName) {
                        switch (AV.tagName.toUpperCase()) {
                            case X:
                                AT.setProperty(w, AV);
                                break;
                            case i:
                                AU[AU.length] = AV;
                                break;
                        }
                    }
                } while ((AV = AV.nextSibling));
                AS = AU.length;
                if (AS > 0) {
                    AR = new this.SUBMENU_TYPE(x.generateId());
                    AT.setProperty(w, AR);
                    for (AW = 0; AW < AS; AW++) {
                        AR.addItem((new AR.ITEM_TYPE(AU[AW])));
                    }
                }
            }
        }
    }, configText:function (Aa, AT, AV) {
        var AS = AT[0], AU = this.cfg, AY = this._oAnchor, AR = AU.getProperty(L), AZ = AJ, AW = AJ, AX = AJ;
        if (AS) {
            if (AR) {
                AZ = AN + AR + I;
            }
            if (AU.getProperty(A)) {
                AW = a;
                AX = I;
            }
            if (AU.getProperty(N)) {
                AW = W;
                AX = y;
            }
            AY.innerHTML = (AW + AS + AX + AZ);
        }
    }, configHelpText:function (AT, AS, AR) {
        this.cfg.refireEvent(AL);
    }, configURL:function (AT, AS, AR) {
        var AV = AS[0];
        if (!AV) {
            AV = O;
        }
        var AU = this._oAnchor;
        if (k.opera) {
            AU.removeAttribute(AE);
        }
        AU.setAttribute(AE, AV);
    }, configTarget:function (AU, AT, AS) {
        var AR = AT[0], AV = this._oAnchor;
        if (AR && AR.length > 0) {
            AV.setAttribute(AH, AR);
        } else {
            AV.removeAttribute(AH);
        }
    }, configEmphasis:function (AT, AS, AR) {
        var AV = AS[0], AU = this.cfg;
        if (AV && AU.getProperty(N)) {
            AU.setProperty(N, false);
        }
        AU.refireEvent(AL);
    }, configStrongEmphasis:function (AU, AT, AS) {
        var AR = AT[0], AV = this.cfg;
        if (AR && AV.getProperty(A)) {
            AV.setProperty(A, false);
        }
        AV.refireEvent(AL);
    }, configChecked:function (AT, AS, AR) {
        var AV = AS[0], AU = this.cfg;
        if (AV) {
            g.call(this, b);
        } else {
            R.call(this, b);
        }
        AU.refireEvent(AL);
        if (AU.getProperty(H)) {
            AU.refireEvent(H);
        }
        if (AU.getProperty(B)) {
            AU.refireEvent(B);
        }
    }, configDisabled:function (AT, AS, AR) {
        var AV = AS[0], AW = this.cfg, AU = AW.getProperty(w), AX = AW.getProperty(b);
        if (AV) {
            if (AW.getProperty(B)) {
                AW.setProperty(B, false);
            }
            g.call(this, H);
            if (AU) {
                g.call(this, AI);
            }
            if (AX) {
                g.call(this, U);
            }
        } else {
            R.call(this, H);
            if (AU) {
                R.call(this, AI);
            }
            if (AX) {
                R.call(this, U);
            }
        }
    }, configSelected:function (AT, AS, AR) {
        var AX = this.cfg, AW = this._oAnchor, AV = AS[0], AY = AX.getProperty(b), AU = AX.getProperty(w);
        if (k.opera) {
            AW.blur();
        }
        if (AV && !AX.getProperty(H)) {
            g.call(this, B);
            if (AU) {
                g.call(this, AD);
            }
            if (AY) {
                g.call(this, T);
            }
        } else {
            R.call(this, B);
            if (AU) {
                R.call(this, AD);
            }
            if (AY) {
                R.call(this, T);
            }
        }
        if (this.hasFocus() && k.opera) {
            AW.focus();
        }
    }, _onSubmenuBeforeHide:function (AU, AT) {
        var AV = this.parent, AR;

        function AS() {
            AV._oAnchor.blur();
            AR.beforeHideEvent.unsubscribe(AS);
        }

        if (AV.hasFocus()) {
            AR = AV.parent;
            AR.beforeHideEvent.subscribe(AS);
        }
    }, configSubmenu:function (AY, AT, AW) {
        var AV = AT[0], AU = this.cfg, AS = this.parent && this.parent.lazyLoad, AX, AZ, AR;
        if (AV) {
            if (AV instanceof AB) {
                AX = AV;
                AX.parent = this;
                AX.lazyLoad = AS;
            } else {
                if (AQ.isObject(AV) && AV.id && !AV.nodeType) {
                    AZ = AV.id;
                    AR = AV;
                    AR.lazyload = AS;
                    AR.parent = this;
                    AX = new this.SUBMENU_TYPE(AZ, AR);
                    AU.setProperty(w, AX, true);
                } else {
                    AX = new this.SUBMENU_TYPE(AV, {lazyload:AS, parent:this});
                    AU.setProperty(w, AX, true);
                }
            }
            if (AX) {
                AX.cfg.setProperty(Y, true);
                g.call(this, P);
                if (AU.getProperty(n) === O) {
                    AU.setProperty(n, (O + AX.id));
                }
                this._oSubmenu = AX;
                if (k.opera) {
                    AX.beforeHideEvent.subscribe(this._onSubmenuBeforeHide);
                }
            }
        } else {
            R.call(this, P);
            if (this._oSubmenu) {
                this._oSubmenu.destroy();
            }
        }
        if (AU.getProperty(H)) {
            AU.refireEvent(H);
        }
        if (AU.getProperty(B)) {
            AU.refireEvent(B);
        }
    }, configOnClick:function (AT, AS, AR) {
        var AU = AS[0];
        if (this._oOnclickAttributeValue && (this._oOnclickAttributeValue != AU)) {
            this.clickEvent.unsubscribe(this._oOnclickAttributeValue.fn, this._oOnclickAttributeValue.obj);
            this._oOnclickAttributeValue = null;
        }
        if (!this._oOnclickAttributeValue && AQ.isObject(AU) && AQ.isFunction(AU.fn)) {
            this.clickEvent.subscribe(AU.fn, ((h in AU) ? AU.obj : this), ((AG in AU) ? AU.scope : null));
            this._oOnclickAttributeValue = AU;
        }
    }, configClassName:function (AU, AT, AS) {
        var AR = AT[0];
        if (this._sClassName) {
            x.removeClass(this.element, this._sClassName);
        }
        x.addClass(this.element, AR);
        this._sClassName = AR;
    }, _dispatchClickEvent:function () {
        var AS = this, AR;
        if (!AS.cfg.getProperty(H)) {
            AR = x.getFirstChild(AS.element);
            this._dispatchDOMClick(AR);
        }
    }, _dispatchDOMClick:function (AS) {
        var AR;
        if (k.ie && k.ie < 9) {
            AS.fireEvent(q);
        } else {
            if ((k.gecko && k.gecko >= 1.9) || k.opera || k.webkit) {
                AR = document.createEvent("HTMLEvents");
                AR.initEvent(AA, true, true);
            } else {
                AR = document.createEvent("MouseEvents");
                AR.initMouseEvent(AA, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            }
            AS.dispatchEvent(AR);
        }
    }, _createKeyListener:function (AU, AT, AW) {
        var AV = this, AS = AV.parent;
        var AR = new YAHOO.util.KeyListener(AS.element.ownerDocument, AW, {fn:AV._dispatchClickEvent, scope:AV, correctScope:true});
        if (AS.cfg.getProperty(V)) {
            AR.enable();
        }
        AS.subscribe(D, AR.enable, null, AR);
        AS.subscribe(M, AR.disable, null, AR);
        AV._keyListener = AR;
        AS.unsubscribe(D, AV._createKeyListener, AW);
    }, configKeyListener:function (AT, AS) {
        var AV = AS[0], AU = this, AR = AU.parent;
        if (AU._keyData) {
            AR.unsubscribe(D, AU._createKeyListener, AU._keyData);
            AU._keyData = null;
        }
        if (AU._keyListener) {
            AR.unsubscribe(D, AU._keyListener.enable);
            AR.unsubscribe(M, AU._keyListener.disable);
            AU._keyListener.disable();
            AU._keyListener = null;
        }
        if (AV) {
            AU._keyData = AV;
            AR.subscribe(D, AU._createKeyListener, AV, AU);
        }
    }, initDefaultConfig:function () {
        var AR = this.cfg;
        AR.addProperty(o.key, {handler:this.configText, value:o.value, validator:o.validator, suppressEvent:o.suppressEvent});
        AR.addProperty(s.key, {handler:this.configHelpText, supercedes:s.supercedes, suppressEvent:s.suppressEvent});
        AR.addProperty(G.key, {handler:this.configURL, value:G.value, suppressEvent:G.suppressEvent});
        AR.addProperty(AO.key, {handler:this.configTarget, suppressEvent:AO.suppressEvent});
        AR.addProperty(AP.key, {handler:this.configEmphasis, value:AP.value, validator:AP.validator, suppressEvent:AP.suppressEvent, supercedes:AP.supercedes});
        AR.addProperty(d.key, {handler:this.configStrongEmphasis, value:d.value, validator:d.validator, suppressEvent:d.suppressEvent, supercedes:d.supercedes});
        AR.addProperty(l.key, {handler:this.configChecked, value:l.value, validator:l.validator, suppressEvent:l.suppressEvent, supercedes:l.supercedes});
        AR.addProperty(AM.key, {handler:this.configDisabled, value:AM.value, validator:AM.validator, suppressEvent:AM.suppressEvent});
        AR.addProperty(f.key, {handler:this.configSelected, value:f.value, validator:f.validator, suppressEvent:f.suppressEvent});
        AR.addProperty(F.key, {handler:this.configSubmenu, supercedes:F.supercedes, suppressEvent:F.suppressEvent});
        AR.addProperty(u.key, {handler:this.configOnClick, suppressEvent:u.suppressEvent});
        AR.addProperty(AC.key, {handler:this.configClassName, value:AC.value, validator:AC.validator, suppressEvent:AC.suppressEvent});
        AR.addProperty(z.key, {handler:this.configKeyListener, value:z.value, suppressEvent:z.suppressEvent});
    }, getNextSibling:function () {
        var AR = function (AX) {
            return(AX.nodeName.toLowerCase() === "ul");
        }, AV = this.element, AU = x.getNextSibling(AV), AT, AS, AW;
        if (!AU) {
            AT = AV.parentNode;
            AS = x.getNextSiblingBy(AT, AR);
            if (AS) {
                AW = AS;
            } else {
                AW = x.getFirstChildBy(AT.parentNode, AR);
            }
            AU = x.getFirstChild(AW);
        }
        return YAHOO.widget.MenuManager.getMenuItem(AU.id);
    }, getNextEnabledSibling:function () {
        var AR = this.getNextSibling();
        return(AR.cfg.getProperty(H) || AR.element.style.display == t) ? AR.getNextEnabledSibling() : AR;
    }, getPreviousSibling:function () {
        var AR = function (AX) {
            return(AX.nodeName.toLowerCase() === "ul");
        }, AV = this.element, AU = x.getPreviousSibling(AV), AT, AS, AW;
        if (!AU) {
            AT = AV.parentNode;
            AS = x.getPreviousSiblingBy(AT, AR);
            if (AS) {
                AW = AS;
            } else {
                AW = x.getLastChildBy(AT.parentNode, AR);
            }
            AU = x.getLastChild(AW);
        }
        return YAHOO.widget.MenuManager.getMenuItem(AU.id);
    }, getPreviousEnabledSibling:function () {
        var AR = this.getPreviousSibling();
        return(AR.cfg.getProperty(H) || AR.element.style.display == t) ? AR.getPreviousEnabledSibling() : AR;
    }, focus:function () {
        var AU = this.parent, AT = this._oAnchor, AR = AU.activeItem;

        function AS() {
            try {
                if (!(k.ie && !document.hasFocus())) {
                    if (AR) {
                        AR.blurEvent.fire();
                    }
                    AT.focus();
                    this.focusEvent.fire();
                }
            } catch (AV) {
            }
        }

        if (!this.cfg.getProperty(H) && AU && AU.cfg.getProperty(V) && this.element.style.display != t) {
            AQ.later(0, this, AS);
        }
    }, blur:function () {
        var AR = this.parent;
        if (!this.cfg.getProperty(H) && AR && AR.cfg.getProperty(V)) {
            AQ.later(0, this, function () {
                try {
                    this._oAnchor.blur();
                    this.blurEvent.fire();
                } catch (AS) {
                }
            }, 0);
        }
    }, hasFocus:function () {
        return(YAHOO.widget.MenuManager.getFocusedMenuItem() == this);
    }, destroy:function () {
        var AT = this.element, AS, AR, AV, AU;
        if (AT) {
            AS = this.cfg.getProperty(w);
            if (AS) {
                AS.destroy();
            }
            AR = AT.parentNode;
            if (AR) {
                AR.removeChild(AT);
                this.destroyEvent.fire();
            }
            AU = p.length - 1;
            do {
                AV = p[AU];
                this[AV[0]].unsubscribeAll();
            } while (AU--);
            this.cfg.configChangedEvent.unsubscribeAll();
        }
    }, toString:function () {
        var AS = m, AR = this.id;
        if (AR) {
            AS += (E + AR);
        }
        return AS;
    }};
    AQ.augmentProto(c, YAHOO.util.EventProvider);
})();
(function () {
    var B = "xy", C = "mousedown", F = "ContextMenu", J = " ";
    YAHOO.widget.ContextMenu = function (L, K) {
        YAHOO.widget.ContextMenu.superclass.constructor.call(this, L, K);
    };
    var I = YAHOO.util.Event, E = YAHOO.env.ua, G = YAHOO.widget.ContextMenu, A = {"TRIGGER_CONTEXT_MENU":"triggerContextMenu", "CONTEXT_MENU":(E.opera ? C : "contextmenu"), "CLICK":"click"}, H = {key:"trigger", suppressEvent:true};

    function D(L, K, M) {
        this.cfg.setProperty(B, M);
        this.beforeShowEvent.unsubscribe(D, M);
    }

    YAHOO.lang.extend(G, YAHOO.widget.Menu, {_oTrigger:null, _bCancelled:false, contextEventTarget:null, triggerContextMenuEvent:null, init:function (L, K) {
        G.superclass.init.call(this, L);
        this.beforeInitEvent.fire(G);
        if (K) {
            this.cfg.applyConfig(K, true);
        }
        this.initEvent.fire(G);
    }, initEvents:function () {
        G.superclass.initEvents.call(this);
        this.triggerContextMenuEvent = this.createEvent(A.TRIGGER_CONTEXT_MENU);
        this.triggerContextMenuEvent.signature = YAHOO.util.CustomEvent.LIST;
    }, cancel:function () {
        this._bCancelled = true;
    }, _removeEventHandlers:function () {
        var K = this._oTrigger;
        if (K) {
            I.removeListener(K, A.CONTEXT_MENU, this._onTriggerContextMenu);
            if (E.opera) {
                I.removeListener(K, A.CLICK, this._onTriggerClick);
            }
        }
    }, _onTriggerClick:function (L, K) {
        if (L.ctrlKey) {
            I.stopEvent(L);
        }
    }, _onTriggerContextMenu:function (M, K) {
        var L;
        if (!(M.type == C && !M.ctrlKey)) {
            this.contextEventTarget = I.getTarget(M);
            this.triggerContextMenuEvent.fire(M);
            if (!this._bCancelled) {
                I.stopEvent(M);
                YAHOO.widget.MenuManager.hideVisible();
                L = I.getXY(M);
                if (!YAHOO.util.Dom.inDocument(this.element)) {
                    this.beforeShowEvent.subscribe(D, L);
                } else {
                    this.cfg.setProperty(B, L);
                }
                this.show();
            }
            this._bCancelled = false;
        }
    }, toString:function () {
        var L = F, K = this.id;
        if (K) {
            L += (J + K);
        }
        return L;
    }, initDefaultConfig:function () {
        G.superclass.initDefaultConfig.call(this);
        this.cfg.addProperty(H.key, {handler:this.configTrigger, suppressEvent:H.suppressEvent});
    }, destroy:function (K) {
        this._removeEventHandlers();
        G.superclass.destroy.call(this, K);
    }, configTrigger:function (L, K, N) {
        var M = K[0];
        if (M) {
            if (this._oTrigger) {
                this._removeEventHandlers();
            }
            this._oTrigger = M;
            I.on(M, A.CONTEXT_MENU, this._onTriggerContextMenu, this, true);
            if (E.opera) {
                I.on(M, A.CLICK, this._onTriggerClick, this, true);
            }
        } else {
            this._removeEventHandlers();
        }
    }});
}());
YAHOO.widget.ContextMenuItem = YAHOO.widget.MenuItem;
(function () {
    var D = YAHOO.lang, N = "static", M = "dynamic," + N, A = "disabled", F = "selected", B = "autosubmenudisplay", G = "submenu", C = "visible", Q = " ", H = "submenutoggleregion", P = "MenuBar";
    YAHOO.widget.MenuBar = function (T, S) {
        YAHOO.widget.MenuBar.superclass.constructor.call(this, T, S);
    };
    function O(T) {
        var S = false;
        if (D.isString(T)) {
            S = (M.indexOf((T.toLowerCase())) != -1);
        }
        return S;
    }

    var R = YAHOO.util.Event, L = YAHOO.widget.MenuBar, K = {key:"position", value:N, validator:O, supercedes:[C]}, E = {key:"submenualignment", value:["tl", "bl"]}, J = {key:B, value:false, validator:D.isBoolean, suppressEvent:true}, I = {key:H, value:false, validator:D.isBoolean};
    D.extend(L, YAHOO.widget.Menu, {init:function (T, S) {
        if (!this.ITEM_TYPE) {
            this.ITEM_TYPE = YAHOO.widget.MenuBarItem;
        }
        L.superclass.init.call(this, T);
        this.beforeInitEvent.fire(L);
        if (S) {
            this.cfg.applyConfig(S, true);
        }
        this.initEvent.fire(L);
    }, CSS_CLASS_NAME:"yuimenubar", SUBMENU_TOGGLE_REGION_WIDTH:20, _onKeyDown:function (U, T, Y) {
        var S = T[0], Z = T[1], W, X, V;
        if (Z && !Z.cfg.getProperty(A)) {
            X = Z.cfg;
            switch (S.keyCode) {
                case 37:
                case 39:
                    if (Z == this.activeItem && !X.getProperty(F)) {
                        X.setProperty(F, true);
                    } else {
                        V = (S.keyCode == 37) ? Z.getPreviousEnabledSibling() : Z.getNextEnabledSibling();
                        if (V) {
                            this.clearActiveItem();
                            V.cfg.setProperty(F, true);
                            W = V.cfg.getProperty(G);
                            if (W) {
                                W.show();
                                W.setInitialFocus();
                            } else {
                                V.focus();
                            }
                        }
                    }
                    R.preventDefault(S);
                    break;
                case 40:
                    if (this.activeItem != Z) {
                        this.clearActiveItem();
                        X.setProperty(F, true);
                        Z.focus();
                    }
                    W = X.getProperty(G);
                    if (W) {
                        if (W.cfg.getProperty(C)) {
                            W.setInitialSelection();
                            W.setInitialFocus();
                        } else {
                            W.show();
                            W.setInitialFocus();
                        }
                    }
                    R.preventDefault(S);
                    break;
            }
        }
        if (S.keyCode == 27 && this.activeItem) {
            W = this.activeItem.cfg.getProperty(G);
            if (W && W.cfg.getProperty(C)) {
                W.hide();
                this.activeItem.focus();
            } else {
                this.activeItem.cfg.setProperty(F, false);
                this.activeItem.blur();
            }
            R.preventDefault(S);
        }
    }, _onClick:function (e, Y, b) {
        L.superclass._onClick.call(this, e, Y, b);
        var d = Y[1], T = true, S, f, U, W, Z, a, c, V;
        var X = function () {
            if (a.cfg.getProperty(C)) {
                a.hide();
            } else {
                a.show();
            }
        };
        if (d && !d.cfg.getProperty(A)) {
            f = Y[0];
            U = R.getTarget(f);
            W = this.activeItem;
            Z = this.cfg;
            if (W && W != d) {
                this.clearActiveItem();
            }
            d.cfg.setProperty(F, true);
            a = d.cfg.getProperty(G);
            if (a) {
                S = d.element;
                c = YAHOO.util.Dom.getX(S);
                V = c + (S.offsetWidth - this.SUBMENU_TOGGLE_REGION_WIDTH);
                if (Z.getProperty(H)) {
                    if (R.getPageX(f) > V) {
                        X();
                        R.preventDefault(f);
                        T = false;
                    }
                } else {
                    X();
                }
            }
        }
        return T;
    }, configSubmenuToggle:function (U, T) {
        var S = T[0];
        if (S) {
            this.cfg.setProperty(B, false);
        }
    }, toString:function () {
        var T = P, S = this.id;
        if (S) {
            T += (Q + S);
        }
        return T;
    }, initDefaultConfig:function () {
        L.superclass.initDefaultConfig.call(this);
        var S = this.cfg;
        S.addProperty(K.key, {handler:this.configPosition, value:K.value, validator:K.validator, supercedes:K.supercedes});
        S.addProperty(E.key, {value:E.value, suppressEvent:E.suppressEvent});
        S.addProperty(J.key, {value:J.value, validator:J.validator, suppressEvent:J.suppressEvent});
        S.addProperty(I.key, {value:I.value, validator:I.validator, handler:this.configSubmenuToggle});
    }});
}());
YAHOO.widget.MenuBarItem = function (B, A) {
    YAHOO.widget.MenuBarItem.superclass.constructor.call(this, B, A);
};
YAHOO.lang.extend(YAHOO.widget.MenuBarItem, YAHOO.widget.MenuItem, {init:function (B, A) {
    if (!this.SUBMENU_TYPE) {
        this.SUBMENU_TYPE = YAHOO.widget.Menu;
    }
    YAHOO.widget.MenuBarItem.superclass.init.call(this, B);
    var C = this.cfg;
    if (A) {
        C.applyConfig(A, true);
    }
    C.fireQueue();
}, CSS_CLASS_NAME:"yuimenubaritem", CSS_LABEL_CLASS_NAME:"yuimenubaritemlabel", toString:function () {
    var A = "MenuBarItem";
    if (this.cfg && this.cfg.getProperty("text")) {
        A += (": " + this.cfg.getProperty("text"));
    }
    return A;
}});
YAHOO.register("menu", YAHOO.widget.Menu, {version:"2.9.0", build:"2800"});