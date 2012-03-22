/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
YAHOO.util.Connect = {_msxml_progid:["Microsoft.XMLHTTP", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP"], _http_headers:{}, _has_http_headers:false, _use_default_post_header:true, _default_post_header:"application/x-www-form-urlencoded; charset=UTF-8", _default_form_header:"application/x-www-form-urlencoded", _use_default_xhr_header:true, _default_xhr_header:"XMLHttpRequest", _has_default_headers:true, _isFormSubmit:false, _default_headers:{}, _poll:{}, _timeOut:{}, _polling_interval:50, _transaction_id:0, startEvent:new YAHOO.util.CustomEvent("start"), completeEvent:new YAHOO.util.CustomEvent("complete"), successEvent:new YAHOO.util.CustomEvent("success"), failureEvent:new YAHOO.util.CustomEvent("failure"), abortEvent:new YAHOO.util.CustomEvent("abort"), _customEvents:{onStart:["startEvent", "start"], onComplete:["completeEvent", "complete"], onSuccess:["successEvent", "success"], onFailure:["failureEvent", "failure"], onUpload:["uploadEvent", "upload"], onAbort:["abortEvent", "abort"]}, setProgId:function (A) {
    this._msxml_progid.unshift(A);
}, setDefaultPostHeader:function (A) {
    if (typeof A == "string") {
        this._default_post_header = A;
        this._use_default_post_header = true;
    } else {
        if (typeof A == "boolean") {
            this._use_default_post_header = A;
        }
    }
}, setDefaultXhrHeader:function (A) {
    if (typeof A == "string") {
        this._default_xhr_header = A;
    } else {
        this._use_default_xhr_header = A;
    }
}, setPollingInterval:function (A) {
    if (typeof A == "number" && isFinite(A)) {
        this._polling_interval = A;
    }
}, createXhrObject:function (F) {
    var D, A, B;
    try {
        A = new XMLHttpRequest();
        D = {conn:A, tId:F, xhr:true};
    } catch (C) {
        for (B = 0; B < this._msxml_progid.length; ++B) {
            try {
                A = new ActiveXObject(this._msxml_progid[B]);
                D = {conn:A, tId:F, xhr:true};
                break;
            } catch (E) {
            }
        }
    } finally {
        return D;
    }
}, getConnectionObject:function (A) {
    var C, D = this._transaction_id;
    try {
        if (!A) {
            C = this.createXhrObject(D);
        } else {
            C = {tId:D};
            if (A === "xdr") {
                C.conn = this._transport;
                C.xdr = true;
            } else {
                if (A === "upload") {
                    C.upload = true;
                }
            }
        }
        if (C) {
            this._transaction_id++;
        }
    } catch (B) {
    }
    return C;
}, asyncRequest:function (H, D, G, A) {
    var B = G && G.argument ? G.argument : null, E = this, F, C;
    if (this._isFileUpload) {
        C = "upload";
    } else {
        if (G && G.xdr) {
            C = "xdr";
        }
    }
    F = this.getConnectionObject(C);
    if (!F) {
        return null;
    } else {
        if (G && G.customevents) {
            this.initCustomEvents(F, G);
        }
        if (this._isFormSubmit) {
            if (this._isFileUpload) {
                window.setTimeout(function () {
                    E.uploadFile(F, G, D, A);
                }, 10);
                return F;
            }
            if (H.toUpperCase() == "GET") {
                if (this._sFormData.length !== 0) {
                    D += ((D.indexOf("?") == -1) ? "?" : "&") + this._sFormData;
                }
            } else {
                if (H.toUpperCase() == "POST") {
                    A = A ? this._sFormData + "&" + A : this._sFormData;
                }
            }
        }
        if (H.toUpperCase() == "GET" && (G && G.cache === false)) {
            D += ((D.indexOf("?") == -1) ? "?" : "&") + "rnd=" + new Date().valueOf().toString();
        }
        if (this._use_default_xhr_header) {
            if (!this._default_headers["X-Requested-With"]) {
                this.initHeader("X-Requested-With", this._default_xhr_header, true);
            }
        }
        if ((H.toUpperCase() === "POST" && this._use_default_post_header) && this._isFormSubmit === false) {
            this.initHeader("Content-Type", this._default_post_header);
        }
        if (F.xdr) {
            this.xdr(F, H, D, G, A);
            return F;
        }
        F.conn.open(H, D, true);
        if (this._has_default_headers || this._has_http_headers) {
            this.setHeader(F);
        }
        this.handleReadyState(F, G);
        F.conn.send(A || "");
        if (this._isFormSubmit === true) {
            this.resetFormState();
        }
        this.startEvent.fire(F, B);
        if (F.startEvent) {
            F.startEvent.fire(F, B);
        }
        return F;
    }
}, initCustomEvents:function (A, C) {
    var B;
    for (B in C.customevents) {
        if (this._customEvents[B][0]) {
            A[this._customEvents[B][0]] = new YAHOO.util.CustomEvent(this._customEvents[B][1], (C.scope) ? C.scope : null);
            A[this._customEvents[B][0]].subscribe(C.customevents[B]);
        }
    }
}, handleReadyState:function (C, D) {
    var B = this, A = (D && D.argument) ? D.argument : null;
    if (D && D.timeout) {
        this._timeOut[C.tId] = window.setTimeout(function () {
            B.abort(C, D, true);
        }, D.timeout);
    }
    this._poll[C.tId] = window.setInterval(function () {
        if (C.conn && C.conn.readyState === 4) {
            window.clearInterval(B._poll[C.tId]);
            delete B._poll[C.tId];
            if (D && D.timeout) {
                window.clearTimeout(B._timeOut[C.tId]);
                delete B._timeOut[C.tId];
            }
            B.completeEvent.fire(C, A);
            if (C.completeEvent) {
                C.completeEvent.fire(C, A);
            }
            B.handleTransactionResponse(C, D);
        }
    }, this._polling_interval);
}, handleTransactionResponse:function (B, I, D) {
    var E, A, G = (I && I.argument) ? I.argument : null, C = (B.r && B.r.statusText === "xdr:success") ? true : false, H = (B.r && B.r.statusText === "xdr:failure") ? true : false, J = D;
    try {
        if ((B.conn.status !== undefined && B.conn.status !== 0) || C) {
            E = B.conn.status;
        } else {
            if (H && !J) {
                E = 0;
            } else {
                E = 13030;
            }
        }
    } catch (F) {
        E = 13030;
    }
    if ((E >= 200 && E < 300) || E === 1223 || C) {
        A = B.xdr ? B.r : this.createResponseObject(B, G);
        if (I && I.success) {
            if (!I.scope) {
                I.success(A);
            } else {
                I.success.apply(I.scope, [A]);
            }
        }
        this.successEvent.fire(A);
        if (B.successEvent) {
            B.successEvent.fire(A);
        }
    } else {
        switch (E) {
            case 12002:
            case 12029:
            case 12030:
            case 12031:
            case 12152:
            case 13030:
                A = this.createExceptionObject(B.tId, G, (D ? D : false));
                if (I && I.failure) {
                    if (!I.scope) {
                        I.failure(A);
                    } else {
                        I.failure.apply(I.scope, [A]);
                    }
                }
                break;
            default:
                A = (B.xdr) ? B.response : this.createResponseObject(B, G);
                if (I && I.failure) {
                    if (!I.scope) {
                        I.failure(A);
                    } else {
                        I.failure.apply(I.scope, [A]);
                    }
                }
        }
        this.failureEvent.fire(A);
        if (B.failureEvent) {
            B.failureEvent.fire(A);
        }
    }
    this.releaseObject(B);
    A = null;
}, createResponseObject:function (A, G) {
    var D = {}, I = {}, E, C, F, B;
    try {
        C = A.conn.getAllResponseHeaders();
        F = C.split("\n");
        for (E = 0; E < F.length; E++) {
            B = F[E].indexOf(":");
            if (B != -1) {
                I[F[E].substring(0, B)] = YAHOO.lang.trim(F[E].substring(B + 2));
            }
        }
    } catch (H) {
    }
    D.tId = A.tId;
    D.status = (A.conn.status == 1223) ? 204 : A.conn.status;
    D.statusText = (A.conn.status == 1223) ? "No Content" : A.conn.statusText;
    D.getResponseHeader = I;
    D.getAllResponseHeaders = C;
    D.responseText = A.conn.responseText;
    D.responseXML = A.conn.responseXML;
    if (G) {
        D.argument = G;
    }
    return D;
}, createExceptionObject:function (H, D, A) {
    var F = 0, G = "communication failure", C = -1, B = "transaction aborted", E = {};
    E.tId = H;
    if (A) {
        E.status = C;
        E.statusText = B;
    } else {
        E.status = F;
        E.statusText = G;
    }
    if (D) {
        E.argument = D;
    }
    return E;
}, initHeader:function (A, D, C) {
    var B = (C) ? this._default_headers : this._http_headers;
    B[A] = D;
    if (C) {
        this._has_default_headers = true;
    } else {
        this._has_http_headers = true;
    }
}, setHeader:function (A) {
    var B;
    if (this._has_default_headers) {
        for (B in this._default_headers) {
            if (YAHOO.lang.hasOwnProperty(this._default_headers, B)) {
                A.conn.setRequestHeader(B, this._default_headers[B]);
            }
        }
    }
    if (this._has_http_headers) {
        for (B in this._http_headers) {
            if (YAHOO.lang.hasOwnProperty(this._http_headers, B)) {
                A.conn.setRequestHeader(B, this._http_headers[B]);
            }
        }
        this._http_headers = {};
        this._has_http_headers = false;
    }
}, resetDefaultHeaders:function () {
    this._default_headers = {};
    this._has_default_headers = false;
}, abort:function (E, G, A) {
    var D, B = (G && G.argument) ? G.argument : null;
    E = E || {};
    if (E.conn) {
        if (E.xhr) {
            if (this.isCallInProgress(E)) {
                E.conn.abort();
                window.clearInterval(this._poll[E.tId]);
                delete this._poll[E.tId];
                if (A) {
                    window.clearTimeout(this._timeOut[E.tId]);
                    delete this._timeOut[E.tId];
                }
                D = true;
            }
        } else {
            if (E.xdr) {
                E.conn.abort(E.tId);
                D = true;
            }
        }
    } else {
        if (E.upload) {
            var C = "yuiIO" + E.tId;
            var F = document.getElementById(C);
            if (F) {
                YAHOO.util.Event.removeListener(F, "load");
                document.body.removeChild(F);
                if (A) {
                    window.clearTimeout(this._timeOut[E.tId]);
                    delete this._timeOut[E.tId];
                }
                D = true;
            }
        } else {
            D = false;
        }
    }
    if (D === true) {
        this.abortEvent.fire(E, B);
        if (E.abortEvent) {
            E.abortEvent.fire(E, B);
        }
        this.handleTransactionResponse(E, G, true);
    }
    return D;
}, isCallInProgress:function (A) {
    A = A || {};
    if (A.xhr && A.conn) {
        return A.conn.readyState !== 4 && A.conn.readyState !== 0;
    } else {
        if (A.xdr && A.conn) {
            return A.conn.isCallInProgress(A.tId);
        } else {
            if (A.upload === true) {
                return document.getElementById("yuiIO" + A.tId) ? true : false;
            } else {
                return false;
            }
        }
    }
}, releaseObject:function (A) {
    if (A && A.conn) {
        A.conn = null;
        A = null;
    }
}};
YAHOO.register("connection_core", YAHOO.util.Connect, {version:"2.9.0", build:"2800"});