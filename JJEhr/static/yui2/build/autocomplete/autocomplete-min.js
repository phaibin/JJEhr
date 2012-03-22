/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
YAHOO.widget.DS_JSArray = YAHOO.util.LocalDataSource;
YAHOO.widget.DS_JSFunction = YAHOO.util.FunctionDataSource;
YAHOO.widget.DS_XHR = function (b, a, d) {
    var c = new YAHOO.util.XHRDataSource(b, d);
    c._aDeprecatedSchema = a;
    return c;
};
YAHOO.widget.DS_ScriptNode = function (b, a, d) {
    var c = new YAHOO.util.ScriptNodeDataSource(b, d);
    c._aDeprecatedSchema = a;
    return c;
};
YAHOO.widget.DS_XHR.TYPE_JSON = YAHOO.util.DataSourceBase.TYPE_JSON;
YAHOO.widget.DS_XHR.TYPE_XML = YAHOO.util.DataSourceBase.TYPE_XML;
YAHOO.widget.DS_XHR.TYPE_FLAT = YAHOO.util.DataSourceBase.TYPE_TEXT;
YAHOO.widget.AutoComplete = function (g, b, j, c) {
    if (g && b && j) {
        if (j && YAHOO.lang.isFunction(j.sendRequest)) {
            this.dataSource = j;
        } else {
            return;
        }
        this.key = 0;
        var d = j.responseSchema;
        if (j._aDeprecatedSchema) {
            var k = j._aDeprecatedSchema;
            if (YAHOO.lang.isArray(k)) {
                if ((j.responseType === YAHOO.util.DataSourceBase.TYPE_JSON) || (j.responseType === YAHOO.util.DataSourceBase.TYPE_UNKNOWN)) {
                    d.resultsList = k[0];
                    this.key = k[1];
                    d.fields = (k.length < 3) ? null : k.slice(1);
                } else {
                    if (j.responseType === YAHOO.util.DataSourceBase.TYPE_XML) {
                        d.resultNode = k[0];
                        this.key = k[1];
                        d.fields = k.slice(1);
                    } else {
                        if (j.responseType === YAHOO.util.DataSourceBase.TYPE_TEXT) {
                            d.recordDelim = k[0];
                            d.fieldDelim = k[1];
                        }
                    }
                }
                j.responseSchema = d;
            }
        }
        if (YAHOO.util.Dom.inDocument(g)) {
            if (YAHOO.lang.isString(g)) {
                this._sName = "instance" + YAHOO.widget.AutoComplete._nIndex + " " + g;
                this._elTextbox = document.getElementById(g);
            } else {
                this._sName = (g.id) ? "instance" + YAHOO.widget.AutoComplete._nIndex + " " + g.id : "instance" + YAHOO.widget.AutoComplete._nIndex;
                this._elTextbox = g;
            }
            YAHOO.util.Dom.addClass(this._elTextbox, "yui-ac-input");
        } else {
            return;
        }
        if (YAHOO.util.Dom.inDocument(b)) {
            if (YAHOO.lang.isString(b)) {
                this._elContainer = document.getElementById(b);
            } else {
                this._elContainer = b;
            }
            if (this._elContainer.style.display == "none") {
            }
            var e = this._elContainer.parentNode;
            var a = e.tagName.toLowerCase();
            if (a == "div") {
                YAHOO.util.Dom.addClass(e, "yui-ac");
            } else {
            }
        } else {
            return;
        }
        if (this.dataSource.dataType === YAHOO.util.DataSourceBase.TYPE_LOCAL) {
            this.applyLocalFilter = true;
        }
        if (c && (c.constructor == Object)) {
            for (var i in c) {
                if (i) {
                    this[i] = c[i];
                }
            }
        }
        this._initContainerEl();
        this._initProps();
        this._initListEl();
        this._initContainerHelperEls();
        var h = this;
        var f = this._elTextbox;
        YAHOO.util.Event.addListener(f, "keyup", h._onTextboxKeyUp, h);
        YAHOO.util.Event.addListener(f, "keydown", h._onTextboxKeyDown, h);
        YAHOO.util.Event.addListener(f, "focus", h._onTextboxFocus, h);
        YAHOO.util.Event.addListener(f, "blur", h._onTextboxBlur, h);
        YAHOO.util.Event.addListener(b, "mouseover", h._onContainerMouseover, h);
        YAHOO.util.Event.addListener(b, "mouseout", h._onContainerMouseout, h);
        YAHOO.util.Event.addListener(b, "click", h._onContainerClick, h);
        YAHOO.util.Event.addListener(b, "scroll", h._onContainerScroll, h);
        YAHOO.util.Event.addListener(b, "resize", h._onContainerResize, h);
        YAHOO.util.Event.addListener(f, "keypress", h._onTextboxKeyPress, h);
        YAHOO.util.Event.addListener(window, "unload", h._onWindowUnload, h);
        this.textboxFocusEvent = new YAHOO.util.CustomEvent("textboxFocus", this);
        this.textboxKeyEvent = new YAHOO.util.CustomEvent("textboxKey", this);
        this.dataRequestEvent = new YAHOO.util.CustomEvent("dataRequest", this);
        this.dataRequestCancelEvent = new YAHOO.util.CustomEvent("dataRequestCancel", this);
        this.dataReturnEvent = new YAHOO.util.CustomEvent("dataReturn", this);
        this.dataErrorEvent = new YAHOO.util.CustomEvent("dataError", this);
        this.containerPopulateEvent = new YAHOO.util.CustomEvent("containerPopulate", this);
        this.containerExpandEvent = new YAHOO.util.CustomEvent("containerExpand", this);
        this.typeAheadEvent = new YAHOO.util.CustomEvent("typeAhead", this);
        this.itemMouseOverEvent = new YAHOO.util.CustomEvent("itemMouseOver", this);
        this.itemMouseOutEvent = new YAHOO.util.CustomEvent("itemMouseOut", this);
        this.itemArrowToEvent = new YAHOO.util.CustomEvent("itemArrowTo", this);
        this.itemArrowFromEvent = new YAHOO.util.CustomEvent("itemArrowFrom", this);
        this.itemSelectEvent = new YAHOO.util.CustomEvent("itemSelect", this);
        this.unmatchedItemSelectEvent = new YAHOO.util.CustomEvent("unmatchedItemSelect", this);
        this.selectionEnforceEvent = new YAHOO.util.CustomEvent("selectionEnforce", this);
        this.containerCollapseEvent = new YAHOO.util.CustomEvent("containerCollapse", this);
        this.textboxBlurEvent = new YAHOO.util.CustomEvent("textboxBlur", this);
        this.textboxChangeEvent = new YAHOO.util.CustomEvent("textboxChange", this);
        f.setAttribute("autocomplete", "off");
        YAHOO.widget.AutoComplete._nIndex++;
    } else {
    }
};
YAHOO.widget.AutoComplete.prototype.dataSource = null;
YAHOO.widget.AutoComplete.prototype.applyLocalFilter = null;
YAHOO.widget.AutoComplete.prototype.queryMatchCase = false;
YAHOO.widget.AutoComplete.prototype.queryMatchContains = false;
YAHOO.widget.AutoComplete.prototype.queryMatchSubset = false;
YAHOO.widget.AutoComplete.prototype.minQueryLength = 1;
YAHOO.widget.AutoComplete.prototype.maxResultsDisplayed = 10;
YAHOO.widget.AutoComplete.prototype.queryDelay = 0.2;
YAHOO.widget.AutoComplete.prototype.typeAheadDelay = 0.5;
YAHOO.widget.AutoComplete.prototype.queryInterval = 500;
YAHOO.widget.AutoComplete.prototype.highlightClassName = "yui-ac-highlight";
YAHOO.widget.AutoComplete.prototype.prehighlightClassName = null;
YAHOO.widget.AutoComplete.prototype.delimChar = null;
YAHOO.widget.AutoComplete.prototype.autoHighlight = true;
YAHOO.widget.AutoComplete.prototype.typeAhead = false;
YAHOO.widget.AutoComplete.prototype.animHoriz = false;
YAHOO.widget.AutoComplete.prototype.animVert = true;
YAHOO.widget.AutoComplete.prototype.animSpeed = 0.3;
YAHOO.widget.AutoComplete.prototype.forceSelection = false;
YAHOO.widget.AutoComplete.prototype.allowBrowserAutocomplete = true;
YAHOO.widget.AutoComplete.prototype.alwaysShowContainer = false;
YAHOO.widget.AutoComplete.prototype.useIFrame = false;
YAHOO.widget.AutoComplete.prototype.useShadow = false;
YAHOO.widget.AutoComplete.prototype.suppressInputUpdate = false;
YAHOO.widget.AutoComplete.prototype.resultTypeList = true;
YAHOO.widget.AutoComplete.prototype.queryQuestionMark = true;
YAHOO.widget.AutoComplete.prototype.autoSnapContainer = true;
YAHOO.widget.AutoComplete.prototype.toString = function () {
    return"AutoComplete " + this._sName;
};
YAHOO.widget.AutoComplete.prototype.getInputEl = function () {
    return this._elTextbox;
};
YAHOO.widget.AutoComplete.prototype.getContainerEl = function () {
    return this._elContainer;
};
YAHOO.widget.AutoComplete.prototype.isFocused = function () {
    return this._bFocused;
};
YAHOO.widget.AutoComplete.prototype.isContainerOpen = function () {
    return this._bContainerOpen;
};
YAHOO.widget.AutoComplete.prototype.getListEl = function () {
    return this._elList;
};
YAHOO.widget.AutoComplete.prototype.getListItemMatch = function (a) {
    if (a._sResultMatch) {
        return a._sResultMatch;
    } else {
        return null;
    }
};
YAHOO.widget.AutoComplete.prototype.getListItemData = function (a) {
    if (a._oResultData) {
        return a._oResultData;
    } else {
        return null;
    }
};
YAHOO.widget.AutoComplete.prototype.getListItemIndex = function (a) {
    if (YAHOO.lang.isNumber(a._nItemIndex)) {
        return a._nItemIndex;
    } else {
        return null;
    }
};
YAHOO.widget.AutoComplete.prototype.setHeader = function (b) {
    if (this._elHeader) {
        var a = this._elHeader;
        if (b) {
            a.innerHTML = b;
            a.style.display = "";
        } else {
            a.innerHTML = "";
            a.style.display = "none";
        }
    }
};
YAHOO.widget.AutoComplete.prototype.setFooter = function (b) {
    if (this._elFooter) {
        var a = this._elFooter;
        if (b) {
            a.innerHTML = b;
            a.style.display = "";
        } else {
            a.innerHTML = "";
            a.style.display = "none";
        }
    }
};
YAHOO.widget.AutoComplete.prototype.setBody = function (a) {
    if (this._elBody) {
        var b = this._elBody;
        YAHOO.util.Event.purgeElement(b, true);
        if (a) {
            b.innerHTML = a;
            b.style.display = "";
        } else {
            b.innerHTML = "";
            b.style.display = "none";
        }
        this._elList = null;
    }
};
YAHOO.widget.AutoComplete.prototype.generateRequest = function (b) {
    var a = this.dataSource.dataType;
    if (a === YAHOO.util.DataSourceBase.TYPE_XHR) {
        if (!this.dataSource.connMethodPost) {
            b = (this.queryQuestionMark ? "?" : "") + (this.dataSource.scriptQueryParam || "query") + "=" + b + (this.dataSource.scriptQueryAppend ? ("&" + this.dataSource.scriptQueryAppend) : "");
        } else {
            b = (this.dataSource.scriptQueryParam || "query") + "=" + b + (this.dataSource.scriptQueryAppend ? ("&" + this.dataSource.scriptQueryAppend) : "");
        }
    } else {
        if (a === YAHOO.util.DataSourceBase.TYPE_SCRIPTNODE) {
            b = "&" + (this.dataSource.scriptQueryParam || "query") + "=" + b + (this.dataSource.scriptQueryAppend ? ("&" + this.dataSource.scriptQueryAppend) : "");
        }
    }
    return b;
};
YAHOO.widget.AutoComplete.prototype.sendQuery = function (b) {
    this._bFocused = true;
    var a = (this.delimChar) ? this._elTextbox.value + b : b;
    this._sendQuery(a);
};
YAHOO.widget.AutoComplete.prototype.snapContainer = function () {
    var a = this._elTextbox, b = YAHOO.util.Dom.getXY(a);
    b[1] += YAHOO.util.Dom.get(a).offsetHeight + 2;
    YAHOO.util.Dom.setXY(this._elContainer, b);
};
YAHOO.widget.AutoComplete.prototype.expandContainer = function () {
    this._toggleContainer(true);
};
YAHOO.widget.AutoComplete.prototype.collapseContainer = function () {
    this._toggleContainer(false);
};
YAHOO.widget.AutoComplete.prototype.clearList = function () {
    var b = this._elList.childNodes, a = b.length - 1;
    for (; a > -1; a--) {
        b[a].style.display = "none";
    }
};
YAHOO.widget.AutoComplete.prototype.getSubsetMatches = function (e) {
    var d, c, a;
    for (var b = e.length; b >= this.minQueryLength; b--) {
        a = this.generateRequest(e.substr(0, b));
        this.dataRequestEvent.fire(this, d, a);
        c = this.dataSource.getCachedResponse(a);
        if (c) {
            return this.filterResults.apply(this.dataSource, [e, c, c, {scope:this}]);
        }
    }
    return null;
};
YAHOO.widget.AutoComplete.prototype.preparseRawResponse = function (c, b, a) {
    var d = ((this.responseStripAfter !== "") && (b.indexOf)) ? b.indexOf(this.responseStripAfter) : -1;
    if (d != -1) {
        b = b.substring(0, d);
    }
    return b;
};
YAHOO.widget.AutoComplete.prototype.filterResults = function (l, n, r, m) {
    if (m && m.argument && YAHOO.lang.isValue(m.argument.query)) {
        l = m.argument.query;
    }
    if (l && l !== "") {
        r = YAHOO.widget.AutoComplete._cloneObject(r);
        var j = m.scope, q = this, c = r.results, o = [], b = j.maxResultsDisplayed, k = (q.queryMatchCase || j.queryMatchCase), a = (q.queryMatchContains || j.queryMatchContains);
        for (var d = 0, h = c.length; d < h; d++) {
            var f = c[d];
            var e = null;
            if (YAHOO.lang.isString(f)) {
                e = f;
            } else {
                if (YAHOO.lang.isArray(f)) {
                    e = f[0];
                } else {
                    if (this.responseSchema.fields) {
                        var p = this.responseSchema.fields[0].key || this.responseSchema.fields[0];
                        e = f[p];
                    } else {
                        if (this.key) {
                            e = f[this.key];
                        }
                    }
                }
            }
            if (YAHOO.lang.isString(e)) {
                var g = (k) ? e.indexOf(decodeURIComponent(l)) : e.toLowerCase().indexOf(decodeURIComponent(l).toLowerCase());
                if ((!a && (g === 0)) || (a && (g > -1))) {
                    o.push(f);
                }
            }
            if (h > b && o.length === b) {
                break;
            }
        }
        r.results = o;
    } else {
    }
    return r;
};
YAHOO.widget.AutoComplete.prototype.handleResponse = function (c, a, b) {
    if ((this instanceof YAHOO.widget.AutoComplete) && this._sName) {
        this._populateList(c, a, b);
    }
};
YAHOO.widget.AutoComplete.prototype.doBeforeLoadData = function (c, a, b) {
    return true;
};
YAHOO.widget.AutoComplete.prototype.formatResult = function (b, d, a) {
    var c = (a) ? a : "";
    return c;
};
YAHOO.widget.AutoComplete.prototype.formatEscapedResult = function (c, d, b) {
    var a = (b) ? b : "";
    return YAHOO.lang.escapeHTML(a);
};
YAHOO.widget.AutoComplete.prototype.doBeforeExpandContainer = function (d, a, c, b) {
    return true;
};
YAHOO.widget.AutoComplete.prototype.destroy = function () {
    var b = this.toString();
    var a = this._elTextbox;
    var d = this._elContainer;
    this.textboxFocusEvent.unsubscribeAll();
    this.textboxKeyEvent.unsubscribeAll();
    this.dataRequestEvent.unsubscribeAll();
    this.dataReturnEvent.unsubscribeAll();
    this.dataErrorEvent.unsubscribeAll();
    this.containerPopulateEvent.unsubscribeAll();
    this.containerExpandEvent.unsubscribeAll();
    this.typeAheadEvent.unsubscribeAll();
    this.itemMouseOverEvent.unsubscribeAll();
    this.itemMouseOutEvent.unsubscribeAll();
    this.itemArrowToEvent.unsubscribeAll();
    this.itemArrowFromEvent.unsubscribeAll();
    this.itemSelectEvent.unsubscribeAll();
    this.unmatchedItemSelectEvent.unsubscribeAll();
    this.selectionEnforceEvent.unsubscribeAll();
    this.containerCollapseEvent.unsubscribeAll();
    this.textboxBlurEvent.unsubscribeAll();
    this.textboxChangeEvent.unsubscribeAll();
    YAHOO.util.Event.purgeElement(a, true);
    YAHOO.util.Event.purgeElement(d, true);
    d.innerHTML = "";
    for (var c in this) {
        if (YAHOO.lang.hasOwnProperty(this, c)) {
            this[c] = null;
        }
    }
};
YAHOO.widget.AutoComplete.prototype.textboxFocusEvent = null;
YAHOO.widget.AutoComplete.prototype.textboxKeyEvent = null;
YAHOO.widget.AutoComplete.prototype.dataRequestEvent = null;
YAHOO.widget.AutoComplete.prototype.dataRequestCancelEvent = null;
YAHOO.widget.AutoComplete.prototype.dataReturnEvent = null;
YAHOO.widget.AutoComplete.prototype.dataErrorEvent = null;
YAHOO.widget.AutoComplete.prototype.containerPopulateEvent = null;
YAHOO.widget.AutoComplete.prototype.containerExpandEvent = null;
YAHOO.widget.AutoComplete.prototype.typeAheadEvent = null;
YAHOO.widget.AutoComplete.prototype.itemMouseOverEvent = null;
YAHOO.widget.AutoComplete.prototype.itemMouseOutEvent = null;
YAHOO.widget.AutoComplete.prototype.itemArrowToEvent = null;
YAHOO.widget.AutoComplete.prototype.itemArrowFromEvent = null;
YAHOO.widget.AutoComplete.prototype.itemSelectEvent = null;
YAHOO.widget.AutoComplete.prototype.unmatchedItemSelectEvent = null;
YAHOO.widget.AutoComplete.prototype.selectionEnforceEvent = null;
YAHOO.widget.AutoComplete.prototype.containerCollapseEvent = null;
YAHOO.widget.AutoComplete.prototype.textboxBlurEvent = null;
YAHOO.widget.AutoComplete.prototype.textboxChangeEvent = null;
YAHOO.widget.AutoComplete._nIndex = 0;
YAHOO.widget.AutoComplete.prototype._sName = null;
YAHOO.widget.AutoComplete.prototype._elTextbox = null;
YAHOO.widget.AutoComplete.prototype._elContainer = null;
YAHOO.widget.AutoComplete.prototype._elContent = null;
YAHOO.widget.AutoComplete.prototype._elHeader = null;
YAHOO.widget.AutoComplete.prototype._elBody = null;
YAHOO.widget.AutoComplete.prototype._elFooter = null;
YAHOO.widget.AutoComplete.prototype._elShadow = null;
YAHOO.widget.AutoComplete.prototype._elIFrame = null;
YAHOO.widget.AutoComplete.prototype._bFocused = false;
YAHOO.widget.AutoComplete.prototype._oAnim = null;
YAHOO.widget.AutoComplete.prototype._bContainerOpen = false;
YAHOO.widget.AutoComplete.prototype._bOverContainer = false;
YAHOO.widget.AutoComplete.prototype._elList = null;
YAHOO.widget.AutoComplete.prototype._nDisplayedItems = 0;
YAHOO.widget.AutoComplete.prototype._sCurQuery = null;
YAHOO.widget.AutoComplete.prototype._sPastSelections = "";
YAHOO.widget.AutoComplete.prototype._sInitInputValue = null;
YAHOO.widget.AutoComplete.prototype._elCurListItem = null;
YAHOO.widget.AutoComplete.prototype._elCurPrehighlightItem = null;
YAHOO.widget.AutoComplete.prototype._bItemSelected = false;
YAHOO.widget.AutoComplete.prototype._nKeyCode = null;
YAHOO.widget.AutoComplete.prototype._nDelayID = -1;
YAHOO.widget.AutoComplete.prototype._nTypeAheadDelayID = -1;
YAHOO.widget.AutoComplete.prototype._iFrameSrc = "javascript:false;";
YAHOO.widget.AutoComplete.prototype._queryInterval = null;
YAHOO.widget.AutoComplete.prototype._sLastTextboxValue = null;
YAHOO.widget.AutoComplete.prototype._initProps = function () {
    var b = this.minQueryLength;
    if (!YAHOO.lang.isNumber(b)) {
        this.minQueryLength = 1;
    }
    var e = this.maxResultsDisplayed;
    if (!YAHOO.lang.isNumber(e) || (e < 1)) {
        this.maxResultsDisplayed = 10;
    }
    var f = this.queryDelay;
    if (!YAHOO.lang.isNumber(f) || (f < 0)) {
        this.queryDelay = 0.2;
    }
    var c = this.typeAheadDelay;
    if (!YAHOO.lang.isNumber(c) || (c < 0)) {
        this.typeAheadDelay = 0.2;
    }
    var a = this.delimChar;
    if (YAHOO.lang.isString(a) && (a.length > 0)) {
        this.delimChar = [a];
    } else {
        if (!YAHOO.lang.isArray(a)) {
            this.delimChar = null;
        }
    }
    var d = this.animSpeed;
    if ((this.animHoriz || this.animVert) && YAHOO.util.Anim) {
        if (!YAHOO.lang.isNumber(d) || (d < 0)) {
            this.animSpeed = 0.3;
        }
        if (!this._oAnim) {
            this._oAnim = new YAHOO.util.Anim(this._elContent, {}, this.animSpeed);
        } else {
            this._oAnim.duration = this.animSpeed;
        }
    }
    if (this.forceSelection && a) {
    }
};
YAHOO.widget.AutoComplete.prototype._initContainerHelperEls = function () {
    if (this.useShadow && !this._elShadow) {
        var a = document.createElement("div");
        a.className = "yui-ac-shadow";
        a.style.width = 0;
        a.style.height = 0;
        this._elShadow = this._elContainer.appendChild(a);
    }
    if (this.useIFrame && !this._elIFrame) {
        var b = document.createElement("iframe");
        b.src = this._iFrameSrc;
        b.frameBorder = 0;
        b.scrolling = "no";
        b.style.position = "absolute";
        b.style.width = 0;
        b.style.height = 0;
        b.style.padding = 0;
        b.tabIndex = -1;
        b.role = "presentation";
        b.title = "Presentational iframe shim";
        this._elIFrame = this._elContainer.appendChild(b);
    }
};
YAHOO.widget.AutoComplete.prototype._initContainerEl = function () {
    YAHOO.util.Dom.addClass(this._elContainer, "yui-ac-container");
    if (!this._elContent) {
        var c = document.createElement("div");
        c.className = "yui-ac-content";
        c.style.display = "none";
        this._elContent = this._elContainer.appendChild(c);
        var b = document.createElement("div");
        b.className = "yui-ac-hd";
        b.style.display = "none";
        this._elHeader = this._elContent.appendChild(b);
        var d = document.createElement("div");
        d.className = "yui-ac-bd";
        this._elBody = this._elContent.appendChild(d);
        var a = document.createElement("div");
        a.className = "yui-ac-ft";
        a.style.display = "none";
        this._elFooter = this._elContent.appendChild(a);
    } else {
    }
};
YAHOO.widget.AutoComplete.prototype._initListEl = function () {
    var c = this.maxResultsDisplayed, a = this._elList || document.createElement("ul"), b;
    while (a.childNodes.length < c) {
        b = document.createElement("li");
        b.style.display = "none";
        b._nItemIndex = a.childNodes.length;
        a.appendChild(b);
    }
    if (!this._elList) {
        var d = this._elBody;
        YAHOO.util.Event.purgeElement(d, true);
        d.innerHTML = "";
        this._elList = d.appendChild(a);
    }
    this._elBody.style.display = "";
};
YAHOO.widget.AutoComplete.prototype._focus = function () {
    var a = this;
    setTimeout(function () {
        try {
            a._elTextbox.focus();
        } catch (b) {
        }
    }, 0);
};
YAHOO.widget.AutoComplete.prototype._enableIntervalDetection = function () {
    var a = this;
    if (!a._queryInterval && a.queryInterval) {
        a._queryInterval = setInterval(function () {
            a._onInterval();
        }, a.queryInterval);
    }
};
YAHOO.widget.AutoComplete.prototype.enableIntervalDetection = YAHOO.widget.AutoComplete.prototype._enableIntervalDetection;
YAHOO.widget.AutoComplete.prototype._onInterval = function () {
    var a = this._elTextbox.value;
    var b = this._sLastTextboxValue;
    if (a != b) {
        this._sLastTextboxValue = a;
        this._sendQuery(a);
    }
};
YAHOO.widget.AutoComplete.prototype._clearInterval = function () {
    if (this._queryInterval) {
        clearInterval(this._queryInterval);
        this._queryInterval = null;
    }
};
YAHOO.widget.AutoComplete.prototype._isIgnoreKey = function (a) {
    if ((a == 9) || (a == 13) || (a == 16) || (a == 17) || (a >= 18 && a <= 20) || (a == 27) || (a >= 33 && a <= 35) || (a >= 36 && a <= 40) || (a >= 44 && a <= 45) || (a == 229)) {
        return true;
    }
    return false;
};
YAHOO.widget.AutoComplete.prototype._sendQuery = function (d) {
    if (this.minQueryLength < 0) {
        this._toggleContainer(false);
        return;
    }
    if (this.delimChar) {
        var a = this._extractQuery(d);
        d = a.query;
        this._sPastSelections = a.previous;
    }
    if ((d && (d.length < this.minQueryLength)) || (!d && this.minQueryLength > 0)) {
        if (this._nDelayID != -1) {
            clearTimeout(this._nDelayID);
        }
        this._toggleContainer(false);
        return;
    }
    d = encodeURIComponent(d);
    this._nDelayID = -1;
    if (this.dataSource.queryMatchSubset || this.queryMatchSubset) {
        var c = this.getSubsetMatches(d);
        if (c) {
            this.handleResponse(d, c, {query:d});
            return;
        }
    }
    if (this.dataSource.responseStripAfter) {
        this.dataSource.doBeforeParseData = this.preparseRawResponse;
    }
    if (this.applyLocalFilter) {
        this.dataSource.doBeforeCallback = this.filterResults;
    }
    var b = this.generateRequest(d);
    if (b !== undefined) {
        this.dataRequestEvent.fire(this, d, b);
        this.dataSource.sendRequest(b, {success:this.handleResponse, failure:this.handleResponse, scope:this, argument:{query:d}});
    } else {
        this.dataRequestCancelEvent.fire(this, d);
    }
};
YAHOO.widget.AutoComplete.prototype._populateListItem = function (b, a, c) {
    b.innerHTML = this.formatResult(a, c, b._sResultMatch);
};
YAHOO.widget.AutoComplete.prototype._populateList = function (n, f, c) {
    if (this._nTypeAheadDelayID != -1) {
        clearTimeout(this._nTypeAheadDelayID);
    }
    n = (c && c.query) ? c.query : n;
    var h = this.doBeforeLoadData(n, f, c);
    if (h && !f.error) {
        this.dataReturnEvent.fire(this, n, f.results);
        if (this._bFocused) {
            var p = decodeURIComponent(n);
            this._sCurQuery = p;
            this._bItemSelected = false;
            var u = f.results, a = Math.min(u.length, this.maxResultsDisplayed), m = (this.dataSource.responseSchema.fields) ? (this.dataSource.responseSchema.fields[0].key || this.dataSource.responseSchema.fields[0]) : 0;
            if (a > 0) {
                if (!this._elList || (this._elList.childNodes.length < a)) {
                    this._initListEl();
                }
                this._initContainerHelperEls();
                var l = this._elList.childNodes;
                for (var t = a - 1; t >= 0; t--) {
                    var s = l[t], e = u[t];
                    if (this.resultTypeList) {
                        var b = [];
                        b[0] = (YAHOO.lang.isString(e)) ? e : e[m] || e[this.key];
                        var o = this.dataSource.responseSchema.fields;
                        if (YAHOO.lang.isArray(o) && (o.length > 1)) {
                            for (var q = 1, v = o.length; q < v; q++) {
                                b[b.length] = e[o[q].key || o[q]];
                            }
                        } else {
                            if (YAHOO.lang.isArray(e)) {
                                b = e;
                            } else {
                                if (YAHOO.lang.isString(e)) {
                                    b = [e];
                                } else {
                                    b[1] = e;
                                }
                            }
                        }
                        e = b;
                    }
                    s._sResultMatch = (YAHOO.lang.isString(e)) ? e : (YAHOO.lang.isArray(e)) ? e[0] : (e[m] || "");
                    s._oResultData = e;
                    this._populateListItem(s, e, p);
                    s.style.display = "";
                }
                if (a < l.length) {
                    var g;
                    for (var r = l.length - 1; r >= a; r--) {
                        g = l[r];
                        g.style.display = "none";
                    }
                }
                this._nDisplayedItems = a;
                this.containerPopulateEvent.fire(this, n, u);
                if (this.autoHighlight) {
                    var d = this._elList.firstChild;
                    this._toggleHighlight(d, "to");
                    this.itemArrowToEvent.fire(this, d);
                    this._typeAhead(d, n);
                } else {
                    this._toggleHighlight(this._elCurListItem, "from");
                }
                h = this._doBeforeExpandContainer(this._elTextbox, this._elContainer, n, u);
                this._toggleContainer(h);
            } else {
                this._toggleContainer(false);
            }
            return;
        }
    } else {
        this.dataErrorEvent.fire(this, n, f);
    }
};
YAHOO.widget.AutoComplete.prototype._doBeforeExpandContainer = function (d, a, c, b) {
    if (this.autoSnapContainer) {
        this.snapContainer();
    }
    return this.doBeforeExpandContainer(d, a, c, b);
};
YAHOO.widget.AutoComplete.prototype._clearSelection = function () {
    var a = (this.delimChar) ? this._extractQuery(this._elTextbox.value) : {previous:"", query:this._elTextbox.value};
    this._elTextbox.value = a.previous;
    this.selectionEnforceEvent.fire(this, a.query);
};
YAHOO.widget.AutoComplete.prototype._textMatchesOption = function () {
    var a = null;
    for (var b = 0; b < this._nDisplayedItems; b++) {
        var c = this._elList.childNodes[b];
        var d = ("" + c._sResultMatch).toLowerCase();
        if (d == this._sCurQuery.toLowerCase()) {
            a = c;
            break;
        }
    }
    return(a);
};
YAHOO.widget.AutoComplete.prototype._typeAhead = function (b, d) {
    if (!this.typeAhead || (this._nKeyCode == 8)) {
        return;
    }
    var a = this, c = this._elTextbox;
    if (c.setSelectionRange || c.createTextRange) {
        this._nTypeAheadDelayID = setTimeout(function () {
            var f = c.value.length;
            a._updateValue(b);
            var g = c.value.length;
            a._selectText(c, f, g);
            var e = c.value.substr(f, g);
            a._sCurQuery = b._sResultMatch;
            a.typeAheadEvent.fire(a, d, e);
        }, (this.typeAheadDelay * 1000));
    }
};
YAHOO.widget.AutoComplete.prototype._selectText = function (d, a, b) {
    if (d.setSelectionRange) {
        d.setSelectionRange(a, b);
    } else {
        if (d.createTextRange) {
            var c = d.createTextRange();
            c.moveStart("character", a);
            c.moveEnd("character", b - d.value.length);
            c.select();
        } else {
            d.select();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._extractQuery = function (h) {
    var c = this.delimChar, f = -1, g, e, b = c.length - 1, d;
    for (; b >= 0; b--) {
        g = h.lastIndexOf(c[b]);
        if (g > f) {
            f = g;
        }
    }
    if (c[b] == " ") {
        for (var a = c.length - 1; a >= 0; a--) {
            if (h[f - 1] == c[a]) {
                f--;
                break;
            }
        }
    }
    if (f > -1) {
        e = f + 1;
        while (h.charAt(e) == " ") {
            e += 1;
        }
        d = h.substring(0, e);
        h = h.substr(e);
    } else {
        d = "";
    }
    return{previous:d, query:h};
};
YAHOO.widget.AutoComplete.prototype._toggleContainerHelpers = function (d) {
    var e = this._elContent.offsetWidth + "px";
    var b = this._elContent.offsetHeight + "px";
    if (this.useIFrame && this._elIFrame) {
        var c = this._elIFrame;
        if (d) {
            c.style.width = e;
            c.style.height = b;
            c.style.padding = "";
        } else {
            c.style.width = 0;
            c.style.height = 0;
            c.style.padding = 0;
        }
    }
    if (this.useShadow && this._elShadow) {
        var a = this._elShadow;
        if (d) {
            a.style.width = e;
            a.style.height = b;
        } else {
            a.style.width = 0;
            a.style.height = 0;
        }
    }
};
YAHOO.widget.AutoComplete.prototype._toggleContainer = function (i) {
    var d = this._elContainer;
    if (this.alwaysShowContainer && this._bContainerOpen) {
        return;
    }
    if (!i) {
        this._toggleHighlight(this._elCurListItem, "from");
        this._nDisplayedItems = 0;
        this._sCurQuery = null;
        if (this._elContent.style.display == "none") {
            return;
        }
    }
    var a = this._oAnim;
    if (a && a.getEl() && (this.animHoriz || this.animVert)) {
        if (a.isAnimated()) {
            a.stop(true);
        }
        var g = this._elContent.cloneNode(true);
        d.appendChild(g);
        g.style.top = "-9000px";
        g.style.width = "";
        g.style.height = "";
        g.style.display = "";
        var f = g.offsetWidth;
        var c = g.offsetHeight;
        var b = (this.animHoriz) ? 0 : f;
        var e = (this.animVert) ? 0 : c;
        a.attributes = (i) ? {width:{to:f}, height:{to:c}} : {width:{to:b}, height:{to:e}};
        if (i && !this._bContainerOpen) {
            this._elContent.style.width = b + "px";
            this._elContent.style.height = e + "px";
        } else {
            this._elContent.style.width = f + "px";
            this._elContent.style.height = c + "px";
        }
        d.removeChild(g);
        g = null;
        var h = this;
        var j = function () {
            a.onComplete.unsubscribeAll();
            if (i) {
                h._toggleContainerHelpers(true);
                h._bContainerOpen = i;
                h.containerExpandEvent.fire(h);
            } else {
                h._elContent.style.display = "none";
                h._bContainerOpen = i;
                h.containerCollapseEvent.fire(h);
            }
        };
        this._toggleContainerHelpers(false);
        this._elContent.style.display = "";
        a.onComplete.subscribe(j);
        a.animate();
    } else {
        if (i) {
            this._elContent.style.display = "";
            this._toggleContainerHelpers(true);
            this._bContainerOpen = i;
            this.containerExpandEvent.fire(this);
        } else {
            this._toggleContainerHelpers(false);
            this._elContent.style.display = "none";
            this._bContainerOpen = i;
            this.containerCollapseEvent.fire(this);
        }
    }
};
YAHOO.widget.AutoComplete.prototype._toggleHighlight = function (a, c) {
    if (a) {
        var b = this.highlightClassName;
        if (this._elCurListItem) {
            YAHOO.util.Dom.removeClass(this._elCurListItem, b);
            this._elCurListItem = null;
        }
        if ((c == "to") && b) {
            YAHOO.util.Dom.addClass(a, b);
            this._elCurListItem = a;
        }
    }
};
YAHOO.widget.AutoComplete.prototype._togglePrehighlight = function (b, c) {
    var a = this.prehighlightClassName;
    if (this._elCurPrehighlightItem) {
        YAHOO.util.Dom.removeClass(this._elCurPrehighlightItem, a);
    }
    if (b == this._elCurListItem) {
        return;
    }
    if ((c == "mouseover") && a) {
        YAHOO.util.Dom.addClass(b, a);
        this._elCurPrehighlightItem = b;
    } else {
        YAHOO.util.Dom.removeClass(b, a);
    }
};
YAHOO.widget.AutoComplete.prototype._updateValue = function (c) {
    if (!this.suppressInputUpdate) {
        var f = this._elTextbox;
        var e = (this.delimChar) ? (this.delimChar[0] || this.delimChar) : null;
        var b = c._sResultMatch;
        var d = "";
        if (e) {
            d = this._sPastSelections;
            d += b + e;
            if (e != " ") {
                d += " ";
            }
        } else {
            d = b;
        }
        f.value = d;
        if (f.type == "textarea") {
            f.scrollTop = f.scrollHeight;
        }
        var a = f.value.length;
        this._selectText(f, a, a);
        this._elCurListItem = c;
    }
};
YAHOO.widget.AutoComplete.prototype._selectItem = function (a) {
    this._bItemSelected = true;
    this._updateValue(a);
    this._sPastSelections = this._elTextbox.value;
    this._clearInterval();
    this.itemSelectEvent.fire(this, a, a._oResultData);
    this._toggleContainer(false);
};
YAHOO.widget.AutoComplete.prototype._jumpSelection = function () {
    if (this._elCurListItem) {
        this._selectItem(this._elCurListItem);
    } else {
        this._toggleContainer(false);
    }
};
YAHOO.widget.AutoComplete.prototype._moveSelection = function (g) {
    if (this._bContainerOpen) {
        var h = this._elCurListItem, d = -1;
        if (h) {
            d = h._nItemIndex;
        }
        var e = (g == 40) ? (d + 1) : (d - 1);
        if (e < -2 || e >= this._nDisplayedItems) {
            return;
        }
        if (h) {
            this._toggleHighlight(h, "from");
            this.itemArrowFromEvent.fire(this, h);
        }
        if (e == -1) {
            if (this.delimChar) {
                this._elTextbox.value = this._sPastSelections + this._sCurQuery;
            } else {
                this._elTextbox.value = this._sCurQuery;
            }
            return;
        }
        if (e == -2) {
            this._toggleContainer(false);
            return;
        }
        var f = this._elList.childNodes[e], b = this._elContent, c = YAHOO.util.Dom.getStyle(b, "overflow"), i = YAHOO.util.Dom.getStyle(b, "overflowY"), a = ((c == "auto") || (c == "scroll") || (i == "auto") || (i == "scroll"));
        if (a && (e > -1) && (e < this._nDisplayedItems)) {
            if (g == 40) {
                if ((f.offsetTop + f.offsetHeight) > (b.scrollTop + b.offsetHeight)) {
                    b.scrollTop = (f.offsetTop + f.offsetHeight) - b.offsetHeight;
                } else {
                    if ((f.offsetTop + f.offsetHeight) < b.scrollTop) {
                        b.scrollTop = f.offsetTop;
                    }
                }
            } else {
                if (f.offsetTop < b.scrollTop) {
                    this._elContent.scrollTop = f.offsetTop;
                } else {
                    if (f.offsetTop > (b.scrollTop + b.offsetHeight)) {
                        this._elContent.scrollTop = (f.offsetTop + f.offsetHeight) - b.offsetHeight;
                    }
                }
            }
        }
        this._toggleHighlight(f, "to");
        this.itemArrowToEvent.fire(this, f);
        if (this.typeAhead) {
            this._updateValue(f);
            this._sCurQuery = f._sResultMatch;
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerMouseover = function (a, c) {
    var d = YAHOO.util.Event.getTarget(a);
    var b = d.nodeName.toLowerCase();
    while (d && (b != "table")) {
        switch (b) {
            case"body":
                return;
            case"li":
                if (c.prehighlightClassName) {
                    c._togglePrehighlight(d, "mouseover");
                } else {
                    c._toggleHighlight(d, "to");
                }
                c.itemMouseOverEvent.fire(c, d);
                break;
            case"div":
                if (YAHOO.util.Dom.hasClass(d, "yui-ac-container")) {
                    c._bOverContainer = true;
                    return;
                }
                break;
            default:
                break;
        }
        d = d.parentNode;
        if (d) {
            b = d.nodeName.toLowerCase();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerMouseout = function (a, c) {
    var d = YAHOO.util.Event.getTarget(a);
    var b = d.nodeName.toLowerCase();
    while (d && (b != "table")) {
        switch (b) {
            case"body":
                return;
            case"li":
                if (c.prehighlightClassName) {
                    c._togglePrehighlight(d, "mouseout");
                } else {
                    c._toggleHighlight(d, "from");
                }
                c.itemMouseOutEvent.fire(c, d);
                break;
            case"ul":
                c._toggleHighlight(c._elCurListItem, "to");
                break;
            case"div":
                if (YAHOO.util.Dom.hasClass(d, "yui-ac-container")) {
                    c._bOverContainer = false;
                    return;
                }
                break;
            default:
                break;
        }
        d = d.parentNode;
        if (d) {
            b = d.nodeName.toLowerCase();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerClick = function (a, c) {
    var d = YAHOO.util.Event.getTarget(a);
    var b = d.nodeName.toLowerCase();
    while (d && (b != "table")) {
        switch (b) {
            case"body":
                return;
            case"li":
                c._toggleHighlight(d, "to");
                c._selectItem(d);
                return;
            default:
                break;
        }
        d = d.parentNode;
        if (d) {
            b = d.nodeName.toLowerCase();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onContainerScroll = function (a, b) {
    b._focus();
};
YAHOO.widget.AutoComplete.prototype._onContainerResize = function (a, b) {
    b._toggleContainerHelpers(b._bContainerOpen);
};
YAHOO.widget.AutoComplete.prototype._onTextboxKeyDown = function (a, b) {
    var c = a.keyCode;
    if (b._nTypeAheadDelayID != -1) {
        clearTimeout(b._nTypeAheadDelayID);
    }
    switch (c) {
        case 9:
            if (!YAHOO.env.ua.opera && (navigator.userAgent.toLowerCase().indexOf("mac") == -1) || (YAHOO.env.ua.webkit > 420)) {
                if (b._elCurListItem) {
                    if (b.delimChar && (b._nKeyCode != c)) {
                        if (b._bContainerOpen) {
                            YAHOO.util.Event.stopEvent(a);
                        }
                    }
                    b._selectItem(b._elCurListItem);
                } else {
                    b._toggleContainer(false);
                }
            }
            break;
        case 13:
            if (!YAHOO.env.ua.opera && (navigator.userAgent.toLowerCase().indexOf("mac") == -1) || (YAHOO.env.ua.webkit > 420)) {
                if (b._elCurListItem) {
                    if (b._nKeyCode != c) {
                        if (b._bContainerOpen) {
                            YAHOO.util.Event.stopEvent(a);
                        }
                    }
                    b._selectItem(b._elCurListItem);
                } else {
                    b._toggleContainer(false);
                }
            }
            break;
        case 27:
            b._toggleContainer(false);
            return;
        case 39:
            b._jumpSelection();
            break;
        case 38:
            if (b._bContainerOpen) {
                YAHOO.util.Event.stopEvent(a);
                b._moveSelection(c);
            }
            break;
        case 40:
            if (b._bContainerOpen) {
                YAHOO.util.Event.stopEvent(a);
                b._moveSelection(c);
            }
            break;
        default:
            b._bItemSelected = false;
            b._toggleHighlight(b._elCurListItem, "from");
            b.textboxKeyEvent.fire(b, c);
            break;
    }
    if (c === 18) {
        b._enableIntervalDetection();
    }
    b._nKeyCode = c;
};
YAHOO.widget.AutoComplete.prototype._onTextboxKeyPress = function (a, b) {
    var c = a.keyCode;
    if (YAHOO.env.ua.opera || (navigator.userAgent.toLowerCase().indexOf("mac") != -1) && (YAHOO.env.ua.webkit < 420)) {
        switch (c) {
            case 9:
                if (b._bContainerOpen) {
                    if (b.delimChar) {
                        YAHOO.util.Event.stopEvent(a);
                    }
                    if (b._elCurListItem) {
                        b._selectItem(b._elCurListItem);
                    } else {
                        b._toggleContainer(false);
                    }
                }
                break;
            case 13:
                if (b._bContainerOpen) {
                    YAHOO.util.Event.stopEvent(a);
                    if (b._elCurListItem) {
                        b._selectItem(b._elCurListItem);
                    } else {
                        b._toggleContainer(false);
                    }
                }
                break;
            default:
                break;
        }
    } else {
        if (c == 229) {
            b._enableIntervalDetection();
        }
    }
};
YAHOO.widget.AutoComplete.prototype._onTextboxKeyUp = function (a, c) {
    var b = this.value;
    c._initProps();
    var d = a.keyCode;
    if (c._isIgnoreKey(d)) {
        return;
    }
    if (c._nDelayID != -1) {
        clearTimeout(c._nDelayID);
    }
    c._nDelayID = setTimeout(function () {
        c._sendQuery(b);
    }, (c.queryDelay * 1000));
};
YAHOO.widget.AutoComplete.prototype._onTextboxFocus = function (a, b) {
    if (!b._bFocused) {
        b._elTextbox.setAttribute("autocomplete", "off");
        b._bFocused = true;
        b._sInitInputValue = b._elTextbox.value;
        b.textboxFocusEvent.fire(b);
    }
};
YAHOO.widget.AutoComplete.prototype._onTextboxBlur = function (a, c) {
    if (!c._bOverContainer || (c._nKeyCode == 9)) {
        if (!c._bItemSelected) {
            var b = c._textMatchesOption();
            if (!c._bContainerOpen || (c._bContainerOpen && (b === null))) {
                if (c.forceSelection) {
                    c._clearSelection();
                } else {
                    c.unmatchedItemSelectEvent.fire(c, c._sCurQuery);
                }
            } else {
                if (c.forceSelection) {
                    c._selectItem(b);
                }
            }
        }
        c._clearInterval();
        c._bFocused = false;
        if (c._sInitInputValue !== c._elTextbox.value) {
            c.textboxChangeEvent.fire(c);
        }
        c.textboxBlurEvent.fire(c);
        c._toggleContainer(false);
    } else {
        c._focus();
    }
};
YAHOO.widget.AutoComplete.prototype._onWindowUnload = function (a, b) {
    if (b && b._elTextbox && b.allowBrowserAutocomplete) {
        b._elTextbox.setAttribute("autocomplete", "on");
    }
};
YAHOO.widget.AutoComplete.prototype.doBeforeSendQuery = function (a) {
    return this.generateRequest(a);
};
YAHOO.widget.AutoComplete.prototype.getListItems = function () {
    var c = [], b = this._elList.childNodes;
    for (var a = b.length - 1; a >= 0; a--) {
        c[a] = b[a];
    }
    return c;
};
YAHOO.widget.AutoComplete._cloneObject = function (d) {
    if (!YAHOO.lang.isValue(d)) {
        return d;
    }
    var f = {};
    if (YAHOO.lang.isFunction(d)) {
        f = d;
    } else {
        if (YAHOO.lang.isArray(d)) {
            var e = [];
            for (var c = 0, b = d.length; c < b; c++) {
                e[c] = YAHOO.widget.AutoComplete._cloneObject(d[c]);
            }
            f = e;
        } else {
            if (YAHOO.lang.isObject(d)) {
                for (var a in d) {
                    if (YAHOO.lang.hasOwnProperty(d, a)) {
                        if (YAHOO.lang.isValue(d[a]) && YAHOO.lang.isObject(d[a]) || YAHOO.lang.isArray(d[a])) {
                            f[a] = YAHOO.widget.AutoComplete._cloneObject(d[a]);
                        } else {
                            f[a] = d[a];
                        }
                    }
                }
            } else {
                f = d;
            }
        }
    }
    return f;
};
YAHOO.register("autocomplete", YAHOO.widget.AutoComplete, {version:"2.9.0", build:"2800"});