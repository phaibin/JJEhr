/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var j = document, b = j.createElement("p"), e = b.style, c = YAHOO.lang, m = {}, i = {}, f = 0, k = ("cssFloat" in e) ? "cssFloat" : "styleFloat", g, a, l;
    a = ("opacity" in e) ? function (d) {
        d.opacity = "";
    } : function (d) {
        d.filter = "";
    };
    e.border = "1px solid red";
    e.border = "";
    l = e.borderLeft ? function (d, o) {
        var n;
        if (o !== k && o.toLowerCase().indexOf("float") != -1) {
            o = k;
        }
        if (typeof d[o] === "string") {
            switch (o) {
                case"opacity":
                case"filter":
                    a(d);
                    break;
                case"font":
                    d.font = d.fontStyle = d.fontVariant = d.fontWeight = d.fontSize = d.lineHeight = d.fontFamily = "";
                    break;
                default:
                    for (n in d) {
                        if (n.indexOf(o) === 0) {
                            d[n] = "";
                        }
                    }
            }
        }
    } : function (d, n) {
        if (n !== k && n.toLowerCase().indexOf("float") != -1) {
            n = k;
        }
        if (c.isString(d[n])) {
            if (n === "opacity") {
                a(d);
            } else {
                d[n] = "";
            }
        }
    };
    function h(u, o) {
        var x, s, w, v = {}, n, y, q, t, d, p;
        if (!(this instanceof h)) {
            return new h(u, o);
        }
        s = u && (u.nodeName ? u : j.getElementById(u));
        if (u && i[u]) {
            return i[u];
        } else {
            if (s && s.yuiSSID && i[s.yuiSSID]) {
                return i[s.yuiSSID];
            }
        }
        if (!s || !/^(?:style|link)$/i.test(s.nodeName)) {
            s = j.createElement("style");
            s.type = "text/css";
        }
        if (c.isString(u)) {
            if (u.indexOf("{") != -1) {
                if (s.styleSheet) {
                    s.styleSheet.cssText = u;
                } else {
                    s.appendChild(j.createTextNode(u));
                }
            } else {
                if (!o) {
                    o = u;
                }
            }
        }
        if (!s.parentNode || s.parentNode.nodeName.toLowerCase() !== "head") {
            x = (s.ownerDocument || j).getElementsByTagName("head")[0];
            x.appendChild(s);
        }
        w = s.sheet || s.styleSheet;
        n = w && ("cssRules" in w) ? "cssRules" : "rules";
        q = ("deleteRule" in w) ? function (r) {
            w.deleteRule(r);
        } : function (r) {
            w.removeRule(r);
        };
        y = ("insertRule" in w) ? function (A, z, r) {
            w.insertRule(A + " {" + z + "}", r);
        } : function (A, z, r) {
            w.addRule(A, z, r);
        };
        for (t = w[n].length - 1; t >= 0; --t) {
            d = w[n][t];
            p = d.selectorText;
            if (v[p]) {
                v[p].style.cssText += ";" + d.style.cssText;
                q(t);
            } else {
                v[p] = d;
            }
        }
        s.yuiSSID = "yui-stylesheet-" + (f++);
        h.register(s.yuiSSID, this);
        if (o) {
            h.register(o, this);
        }
        c.augmentObject(this, {getId:function () {
            return s.yuiSSID;
        }, node:s, enable:function () {
            w.disabled = false;
            return this;
        }, disable:function () {
            w.disabled = true;
            return this;
        }, isEnabled:function () {
            return !w.disabled;
        }, set:function (B, A) {
            var D = v[B], C = B.split(/\s*,\s*/), z, r;
            if (C.length > 1) {
                for (z = C.length - 1; z >= 0; --z) {
                    this.set(C[z], A);
                }
                return this;
            }
            if (!h.isValidSelector(B)) {
                return this;
            }
            if (D) {
                D.style.cssText = h.toCssText(A, D.style.cssText);
            } else {
                r = w[n].length;
                A = h.toCssText(A);
                if (A) {
                    y(B, A, r);
                    v[B] = w[n][r];
                }
            }
            return this;
        }, unset:function (B, A) {
            var D = v[B], C = B.split(/\s*,\s*/), r = !A, E, z;
            if (C.length > 1) {
                for (z = C.length - 1; z >= 0; --z) {
                    this.unset(C[z], A);
                }
                return this;
            }
            if (D) {
                if (!r) {
                    if (!c.isArray(A)) {
                        A = [A];
                    }
                    e.cssText = D.style.cssText;
                    for (z = A.length - 1; z >= 0; --z) {
                        l(e, A[z]);
                    }
                    if (e.cssText) {
                        D.style.cssText = e.cssText;
                    } else {
                        r = true;
                    }
                }
                if (r) {
                    E = w[n];
                    for (z = E.length - 1; z >= 0; --z) {
                        if (E[z] === D) {
                            delete v[B];
                            q(z);
                            break;
                        }
                    }
                }
            }
            return this;
        }, getCssText:function (A) {
            var B, z, r;
            if (c.isString(A)) {
                B = v[A.split(/\s*,\s*/)[0]];
                return B ? B.style.cssText : null;
            } else {
                z = [];
                for (r in v) {
                    if (v.hasOwnProperty(r)) {
                        B = v[r];
                        z.push(B.selectorText + " {" + B.style.cssText + "}");
                    }
                }
                return z.join("\n");
            }
        }}, true);
    }

    g = function (n, p) {
        var o = n.styleFloat || n.cssFloat || n["float"], r;
        try {
            e.cssText = p || "";
        } catch (d) {
            b = j.createElement("p");
            e = b.style;
            e.cssText = p || "";
        }
        if (c.isString(n)) {
            e.cssText += ";" + n;
        } else {
            if (o && !n[k]) {
                n = c.merge(n);
                delete n.styleFloat;
                delete n.cssFloat;
                delete n["float"];
                n[k] = o;
            }
            for (r in n) {
                if (n.hasOwnProperty(r)) {
                    try {
                        e[r] = c.trim(n[r]);
                    } catch (q) {
                    }
                }
            }
        }
        return e.cssText;
    };
    c.augmentObject(h, {toCssText:(("opacity" in e) ? g : function (d, n) {
        if (c.isObject(d) && "opacity" in d) {
            d = c.merge(d, {filter:"alpha(opacity=" + (d.opacity * 100) + ")"});
            delete d.opacity;
        }
        return g(d, n);
    }), register:function (d, n) {
        return !!(d && n instanceof h && !i[d] && (i[d] = n));
    }, isValidSelector:function (n) {
        var d = false;
        if (n && c.isString(n)) {
            if (!m.hasOwnProperty(n)) {
                m[n] = !/\S/.test(n.replace(/\s+|\s*[+~>]\s*/g, " ").replace(/([^ ])\[.*?\]/g, "$1").replace(/([^ ])::?[a-z][a-z\-]+[a-z](?:\(.*?\))?/ig, "$1").replace(/(?:^| )[a-z0-6]+/ig, " ").replace(/\\./g, "").replace(/[.#]\w[\w\-]*/g, ""));
            }
            d = m[n];
        }
        return d;
    }}, true);
    YAHOO.util.StyleSheet = h;
})();
YAHOO.register("stylesheet", YAHOO.util.StyleSheet, {version:"2.9.0", build:"2800"});