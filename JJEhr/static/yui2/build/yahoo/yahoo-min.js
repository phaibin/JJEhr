/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
if (typeof YAHOO == "undefined" || !YAHOO) {
    var YAHOO = {};
}
YAHOO.namespace = function () {
    var b = arguments, g = null, e, c, f;
    for (e = 0; e < b.length; e = e + 1) {
        f = ("" + b[e]).split(".");
        g = YAHOO;
        for (c = (f[0] == "YAHOO") ? 1 : 0; c < f.length; c = c + 1) {
            g[f[c]] = g[f[c]] || {};
            g = g[f[c]];
        }
    }
    return g;
};
YAHOO.log = function (d, a, c) {
    var b = YAHOO.widget.Logger;
    if (b && b.log) {
        return b.log(d, a, c);
    } else {
        return false;
    }
};
YAHOO.register = function (a, f, e) {
    var k = YAHOO.env.modules, c, j, h, g, d;
    if (!k[a]) {
        k[a] = {versions:[], builds:[]};
    }
    c = k[a];
    j = e.version;
    h = e.build;
    g = YAHOO.env.listeners;
    c.name = a;
    c.version = j;
    c.build = h;
    c.versions.push(j);
    c.builds.push(h);
    c.mainClass = f;
    for (d = 0; d < g.length; d = d + 1) {
        g[d](c);
    }
    if (f) {
        f.VERSION = j;
        f.BUILD = h;
    } else {
        YAHOO.log("mainClass is undefined for module " + a, "warn");
    }
};
YAHOO.env = YAHOO.env || {modules:[], listeners:[]};
YAHOO.env.getVersion = function (a) {
    return YAHOO.env.modules[a] || null;
};
YAHOO.env.parseUA = function (d) {
    var e = function (i) {
        var j = 0;
        return parseFloat(i.replace(/\./g, function () {
            return(j++ == 1) ? "" : ".";
        }));
    }, h = navigator, g = {ie:0, opera:0, gecko:0, webkit:0, chrome:0, mobile:null, air:0, ipad:0, iphone:0, ipod:0, ios:null, android:0, webos:0, caja:h && h.cajaVersion, secure:false, os:null}, c = d || (navigator && navigator.userAgent), f = window && window.location, b = f && f.href, a;
    g.secure = b && (b.toLowerCase().indexOf("https") === 0);
    if (c) {
        if ((/windows|win32/i).test(c)) {
            g.os = "windows";
        } else {
            if ((/macintosh/i).test(c)) {
                g.os = "macintosh";
            } else {
                if ((/rhino/i).test(c)) {
                    g.os = "rhino";
                }
            }
        }
        if ((/KHTML/).test(c)) {
            g.webkit = 1;
        }
        a = c.match(/AppleWebKit\/([^\s]*)/);
        if (a && a[1]) {
            g.webkit = e(a[1]);
            if (/ Mobile\//.test(c)) {
                g.mobile = "Apple";
                a = c.match(/OS ([^\s]*)/);
                if (a && a[1]) {
                    a = e(a[1].replace("_", "."));
                }
                g.ios = a;
                g.ipad = g.ipod = g.iphone = 0;
                a = c.match(/iPad|iPod|iPhone/);
                if (a && a[0]) {
                    g[a[0].toLowerCase()] = g.ios;
                }
            } else {
                a = c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
                if (a) {
                    g.mobile = a[0];
                }
                if (/webOS/.test(c)) {
                    g.mobile = "WebOS";
                    a = c.match(/webOS\/([^\s]*);/);
                    if (a && a[1]) {
                        g.webos = e(a[1]);
                    }
                }
                if (/ Android/.test(c)) {
                    g.mobile = "Android";
                    a = c.match(/Android ([^\s]*);/);
                    if (a && a[1]) {
                        g.android = e(a[1]);
                    }
                }
            }
            a = c.match(/Chrome\/([^\s]*)/);
            if (a && a[1]) {
                g.chrome = e(a[1]);
            } else {
                a = c.match(/AdobeAIR\/([^\s]*)/);
                if (a) {
                    g.air = a[0];
                }
            }
        }
        if (!g.webkit) {
            a = c.match(/Opera[\s\/]([^\s]*)/);
            if (a && a[1]) {
                g.opera = e(a[1]);
                a = c.match(/Version\/([^\s]*)/);
                if (a && a[1]) {
                    g.opera = e(a[1]);
                }
                a = c.match(/Opera Mini[^;]*/);
                if (a) {
                    g.mobile = a[0];
                }
            } else {
                a = c.match(/MSIE\s([^;]*)/);
                if (a && a[1]) {
                    g.ie = e(a[1]);
                } else {
                    a = c.match(/Gecko\/([^\s]*)/);
                    if (a) {
                        g.gecko = 1;
                        a = c.match(/rv:([^\s\)]*)/);
                        if (a && a[1]) {
                            g.gecko = e(a[1]);
                        }
                    }
                }
            }
        }
    }
    return g;
};
YAHOO.env.ua = YAHOO.env.parseUA();
(function () {
    YAHOO.namespace("util", "widget", "example");
    if ("undefined" !== typeof YAHOO_config) {
        var b = YAHOO_config.listener, a = YAHOO.env.listeners, d = true, c;
        if (b) {
            for (c = 0; c < a.length; c++) {
                if (a[c] == b) {
                    d = false;
                    break;
                }
            }
            if (d) {
                a.push(b);
            }
        }
    }
})();
YAHOO.lang = YAHOO.lang || {};
(function () {
    var f = YAHOO.lang, a = Object.prototype, c = "[object Array]", h = "[object Function]", i = "[object Object]", b = [], g = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#x27;", "/":"&#x2F;", "`":"&#x60;"}, d = ["toString", "valueOf"], e = {isArray:function (j) {
        return a.toString.apply(j) === c;
    }, isBoolean:function (j) {
        return typeof j === "boolean";
    }, isFunction:function (j) {
        return(typeof j === "function") || a.toString.apply(j) === h;
    }, isNull:function (j) {
        return j === null;
    }, isNumber:function (j) {
        return typeof j === "number" && isFinite(j);
    }, isObject:function (j) {
        return(j && (typeof j === "object" || f.isFunction(j))) || false;
    }, isString:function (j) {
        return typeof j === "string";
    }, isUndefined:function (j) {
        return typeof j === "undefined";
    }, _IEEnumFix:(YAHOO.env.ua.ie) ? function (l, k) {
        var j, n, m;
        for (j = 0; j < d.length; j = j + 1) {
            n = d[j];
            m = k[n];
            if (f.isFunction(m) && m != a[n]) {
                l[n] = m;
            }
        }
    } : function () {
    }, escapeHTML:function (j) {
        return j.replace(/[&<>"'\/`]/g, function (k) {
            return g[k];
        });
    }, extend:function (m, n, l) {
        if (!n || !m) {
            throw new Error("extend failed, please check that " + "all dependencies are included.");
        }
        var k = function () {
        }, j;
        k.prototype = n.prototype;
        m.prototype = new k();
        m.prototype.constructor = m;
        m.superclass = n.prototype;
        if (n.prototype.constructor == a.constructor) {
            n.prototype.constructor = n;
        }
        if (l) {
            for (j in l) {
                if (f.hasOwnProperty(l, j)) {
                    m.prototype[j] = l[j];
                }
            }
            f._IEEnumFix(m.prototype, l);
        }
    }, augmentObject:function (n, m) {
        if (!m || !n) {
            throw new Error("Absorb failed, verify dependencies.");
        }
        var j = arguments, l, o, k = j[2];
        if (k && k !== true) {
            for (l = 2; l < j.length; l = l + 1) {
                n[j[l]] = m[j[l]];
            }
        } else {
            for (o in m) {
                if (k || !(o in n)) {
                    n[o] = m[o];
                }
            }
            f._IEEnumFix(n, m);
        }
        return n;
    }, augmentProto:function (m, l) {
        if (!l || !m) {
            throw new Error("Augment failed, verify dependencies.");
        }
        var j = [m.prototype, l.prototype], k;
        for (k = 2; k < arguments.length; k = k + 1) {
            j.push(arguments[k]);
        }
        f.augmentObject.apply(this, j);
        return m;
    }, dump:function (j, p) {
        var l, n, r = [], t = "{...}", k = "f(){...}", q = ", ", m = " => ";
        if (!f.isObject(j)) {
            return j + "";
        } else {
            if (j instanceof Date || ("nodeType" in j && "tagName" in j)) {
                return j;
            } else {
                if (f.isFunction(j)) {
                    return k;
                }
            }
        }
        p = (f.isNumber(p)) ? p : 3;
        if (f.isArray(j)) {
            r.push("[");
            for (l = 0, n = j.length; l < n; l = l + 1) {
                if (f.isObject(j[l])) {
                    r.push((p > 0) ? f.dump(j[l], p - 1) : t);
                } else {
                    r.push(j[l]);
                }
                r.push(q);
            }
            if (r.length > 1) {
                r.pop();
            }
            r.push("]");
        } else {
            r.push("{");
            for (l in j) {
                if (f.hasOwnProperty(j, l)) {
                    r.push(l + m);
                    if (f.isObject(j[l])) {
                        r.push((p > 0) ? f.dump(j[l], p - 1) : t);
                    } else {
                        r.push(j[l]);
                    }
                    r.push(q);
                }
            }
            if (r.length > 1) {
                r.pop();
            }
            r.push("}");
        }
        return r.join("");
    }, substitute:function (x, y, E, l) {
        var D, C, B, G, t, u, F = [], p, z = x.length, A = "dump", r = " ", q = "{", m = "}", n, w;
        for (; ;) {
            D = x.lastIndexOf(q, z);
            if (D < 0) {
                break;
            }
            C = x.indexOf(m, D);
            if (D + 1 > C) {
                break;
            }
            p = x.substring(D + 1, C);
            G = p;
            u = null;
            B = G.indexOf(r);
            if (B > -1) {
                u = G.substring(B + 1);
                G = G.substring(0, B);
            }
            t = y[G];
            if (E) {
                t = E(G, t, u);
            }
            if (f.isObject(t)) {
                if (f.isArray(t)) {
                    t = f.dump(t, parseInt(u, 10));
                } else {
                    u = u || "";
                    n = u.indexOf(A);
                    if (n > -1) {
                        u = u.substring(4);
                    }
                    w = t.toString();
                    if (w === i || n > -1) {
                        t = f.dump(t, parseInt(u, 10));
                    } else {
                        t = w;
                    }
                }
            } else {
                if (!f.isString(t) && !f.isNumber(t)) {
                    t = "~-" + F.length + "-~";
                    F[F.length] = p;
                }
            }
            x = x.substring(0, D) + t + x.substring(C + 1);
            if (l === false) {
                z = D - 1;
            }
        }
        for (D = F.length - 1; D >= 0; D = D - 1) {
            x = x.replace(new RegExp("~-" + D + "-~"), "{" + F[D] + "}", "g");
        }
        return x;
    }, trim:function (j) {
        try {
            return j.replace(/^\s+|\s+$/g, "");
        } catch (k) {
            return j;
        }
    }, merge:function () {
        var n = {}, k = arguments, j = k.length, m;
        for (m = 0; m < j; m = m + 1) {
            f.augmentObject(n, k[m], true);
        }
        return n;
    }, later:function (t, k, u, n, p) {
        t = t || 0;
        k = k || {};
        var l = u, s = n, q, j;
        if (f.isString(u)) {
            l = k[u];
        }
        if (!l) {
            throw new TypeError("method undefined");
        }
        if (!f.isUndefined(n) && !f.isArray(s)) {
            s = [n];
        }
        q = function () {
            l.apply(k, s || b);
        };
        j = (p) ? setInterval(q, t) : setTimeout(q, t);
        return{interval:p, cancel:function () {
            if (this.interval) {
                clearInterval(j);
            } else {
                clearTimeout(j);
            }
        }};
    }, isValue:function (j) {
        return(f.isObject(j) || f.isString(j) || f.isNumber(j) || f.isBoolean(j));
    }};
    f.hasOwnProperty = (a.hasOwnProperty) ? function (j, k) {
        return j && j.hasOwnProperty && j.hasOwnProperty(k);
    } : function (j, k) {
        return !f.isUndefined(j[k]) && j.constructor.prototype[k] !== j[k];
    };
    e.augmentObject(f, e, true);
    YAHOO.util.Lang = f;
    f.augment = f.augmentProto;
    YAHOO.augment = f.augmentProto;
    YAHOO.extend = f.extend;
})();
YAHOO.register("yahoo", YAHOO, {version:"2.9.0", build:"2800"});