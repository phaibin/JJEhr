/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var lang = YAHOO.lang, util = YAHOO.util, Ev = util.Event;
    util.DataSourceBase = function (oLiveData, oConfigs) {
        if (oLiveData === null || oLiveData === undefined) {
            return;
        }
        this.liveData = oLiveData;
        this._oQueue = {interval:null, conn:null, requests:[]};
        this.responseSchema = {};
        if (oConfigs && (oConfigs.constructor == Object)) {
            for (var sConfig in oConfigs) {
                if (sConfig) {
                    this[sConfig] = oConfigs[sConfig];
                }
            }
        }
        var maxCacheEntries = this.maxCacheEntries;
        if (!lang.isNumber(maxCacheEntries) || (maxCacheEntries < 0)) {
            maxCacheEntries = 0;
        }
        this._aIntervals = [];
        this.createEvent("cacheRequestEvent");
        this.createEvent("cacheResponseEvent");
        this.createEvent("requestEvent");
        this.createEvent("responseEvent");
        this.createEvent("responseParseEvent");
        this.createEvent("responseCacheEvent");
        this.createEvent("dataErrorEvent");
        this.createEvent("cacheFlushEvent");
        var DS = util.DataSourceBase;
        this._sName = "DataSource instance" + DS._nIndex;
        DS._nIndex++;
    };
    var DS = util.DataSourceBase;
    lang.augmentObject(DS, {TYPE_UNKNOWN:-1, TYPE_JSARRAY:0, TYPE_JSFUNCTION:1, TYPE_XHR:2, TYPE_JSON:3, TYPE_XML:4, TYPE_TEXT:5, TYPE_HTMLTABLE:6, TYPE_SCRIPTNODE:7, TYPE_LOCAL:8, ERROR_DATAINVALID:"Invalid data", ERROR_DATANULL:"Null data", _nIndex:0, _nTransactionId:0, _cloneObject:function (o) {
        if (!lang.isValue(o)) {
            return o;
        }
        var copy = {};
        if (Object.prototype.toString.apply(o) === "[object RegExp]") {
            copy = o;
        } else {
            if (lang.isFunction(o)) {
                copy = o;
            } else {
                if (lang.isArray(o)) {
                    var array = [];
                    for (var i = 0, len = o.length; i < len; i++) {
                        array[i] = DS._cloneObject(o[i]);
                    }
                    copy = array;
                } else {
                    if (lang.isObject(o)) {
                        for (var x in o) {
                            if (lang.hasOwnProperty(o, x)) {
                                if (lang.isValue(o[x]) && lang.isObject(o[x]) || lang.isArray(o[x])) {
                                    copy[x] = DS._cloneObject(o[x]);
                                } else {
                                    copy[x] = o[x];
                                }
                            }
                        }
                    } else {
                        copy = o;
                    }
                }
            }
        }
        return copy;
    }, _getLocationValue:function (field, context) {
        var locator = field.locator || field.key || field, xmldoc = context.ownerDocument || context, result, res, value = null;
        try {
            if (!lang.isUndefined(xmldoc.evaluate)) {
                result = xmldoc.evaluate(locator, context, xmldoc.createNSResolver(!context.ownerDocument ? context.documentElement : context.ownerDocument.documentElement), 0, null);
                while (res = result.iterateNext()) {
                    value = res.textContent;
                }
            } else {
                xmldoc.setProperty("SelectionLanguage", "XPath");
                result = context.selectNodes(locator)[0];
                value = result.value || result.text || null;
            }
            return value;
        } catch (e) {
        }
    }, issueCallback:function (callback, params, error, scope) {
        if (lang.isFunction(callback)) {
            callback.apply(scope, params);
        } else {
            if (lang.isObject(callback)) {
                scope = callback.scope || scope || window;
                var callbackFunc = callback.success;
                if (error) {
                    callbackFunc = callback.failure;
                }
                if (callbackFunc) {
                    callbackFunc.apply(scope, params.concat([callback.argument]));
                }
            }
        }
    }, parseString:function (oData) {
        if (!lang.isValue(oData)) {
            return null;
        }
        var string = oData + "";
        if (lang.isString(string)) {
            return string;
        } else {
            return null;
        }
    }, parseNumber:function (oData) {
        if (!lang.isValue(oData) || (oData === "")) {
            return null;
        }
        var number = oData * 1;
        if (lang.isNumber(number)) {
            return number;
        } else {
            return null;
        }
    }, convertNumber:function (oData) {
        return DS.parseNumber(oData);
    }, parseDate:function (oData) {
        var date = null;
        if (lang.isValue(oData) && !(oData instanceof Date)) {
            date = new Date(oData);
        } else {
            return oData;
        }
        if (date instanceof Date) {
            return date;
        } else {
            return null;
        }
    }, convertDate:function (oData) {
        return DS.parseDate(oData);
    }});
    DS.Parser = {string:DS.parseString, number:DS.parseNumber, date:DS.parseDate};
    DS.prototype = {_sName:null, _aCache:null, _oQueue:null, _aIntervals:null, maxCacheEntries:0, liveData:null, dataType:DS.TYPE_UNKNOWN, responseType:DS.TYPE_UNKNOWN, responseSchema:null, useXPath:false, cloneBeforeCaching:false, toString:function () {
        return this._sName;
    }, getCachedResponse:function (oRequest, oCallback, oCaller) {
        var aCache = this._aCache;
        if (this.maxCacheEntries > 0) {
            if (!aCache) {
                this._aCache = [];
            } else {
                var nCacheLength = aCache.length;
                if (nCacheLength > 0) {
                    var oResponse = null;
                    this.fireEvent("cacheRequestEvent", {request:oRequest, callback:oCallback, caller:oCaller});
                    for (var i = nCacheLength - 1; i >= 0; i--) {
                        var oCacheElem = aCache[i];
                        if (this.isCacheHit(oRequest, oCacheElem.request)) {
                            oResponse = oCacheElem.response;
                            this.fireEvent("cacheResponseEvent", {request:oRequest, response:oResponse, callback:oCallback, caller:oCaller});
                            if (i < nCacheLength - 1) {
                                aCache.splice(i, 1);
                                this.addToCache(oRequest, oResponse);
                            }
                            oResponse.cached = true;
                            break;
                        }
                    }
                    return oResponse;
                }
            }
        } else {
            if (aCache) {
                this._aCache = null;
            }
        }
        return null;
    }, isCacheHit:function (oRequest, oCachedRequest) {
        return(oRequest === oCachedRequest);
    }, addToCache:function (oRequest, oResponse) {
        var aCache = this._aCache;
        if (!aCache) {
            return;
        }
        while (aCache.length >= this.maxCacheEntries) {
            aCache.shift();
        }
        oResponse = (this.cloneBeforeCaching) ? DS._cloneObject(oResponse) : oResponse;
        var oCacheElem = {request:oRequest, response:oResponse};
        aCache[aCache.length] = oCacheElem;
        this.fireEvent("responseCacheEvent", {request:oRequest, response:oResponse});
    }, flushCache:function () {
        if (this._aCache) {
            this._aCache = [];
            this.fireEvent("cacheFlushEvent");
        }
    }, setInterval:function (nMsec, oRequest, oCallback, oCaller) {
        if (lang.isNumber(nMsec) && (nMsec >= 0)) {
            var oSelf = this;
            var nId = setInterval(function () {
                oSelf.makeConnection(oRequest, oCallback, oCaller);
            }, nMsec);
            this._aIntervals.push(nId);
            return nId;
        } else {
        }
    }, clearInterval:function (nId) {
        var tracker = this._aIntervals || [];
        for (var i = tracker.length - 1; i > -1; i--) {
            if (tracker[i] === nId) {
                tracker.splice(i, 1);
                clearInterval(nId);
            }
        }
    }, clearAllIntervals:function () {
        var tracker = this._aIntervals || [];
        for (var i = tracker.length - 1; i > -1; i--) {
            clearInterval(tracker[i]);
        }
        tracker = [];
    }, sendRequest:function (oRequest, oCallback, oCaller) {
        var oCachedResponse = this.getCachedResponse(oRequest, oCallback, oCaller);
        if (oCachedResponse) {
            DS.issueCallback(oCallback, [oRequest, oCachedResponse], false, oCaller);
            return null;
        }
        return this.makeConnection(oRequest, oCallback, oCaller);
    }, makeConnection:function (oRequest, oCallback, oCaller) {
        var tId = DS._nTransactionId++;
        this.fireEvent("requestEvent", {tId:tId, request:oRequest, callback:oCallback, caller:oCaller});
        var oRawResponse = this.liveData;
        this.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
        return tId;
    }, handleResponse:function (oRequest, oRawResponse, oCallback, oCaller, tId) {
        this.fireEvent("responseEvent", {tId:tId, request:oRequest, response:oRawResponse, callback:oCallback, caller:oCaller});
        var xhr = (this.dataType == DS.TYPE_XHR) ? true : false;
        var oParsedResponse = null;
        var oFullResponse = oRawResponse;
        if (this.responseType === DS.TYPE_UNKNOWN) {
            var ctype = (oRawResponse && oRawResponse.getResponseHeader) ? oRawResponse.getResponseHeader["Content-Type"] : null;
            if (ctype) {
                if (ctype.indexOf("text/xml") > -1) {
                    this.responseType = DS.TYPE_XML;
                } else {
                    if (ctype.indexOf("application/json") > -1) {
                        this.responseType = DS.TYPE_JSON;
                    } else {
                        if (ctype.indexOf("text/plain") > -1) {
                            this.responseType = DS.TYPE_TEXT;
                        }
                    }
                }
            } else {
                if (YAHOO.lang.isArray(oRawResponse)) {
                    this.responseType = DS.TYPE_JSARRAY;
                } else {
                    if (oRawResponse && oRawResponse.nodeType && (oRawResponse.nodeType === 9 || oRawResponse.nodeType === 1 || oRawResponse.nodeType === 11)) {
                        this.responseType = DS.TYPE_XML;
                    } else {
                        if (oRawResponse && oRawResponse.nodeName && (oRawResponse.nodeName.toLowerCase() == "table")) {
                            this.responseType = DS.TYPE_HTMLTABLE;
                        } else {
                            if (YAHOO.lang.isObject(oRawResponse)) {
                                this.responseType = DS.TYPE_JSON;
                            } else {
                                if (YAHOO.lang.isString(oRawResponse)) {
                                    this.responseType = DS.TYPE_TEXT;
                                }
                            }
                        }
                    }
                }
            }
        }
        switch (this.responseType) {
            case DS.TYPE_JSARRAY:
                if (xhr && oRawResponse && oRawResponse.responseText) {
                    oFullResponse = oRawResponse.responseText;
                }
                try {
                    if (lang.isString(oFullResponse)) {
                        var parseArgs = [oFullResponse].concat(this.parseJSONArgs);
                        if (lang.JSON) {
                            oFullResponse = lang.JSON.parse.apply(lang.JSON, parseArgs);
                        } else {
                            if (window.JSON && JSON.parse) {
                                oFullResponse = JSON.parse.apply(JSON, parseArgs);
                            } else {
                                if (oFullResponse.parseJSON) {
                                    oFullResponse = oFullResponse.parseJSON.apply(oFullResponse, parseArgs.slice(1));
                                } else {
                                    while (oFullResponse.length > 0 && (oFullResponse.charAt(0) != "{") && (oFullResponse.charAt(0) != "[")) {
                                        oFullResponse = oFullResponse.substring(1, oFullResponse.length);
                                    }
                                    if (oFullResponse.length > 0) {
                                        var arrayEnd = Math.max(oFullResponse.lastIndexOf("]"), oFullResponse.lastIndexOf("}"));
                                        oFullResponse = oFullResponse.substring(0, arrayEnd + 1);
                                        oFullResponse = eval("(" + oFullResponse + ")");
                                    }
                                }
                            }
                        }
                    }
                } catch (e1) {
                }
                oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                oParsedResponse = this.parseArrayData(oRequest, oFullResponse);
                break;
            case DS.TYPE_JSON:
                if (xhr && oRawResponse && oRawResponse.responseText) {
                    oFullResponse = oRawResponse.responseText;
                }
                try {
                    if (lang.isString(oFullResponse)) {
                        var parseArgs = [oFullResponse].concat(this.parseJSONArgs);
                        if (lang.JSON) {
                            oFullResponse = lang.JSON.parse.apply(lang.JSON, parseArgs);
                        } else {
                            if (window.JSON && JSON.parse) {
                                oFullResponse = JSON.parse.apply(JSON, parseArgs);
                            } else {
                                if (oFullResponse.parseJSON) {
                                    oFullResponse = oFullResponse.parseJSON.apply(oFullResponse, parseArgs.slice(1));
                                } else {
                                    while (oFullResponse.length > 0 && (oFullResponse.charAt(0) != "{") && (oFullResponse.charAt(0) != "[")) {
                                        oFullResponse = oFullResponse.substring(1, oFullResponse.length);
                                    }
                                    if (oFullResponse.length > 0) {
                                        var objEnd = Math.max(oFullResponse.lastIndexOf("]"), oFullResponse.lastIndexOf("}"));
                                        oFullResponse = oFullResponse.substring(0, objEnd + 1);
                                        oFullResponse = eval("(" + oFullResponse + ")");
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                }
                oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                oParsedResponse = this.parseJSONData(oRequest, oFullResponse);
                break;
            case DS.TYPE_HTMLTABLE:
                if (xhr && oRawResponse.responseText) {
                    var el = document.createElement("div");
                    el.innerHTML = oRawResponse.responseText;
                    oFullResponse = el.getElementsByTagName("table")[0];
                }
                oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                oParsedResponse = this.parseHTMLTableData(oRequest, oFullResponse);
                break;
            case DS.TYPE_XML:
                if (xhr && oRawResponse.responseXML) {
                    oFullResponse = oRawResponse.responseXML;
                }
                oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                oParsedResponse = this.parseXMLData(oRequest, oFullResponse);
                break;
            case DS.TYPE_TEXT:
                if (xhr && lang.isString(oRawResponse.responseText)) {
                    oFullResponse = oRawResponse.responseText;
                }
                oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                oParsedResponse = this.parseTextData(oRequest, oFullResponse);
                break;
            default:
                oFullResponse = this.doBeforeParseData(oRequest, oFullResponse, oCallback);
                oParsedResponse = this.parseData(oRequest, oFullResponse);
                break;
        }
        oParsedResponse = oParsedResponse || {};
        if (!oParsedResponse.results) {
            oParsedResponse.results = [];
        }
        if (!oParsedResponse.meta) {
            oParsedResponse.meta = {};
        }
        if (!oParsedResponse.error) {
            oParsedResponse = this.doBeforeCallback(oRequest, oFullResponse, oParsedResponse, oCallback);
            this.fireEvent("responseParseEvent", {request:oRequest, response:oParsedResponse, callback:oCallback, caller:oCaller});
            this.addToCache(oRequest, oParsedResponse);
        } else {
            oParsedResponse.error = true;
            this.fireEvent("dataErrorEvent", {request:oRequest, response:oRawResponse, callback:oCallback, caller:oCaller, message:DS.ERROR_DATANULL});
        }
        oParsedResponse.tId = tId;
        DS.issueCallback(oCallback, [oRequest, oParsedResponse], oParsedResponse.error, oCaller);
    }, doBeforeParseData:function (oRequest, oFullResponse, oCallback) {
        return oFullResponse;
    }, doBeforeCallback:function (oRequest, oFullResponse, oParsedResponse, oCallback) {
        return oParsedResponse;
    }, parseData:function (oRequest, oFullResponse) {
        if (lang.isValue(oFullResponse)) {
            var oParsedResponse = {results:oFullResponse, meta:{}};
            return oParsedResponse;
        }
        return null;
    }, parseArrayData:function (oRequest, oFullResponse) {
        if (lang.isArray(oFullResponse)) {
            var results = [], i, j, rec, field, data;
            if (lang.isArray(this.responseSchema.fields)) {
                var fields = this.responseSchema.fields;
                for (i = fields.length - 1; i >= 0; --i) {
                    if (typeof fields[i] !== "object") {
                        fields[i] = {key:fields[i]};
                    }
                }
                var parsers = {}, p;
                for (i = fields.length - 1; i >= 0; --i) {
                    p = (typeof fields[i].parser === "function" ? fields[i].parser : DS.Parser[fields[i].parser + ""]) || fields[i].converter;
                    if (p) {
                        parsers[fields[i].key] = p;
                    }
                }
                var arrType = lang.isArray(oFullResponse[0]);
                for (i = oFullResponse.length - 1; i > -1; i--) {
                    var oResult = {};
                    rec = oFullResponse[i];
                    if (typeof rec === "object") {
                        for (j = fields.length - 1; j > -1; j--) {
                            field = fields[j];
                            data = arrType ? rec[j] : rec[field.key];
                            if (parsers[field.key]) {
                                data = parsers[field.key].call(this, data);
                            }
                            if (data === undefined) {
                                data = null;
                            }
                            oResult[field.key] = data;
                        }
                    } else {
                        if (lang.isString(rec)) {
                            for (j = fields.length - 1; j > -1; j--) {
                                field = fields[j];
                                data = rec;
                                if (parsers[field.key]) {
                                    data = parsers[field.key].call(this, data);
                                }
                                if (data === undefined) {
                                    data = null;
                                }
                                oResult[field.key] = data;
                            }
                        }
                    }
                    results[i] = oResult;
                }
            } else {
                results = oFullResponse;
            }
            var oParsedResponse = {results:results};
            return oParsedResponse;
        }
        return null;
    }, parseTextData:function (oRequest, oFullResponse) {
        if (lang.isString(oFullResponse)) {
            if (lang.isString(this.responseSchema.recordDelim) && lang.isString(this.responseSchema.fieldDelim)) {
                var oParsedResponse = {results:[]};
                var recDelim = this.responseSchema.recordDelim;
                var fieldDelim = this.responseSchema.fieldDelim;
                if (oFullResponse.length > 0) {
                    var newLength = oFullResponse.length - recDelim.length;
                    if (oFullResponse.substr(newLength) == recDelim) {
                        oFullResponse = oFullResponse.substr(0, newLength);
                    }
                    if (oFullResponse.length > 0) {
                        var recordsarray = oFullResponse.split(recDelim);
                        for (var i = 0, len = recordsarray.length, recIdx = 0; i < len; ++i) {
                            var bError = false, sRecord = recordsarray[i];
                            if (lang.isString(sRecord) && (sRecord.length > 0)) {
                                var fielddataarray = recordsarray[i].split(fieldDelim);
                                var oResult = {};
                                if (lang.isArray(this.responseSchema.fields)) {
                                    var fields = this.responseSchema.fields;
                                    for (var j = fields.length - 1; j > -1; j--) {
                                        try {
                                            var data = fielddataarray[j];
                                            if (lang.isString(data)) {
                                                if (data.charAt(0) == '"') {
                                                    data = data.substr(1);
                                                }
                                                if (data.charAt(data.length - 1) == '"') {
                                                    data = data.substr(0, data.length - 1);
                                                }
                                                var field = fields[j];
                                                var key = (lang.isValue(field.key)) ? field.key : field;
                                                if (!field.parser && field.converter) {
                                                    field.parser = field.converter;
                                                }
                                                var parser = (typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""];
                                                if (parser) {
                                                    data = parser.call(this, data);
                                                }
                                                if (data === undefined) {
                                                    data = null;
                                                }
                                                oResult[key] = data;
                                            } else {
                                                bError = true;
                                            }
                                        } catch (e) {
                                            bError = true;
                                        }
                                    }
                                } else {
                                    oResult = fielddataarray;
                                }
                                if (!bError) {
                                    oParsedResponse.results[recIdx++] = oResult;
                                }
                            }
                        }
                    }
                }
                return oParsedResponse;
            }
        }
        return null;
    }, parseXMLResult:function (result) {
        var oResult = {}, schema = this.responseSchema;
        try {
            for (var m = schema.fields.length - 1; m >= 0; m--) {
                var field = schema.fields[m];
                var key = (lang.isValue(field.key)) ? field.key : field;
                var data = null;
                if (this.useXPath) {
                    data = YAHOO.util.DataSource._getLocationValue(field, result);
                } else {
                    var xmlAttr = result.attributes.getNamedItem(key);
                    if (xmlAttr) {
                        data = xmlAttr.value;
                    } else {
                        var xmlNode = result.getElementsByTagName(key);
                        if (xmlNode && xmlNode.item(0)) {
                            var item = xmlNode.item(0);
                            data = (item) ? ((item.text) ? item.text : (item.textContent) ? item.textContent : null) : null;
                            if (!data) {
                                var datapieces = [];
                                for (var j = 0, len = item.childNodes.length; j < len; j++) {
                                    if (item.childNodes[j].nodeValue) {
                                        datapieces[datapieces.length] = item.childNodes[j].nodeValue;
                                    }
                                }
                                if (datapieces.length > 0) {
                                    data = datapieces.join("");
                                }
                            }
                        }
                    }
                }
                if (data === null) {
                    data = "";
                }
                if (!field.parser && field.converter) {
                    field.parser = field.converter;
                }
                var parser = (typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""];
                if (parser) {
                    data = parser.call(this, data);
                }
                if (data === undefined) {
                    data = null;
                }
                oResult[key] = data;
            }
        } catch (e) {
        }
        return oResult;
    }, parseXMLData:function (oRequest, oFullResponse) {
        var bError = false, schema = this.responseSchema, oParsedResponse = {meta:{}}, xmlList = null, metaNode = schema.metaNode, metaLocators = schema.metaFields || {}, i, k, loc, v;
        try {
            if (this.useXPath) {
                for (k in metaLocators) {
                    oParsedResponse.meta[k] = YAHOO.util.DataSource._getLocationValue(metaLocators[k], oFullResponse);
                }
            } else {
                metaNode = metaNode ? oFullResponse.getElementsByTagName(metaNode)[0] : oFullResponse;
                if (metaNode) {
                    for (k in metaLocators) {
                        if (lang.hasOwnProperty(metaLocators, k)) {
                            loc = metaLocators[k];
                            v = metaNode.getElementsByTagName(loc)[0];
                            if (v) {
                                v = v.firstChild.nodeValue;
                            } else {
                                v = metaNode.attributes.getNamedItem(loc);
                                if (v) {
                                    v = v.value;
                                }
                            }
                            if (lang.isValue(v)) {
                                oParsedResponse.meta[k] = v;
                            }
                        }
                    }
                }
            }
            xmlList = (schema.resultNode) ? oFullResponse.getElementsByTagName(schema.resultNode) : null;
        } catch (e) {
        }
        if (!xmlList || !lang.isArray(schema.fields)) {
            bError = true;
        } else {
            oParsedResponse.results = [];
            for (i = xmlList.length - 1; i >= 0; --i) {
                var oResult = this.parseXMLResult(xmlList.item(i));
                oParsedResponse.results[i] = oResult;
            }
        }
        if (bError) {
            oParsedResponse.error = true;
        } else {
        }
        return oParsedResponse;
    }, parseJSONData:function (oRequest, oFullResponse) {
        var oParsedResponse = {results:[], meta:{}};
        if (lang.isObject(oFullResponse) && this.responseSchema.resultsList) {
            var schema = this.responseSchema, fields = schema.fields, resultsList = oFullResponse, results = [], metaFields = schema.metaFields || {}, fieldParsers = [], fieldPaths = [], simpleFields = [], bError = false, i, len, j, v, key, parser, path;
            var buildPath = function (needle) {
                var path = null, keys = [], i = 0;
                if (needle) {
                    needle = needle.replace(/\[(['"])(.*?)\1\]/g,
                        function (x, $1, $2) {
                            keys[i] = $2;
                            return".@" + (i++);
                        }).replace(/\[(\d+)\]/g,
                        function (x, $1) {
                            keys[i] = parseInt($1, 10) | 0;
                            return".@" + (i++);
                        }).replace(/^\./, "");
                    if (!/[^\w\.\$@]/.test(needle)) {
                        path = needle.split(".");
                        for (i = path.length - 1; i >= 0; --i) {
                            if (path[i].charAt(0) === "@") {
                                path[i] = keys[parseInt(path[i].substr(1), 10)];
                            }
                        }
                    } else {
                    }
                }
                return path;
            };
            var walkPath = function (path, origin) {
                var v = origin, i = 0, len = path.length;
                for (; i < len && v; ++i) {
                    v = v[path[i]];
                }
                return v;
            };
            path = buildPath(schema.resultsList);
            if (path) {
                resultsList = walkPath(path, oFullResponse);
                if (resultsList === undefined) {
                    bError = true;
                }
            } else {
                bError = true;
            }
            if (!resultsList) {
                resultsList = [];
            }
            if (!lang.isArray(resultsList)) {
                resultsList = [resultsList];
            }
            if (!bError) {
                if (schema.fields) {
                    var field;
                    for (i = 0, len = fields.length; i < len; i++) {
                        field = fields[i];
                        key = field.key || field;
                        parser = ((typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""]) || field.converter;
                        path = buildPath(key);
                        if (parser) {
                            fieldParsers[fieldParsers.length] = {key:key, parser:parser};
                        }
                        if (path) {
                            if (path.length > 1) {
                                fieldPaths[fieldPaths.length] = {key:key, path:path};
                            } else {
                                simpleFields[simpleFields.length] = {key:key, path:path[0]};
                            }
                        } else {
                        }
                    }
                    for (i = resultsList.length - 1; i >= 0; --i) {
                        var r = resultsList[i], rec = {};
                        if (r) {
                            for (j = simpleFields.length - 1; j >= 0; --j) {
                                rec[simpleFields[j].key] = (r[simpleFields[j].path] !== undefined) ? r[simpleFields[j].path] : r[j];
                            }
                            for (j = fieldPaths.length - 1; j >= 0; --j) {
                                rec[fieldPaths[j].key] = walkPath(fieldPaths[j].path, r);
                            }
                            for (j = fieldParsers.length - 1; j >= 0; --j) {
                                var p = fieldParsers[j].key;
                                rec[p] = fieldParsers[j].parser.call(this, rec[p]);
                                if (rec[p] === undefined) {
                                    rec[p] = null;
                                }
                            }
                        }
                        results[i] = rec;
                    }
                } else {
                    results = resultsList;
                }
                for (key in metaFields) {
                    if (lang.hasOwnProperty(metaFields, key)) {
                        path = buildPath(metaFields[key]);
                        if (path) {
                            v = walkPath(path, oFullResponse);
                            oParsedResponse.meta[key] = v;
                        }
                    }
                }
            } else {
                oParsedResponse.error = true;
            }
            oParsedResponse.results = results;
        } else {
            oParsedResponse.error = true;
        }
        return oParsedResponse;
    }, parseHTMLTableData:function (oRequest, oFullResponse) {
        var bError = false;
        var elTable = oFullResponse;
        var fields = this.responseSchema.fields;
        var oParsedResponse = {results:[]};
        if (lang.isArray(fields)) {
            for (var i = 0; i < elTable.tBodies.length; i++) {
                var elTbody = elTable.tBodies[i];
                for (var j = elTbody.rows.length - 1; j > -1; j--) {
                    var elRow = elTbody.rows[j];
                    var oResult = {};
                    for (var k = fields.length - 1; k > -1; k--) {
                        var field = fields[k];
                        var key = (lang.isValue(field.key)) ? field.key : field;
                        var data = elRow.cells[k].innerHTML;
                        if (!field.parser && field.converter) {
                            field.parser = field.converter;
                        }
                        var parser = (typeof field.parser === "function") ? field.parser : DS.Parser[field.parser + ""];
                        if (parser) {
                            data = parser.call(this, data);
                        }
                        if (data === undefined) {
                            data = null;
                        }
                        oResult[key] = data;
                    }
                    oParsedResponse.results[j] = oResult;
                }
            }
        } else {
            bError = true;
        }
        if (bError) {
            oParsedResponse.error = true;
        } else {
        }
        return oParsedResponse;
    }};
    lang.augmentProto(DS, util.EventProvider);
    util.LocalDataSource = function (oLiveData, oConfigs) {
        this.dataType = DS.TYPE_LOCAL;
        if (oLiveData) {
            if (YAHOO.lang.isArray(oLiveData)) {
                this.responseType = DS.TYPE_JSARRAY;
            } else {
                if (oLiveData.nodeType && oLiveData.nodeType == 9) {
                    this.responseType = DS.TYPE_XML;
                } else {
                    if (oLiveData.nodeName && (oLiveData.nodeName.toLowerCase() == "table")) {
                        this.responseType = DS.TYPE_HTMLTABLE;
                        oLiveData = oLiveData.cloneNode(true);
                    } else {
                        if (YAHOO.lang.isString(oLiveData)) {
                            this.responseType = DS.TYPE_TEXT;
                        } else {
                            if (YAHOO.lang.isObject(oLiveData)) {
                                this.responseType = DS.TYPE_JSON;
                            }
                        }
                    }
                }
            }
        } else {
            oLiveData = [];
            this.responseType = DS.TYPE_JSARRAY;
        }
        util.LocalDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.LocalDataSource, DS);
    lang.augmentObject(util.LocalDataSource, DS);
    util.FunctionDataSource = function (oLiveData, oConfigs) {
        this.dataType = DS.TYPE_JSFUNCTION;
        oLiveData = oLiveData || function () {
        };
        util.FunctionDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.FunctionDataSource, DS, {scope:null, makeConnection:function (oRequest, oCallback, oCaller) {
        var tId = DS._nTransactionId++;
        this.fireEvent("requestEvent", {tId:tId, request:oRequest, callback:oCallback, caller:oCaller});
        var oRawResponse = (this.scope) ? this.liveData.call(this.scope, oRequest, this, oCallback) : this.liveData(oRequest, oCallback);
        if (this.responseType === DS.TYPE_UNKNOWN) {
            if (YAHOO.lang.isArray(oRawResponse)) {
                this.responseType = DS.TYPE_JSARRAY;
            } else {
                if (oRawResponse && oRawResponse.nodeType && oRawResponse.nodeType == 9) {
                    this.responseType = DS.TYPE_XML;
                } else {
                    if (oRawResponse && oRawResponse.nodeName && (oRawResponse.nodeName.toLowerCase() == "table")) {
                        this.responseType = DS.TYPE_HTMLTABLE;
                    } else {
                        if (YAHOO.lang.isObject(oRawResponse)) {
                            this.responseType = DS.TYPE_JSON;
                        } else {
                            if (YAHOO.lang.isString(oRawResponse)) {
                                this.responseType = DS.TYPE_TEXT;
                            }
                        }
                    }
                }
            }
        }
        this.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
        return tId;
    }});
    lang.augmentObject(util.FunctionDataSource, DS);
    util.ScriptNodeDataSource = function (oLiveData, oConfigs) {
        this.dataType = DS.TYPE_SCRIPTNODE;
        oLiveData = oLiveData || "";
        util.ScriptNodeDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.ScriptNodeDataSource, DS, {getUtility:util.Get, asyncMode:"allowAll", scriptCallbackParam:"callback", generateRequestCallback:function (id) {
        return"&" + this.scriptCallbackParam + "=YAHOO.util.ScriptNodeDataSource.callbacks[" + id + "]";
    }, doBeforeGetScriptNode:function (sUri) {
        return sUri;
    }, makeConnection:function (oRequest, oCallback, oCaller) {
        var tId = DS._nTransactionId++;
        this.fireEvent("requestEvent", {tId:tId, request:oRequest, callback:oCallback, caller:oCaller});
        if (util.ScriptNodeDataSource._nPending === 0) {
            util.ScriptNodeDataSource.callbacks = [];
            util.ScriptNodeDataSource._nId = 0;
        }
        var id = util.ScriptNodeDataSource._nId;
        util.ScriptNodeDataSource._nId++;
        var oSelf = this;
        util.ScriptNodeDataSource.callbacks[id] = function (oRawResponse) {
            if ((oSelf.asyncMode !== "ignoreStaleResponses") || (id === util.ScriptNodeDataSource.callbacks.length - 1)) {
                if (oSelf.responseType === DS.TYPE_UNKNOWN) {
                    if (YAHOO.lang.isArray(oRawResponse)) {
                        oSelf.responseType = DS.TYPE_JSARRAY;
                    } else {
                        if (oRawResponse.nodeType && oRawResponse.nodeType == 9) {
                            oSelf.responseType = DS.TYPE_XML;
                        } else {
                            if (oRawResponse.nodeName && (oRawResponse.nodeName.toLowerCase() == "table")) {
                                oSelf.responseType = DS.TYPE_HTMLTABLE;
                            } else {
                                if (YAHOO.lang.isObject(oRawResponse)) {
                                    oSelf.responseType = DS.TYPE_JSON;
                                } else {
                                    if (YAHOO.lang.isString(oRawResponse)) {
                                        oSelf.responseType = DS.TYPE_TEXT;
                                    }
                                }
                            }
                        }
                    }
                }
                oSelf.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
            } else {
            }
            delete util.ScriptNodeDataSource.callbacks[id];
        };
        util.ScriptNodeDataSource._nPending++;
        var sUri = this.liveData + oRequest + this.generateRequestCallback(id);
        sUri = this.doBeforeGetScriptNode(sUri);
        this.getUtility.script(sUri, {autopurge:true, onsuccess:util.ScriptNodeDataSource._bumpPendingDown, onfail:util.ScriptNodeDataSource._bumpPendingDown});
        return tId;
    }});
    lang.augmentObject(util.ScriptNodeDataSource, DS);
    lang.augmentObject(util.ScriptNodeDataSource, {_nId:0, _nPending:0, callbacks:[]});
    util.XHRDataSource = function (oLiveData, oConfigs) {
        this.dataType = DS.TYPE_XHR;
        this.connMgr = this.connMgr || util.Connect;
        oLiveData = oLiveData || "";
        util.XHRDataSource.superclass.constructor.call(this, oLiveData, oConfigs);
    };
    lang.extend(util.XHRDataSource, DS, {connMgr:null, connXhrMode:"allowAll", connMethodPost:false, connTimeout:0, makeConnection:function (oRequest, oCallback, oCaller) {
        var oRawResponse = null;
        var tId = DS._nTransactionId++;
        this.fireEvent("requestEvent", {tId:tId, request:oRequest, callback:oCallback, caller:oCaller});
        var oSelf = this;
        var oConnMgr = this.connMgr;
        var oQueue = this._oQueue;
        var _xhrSuccess = function (oResponse) {
            if (oResponse && (this.connXhrMode == "ignoreStaleResponses") && (oResponse.tId != oQueue.conn.tId)) {
                return null;
            } else {
                if (!oResponse) {
                    this.fireEvent("dataErrorEvent", {request:oRequest, response:null, callback:oCallback, caller:oCaller, message:DS.ERROR_DATANULL});
                    DS.issueCallback(oCallback, [oRequest, {error:true}], true, oCaller);
                    return null;
                } else {
                    if (this.responseType === DS.TYPE_UNKNOWN) {
                        var ctype = (oResponse.getResponseHeader) ? oResponse.getResponseHeader["Content-Type"] : null;
                        if (ctype) {
                            if (ctype.indexOf("text/xml") > -1) {
                                this.responseType = DS.TYPE_XML;
                            } else {
                                if (ctype.indexOf("application/json") > -1) {
                                    this.responseType = DS.TYPE_JSON;
                                } else {
                                    if (ctype.indexOf("text/plain") > -1) {
                                        this.responseType = DS.TYPE_TEXT;
                                    }
                                }
                            }
                        }
                    }
                    this.handleResponse(oRequest, oResponse, oCallback, oCaller, tId);
                }
            }
        };
        var _xhrFailure = function (oResponse) {
            this.fireEvent("dataErrorEvent", {request:oRequest, response:oResponse, callback:oCallback, caller:oCaller, message:DS.ERROR_DATAINVALID});
            if (lang.isString(this.liveData) && lang.isString(oRequest) && (this.liveData.lastIndexOf("?") !== this.liveData.length - 1) && (oRequest.indexOf("?") !== 0)) {
            }
            oResponse = oResponse || {};
            oResponse.error = true;
            DS.issueCallback(oCallback, [oRequest, oResponse], true, oCaller);
            return null;
        };
        var _xhrCallback = {success:_xhrSuccess, failure:_xhrFailure, scope:this};
        if (lang.isNumber(this.connTimeout)) {
            _xhrCallback.timeout = this.connTimeout;
        }
        if (this.connXhrMode == "cancelStaleRequests") {
            if (oQueue.conn) {
                if (oConnMgr.abort) {
                    oConnMgr.abort(oQueue.conn);
                    oQueue.conn = null;
                } else {
                }
            }
        }
        if (oConnMgr && oConnMgr.asyncRequest) {
            var sLiveData = this.liveData;
            var isPost = this.connMethodPost;
            var sMethod = (isPost) ? "POST" : "GET";
            var sUri = (isPost || !lang.isValue(oRequest)) ? sLiveData : sLiveData + oRequest;
            var sRequest = (isPost) ? oRequest : null;
            if (this.connXhrMode != "queueRequests") {
                oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, _xhrCallback, sRequest);
            } else {
                if (oQueue.conn) {
                    var allRequests = oQueue.requests;
                    allRequests.push({request:oRequest, callback:_xhrCallback});
                    if (!oQueue.interval) {
                        oQueue.interval = setInterval(function () {
                            if (oConnMgr.isCallInProgress(oQueue.conn)) {
                                return;
                            } else {
                                if (allRequests.length > 0) {
                                    sUri = (isPost || !lang.isValue(allRequests[0].request)) ? sLiveData : sLiveData + allRequests[0].request;
                                    sRequest = (isPost) ? allRequests[0].request : null;
                                    oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, allRequests[0].callback, sRequest);
                                    allRequests.shift();
                                } else {
                                    clearInterval(oQueue.interval);
                                    oQueue.interval = null;
                                }
                            }
                        }, 50);
                    }
                } else {
                    oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, _xhrCallback, sRequest);
                }
            }
        } else {
            DS.issueCallback(oCallback, [oRequest, {error:true}], true, oCaller);
        }
        return tId;
    }});
    lang.augmentObject(util.XHRDataSource, DS);
    util.DataSource = function (oLiveData, oConfigs) {
        oConfigs = oConfigs || {};
        var dataType = oConfigs.dataType;
        if (dataType) {
            if (dataType == DS.TYPE_LOCAL) {
                return new util.LocalDataSource(oLiveData, oConfigs);
            } else {
                if (dataType == DS.TYPE_XHR) {
                    return new util.XHRDataSource(oLiveData, oConfigs);
                } else {
                    if (dataType == DS.TYPE_SCRIPTNODE) {
                        return new util.ScriptNodeDataSource(oLiveData, oConfigs);
                    } else {
                        if (dataType == DS.TYPE_JSFUNCTION) {
                            return new util.FunctionDataSource(oLiveData, oConfigs);
                        }
                    }
                }
            }
        }
        if (YAHOO.lang.isString(oLiveData)) {
            return new util.XHRDataSource(oLiveData, oConfigs);
        } else {
            if (YAHOO.lang.isFunction(oLiveData)) {
                return new util.FunctionDataSource(oLiveData, oConfigs);
            } else {
                return new util.LocalDataSource(oLiveData, oConfigs);
            }
        }
    };
    lang.augmentObject(util.DataSource, DS);
})();
YAHOO.util.Number = {format:function (e, k) {
    if (e === "" || e === null || !isFinite(e)) {
        return"";
    }
    e = +e;
    k = YAHOO.lang.merge(YAHOO.util.Number.format.defaults, (k || {}));
    var j = e + "", l = Math.abs(e), b = k.decimalPlaces || 0, r = k.thousandsSeparator, f = k.negativeFormat || ("-" + k.format), q, p, g, h;
    if (f.indexOf("#") > -1) {
        f = f.replace(/#/, k.format);
    }
    if (b < 0) {
        q = l - (l % 1) + "";
        g = q.length + b;
        if (g > 0) {
            q = Number("." + q).toFixed(g).slice(2) + new Array(q.length - g + 1).join("0");
        } else {
            q = "0";
        }
    } else {
        var a = l + "";
        if (b > 0 || a.indexOf(".") > 0) {
            var d = Math.pow(10, b);
            q = Math.round(l * d) / d + "";
            var c = q.indexOf("."), m, o;
            if (c < 0) {
                m = b;
                o = (Math.pow(10, m) + "").substring(1);
                if (b > 0) {
                    q = q + "." + o;
                }
            } else {
                m = b - (q.length - c - 1);
                o = (Math.pow(10, m) + "").substring(1);
                q = q + o;
            }
        } else {
            q = l.toFixed(b) + "";
        }
    }
    p = q.split(/\D/);
    if (l >= 1000) {
        g = p[0].length % 3 || 3;
        p[0] = p[0].slice(0, g) + p[0].slice(g).replace(/(\d{3})/g, r + "$1");
    }
    return YAHOO.util.Number.format._applyFormat((e < 0 ? f : k.format), p.join(k.decimalSeparator), k);
}};
YAHOO.util.Number.format.defaults = {format:"{prefix}{number}{suffix}", negativeFormat:null, decimalSeparator:".", decimalPlaces:null, thousandsSeparator:""};
YAHOO.util.Number.format._applyFormat = function (a, b, c) {
    return a.replace(/\{(\w+)\}/g, function (d, e) {
        return e === "number" ? b : e in c ? c[e] : "";
    });
};
(function () {
    var a = function (c, e, d) {
        if (typeof d === "undefined") {
            d = 10;
        }
        for (; parseInt(c, 10) < d && d > 1; d /= 10) {
            c = e.toString() + c;
        }
        return c.toString();
    };
    var b = {formats:{a:function (e, c) {
        return c.a[e.getDay()];
    }, A:function (e, c) {
        return c.A[e.getDay()];
    }, b:function (e, c) {
        return c.b[e.getMonth()];
    }, B:function (e, c) {
        return c.B[e.getMonth()];
    }, C:function (c) {
        return a(parseInt(c.getFullYear() / 100, 10), 0);
    }, d:["getDate", "0"], e:["getDate", " "], g:function (c) {
        return a(parseInt(b.formats.G(c) % 100, 10), 0);
    }, G:function (f) {
        var g = f.getFullYear();
        var e = parseInt(b.formats.V(f), 10);
        var c = parseInt(b.formats.W(f), 10);
        if (c > e) {
            g++;
        } else {
            if (c === 0 && e >= 52) {
                g--;
            }
        }
        return g;
    }, H:["getHours", "0"], I:function (e) {
        var c = e.getHours() % 12;
        return a(c === 0 ? 12 : c, 0);
    }, j:function (h) {
        var g = new Date("" + h.getFullYear() + "/1/1 GMT");
        var e = new Date("" + h.getFullYear() + "/" + (h.getMonth() + 1) + "/" + h.getDate() + " GMT");
        var c = e - g;
        var f = parseInt(c / 60000 / 60 / 24, 10) + 1;
        return a(f, 0, 100);
    }, k:["getHours", " "], l:function (e) {
        var c = e.getHours() % 12;
        return a(c === 0 ? 12 : c, " ");
    }, m:function (c) {
        return a(c.getMonth() + 1, 0);
    }, M:["getMinutes", "0"], p:function (e, c) {
        return c.p[e.getHours() >= 12 ? 1 : 0];
    }, P:function (e, c) {
        return c.P[e.getHours() >= 12 ? 1 : 0];
    }, s:function (e, c) {
        return parseInt(e.getTime() / 1000, 10);
    }, S:["getSeconds", "0"], u:function (c) {
        var e = c.getDay();
        return e === 0 ? 7 : e;
    }, U:function (g) {
        var c = parseInt(b.formats.j(g), 10);
        var f = 6 - g.getDay();
        var e = parseInt((c + f) / 7, 10);
        return a(e, 0);
    }, V:function (g) {
        var f = parseInt(b.formats.W(g), 10);
        var c = (new Date("" + g.getFullYear() + "/1/1")).getDay();
        var e = f + (c > 4 || c <= 1 ? 0 : 1);
        if (e === 53 && (new Date("" + g.getFullYear() + "/12/31")).getDay() < 4) {
            e = 1;
        } else {
            if (e === 0) {
                e = b.formats.V(new Date("" + (g.getFullYear() - 1) + "/12/31"));
            }
        }
        return a(e, 0);
    }, w:"getDay", W:function (g) {
        var c = parseInt(b.formats.j(g), 10);
        var f = 7 - b.formats.u(g);
        var e = parseInt((c + f) / 7, 10);
        return a(e, 0, 10);
    }, y:function (c) {
        return a(c.getFullYear() % 100, 0);
    }, Y:"getFullYear", z:function (f) {
        var e = f.getTimezoneOffset();
        var c = a(parseInt(Math.abs(e / 60), 10), 0);
        var g = a(Math.abs(e % 60), 0);
        return(e > 0 ? "-" : "+") + c + g;
    }, Z:function (c) {
        var e = c.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, "$2").replace(/[a-z ]/g, "");
        if (e.length > 4) {
            e = b.formats.z(c);
        }
        return e;
    }, "%":function (c) {
        return"%";
    }}, aggregates:{c:"locale", D:"%m/%d/%y", F:"%Y-%m-%d", h:"%b", n:"\n", r:"locale", R:"%H:%M", t:"\t", T:"%H:%M:%S", x:"locale", X:"locale"}, format:function (g, f, d) {
        f = f || {};
        if (!(g instanceof Date)) {
            return YAHOO.lang.isValue(g) ? g : "";
        }
        var h = f.format || "%m/%d/%Y";
        if (h === "YYYY/MM/DD") {
            h = "%Y/%m/%d";
        } else {
            if (h === "DD/MM/YYYY") {
                h = "%d/%m/%Y";
            } else {
                if (h === "MM/DD/YYYY") {
                    h = "%m/%d/%Y";
                }
            }
        }
        d = d || "en";
        if (!(d in YAHOO.util.DateLocale)) {
            if (d.replace(/-[a-zA-Z]+$/, "") in YAHOO.util.DateLocale) {
                d = d.replace(/-[a-zA-Z]+$/, "");
            } else {
                d = "en";
            }
        }
        var j = YAHOO.util.DateLocale[d];
        var c = function (l, k) {
            var m = b.aggregates[k];
            return(m === "locale" ? j[k] : m);
        };
        var e = function (l, k) {
            var m = b.formats[k];
            if (typeof m === "string") {
                return g[m]();
            } else {
                if (typeof m === "function") {
                    return m.call(g, g, j);
                } else {
                    if (typeof m === "object" && typeof m[0] === "string") {
                        return a(g[m[0]](), m[1]);
                    } else {
                        return k;
                    }
                }
            }
        };
        while (h.match(/%[cDFhnrRtTxX]/)) {
            h = h.replace(/%([cDFhnrRtTxX])/g, c);
        }
        var i = h.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, e);
        c = e = undefined;
        return i;
    }};
    YAHOO.namespace("YAHOO.util");
    YAHOO.util.Date = b;
    YAHOO.util.DateLocale = {a:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], A:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], b:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], B:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], c:"%a %d %b %Y %T %Z", p:["AM", "PM"], P:["am", "pm"], r:"%I:%M:%S %p", x:"%d/%m/%y", X:"%T"};
    YAHOO.util.DateLocale["en"] = YAHOO.lang.merge(YAHOO.util.DateLocale, {});
    YAHOO.util.DateLocale["en-US"] = YAHOO.lang.merge(YAHOO.util.DateLocale["en"], {c:"%a %d %b %Y %I:%M:%S %p %Z", x:"%m/%d/%Y", X:"%I:%M:%S %p"});
    YAHOO.util.DateLocale["en-GB"] = YAHOO.lang.merge(YAHOO.util.DateLocale["en"], {r:"%l:%M:%S %P %Z"});
    YAHOO.util.DateLocale["en-AU"] = YAHOO.lang.merge(YAHOO.util.DateLocale["en"]);
})();
YAHOO.register("datasource", YAHOO.util.DataSource, {version:"2.9.0", build:"2800"});