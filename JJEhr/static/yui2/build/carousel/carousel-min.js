/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var Q = "Carousel";
    YAHOO.widget.Carousel = function (u, t) {
        YAHOO.widget.Carousel.superclass.constructor.call(this, u, t);
    };
    var V = YAHOO.widget.Carousel, g = YAHOO.util.Dom, e = YAHOO.util.Event, r = YAHOO.lang, U = {}, a = true, F = "afterScroll", i = "allItemsRemoved", d = "beforeHide", K = "beforePageChange", k = "beforeScroll", Z = "beforeShow", B = "blur", Y = "focus", c = "hide", T = "itemAdded", q = "itemRemoved", R = "itemReplaced", C = "itemSelected", M = "loadItems", J = "navigationStateChange", j = "pageChange", I = "render", W = "show", b = "startAutoPlay", s = "stopAutoPlay", L = "uiUpdate";

    function H(t, u) {
        var v;
        for (v in u) {
            if (u.hasOwnProperty(v)) {
                g.setStyle(t, v, u[v]);
            }
        }
    }

    function X(u, t) {
        var v = document.createElement(u);
        t = t || {};
        if (t.className) {
            g.addClass(v, t.className);
        }
        if (t.styles) {
            H(v, t.styles);
        }
        if (t.parent) {
            t.parent.appendChild(v);
        }
        if (t.id) {
            v.setAttribute("id", t.id);
        }
        if (t.content) {
            if (t.content.nodeName) {
                v.appendChild(t.content);
            } else {
                v.innerHTML = t.content;
            }
        }
        return v;
    }

    function f(v, u, t) {
        var x;
        if (!v) {
            return 0;
        }
        function w(AA, z) {
            var AB;
            if (z == "marginRight" && (YAHOO.env.ua.webkit || (YAHOO.env.ua.ie && YAHOO.env.ua.ie >= 9))) {
                AB = parseInt(g.getStyle(AA, "marginLeft"), 10);
            } else {
                AB = parseInt(g.getStyle(AA, z), 10);
            }
            return r.isNumber(AB) ? AB : 0;
        }

        function y(AA, z) {
            var AB;
            if (z == "marginRight" && YAHOO.env.ua.webkit) {
                AB = parseFloat(g.getStyle(AA, "marginLeft"));
            } else {
                AB = parseFloat(g.getStyle(AA, z));
            }
            return r.isNumber(AB) ? AB : 0;
        }

        if (typeof t == "undefined") {
            t = "int";
        }
        switch (u) {
            case"height":
                x = v.offsetHeight;
                if (x > 0) {
                    x += w(v, "marginTop") + w(v, "marginBottom");
                } else {
                    x = y(v, "height") + w(v, "marginTop") + w(v, "marginBottom") + w(v, "borderTopWidth") + w(v, "borderBottomWidth") + w(v, "paddingTop") + w(v, "paddingBottom");
                }
                break;
            case"width":
                x = v.offsetWidth;
                if (x > 0) {
                    x += w(v, "marginLeft") + w(v, "marginRight");
                } else {
                    x = y(v, "width") + w(v, "marginLeft") + w(v, "marginRight") + w(v, "borderLeftWidth") + w(v, "borderRightWidth") + w(v, "paddingLeft") + w(v, "paddingRight");
                }
                break;
            default:
                if (t == "int") {
                    x = w(v, u);
                } else {
                    if (t == "float") {
                        x = y(v, u);
                    } else {
                        x = g.getStyle(v, u);
                    }
                }
                break;
        }
        return x;
    }

    function P(x) {
        var w = this, y, v, u = 0, t = false;
        if (w._itemAttrCache[x]) {
            return w._itemAttrCache[x];
        }
        if (w._itemsTable.numItems === 0) {
            return 0;
        }
        v = w._findClosestSibling(-1);
        if (r.isUndefined(v)) {
            return 0;
        }
        y = g.get(v.id);
        if (typeof x == "undefined") {
            t = w.get("isVertical");
        } else {
            t = x == "height";
        }
        if (t) {
            u = f(y, "height");
        } else {
            u = f(y, "width");
        }
        if (u) {
            w._itemAttrCache[x] = u;
        }
        return u;
    }

    function O() {
        var u = this, v, t;
        v = u.get("isVertical");
        t = P.call(u, v ? "height" : "width");
        return(t * u.get("revealAmount") / 100);
    }

    function o(AC) {
        var AI = this, AA = AI._cols, AG = AI._rows, y, z, AD, AE, x, w, AB, t, v, AF, AH = {}, u = AI._itemsTable;
        AD = AI.get("isVertical");
        z = P.call(AI, AD ? "height" : "width");
        v = O.call(AI);
        if (AG) {
            y = this.getPageForItem(AC);
            if (AD) {
                x = Math.floor(AC / AA);
                AF = x;
                AB = AF * z;
                AH.top = (AB + v) + "px";
                z = P.call(AI, "width");
                AE = AC % AA;
                AF = AE;
                t = AF * z;
                AH.left = t + "px";
            } else {
                AE = AC % AA;
                w = (y - 1) * AA;
                AF = AE + w;
                t = AF * z;
                AH.left = (t + v) + "px";
                z = P.call(AI, "height");
                x = Math.floor(AC / AA);
                w = (y - 1) * AG;
                AF = x - w;
                AB = AF * z;
                AH.top = AB + "px";
            }
        } else {
            if (AD) {
                AH.left = 0;
                AH.top = ((AC * z) + v) + "px";
            } else {
                AH.top = 0;
                AH.left = ((AC * z) + v) + "px";
            }
        }
        return AH;
    }

    function D(u) {
        var t = this.get("numVisible");
        return Math.floor(u / t) * t;
    }

    function l(x) {
        var w = this, v = 0, u = 0, t = w.get("isVertical") ? "height" : "width";
        v = P.call(w, t);
        u = v * x;
        return u;
    }

    function h(t, u) {
        u.scrollPageBackward();
        e.preventDefault(t);
    }

    function m(t, u) {
        u.scrollPageForward();
        e.preventDefault(t);
    }

    function p(x, u) {
        var AA = this, AC = AA.CLASSES, t, z = AA._firstItem, y = AA.get("numItems"), AB = AA.get("numVisible"), w = u, v = z + AB - 1;
        if (w >= 0 && w < y) {
            if (!r.isUndefined(AA._itemsTable.items[w])) {
                t = g.get(AA._itemsTable.items[w].id);
                if (t) {
                    g.removeClass(t, AC.SELECTED_ITEM);
                }
            }
        }
        if (r.isNumber(x)) {
            x = parseInt(x, 10);
            x = r.isNumber(x) ? x : 0;
        } else {
            x = z;
        }
        if (r.isUndefined(AA._itemsTable.items[x])) {
            x = D.call(AA, x);
            AA.scrollTo(x);
        }
        if (!r.isUndefined(AA._itemsTable.items[x])) {
            t = g.get(AA._itemsTable.items[x].id);
            if (t) {
                g.addClass(t, AC.SELECTED_ITEM);
            }
        }
        if (x < z || x > v) {
            x = D.call(AA, x);
            AA.scrollTo(x);
        }
    }

    function G(u) {
        var v = this, t = v.get("navigation");
        if (r.isUndefined(t)) {
            return;
        }
        if (r.isUndefined(u)) {
            if (!r.isUndefined(t.prev) && r.isArray(t.prev) && !r.isUndefined(t.prev[0])) {
                g.setStyle(t.prev[0], "visibility", "visible");
            }
            if (!r.isUndefined(t.next) && r.isArray(t.next) && !r.isUndefined(t.next[0])) {
                g.setStyle(t.next[0], "visibility", "visible");
            }
            if (!r.isUndefined(v._pages) && !r.isUndefined(v._pages.el)) {
                g.setStyle(v._pages.el, "visibility", "visible");
            }
        } else {
            if (!r.isUndefined(t.prev) && r.isArray(t.prev) && !r.isUndefined(t.prev[0])) {
                g.setStyle(t.prev[0], "visibility", "hidden");
            }
            if (!r.isUndefined(t.next) && r.isArray(t.next) && !r.isUndefined(t.next[0])) {
                g.setStyle(t.next[0], "visibility", "hidden");
            }
            if (!r.isUndefined(v._pages) && !r.isUndefined(v._pages.el)) {
                g.setStyle(v._pages.el, "visibility", "hidden");
            }
        }
    }

    function n() {
        var v = false, y = this, u = y.CLASSES, x, t, w;
        if (!y._hasRendered) {
            return;
        }
        t = y.get("navigation");
        w = y._firstItem + y.get("numVisible");
        if (t.prev) {
            if (y.get("numItems") === 0 || y._firstItem === 0) {
                if (y.get("numItems") === 0 || !y.get("isCircular")) {
                    e.removeListener(t.prev, "click", h);
                    g.addClass(t.prev, u.FIRST_NAV_DISABLED);
                    for (x = 0; x < y._navBtns.prev.length; x++) {
                        y._navBtns.prev[x].setAttribute("disabled", "true");
                    }
                    y._prevEnabled = false;
                } else {
                    v = !y._prevEnabled;
                }
            } else {
                v = !y._prevEnabled;
            }
            if (v) {
                e.on(t.prev, "click", h, y);
                g.removeClass(t.prev, u.FIRST_NAV_DISABLED);
                for (x = 0; x < y._navBtns.prev.length; x++) {
                    y._navBtns.prev[x].removeAttribute("disabled");
                }
                y._prevEnabled = true;
            }
        }
        v = false;
        if (t.next) {
            if (w >= y.get("numItems")) {
                if (!y.get("isCircular")) {
                    e.removeListener(t.next, "click", m);
                    g.addClass(t.next, u.DISABLED);
                    for (x = 0; x < y._navBtns.next.length; x++) {
                        y._navBtns.next[x].setAttribute("disabled", "true");
                    }
                    y._nextEnabled = false;
                } else {
                    v = !y._nextEnabled;
                }
            } else {
                v = !y._nextEnabled;
            }
            if (v) {
                e.on(t.next, "click", m, y);
                g.removeClass(t.next, u.DISABLED);
                for (x = 0; x < y._navBtns.next.length; x++) {
                    y._navBtns.next[x].removeAttribute("disabled");
                }
                y._nextEnabled = true;
            }
        }
        y.fireEvent(J, {next:y._nextEnabled, prev:y._prevEnabled});
    }

    function S(v) {
        var w = this, t, u;
        if (!w._hasRendered) {
            return;
        }
        u = w.get("numVisible");
        if (!r.isNumber(v)) {
            v = Math.floor(w.get("selectedItem") / u);
        }
        t = Math.ceil(w.get("numItems") / u);
        w._pages.num = t;
        w._pages.cur = v;
        if (t > w.CONFIG.MAX_PAGER_BUTTONS) {
            w._updatePagerMenu();
        } else {
            w._updatePagerButtons();
        }
    }

    function N(t, u) {
        switch (u) {
            case"height":
                return f(t, "marginTop") + f(t, "marginBottom") + f(t, "paddingTop") + f(t, "paddingBottom") + f(t, "borderTopWidth") + f(t, "borderBottomWidth");
            case"width":
                return f(t, "marginLeft") + f(t, "marginRight") + f(t, "paddingLeft") + f(t, "paddingRight") + f(t, "borderLeftWidth") + f(t, "borderRightWidth");
            default:
                break;
        }
        return f(t, u);
    }

    function A(u) {
        var t = this;
        if (!r.isObject(u)) {
            return;
        }
        switch (u.ev) {
            case T:
                t._syncUiForItemAdd(u);
                break;
            case q:
                t._syncUiForItemRemove(u);
                break;
            case R:
                t._syncUiForItemReplace(u);
                break;
            case M:
                t._syncUiForLazyLoading(u);
                break;
        }
        t.fireEvent(L);
    }

    function E(w, u) {
        var y = this, x = y.get("currentPage"), v, t = y.get("numVisible");
        v = parseInt(y._firstItem / t, 10);
        if (v != x) {
            y.setAttributeConfig("currentPage", {value:v});
            y.fireEvent(j, v);
        }
        if (y.get("selectOnScroll")) {
            if (y.get("selectedItem") != y._selectedItem) {
                y.set("selectedItem", y._selectedItem);
            }
        }
        clearTimeout(y._autoPlayTimer);
        delete y._autoPlayTimer;
        if (y.isAutoPlayOn()) {
            y.startAutoPlay();
        }
        y.fireEvent(F, {first:y._firstItem, last:u}, y);
    }

    V.getById = function (t) {
        return U[t] ? U[t].object : false;
    };
    YAHOO.extend(V, YAHOO.util.Element, {_rows:null, _cols:null, _animObj:null, _carouselEl:null, _clipEl:null, _firstItem:0, _hasFocus:false, _hasRendered:false, _isAnimationInProgress:false, _isAutoPlayInProgress:false, _itemsTable:null, _navBtns:null, _navEl:null, _nextEnabled:true, _pages:null, _pagination:null, _prevEnabled:true, _recomputeSize:true, _itemAttrCache:null, CLASSES:{BUTTON:"yui-carousel-button", CAROUSEL:"yui-carousel", CAROUSEL_EL:"yui-carousel-element", CONTAINER:"yui-carousel-container", CONTENT:"yui-carousel-content", DISABLED:"yui-carousel-button-disabled", FIRST_NAV:" yui-carousel-first-button", FIRST_NAV_DISABLED:"yui-carousel-first-button-disabled", FIRST_PAGE:"yui-carousel-nav-first-page", FOCUSSED_BUTTON:"yui-carousel-button-focus", HORIZONTAL:"yui-carousel-horizontal", ITEM_LOADING:"yui-carousel-item-loading", MIN_WIDTH:"yui-carousel-min-width", NAVIGATION:"yui-carousel-nav", NEXT_NAV:" yui-carousel-next-button", NEXT_PAGE:"yui-carousel-next", NAV_CONTAINER:"yui-carousel-buttons", PAGER_ITEM:"yui-carousel-pager-item", PAGINATION:"yui-carousel-pagination", PAGE_FOCUS:"yui-carousel-nav-page-focus", PREV_PAGE:"yui-carousel-prev", ITEM:"yui-carousel-item", SELECTED_ITEM:"yui-carousel-item-selected", SELECTED_NAV:"yui-carousel-nav-page-selected", VERTICAL:"yui-carousel-vertical", MULTI_ROW:"yui-carousel-multi-row", ROW:"yui-carousel-row", VERTICAL_CONTAINER:"yui-carousel-vertical-container", VISIBLE:"yui-carousel-visible"}, CONFIG:{FIRST_VISIBLE:0, HORZ_MIN_WIDTH:180, MAX_PAGER_BUTTONS:5, VERT_MIN_WIDTH:115, NUM_VISIBLE:3}, STRINGS:{ITEM_LOADING_CONTENT:"Loading", NEXT_BUTTON_TEXT:"Next Page", PAGER_PREFIX_TEXT:"Go to page ", PREVIOUS_BUTTON_TEXT:"Previous Page"}, addItem:function (AA, u) {
        var z = this, w, v, t, AB = 0, y, x = z.get("numItems");
        if (!AA) {
            return false;
        }
        if (r.isString(AA) || AA.nodeName) {
            v = AA.nodeName ? AA.innerHTML : AA;
        } else {
            if (r.isObject(AA)) {
                v = AA.content;
            } else {
                return false;
            }
        }
        w = z.CLASSES.ITEM + (AA.className ? " " + AA.className : "");
        t = AA.id ? AA.id : g.generateId();
        if (r.isUndefined(u)) {
            z._itemsTable.items.push({item:v, className:w, id:t});
            y = z._itemsTable.items.length - 1;
        } else {
            if (u < 0 || u > x) {
                return false;
            }
            if (!z._itemsTable.items[u]) {
                z._itemsTable.items[u] = undefined;
                AB = 1;
            }
            z._itemsTable.items.splice(u, AB, {item:v, className:w, id:t});
        }
        z._itemsTable.numItems++;
        if (x < z._itemsTable.items.length) {
            z.set("numItems", z._itemsTable.items.length);
        }
        z.fireEvent(T, {pos:u, ev:T, newPos:y});
        return true;
    }, addItems:function (t) {
        var u, w, v = true;
        if (!r.isArray(t)) {
            return false;
        }
        a = false;
        for (u = 0, w = t.length; u < w; u++) {
            if (this.addItem(t[u][0], t[u][1]) === false) {
                v = false;
            }
        }
        a = true;
        this._syncUiItems();
        return v;
    }, blur:function () {
        this._carouselEl.blur();
        this.fireEvent(B);
    }, clearItems:function () {
        var t = this, u = t.get("numItems");
        while (u > 0) {
            if (!t.removeItem(0)) {
            }
            if (t._itemsTable.numItems === 0) {
                t.set("numItems", 0);
                break;
            }
            u--;
        }
        t.fireEvent(i);
    }, focus:function () {
        var AC = this, x, y, z, w, AB, AD, u, v, t;
        if (!AC._hasRendered) {
            return;
        }
        if (AC.isAnimating()) {
            return;
        }
        t = AC.get("selectedItem");
        AD = AC.get("numVisible");
        u = AC.get("selectOnScroll");
        v = (t >= 0) ? AC.getItem(t) : null;
        x = AC.get("firstVisible");
        AB = x + AD - 1;
        z = (t < x || t > AB);
        y = (v && v.id) ? g.get(v.id) : null;
        w = AC._itemsTable;
        if (!u && z) {
            y = (w && w.items && w.items[x]) ? g.get(w.items[x].id) : null;
        }
        if (y) {
            try {
                y.focus();
            } catch (AA) {
            }
        }
        AC.fireEvent(Y);
    }, hide:function () {
        var t = this;
        if (t.fireEvent(d) !== false) {
            t.removeClass(t.CLASSES.VISIBLE);
            G.call(t, false);
            t.fireEvent(c);
        }
    }, init:function (w, u) {
        var x = this, t = w, y = false, v;
        if (!w) {
            return;
        }
        x._hasRendered = false;
        x._navBtns = {prev:[], next:[]};
        x._pages = {el:null, num:0, cur:0};
        x._pagination = {};
        x._itemAttrCache = {};
        x._itemsTable = {loading:{}, numItems:0, items:[], size:0};
        if (r.isString(w)) {
            w = g.get(w);
        } else {
            if (!w.nodeName) {
                return;
            }
        }
        V.superclass.init.call(x, w, u);
        v = x.get("selectedItem");
        if (v > 0) {
            x.set("firstVisible", D.call(x, v));
        }
        if (w) {
            if (!w.id) {
                w.setAttribute("id", g.generateId());
            }
            y = x._parseCarousel(w);
            if (!y) {
                x._createCarousel(t);
            }
        } else {
            w = x._createCarousel(t);
        }
        t = w.id;
        x.initEvents();
        if (y) {
            x._parseCarouselItems();
        }
        if (v > 0) {
            p.call(x, v, 0);
        }
        if (!u || typeof u.isVertical == "undefined") {
            x.set("isVertical", false);
        }
        x._parseCarouselNavigation(w);
        x._navEl = x._setupCarouselNavigation();
        U[t] = {object:x};
        x._loadItems(Math.min(x.get("firstVisible") + x.get("numVisible"), x.get("numItems")) - 1);
    }, initAttributes:function (t) {
        var u = this;
        t = t || {};
        V.superclass.initAttributes.call(u, t);
        u.setAttributeConfig("carouselEl", {validator:r.isString, value:t.carouselEl || "OL"});
        u.setAttributeConfig("carouselItemEl", {validator:r.isString, value:t.carouselItemEl || "LI"});
        u.setAttributeConfig("currentPage", {readOnly:true, value:0});
        u.setAttributeConfig("firstVisible", {method:u._setFirstVisible, validator:u._validateFirstVisible, value:t.firstVisible || u.CONFIG.FIRST_VISIBLE});
        u.setAttributeConfig("selectOnScroll", {validator:r.isBoolean, value:t.selectOnScroll || true});
        u.setAttributeConfig("numVisible", {setter:u._numVisibleSetter, method:u._setNumVisible, validator:u._validateNumVisible, value:t.numVisible || u.CONFIG.NUM_VISIBLE});
        u.setAttributeConfig("numItems", {method:u._setNumItems, validator:u._validateNumItems, value:u._itemsTable.numItems});
        u.setAttributeConfig("scrollIncrement", {validator:u._validateScrollIncrement, value:t.scrollIncrement || 1});
        u.setAttributeConfig("selectedItem", {setter:u._selectedItemSetter, method:u._setSelectedItem, validator:r.isNumber, value:-1});
        u.setAttributeConfig("revealAmount", {method:u._setRevealAmount, validator:u._validateRevealAmount, value:t.revealAmount || 0});
        u.setAttributeConfig("isCircular", {validator:r.isBoolean, value:t.isCircular || false});
        u.setAttributeConfig("isVertical", {method:u._setOrientation, validator:r.isBoolean, value:t.isVertical || false});
        u.setAttributeConfig("navigation", {method:u._setNavigation, validator:u._validateNavigation, value:t.navigation || {prev:null, next:null, page:null}});
        u.setAttributeConfig("animation", {validator:u._validateAnimation, value:t.animation || {speed:0, effect:null}});
        u.setAttributeConfig("autoPlay", {validator:r.isNumber, value:t.autoPlay || 0});
        u.setAttributeConfig("autoPlayInterval", {validator:r.isNumber, value:t.autoPlayInterval || 0});
        u.setAttributeConfig("numPages", {readOnly:true, getter:u._getNumPages});
        u.setAttributeConfig("lastVisible", {readOnly:true, getter:u._getLastVisible});
    }, initEvents:function () {
        var v = this, u = v.CLASSES, t;
        v.on("keydown", v._keyboardEventHandler);
        v.on(F, n);
        v.on(T, A);
        v.on(q, A);
        v.on(R, A);
        v.on(C, v._focusHandler);
        v.on(M, A);
        v.on(i, function (w) {
            v.scrollTo(0);
            n.call(v);
            S.call(v);
        });
        v.on(j, S, v);
        v.on(I, function (w) {
            if (v.get("selectedItem") === null || v.get("selectedItem") <= 0) {
                v.set("selectedItem", v.get("firstVisible"));
            }
            n.call(v, w);
            S.call(v, w);
            v._setClipContainerSize();
            v.show();
        });
        v.on("selectedItemChange", function (w) {
            p.call(v, w.newValue, w.prevValue);
            if (w.newValue >= 0) {
                v._updateTabIndex(v.getElementForItem(w.newValue));
            }
            v.fireEvent(C, w.newValue);
        });
        v.on(L, function (w) {
            n.call(v, w);
            S.call(v, w);
        });
        v.on("firstVisibleChange", function (w) {
            if (!v.get("selectOnScroll")) {
                if (w.newValue >= 0) {
                    v._updateTabIndex(v.getElementForItem(w.newValue));
                }
            }
        });
        v.on("click", function (w) {
            if (v.isAutoPlayOn()) {
                v.stopAutoPlay();
            }
            v._itemClickHandler(w);
            v._pagerClickHandler(w);
        });
        e.onFocus(v.get("element"), function (w, y) {
            var x = e.getTarget(w);
            if (x && x.nodeName.toUpperCase() == "A" && g.getAncestorByClassName(x, u.NAVIGATION)) {
                if (t) {
                    g.removeClass(t, u.PAGE_FOCUS);
                }
                t = x.parentNode;
                g.addClass(t, u.PAGE_FOCUS);
            } else {
                if (t) {
                    g.removeClass(t, u.PAGE_FOCUS);
                }
            }
            y._hasFocus = true;
            y._updateNavButtons(e.getTarget(w), true);
        }, v);
        e.onBlur(v.get("element"), function (w, x) {
            x._hasFocus = false;
            x._updateNavButtons(e.getTarget(w), false);
        }, v);
    }, isAnimating:function () {
        return this._isAnimationInProgress;
    }, isAutoPlayOn:function () {
        return this._isAutoPlayInProgress;
    }, getElementForItem:function (t) {
        var u = this;
        if (t < 0 || t >= u.get("numItems")) {
            return null;
        }
        if (u._itemsTable.items[t]) {
            return g.get(u._itemsTable.items[t].id);
        }
        return null;
    }, getElementForItems:function () {
        var v = this, u = [], t;
        for (t = 0; t < v._itemsTable.numItems; t++) {
            u.push(v.getElementForItem(t));
        }
        return u;
    }, getItem:function (t) {
        var u = this;
        if (t < 0 || t >= u.get("numItems")) {
            return null;
        }
        if (u._itemsTable.items.length > t) {
            if (!r.isUndefined(u._itemsTable.items[t])) {
                return u._itemsTable.items[t];
            }
        }
        return null;
    }, getItems:function () {
        return this._itemsTable.items;
    }, getLoadingItems:function () {
        return this._itemsTable.loading;
    }, getRows:function () {
        return this._rows;
    }, getCols:function () {
        return this._cols;
    }, getItemPositionById:function (y) {
        var w = this, x = w.get("numItems"), u = 0, t = w._itemsTable.items, v;
        while (u < x) {
            v = t[u] || {};
            if (v.id == y) {
                return u;
            }
            u++;
        }
        return -1;
    }, getVisibleItems:function () {
        var v = this, t = v.get("firstVisible"), w = t + v.get("numVisible"), u = [];
        while (t < w) {
            u.push(v.getElementForItem(t));
            t++;
        }
        return u;
    }, removeItem:function (v) {
        var x = this, t = x._itemsTable, w, u = x.get("numItems");
        if (v < 0 || v >= u) {
            return false;
        }
        w = t.items.splice(v, 1);
        if (w && w.length == 1) {
            if (t.numItems) {
                t.numItems--;
            }
            x.set("numItems", u - 1);
            x.fireEvent(q, {item:w[0], pos:v, ev:q});
            return true;
        }
        return false;
    }, replaceItem:function (AB, w) {
        var AA = this, y, x, v, z = AA.get("numItems"), u, t = AB;
        if (!AB) {
            return false;
        }
        if (r.isString(AB) || AB.nodeName) {
            x = AB.nodeName ? AB.innerHTML : AB;
        } else {
            if (r.isObject(AB)) {
                x = AB.content;
            } else {
                return false;
            }
        }
        if (r.isUndefined(w)) {
            return false;
        } else {
            if (w < 0 || w >= z) {
                return false;
            }
            u = AA._itemsTable.items[w];
            if (!u) {
                u = AA._itemsTable.loading[w];
                AA._itemsTable.items[w] = undefined;
            }
            v = u.id || g.generateId();
            AA._itemsTable.items.splice(w, 1, {item:x, className:AA.CLASSES.ITEM + (AB.className ? " " + AB.className : ""), id:v});
            t = AA._itemsTable.items[w];
        }
        AA.fireEvent(R, {newItem:t, oldItem:u, pos:w, ev:R});
        return true;
    }, replaceItems:function (t) {
        var u, w, v = true;
        if (!r.isArray(t)) {
            return false;
        }
        a = false;
        for (u = 0, w = t.length; u < w; u++) {
            if (this.replaceItem(t[u][0], t[u][1]) === false) {
                v = false;
            }
        }
        a = true;
        this._syncUiItems();
        return v;
    }, render:function (u) {
        var w = this, t = w.CLASSES, v = w._rows;
        w.addClass(t.CAROUSEL);
        if (!w._clipEl) {
            w._clipEl = w._createCarouselClip();
            w._clipEl.appendChild(w._carouselEl);
        }
        if (u) {
            w.appendChild(w._clipEl);
            w.appendTo(u);
        } else {
            if (!g.inDocument(w.get("element"))) {
                return false;
            }
            w.appendChild(w._clipEl);
        }
        if (v) {
            g.addClass(w._clipEl, t.MULTI_ROW);
        }
        if (w.get("isVertical")) {
            w.addClass(t.VERTICAL);
        } else {
            w.addClass(t.HORIZONTAL);
        }
        if (w.get("numItems") < 1) {
            return false;
        }
        w._refreshUi();
        return true;
    }, scrollBackward:function () {
        var t = this;
        t.scrollTo(t._firstItem - t.get("scrollIncrement"));
    }, scrollForward:function () {
        var t = this;
        t.scrollTo(t._firstItem + t.get("scrollIncrement"));
    }, scrollPageBackward:function () {
        var v = this, w = v.get("isVertical"), u = v._cols, x = v.get("firstVisible"), t = x - v.get("numVisible");
        if (t < 0) {
            if (u) {
                t = x - u;
            }
        }
        v.scrollTo(t);
    }, scrollPageForward:function () {
        var u = this, t = u._firstItem + u.get("numVisible");
        if (t > u.get("numItems")) {
            t = 0;
        }
        if (u.get("selectOnScroll")) {
            u._selectedItem = u._getSelectedItem(t);
        }
        u.scrollTo(t);
    }, scrollTo:function (AK, AH) {
        var AG = this, v, AI, AA, AC, AL, AM, AN, AD, AB, w, AF, t, x, u, y, AE, z, AO, AJ = AG._itemsTable;
        if (AJ.numItems === 0 || AK == AG._firstItem || AG.isAnimating()) {
            return;
        }
        AI = AG.get("animation");
        AA = AG.get("isCircular");
        AC = AG.get("isVertical");
        AB = AG._cols;
        w = AG._rows;
        AN = AG._firstItem;
        AF = AG.get("numItems");
        t = AG.get("numVisible");
        u = AG.get("currentPage");
        AO = function () {
            if (AG.isAutoPlayOn()) {
                AG.stopAutoPlay();
            }
        };
        if (AK < 0) {
            if (AA) {
                if (AF % t !== 0) {
                    AK = AF + (AF % t) - t - 1;
                } else {
                    AK = AF + AK;
                }
            } else {
                AO.call(AG);
                return;
            }
        } else {
            if (AF > 0 && AK > AF - 1) {
                if (AG.get("isCircular")) {
                    AK = AF - AK;
                } else {
                    AO.call(AG);
                    return;
                }
            }
        }
        if (isNaN(AK)) {
            return;
        }
        AM = (AG._firstItem > AK) ? "backward" : "forward";
        AE = AN + t;
        AE = (AE > AF - 1) ? AF - 1 : AE;
        y = AG.fireEvent(k, {dir:AM, first:AN, last:AE});
        if (y === false) {
            return;
        }
        AG.fireEvent(K, {page:u});
        AD = AK + t - 1;
        AG._loadItems(AD > AF - 1 ? AF - 1 : AD);
        AL = 0 - AK;
        if (w) {
            if (AC) {
                AL = parseInt(AL / AB, 10);
            } else {
                AL = parseInt(AL / w, 10);
            }
        }
        AG._firstItem = AK;
        AG.set("firstVisible", AK);
        if (!AH && AG.get("selectOnScroll")) {
            AG._selectedItem = AK;
        }
        AE = AK + t;
        AE = (AE > AF - 1) ? AF - 1 : AE;
        x = l.call(AG, AL);
        v = AI.speed > 0;
        if (v) {
            AG._animateAndSetCarouselOffset(x, AK, AE, AH);
        } else {
            AG._setCarouselOffset(x);
            E.call(AG, AK, AE);
        }
    }, getPageForItem:function (t) {
        return Math.ceil((t + 1) / parseInt(this.get("numVisible"), 10));
    }, getFirstVisibleOnPage:function (t) {
        return(t - 1) * this.get("numVisible");
    }, selectPreviousItem:function () {
        var v = this, u = 0, t = v.get("selectedItem");
        if (t == v._firstItem) {
            u = t - v.get("numVisible");
            v._selectedItem = v._getSelectedItem(t - 1);
            v.scrollTo(u, true);
        } else {
            u = v.get("selectedItem") - v.get("scrollIncrement");
            v.set("selectedItem", v._getSelectedItem(u));
        }
    }, selectNextItem:function () {
        var u = this, t = 0;
        t = u.get("selectedItem") + u.get("scrollIncrement");
        u.set("selectedItem", u._getSelectedItem(t));
    }, show:function () {
        var u = this, t = u.CLASSES;
        if (u.fireEvent(Z) !== false) {
            u.addClass(t.VISIBLE);
            G.call(u);
            u.fireEvent(W);
        }
    }, startAutoPlay:function () {
        var t = this, u;
        if (r.isUndefined(t._autoPlayTimer)) {
            u = t.get("autoPlayInterval");
            if (u <= 0) {
                return;
            }
            t._isAutoPlayInProgress = true;
            t.fireEvent(b);
            t._autoPlayTimer = setTimeout(function () {
                t._autoScroll();
            }, u);
        }
    }, stopAutoPlay:function () {
        var t = this;
        if (!r.isUndefined(t._autoPlayTimer)) {
            clearTimeout(t._autoPlayTimer);
            delete t._autoPlayTimer;
            t._isAutoPlayInProgress = false;
            t.fireEvent(s);
        }
    }, updatePagination:function () {
        var AB = this, z = AB._pagination;
        if (!z.el) {
            return false;
        }
        var y = AB.get("numItems"), AC = AB.get("numVisible"), w = AB.get("firstVisible") + 1, x = AB.get("currentPage") + 1, t = AB.get("numPages"), v = {"numVisible":AC, "numPages":t, "numItems":y, "selectedItem":AB.get("selectedItem") + 1, "currentPage":x, "firstVisible":w, "lastVisible":AB.get("lastVisible") + 1}, u = z.callback || {}, AA = u.scope && u.obj ? u.obj : AB;
        z.el.innerHTML = r.isFunction(u.fn) ? u.fn.apply(AA, [z.template, v]) : YAHOO.lang.substitute(z.template, v);
    }, registerPagination:function (u, w, t) {
        var v = this;
        v._pagination.template = u;
        v._pagination.callback = t || {};
        if (!v._pagination.el) {
            v._pagination.el = X("DIV", {className:v.CLASSES.PAGINATION});
            if (w == "before") {
                v._navEl.insertBefore(v._pagination.el, v._navEl.firstChild);
            } else {
                v._navEl.appendChild(v._pagination.el);
            }
            v.on("itemSelected", v.updatePagination);
            v.on("pageChange", v.updatePagination);
        }
        v.updatePagination();
    }, toString:function () {
        return Q + (this.get ? " (#" + this.get("id") + ")" : "");
    }, _animateAndSetCarouselOffset:function (y, w, u) {
        var x = this, v = x.get("animation"), t = null;
        if (x.get("isVertical")) {
            t = new YAHOO.util.Motion(x._carouselEl, {top:{to:y}}, v.speed, v.effect);
        } else {
            t = new YAHOO.util.Motion(x._carouselEl, {left:{to:y}}, v.speed, v.effect);
        }
        x._isAnimationInProgress = true;
        t.onComplete.subscribe(x._animationCompleteHandler, {scope:x, item:w, last:u});
        t.animate();
    }, _animationCompleteHandler:function (t, u, v) {
        v.scope._isAnimationInProgress = false;
        E.call(v.scope, v.item, v.last);
    }, _autoScroll:function () {
        var u = this, v = u._firstItem, t;
        if (v >= u.get("numItems") - 1) {
            if (u.get("isCircular")) {
                t = 0;
            } else {
                u.stopAutoPlay();
            }
        } else {
            t = v + u.get("numVisible");
        }
        u._selectedItem = u._getSelectedItem(t);
        u.scrollTo.call(u, t);
    }, _createCarousel:function (u) {
        var w = this, t = w.CLASSES, v = g.get(u);
        if (!v) {
            v = X("DIV", {className:t.CAROUSEL, id:u});
        }
        if (!w._carouselEl) {
            w._carouselEl = X(w.get("carouselEl"), {className:t.CAROUSEL_EL});
        }
        return v;
    }, _createCarouselClip:function () {
        return X("DIV", {className:this.CLASSES.CONTENT});
    }, _createCarouselItem:function (v) {
        var t, u = this;
        return X(u.get("carouselItemEl"), {className:v.className, styles:{}, content:v.content, id:v.id});
    }, _getValidIndex:function (v) {
        var y = this, t = y.get("isCircular"), w = y.get("numItems"), x = y.get("numVisible"), u = w - 1;
        if (v < 0) {
            v = t ? Math.ceil(w / x) * x + v : 0;
        } else {
            if (v > u) {
                v = t ? 0 : u;
            }
        }
        return v;
    }, _getSelectedItem:function (x) {
        var w = this, t = w.get("isCircular"), v = w.get("numItems"), u = v - 1;
        if (x < 0) {
            if (t) {
                x = v + x;
            } else {
                x = w.get("selectedItem");
            }
        } else {
            if (x > u) {
                if (t) {
                    x = x - v;
                } else {
                    x = w.get("selectedItem");
                }
            }
        }
        return x;
    }, _focusHandler:function () {
        var t = this;
        if (t._hasFocus) {
            t.focus();
        }
    }, _itemClickHandler:function (x) {
        var AA = this, y = AA.get("carouselItemEl"), u = AA.get("element"), v, w, z = e.getTarget(x), t = z.tagName.toUpperCase();
        if (t === "INPUT" || t === "SELECT" || t === "TEXTAREA") {
            return;
        }
        while (z && z != u && z.id != AA._carouselEl) {
            v = z.nodeName;
            if (v.toUpperCase() == y) {
                break;
            }
            z = z.parentNode;
        }
        if ((w = AA.getItemPositionById(z.id)) >= 0) {
            AA.set("selectedItem", AA._getSelectedItem(w));
            AA.focus();
        }
    }, _keyboardEventHandler:function (v) {
        var x = this, u = e.getCharCode(v), w = e.getTarget(v), t = false;
        if (x.isAnimating() || w.tagName.toUpperCase() === "SELECT") {
            return;
        }
        switch (u) {
            case 37:
            case 38:
                x.selectPreviousItem();
                t = true;
                break;
            case 39:
            case 40:
                x.selectNextItem();
                t = true;
                break;
            case 33:
                x.scrollPageBackward();
                t = true;
                break;
            case 34:
                x.scrollPageForward();
                t = true;
                break;
        }
        if (t) {
            if (x.isAutoPlayOn()) {
                x.stopAutoPlay();
            }
            e.preventDefault(v);
        }
    }, _loadItems:function (v) {
        var y = this, u = y.get("numItems"), w = y.get("numVisible"), x = y.get("revealAmount"), z = y._itemsTable.items.length, t = y.get("lastVisible");
        if (z > v && v + 1 >= w) {
            z = v % w || v == t ? v - v % w : v - w + 1;
        }
        if (x && v < u - 1) {
            v++;
        }
        if (v >= z && (!y.getItem(z) || !y.getItem(v))) {
            y.fireEvent(M, {ev:M, first:z, last:v, num:v - z + 1});
        }
    }, _pagerChangeHandler:function (u) {
        var x = this, w = e.getTarget(u), v = w.value, t;
        if (v) {
            t = x.getFirstVisibleOnPage(v);
            x._selectedItem = t;
            x.scrollTo(t);
            x.focus();
        }
    }, _pagerClickHandler:function (z) {
        var AB = this, v = AB.CLASSES, w = e.getTarget(z), u = w.nodeName.toUpperCase(), t, y, x, AA;
        if (g.hasClass(w, v.PAGER_ITEM) || g.hasClass(w.parentNode, v.PAGER_ITEM)) {
            if (u == "EM") {
                w = w.parentNode;
            }
            t = w.href;
            y = t.lastIndexOf("#");
            x = parseInt(t.substring(y + 1), 10);
            if (x != -1) {
                AA = AB.getFirstVisibleOnPage(x);
                AB._selectedItem = AA;
                AB.scrollTo(AA);
                AB.focus();
            }
            e.preventDefault(z);
        }
    }, _parseCarousel:function (v) {
        var y = this, z, t, u, x, w;
        t = y.CLASSES;
        u = y.get("carouselEl");
        x = false;
        for (z = v.firstChild; z; z = z.nextSibling) {
            if (z.nodeType == 1) {
                w = z.nodeName;
                if (w.toUpperCase() == u) {
                    y._carouselEl = z;
                    g.addClass(y._carouselEl, y.CLASSES.CAROUSEL_EL);
                    x = true;
                }
            }
        }
        return x;
    }, _parseCarouselItems:function () {
        var AA = this, AC = AA.CLASSES, x = 0, AB, t, v, w, u, y = AA.get("firstVisible"), z = AA._carouselEl;
        AB = AA._rows;
        v = AA.get("carouselItemEl");
        for (t = z.firstChild; t; t = t.nextSibling) {
            if (t.nodeType == 1) {
                u = t.nodeName;
                if (u.toUpperCase() == v) {
                    if (t.id) {
                        w = t.id;
                    } else {
                        w = g.generateId();
                        t.setAttribute("id", w);
                        g.addClass(t, AA.CLASSES.ITEM);
                    }
                    AA.addItem(t, y);
                    y++;
                }
            }
        }
    }, _parseCarouselNavigation:function (z) {
        var AA = this, y, AB = AA.CLASSES, u, x, w, t, v = false;
        t = g.getElementsByClassName(AB.PREV_PAGE, "*", z);
        if (t.length > 0) {
            for (x in t) {
                if (t.hasOwnProperty(x)) {
                    u = t[x];
                    if (u.nodeName == "INPUT" || u.nodeName == "BUTTON" || u.nodeName == "A") {
                        AA._navBtns.prev.push(u);
                    } else {
                        w = u.getElementsByTagName("INPUT");
                        if (r.isArray(w) && w.length > 0) {
                            AA._navBtns.prev.push(w[0]);
                        } else {
                            w = u.getElementsByTagName("BUTTON");
                            if (r.isArray(w) && w.length > 0) {
                                AA._navBtns.prev.push(w[0]);
                            }
                        }
                    }
                }
            }
            y = {prev:t};
        }
        t = g.getElementsByClassName(AB.NEXT_PAGE, "*", z);
        if (t.length > 0) {
            for (x in t) {
                if (t.hasOwnProperty(x)) {
                    u = t[x];
                    if (u.nodeName == "INPUT" || u.nodeName == "BUTTON" || u.nodeName == "A") {
                        AA._navBtns.next.push(u);
                    } else {
                        w = u.getElementsByTagName("INPUT");
                        if (r.isArray(w) && w.length > 0) {
                            AA._navBtns.next.push(w[0]);
                        } else {
                            w = u.getElementsByTagName("BUTTON");
                            if (r.isArray(w) && w.length > 0) {
                                AA._navBtns.next.push(w[0]);
                            }
                        }
                    }
                }
            }
            if (y) {
                y.next = t;
            } else {
                y = {next:t};
            }
        }
        if (y) {
            AA.set("navigation", y);
            v = true;
        }
        return v;
    }, _refreshUi:function () {
        var x = this, y = x.get("isVertical"), AA = x.get("firstVisible"), u, v, z, t, w;
        if (x._itemsTable.numItems < 1) {
            return;
        }
        w = P.call(x, y ? "height" : "width");
        v = x._itemsTable.items[AA].id;
        w = y ? f(v, "width") : f(v, "height");
        g.setStyle(x._carouselEl, y ? "width" : "height", w + "px");
        x._hasRendered = true;
        x.fireEvent(I);
    }, _setCarouselOffset:function (v) {
        var t = this, u;
        u = t.get("isVertical") ? "top" : "left";
        g.setStyle(t._carouselEl, u, v + "px");
    }, _setupCarouselNavigation:function () {
        var y = this, w, u, t, AA, x, z, v;
        t = y.CLASSES;
        x = g.getElementsByClassName(t.NAVIGATION, "DIV", y.get("element"));
        if (x.length === 0) {
            x = X("DIV", {className:t.NAVIGATION});
            y.insertBefore(x, g.getFirstChild(y.get("element")));
        } else {
            x = x[0];
        }
        y._pages.el = X("UL");
        x.appendChild(y._pages.el);
        AA = y.get("navigation");
        if (r.isString(AA.prev) || r.isArray(AA.prev)) {
            if (r.isString(AA.prev)) {
                AA.prev = [AA.prev];
            }
            for (w in AA.prev) {
                if (AA.prev.hasOwnProperty(w)) {
                    y._navBtns.prev.push(g.get(AA.prev[w]));
                }
            }
        } else {
            v = X("SPAN", {className:t.BUTTON + t.FIRST_NAV});
            g.setStyle(v, "visibility", "visible");
            w = g.generateId();
            v.innerHTML = '<button type="button" ' + 'id="' + w + '" name="' + y.STRINGS.PREVIOUS_BUTTON_TEXT + '">' + y.STRINGS.PREVIOUS_BUTTON_TEXT + "</button>";
            x.appendChild(v);
            w = g.get(w);
            y._navBtns.prev = [w];
            u = {prev:[v]};
        }
        if (r.isString(AA.next) || r.isArray(AA.next)) {
            if (r.isString(AA.next)) {
                AA.next = [AA.next];
            }
            for (w in AA.next) {
                if (AA.next.hasOwnProperty(w)) {
                    y._navBtns.next.push(g.get(AA.next[w]));
                }
            }
        } else {
            z = X("SPAN", {className:t.BUTTON + t.NEXT_NAV});
            g.setStyle(z, "visibility", "visible");
            w = g.generateId();
            z.innerHTML = '<button type="button" ' + 'id="' + w + '" name="' + y.STRINGS.NEXT_BUTTON_TEXT + '">' + y.STRINGS.NEXT_BUTTON_TEXT + "</button>";
            x.appendChild(z);
            w = g.get(w);
            y._navBtns.next = [w];
            if (u) {
                u.next = [z];
            } else {
                u = {next:[z]};
            }
        }
        if (u) {
            y.set("navigation", u);
        }
        return x;
    }, _setClipContainerSize:function (t, v) {
        var AB = this, z = AB.get("isVertical"), AD = AB._rows, x = AB._cols, AA = AB.get("revealAmount"), u = P.call(AB, "height"), w = P.call(AB, "width"), AC, y;
        AB._recomputeSize = (AC === 0);
        if (AB._recomputeSize) {
            AB._hasRendered = false;
            return;
        }
        t = t || AB._clipEl;
        if (AD) {
            AC = u * AD;
            y = w * x;
        } else {
            v = v || AB.get("numVisible");
            if (z) {
                AC = u * v;
            } else {
                y = w * v;
            }
        }
        AA = O.call(AB);
        if (z) {
            AC += (AA * 2);
        } else {
            y += (AA * 2);
        }
        if (z) {
            AC += N(AB._carouselEl, "height");
            g.setStyle(t, "height", AC + "px");
            if (x) {
                y += N(AB._carouselEl, "width");
                g.setStyle(t, "width", y + (0) + "px");
            }
        } else {
            y += N(AB._carouselEl, "width");
            g.setStyle(t, "width", y + "px");
            if (AD) {
                AC += N(AB._carouselEl, "height");
                g.setStyle(t, "height", AC + "px");
            }
        }
        if (t) {
            AB._setContainerSize(t);
        }
    }, _setContainerSize:function (u, v) {
        var y = this, t = y.CONFIG, AB = y.CLASSES, x, AA, w, z;
        x = y.get("isVertical");
        AA = y._rows;
        w = y._cols;
        u = u || y._clipEl;
        v = v || (x ? "height" : "width");
        z = parseFloat(g.getStyle(u, v), 10);
        z = r.isNumber(z) ? z : 0;
        if (x) {
            z += N(y._carouselEl, "height") + f(y._navEl, "height");
        } else {
            z += N(y._carouselEl, "width");
        }
        if (!x) {
            if (z < t.HORZ_MIN_WIDTH) {
                z = t.HORZ_MIN_WIDTH;
                y.addClass(AB.MIN_WIDTH);
            }
        }
        y.setStyle(v, z + "px");
        if (x) {
            z = P.call(y, "width");
            if (w) {
                z = z * w;
            }
            g.setStyle(y._carouselEl, "width", z + "px");
            if (z < t.VERT_MIN_WIDTH) {
                z = t.VERT_MIN_WIDTH;
                y.addClass(AB.MIN_WIDTH);
            }
            y.setStyle("width", z + "px");
        } else {
            z = P.call(y, "height");
            if (AA) {
                z = z * AA;
            }
            g.setStyle(y._carouselEl, "height", z + "px");
        }
    }, _setFirstVisible:function (u) {
        var t = this;
        if (u >= 0 && u < t.get("numItems")) {
            t.scrollTo(u);
        } else {
            u = t.get("firstVisible");
        }
        return u;
    }, _setNavigation:function (t) {
        var u = this;
        if (t.prev) {
            e.on(t.prev, "click", h, u);
        }
        if (t.next) {
            e.on(t.next, "click", m, u);
        }
    }, _setNumVisible:function (u) {
        var t = this;
        t._setClipContainerSize(t._clipEl, u);
    }, _numVisibleSetter:function (v) {
        var u = this, t = v;
        if (r.isArray(v)) {
            u._cols = v[0];
            u._rows = v[1];
            t = v[0] * v[1];
        }
        return t;
    }, _selectedItemSetter:function (u) {
        var t = this;
        return(u < t.get("numItems")) ? u : 0;
    }, _setNumItems:function (v) {
        var u = this, t = u._itemsTable.numItems;
        if (r.isArray(u._itemsTable.items)) {
            if (u._itemsTable.items.length != t) {
                t = u._itemsTable.items.length;
                u._itemsTable.numItems = t;
            }
        }
        if (v < t) {
            while (t > v) {
                u.removeItem(t - 1);
                t--;
            }
        }
        return v;
    }, _setOrientation:function (v) {
        var u = this, t = u.CLASSES;
        if (v) {
            u.replaceClass(t.HORIZONTAL, t.VERTICAL);
        } else {
            u.replaceClass(t.VERTICAL, t.HORIZONTAL);
        }
        return v;
    }, _setRevealAmount:function (u) {
        var t = this;
        if (u >= 0 && u <= 100) {
            u = parseInt(u, 10);
            u = r.isNumber(u) ? u : 0;
            t._setClipContainerSize();
        } else {
            u = t.get("revealAmount");
        }
        return u;
    }, _setSelectedItem:function (t) {
        this._selectedItem = t;
    }, _getNumPages:function () {
        return Math.ceil(parseInt(this.get("numItems"), 10) / parseInt(this.get("numVisible"), 10));
    }, _getLastVisible:function () {
        var t = this;
        return t.get("currentPage") + 1 == t.get("numPages") ? t.get("numItems") - 1 : t.get("firstVisible") + t.get("numVisible") - 1;
    }, _syncUiForItemAdd:function (w) {
        var x, AC = this, z = AC._carouselEl, t, AD, v = AC._itemsTable, u, y, AA, AB;
        y = r.isUndefined(w.pos) ? w.newPos || v.numItems - 1 : w.pos;
        if (!u) {
            AD = v.items[y] || {};
            t = AC._createCarouselItem({className:AD.className, styles:AD.styles, content:AD.item, id:AD.id, pos:y});
            if (r.isUndefined(w.pos)) {
                if (!r.isUndefined(v.loading[y])) {
                    u = v.loading[y];
                }
                if (u) {
                    z.replaceChild(t, u);
                    delete v.loading[y];
                } else {
                    z.appendChild(t);
                }
            } else {
                if (!r.isUndefined(v.items[w.pos + 1])) {
                    AA = g.get(v.items[w.pos + 1].id);
                }
                if (AA) {
                    z.insertBefore(t, AA);
                } else {
                }
            }
        } else {
            if (r.isUndefined(w.pos)) {
                if (!g.isAncestor(AC._carouselEl, u)) {
                    z.appendChild(u);
                }
            } else {
                if (!g.isAncestor(z, u)) {
                    if (!r.isUndefined(v.items[w.pos + 1])) {
                        z.insertBefore(u, g.get(v.items[w.pos + 1].id));
                    }
                }
            }
        }
        if (!AC._hasRendered) {
            AC._refreshUi();
        }
        if (AC.get("selectedItem") < 0) {
            AC.set("selectedItem", AC.get("firstVisible"));
        }
        AC._syncUiItems();
    }, _syncUiForItemReplace:function (z) {
        var y = this, v = y._carouselEl, t = y._itemsTable, AA = z.pos, x = z.newItem, u = z.oldItem, w;
        w = y._createCarouselItem({className:x.className, styles:x.styles, content:x.item, id:u.id});
        if ((u = g.get(u.id))) {
            u.className = x.className;
            u.styles = x.styles;
            u.innerHTML = x.item;
            t.items[AA] = w;
            if (t.loading[AA]) {
                t.numItems++;
                delete t.loading[AA];
            }
        }
    }, _syncUiForItemRemove:function (y) {
        var x = this, t = x._carouselEl, v, w, u, z;
        u = x.get("numItems");
        w = y.item;
        z = y.pos;
        if (w && (v = g.get(w.id))) {
            if (v && g.isAncestor(t, v)) {
                e.purgeElement(v, true);
                t.removeChild(v);
            }
            if (x.get("selectedItem") == z) {
                z = z >= u ? u - 1 : z;
            }
        } else {
        }
        x._syncUiItems();
    }, _findClosestSibling:function (y) {
        var x = this, u = x._itemsTable, t = u.items.length, v = y, w;
        while (v < t && !w) {
            w = u.items[++v];
        }
        return w;
    }, _syncUiForLazyLoading:function (x) {
        var AD = this, AA = AD._carouselEl, v = AD._itemsTable, z = v.items.length, AC = AD._findClosestSibling(x.last), AB = x.last, y = AB - AD.get("numVisible") + 1, t, u;
        for (var w = y; w <= AB; w++) {
            if (!v.loading[w] && !v.items[w]) {
                t = AD._createCarouselItem({className:AD.CLASSES.ITEM + " " + AD.CLASSES.ITEM_LOADING, content:AD.STRINGS.ITEM_LOADING_CONTENT, id:g.generateId()});
                if (t) {
                    if (AC) {
                        AC = g.get(AC.id);
                        if (AC) {
                            AA.insertBefore(t, AC);
                        } else {
                        }
                    } else {
                        AA.appendChild(t);
                    }
                }
                v.loading[w] = t;
            }
        }
        AD._syncUiItems();
    }, _syncUiItems:function () {
        if (!a) {
            return;
        }
        var x, AB = this, z = AB.get("numItems"), w, v = AB._itemsTable, y = v.items, t = v.loading, AC, AA, u = false;
        for (w = 0; w < z; w++) {
            AC = y[w] || t[w];
            if (AC && AC.id) {
                AA = o.call(AB, w);
                AC.styles = AC.styles || {};
                for (x in AA) {
                    if (AC.styles[x] !== AA[x]) {
                        u = true;
                        AC.styles[x] = AA[x];
                    }
                }
                if (u) {
                    H(g.get(AC.id), AA);
                }
                u = false;
            }
        }
    }, _updateNavButtons:function (x, u) {
        var v, t = this.CLASSES, y, w = x.parentNode;
        if (!w) {
            return;
        }
        y = w.parentNode;
        if (x.nodeName.toUpperCase() == "BUTTON" && g.hasClass(w, t.BUTTON)) {
            if (u) {
                if (y) {
                    v = g.getChildren(y);
                    if (v) {
                        g.removeClass(v, t.FOCUSSED_BUTTON);
                    }
                }
                g.addClass(w, t.FOCUSSED_BUTTON);
            } else {
                g.removeClass(w, t.FOCUSSED_BUTTON);
            }
        }
    }, _updatePagerButtons:function () {
        if (!a) {
            return;
        }
        var AB = this, z = AB.CLASSES, AA = AB._pages.cur, t, y, w, AC, u = AB.get("numVisible"), x = AB._pages.num, v = AB._pages.el;
        if (x === 0 || !v) {
            return;
        }
        g.setStyle(v, "visibility", "hidden");
        while (v.firstChild) {
            v.removeChild(v.firstChild);
        }
        for (w = 0; w < x; w++) {
            t = document.createElement("LI");
            if (w === 0) {
                g.addClass(t, z.FIRST_PAGE);
            }
            if (w == AA) {
                g.addClass(t, z.SELECTED_NAV);
            }
            y = "<a class=" + z.PAGER_ITEM + ' href="#' + (w + 1) + '" tabindex="0"><em>' + AB.STRINGS.PAGER_PREFIX_TEXT + " " + (w + 1) + "</em></a>";
            t.innerHTML = y;
            v.appendChild(t);
        }
        g.setStyle(v, "visibility", "visible");
    }, _updatePagerMenu:function () {
        var AB = this, z = AB.CLASSES, AA = AB._pages.cur, u, x, AC, v = AB.get("numVisible"), y = AB._pages.num, w = AB._pages.el, t;
        if (y === 0 || !w) {
            return;
        }
        t = document.createElement("SELECT");
        if (!t) {
            return;
        }
        g.setStyle(w, "visibility", "hidden");
        while (w.firstChild) {
            w.removeChild(w.firstChild);
        }
        for (x = 0; x < y; x++) {
            u = document.createElement("OPTION");
            u.value = x + 1;
            u.innerHTML = AB.STRINGS.PAGER_PREFIX_TEXT + " " + (x + 1);
            if (x == AA) {
                u.setAttribute("selected", "selected");
            }
            t.appendChild(u);
        }
        u = document.createElement("FORM");
        if (!u) {
        } else {
            u.appendChild(t);
            w.appendChild(u);
        }
        e.addListener(t, "change", AB._pagerChangeHandler, this, true);
        g.setStyle(w, "visibility", "visible");
    }, _updateTabIndex:function (t) {
        var u = this;
        if (t) {
            if (u._focusableItemEl) {
                u._focusableItemEl.tabIndex = -1;
            }
            u._focusableItemEl = t;
            t.tabIndex = 0;
        }
    }, _validateAnimation:function (t) {
        var u = true;
        if (r.isObject(t)) {
            if (t.speed) {
                u = u && r.isNumber(t.speed);
            }
            if (t.effect) {
                u = u && r.isFunction(t.effect);
            } else {
                if (!r.isUndefined(YAHOO.util.Easing)) {
                    t.effect = YAHOO.util.Easing.easeOut;
                }
            }
        } else {
            u = false;
        }
        return u;
    }, _validateFirstVisible:function (v) {
        var u = this, t = u.get("numItems");
        if (r.isNumber(v)) {
            if (t === 0 && v == t) {
                return true;
            } else {
                return(v >= 0 && v < t);
            }
        }
        return false;
    }, _validateNavigation:function (t) {
        var u;
        if (!r.isObject(t)) {
            return false;
        }
        if (t.prev) {
            if (!r.isArray(t.prev)) {
                return false;
            }
            for (u in t.prev) {
                if (t.prev.hasOwnProperty(u)) {
                    if (!r.isString(t.prev[u].nodeName)) {
                        return false;
                    }
                }
            }
        }
        if (t.next) {
            if (!r.isArray(t.next)) {
                return false;
            }
            for (u in t.next) {
                if (t.next.hasOwnProperty(u)) {
                    if (!r.isString(t.next[u].nodeName)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }, _validateNumItems:function (t) {
        return r.isNumber(t) && (t >= 0);
    }, _validateNumVisible:function (t) {
        var u = false;
        if (r.isNumber(t)) {
            u = t > 0 && t <= this.get("numItems");
        } else {
            if (r.isArray(t)) {
                if (r.isNumber(t[0]) && r.isNumber(t[1])) {
                    u = t[0] * t[1] > 0 && t.length == 2;
                }
            }
        }
        return u;
    }, _validateRevealAmount:function (t) {
        var u = false;
        if (r.isNumber(t)) {
            u = t >= 0 && t < 100;
        }
        return u;
    }, _validateScrollIncrement:function (t) {
        var u = false;
        if (r.isNumber(t)) {
            u = (t > 0 && t < this.get("numItems"));
        }
        return u;
    }});
})();
YAHOO.register("carousel", YAHOO.widget.Carousel, {version:"2.9.0", build:"2800"});
YAHOO.register("carousel", YAHOO.widget.Carousel, {version:"2.9.0", build:"2800"});