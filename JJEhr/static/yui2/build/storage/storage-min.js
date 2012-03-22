/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var g = YAHOO, f = g.util, e = g.lang, c, d, b = /^type=(\w+)/i, a = /&value=(.*)/i;
    if (!f.Storage) {
        c = function (h) {
            g.log("Exception in YAHOO.util.Storage.?? - must be extended by a storage engine".replace("??", h).replace("??", this.getName ? this.getName() : "Unknown"), "error");
        };
        d = function (h, k, j) {
            var i = this;
            g.env._id_counter += 1;
            i._cfg = e.isObject(j) ? j : {};
            i._location = h;
            i._name = k;
            i.isReady = false;
            i.createEvent(d.CE_READY, {scope:i, fireOnce:true});
            i.createEvent(d.CE_CHANGE, {scope:i});
            i.subscribe(d.CE_READY, function () {
                i.isReady = true;
            });
        };
        d.CE_READY = "YUIStorageReady";
        d.CE_CHANGE = "YUIStorageChange";
        d.prototype = {CE_READY:d.CE_READY, CE_CHANGE:d.CE_CHANGE, _cfg:"", _name:"", _location:"", length:0, isReady:false, clear:function () {
            this._clear();
            this.length = 0;
        }, getItem:function (h) {
            g.log("Fetching item at  " + h);
            var i = this._getItem(h);
            return e.isValue(i) ? this._getValue(i) : null;
        }, getName:function () {
            return this._name;
        }, hasKey:function (h) {
            return e.isString(h) && this._hasKey(h);
        }, key:function (h) {
            g.log("Fetching key at " + h);
            if (e.isNumber(h) && -1 < h && this.length > h) {
                var i = this._key(h);
                if (i) {
                    return i;
                }
            }
            throw ("INDEX_SIZE_ERR - Storage.setItem - The provided index (" + h + ") is not available");
        }, removeItem:function (j) {
            g.log("removing " + j);
            var i = this, h;
            if (i.hasKey(j)) {
                h = i._getItem(j);
                if (!h) {
                    h = null;
                }
                i._removeItem(j);
                i.fireEvent(d.CE_CHANGE, new f.StorageEvent(i, j, h, null, f.StorageEvent.TYPE_REMOVE_ITEM));
            } else {
            }
        }, setItem:function (j, k) {
            g.log("SETTING " + k + " to " + j);
            if (e.isString(j)) {
                var i = this, h = i._getItem(j);
                if (!h) {
                    h = null;
                }
                if (i._setItem(j, i._createValue(k))) {
                    i.fireEvent(d.CE_CHANGE, new f.StorageEvent(i, j, h, k, i.hasKey(j) ? f.StorageEvent.TYPE_UPDATE_ITEM : f.StorageEvent.TYPE_ADD_ITEM));
                } else {
                    throw ("QUOTA_EXCEEDED_ERROR - Storage.setItem - The choosen storage method (" + i.getName() + ") has exceeded capacity");
                }
            } else {
            }
        }, _clear:function () {
            c("_clear");
            return"";
        }, _createValue:function (h) {
            var i = (e.isNull(h) || e.isUndefined(h)) ? ("" + h) : typeof h;
            return"type=" + i + "&value=" + encodeURIComponent("" + h);
        }, _getItem:function (h) {
            c("_getItem");
            return"";
        }, _getValue:function (h) {
            var j = h.match(b)[1], i = h.match(a)[1];
            switch (j) {
                case"boolean":
                    return"true" == i;
                case"number":
                    return parseFloat(i);
                case"null":
                    return null;
                default:
                    return decodeURIComponent(i);
            }
        }, _key:function (h) {
            c("_key");
            return"";
        }, _hasKey:function (h) {
            return null !== this._getItem(h);
        }, _removeItem:function (h) {
            c("_removeItem");
            return"";
        }, _setItem:function (h, i) {
            c("_setItem");
            return"";
        }};
        e.augmentProto(d, f.EventProvider);
        f.Storage = d;
    }
}());
(function () {
    var h = YAHOO.util, e = YAHOO.lang, d = {}, g = [], f = {}, b = function (i) {
        return(i && i.isAvailable()) ? i : null;
    }, a = function (i, l, k) {
        var j = d[i + l.ENGINE_NAME];
        if (!j) {
            j = new l(i, k);
            d[i + l.ENGINE_NAME] = j;
        }
        return j;
    }, c = function (i) {
        switch (i) {
            case h.StorageManager.LOCATION_LOCAL:
            case h.StorageManager.LOCATION_SESSION:
                return i;
            default:
                return h.StorageManager.LOCATION_SESSION;
        }
    };
    h.StorageManager = {LOCATION_SESSION:"sessionStorage", LOCATION_LOCAL:"localStorage", get:function (q, k, p) {
        var n = e.isObject(p) ? p : {}, o = b(f[q]), m, l;
        if (!o && !n.force) {
            if (n.order) {
                l = n.order.length;
                for (m = 0; m < l && !o; m += 1) {
                    o = b(n.order[m]);
                }
            }
            if (!o) {
                l = g.length;
                for (m = 0; m < l && !o; m += 1) {
                    o = b(g[m]);
                }
            }
        }
        if (o) {
            return a(c(k), o, n.engine);
        }
        throw ("YAHOO.util.StorageManager.get - No engine available, please include an engine before calling this function.");
    }, getByteSize:function (i) {
        return encodeURIComponent("" + i).length;
    }, register:function (i) {
        if (e.isFunction(i) && e.isFunction(i.isAvailable) && e.isString(i.ENGINE_NAME)) {
            f[i.ENGINE_NAME] = i;
            g.push(i);
            return true;
        }
        return false;
    }};
    YAHOO.register("StorageManager", h.SWFStore, {version:"2.9.0", build:"2800"});
}());
(function () {
    function a(e, d, c, b, f) {
        this.key = d;
        this.oldValue = c;
        this.newValue = b;
        this.url = window.location.href;
        this.window = window;
        this.storageArea = e;
        this.type = f;
    }

    YAHOO.lang.augmentObject(a, {TYPE_ADD_ITEM:"addItem", TYPE_REMOVE_ITEM:"removeItem", TYPE_UPDATE_ITEM:"updateItem"});
    a.prototype = {key:null, newValue:null, oldValue:null, source:null, storageArea:null, type:null, url:null};
    YAHOO.util.StorageEvent = a;
}());
(function () {
    var a = YAHOO.util;
    a.StorageEngineKeyed = function () {
        a.StorageEngineKeyed.superclass.constructor.apply(this, arguments);
        this._keys = [];
        this._keyMap = {};
    };
    YAHOO.lang.extend(a.StorageEngineKeyed, a.Storage, {_keys:null, _keyMap:null, _addKey:function (b) {
        if (!this._keyMap.hasOwnProperty(b)) {
            this._keys.push(b);
            this._keyMap[b] = this.length;
            this.length = this._keys.length;
        }
    }, _clear:function () {
        this._keys = [];
        this.length = 0;
    }, _indexOfKey:function (c) {
        var b = this._keyMap[c];
        return undefined === b ? -1 : b;
    }, _key:function (b) {
        return this._keys[b];
    }, _removeItem:function (f) {
        var e = this, c = e._indexOfKey(f), d = e._keys.slice(c + 1), b;
        delete e._keyMap[f];
        for (b in e._keyMap) {
            if (c < e._keyMap[b]) {
                e._keyMap[b] -= 1;
            }
        }
        e._keys.length = c;
        e._keys = e._keys.concat(d);
        e.length = e._keys.length;
    }});
}());
(function () {
    var e = YAHOO.util, c = YAHOO.lang, a = function (f) {
        f.begin();
    }, b = function (f) {
        f.commit();
    }, d = function (f, h) {
        var g = this, i = window[f];
        d.superclass.constructor.call(g, f, d.ENGINE_NAME, h);
        if (!i.begin) {
            a = function () {
            };
        }
        if (!i.commit) {
            b = function () {
            };
        }
        g.length = i.length;
        g._driver = i;
        g.fireEvent(e.Storage.CE_READY);
    };
    c.extend(d, e.Storage, {_driver:null, _clear:function () {
        var g = this, f, h;
        if (g._driver.clear) {
            g._driver.clear();
        } else {
            for (f = g.length; 0 <= f; f -= 1) {
                h = g._key(f);
                g._removeItem(h);
            }
        }
    }, _getItem:function (f) {
        var g = this._driver.getItem(f);
        return c.isObject(g) ? g.value : g;
    }, _key:function (f) {
        return this._driver.key(f);
    }, _removeItem:function (f) {
        var g = this._driver;
        a(g);
        g.removeItem(f);
        b(g);
        this.length = g.length;
    }, _setItem:function (g, f) {
        var i = this._driver;
        try {
            a(i);
            i.setItem(g, f);
            b(i);
            this.length = i.length;
            return true;
        } catch (h) {
            return false;
        }
    }}, true);
    d.ENGINE_NAME = "html5";
    d.isAvailable = function () {
        try {
            return("localStorage" in window) && window["localStorage"] !== null && ("sessionStorage" in window) && window["sessionStorage"] !== null;
        } catch (f) {
            return false;
        }
    };
    e.StorageManager.register(d);
    e.StorageEngineHTML5 = d;
}());
(function () {
    var h = YAHOO.util, d = YAHOO.lang, e = 9948, g = "YUIStorageEngine", b = null, f = encodeURIComponent, a = decodeURIComponent, c = function (l, o) {
        var n = this, p = {}, k, i, j;
        c.superclass.constructor.call(n, l, c.ENGINE_NAME, o);
        if (!b) {
            b = google.gears.factory.create(c.GEARS);
            b.open(window.location.host.replace(/[\/\:\*\?"\<\>\|;,]/g, "") + "-" + c.DATABASE);
            b.execute("CREATE TABLE IF NOT EXISTS " + g + " (key TEXT, location TEXT, value TEXT)");
        }
        k = h.StorageManager.LOCATION_SESSION === n._location;
        i = h.Cookie.get("sessionKey" + c.ENGINE_NAME);
        if (!i) {
            b.execute("BEGIN");
            b.execute("DELETE FROM " + g + ' WHERE location="' + f(h.StorageManager.LOCATION_SESSION) + '"');
            b.execute("COMMIT");
        }
        j = b.execute("SELECT key FROM " + g + ' WHERE location="' + f(n._location) + '"');
        p = {};
        try {
            while (j.isValidRow()) {
                var m = a(j.field(0));
                if (!p[m]) {
                    p[m] = true;
                    n._addKey(m);
                }
                j.next();
            }
        } finally {
            j.close();
        }
        if (k) {
            h.Cookie.set("sessionKey" + c.ENGINE_NAME, true);
        }
        n.fireEvent(h.Storage.CE_READY);
    };
    d.extend(c, h.StorageEngineKeyed, {_clear:function () {
        c.superclass._clear.call(this);
        b.execute("BEGIN");
        b.execute("DELETE FROM " + g + ' WHERE location="' + f(this._location) + '"');
        b.execute("COMMIT");
    }, _getItem:function (k) {
        var i = b.execute("SELECT value FROM " + g + ' WHERE key="' + f(k) + '" AND location="' + f(this._location) + '"'), j = "";
        try {
            while (i.isValidRow()) {
                j += i.field(0);
                i.next();
            }
        } finally {
            i.close();
        }
        return j ? a(j) : null;
    }, _removeItem:function (i) {
        c.superclass._removeItem.call(this, i);
        b.execute("BEGIN");
        b.execute("DELETE FROM " + g + ' WHERE key="' + f(i) + '" AND location="' + f(this._location) + '"');
        b.execute("COMMIT");
    }, _setItem:function (r, k) {
        this._addKey(r);
        var l = f(r), m = f(this._location), p = f(k), q = [], s = e - (l + m).length, o = 0, n;
        if (s < p.length) {
            for (n = p.length; o < n; o += s) {
                q.push(p.substr(o, s));
            }
        } else {
            q.push(p);
        }
        b.execute("BEGIN");
        b.execute("DELETE FROM " + g + ' WHERE key="' + l + '" AND location="' + m + '"');
        for (o = 0, n = q.length; o < n; o += 1) {
            b.execute("INSERT INTO " + g + ' VALUES ("' + l + '", "' + m + '", "' + q[o] + '")');
        }
        b.execute("COMMIT");
        return true;
    }});
    h.Event.on("unload", function () {
        if (b) {
            b.close();
        }
    });
    c.ENGINE_NAME = "gears";
    c.GEARS = "beta.database";
    c.DATABASE = "yui.database";
    c.isAvailable = function () {
        if (("google" in window) && ("gears" in window.google)) {
            try {
                google.gears.factory.create(c.GEARS);
                return true;
            } catch (i) {
            }
        }
        return false;
    };
    h.StorageManager.register(c);
    h.StorageEngineGears = c;
}());
(function () {
    var b = YAHOO, i = b.util, g = b.lang, f = i.Dom, j = i.StorageManager, c = 215, h = 138, d = new RegExp("^(" + j.LOCATION_SESSION + "|" + j.LOCATION_LOCAL + ")"), e = null, k = function (m, n) {
        return m._location + n;
    }, a = function (n) {
        if (!e) {
            if (!g.isString(n.swfURL)) {
                n.swfURL = l.SWFURL;
            }
            if (!n.containerID) {
                var o = document.getElementsByTagName("body")[0], m = o.appendChild(document.createElement("div"));
                n.containerID = f.generateId(m);
            }
            if (!n.attributes) {
                n.attributes = {};
            }
            if (!n.attributes.flashVars) {
                n.attributes.flashVars = {};
            }
            n.attributes.flashVars.allowedDomain = document.location.hostname;
            n.attributes.flashVars.useCompression = "true";
            n.attributes.version = 9.115;
            e = new b.widget.SWF(n.containerID, n.swfURL, n.attributes);
            e.subscribe("save", function (p) {
                b.log(p.message, "info");
            });
            e.subscribe("quotaExceededError", function (p) {
                b.log(p.message, "error");
            });
            e.subscribe("inadequateDimensions", function (p) {
                b.log(p.message, "error");
            });
            e.subscribe("error", function (p) {
                b.log(p.message, "error");
            });
            e.subscribe("securityError", function (p) {
                b.log(p.message, "error");
            });
        }
    }, l = function (m, p) {
        var o = this;
        l.superclass.constructor.call(o, m, l.ENGINE_NAME, p);
        a(o._cfg);
        var n = function () {
            o._swf = e._swf;
            e.initialized = true;
            var s = j.LOCATION_SESSION === o._location, r = i.Cookie.get("sessionKey" + l.ENGINE_NAME), u, t, q;
            for (u = e.callSWF("getLength", []) - 1; 0 <= u; u -= 1) {
                t = e.callSWF("getNameAt", [u]);
                q = s && (-1 < t.indexOf(j.LOCATION_SESSION));
                if (q && !r) {
                    e.callSWF("removeItem", [t]);
                } else {
                    if (s === q) {
                        o._addKey(t);
                    }
                }
            }
            if (s) {
                i.Cookie.set("sessionKey" + l.ENGINE_NAME, true);
            }
            o.fireEvent(i.Storage.CE_READY);
        };
        if (e.initialized) {
            n();
        } else {
            e.addListener("contentReady", n);
        }
    };
    g.extend(l, i.StorageEngineKeyed, {_swf:null, _clear:function () {
        for (var m = this._keys.length - 1, n; 0 <= m; m -= 1) {
            n = this._keys[m];
            e.callSWF("removeItem", [n]);
        }
        l.superclass._clear.call(this);
    }, _getItem:function (m) {
        var n = k(this, m);
        return e.callSWF("getValueOf", [n]);
    }, _key:function (m) {
        return l.superclass._key.call(this, m).replace(d, "");
    }, _removeItem:function (m) {
        b.log("removing SWF key: " + m);
        var n = k(this, m);
        l.superclass._removeItem.call(this, n);
        e.callSWF("removeItem", [n]);
    }, _setItem:function (m, p) {
        var n = k(this, m), o;
        if (e.callSWF("setItem", [n, p])) {
            this._addKey(n);
            return true;
        } else {
            o = f.get(e._id);
            if (c > f.getStyle(o, "width").replace(/\D+/g, "")) {
                f.setStyle(o, "width", c + "px");
            }
            if (h > f.getStyle(o, "height").replace(/\D+/g, "")) {
                f.setStyle(o, "height", h + "px");
            }
            b.log("attempting to show settings. are dimensions adequate? " + e.callSWF("hasAdequateDimensions"));
            return e.callSWF("displaySettings", []);
        }
    }});
    l.SWFURL = "swfstore.swf";
    l.ENGINE_NAME = "swf";
    l.isAvailable = function () {
        return(6 <= b.env.ua.flash && b.widget.SWF);
    };
    j.register(l);
    i.StorageEngineSWF = l;
}());
YAHOO.register("storage", YAHOO.util.Storage, {version:"2.9.0", build:"2800"});