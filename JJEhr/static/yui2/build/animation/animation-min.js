/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var b = YAHOO.util;
    var a = function (d, c, e, f) {
        if (!d) {
        }
        this.init(d, c, e, f);
    };
    a.NAME = "Anim";
    a.prototype = {toString:function () {
        var c = this.getEl() || {};
        var d = c.id || c.tagName;
        return(this.constructor.NAME + ": " + d);
    }, patterns:{noNegatives:/width|height|opacity|padding/i, offsetAttribute:/^((width|height)|(top|left))$/, defaultUnit:/width|height|top$|bottom$|left$|right$/i, offsetUnit:/\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i}, doMethod:function (c, e, d) {
        return this.method(this.currentFrame, e, d - e, this.totalFrames);
    }, setAttribute:function (c, f, e) {
        var d = this.getEl();
        if (this.patterns.noNegatives.test(c)) {
            f = (f > 0) ? f : 0;
        }
        if (c in d && !("style" in d && c in d.style)) {
            d[c] = f;
        } else {
            b.Dom.setStyle(d, c, f + e);
        }
    }, getAttribute:function (c) {
        var e = this.getEl();
        var g = b.Dom.getStyle(e, c);
        if (g !== "auto" && !this.patterns.offsetUnit.test(g)) {
            return parseFloat(g);
        }
        var d = this.patterns.offsetAttribute.exec(c) || [];
        var h = !!(d[3]);
        var f = !!(d[2]);
        if ("style" in e) {
            if (f || (b.Dom.getStyle(e, "position") == "absolute" && h)) {
                g = e["offset" + d[0].charAt(0).toUpperCase() + d[0].substr(1)];
            } else {
                g = 0;
            }
        } else {
            if (c in e) {
                g = e[c];
            }
        }
        return g;
    }, getDefaultUnit:function (c) {
        if (this.patterns.defaultUnit.test(c)) {
            return"px";
        }
        return"";
    }, setRuntimeAttribute:function (d) {
        var j;
        var e;
        var f = this.attributes;
        this.runtimeAttributes[d] = {};
        var h = function (i) {
            return(typeof i !== "undefined");
        };
        if (!h(f[d]["to"]) && !h(f[d]["by"])) {
            return false;
        }
        j = (h(f[d]["from"])) ? f[d]["from"] : this.getAttribute(d);
        if (h(f[d]["to"])) {
            e = f[d]["to"];
        } else {
            if (h(f[d]["by"])) {
                if (j.constructor == Array) {
                    e = [];
                    for (var g = 0, c = j.length; g < c; ++g) {
                        e[g] = j[g] + f[d]["by"][g] * 1;
                    }
                } else {
                    e = j + f[d]["by"] * 1;
                }
            }
        }
        this.runtimeAttributes[d].start = j;
        this.runtimeAttributes[d].end = e;
        this.runtimeAttributes[d].unit = (h(f[d].unit)) ? f[d]["unit"] : this.getDefaultUnit(d);
        return true;
    }, init:function (f, c, h, i) {
        var d = false;
        var e = null;
        var g = 0;
        f = b.Dom.get(f);
        this.attributes = c || {};
        this.duration = !YAHOO.lang.isUndefined(h) ? h : 1;
        this.method = i || b.Easing.easeNone;
        this.useSeconds = true;
        this.currentFrame = 0;
        this.totalFrames = b.AnimMgr.fps;
        this.setEl = function (j) {
            f = b.Dom.get(j);
        };
        this.getEl = function () {
            return f;
        };
        this.isAnimated = function () {
            return d;
        };
        this.getStartTime = function () {
            return e;
        };
        this.runtimeAttributes = {};
        this.animate = function () {
            if (this.isAnimated()) {
                return false;
            }
            this.currentFrame = 0;
            this.totalFrames = (this.useSeconds) ? Math.ceil(b.AnimMgr.fps * this.duration) : this.duration;
            if (this.duration === 0 && this.useSeconds) {
                this.totalFrames = 1;
            }
            b.AnimMgr.registerElement(this);
            return true;
        };
        this.stop = function (j) {
            if (!this.isAnimated()) {
                return false;
            }
            if (j) {
                this.currentFrame = this.totalFrames;
                this._onTween.fire();
            }
            b.AnimMgr.stop(this);
        };
        this._handleStart = function () {
            this.onStart.fire();
            this.runtimeAttributes = {};
            for (var j in this.attributes) {
                if (this.attributes.hasOwnProperty(j)) {
                    this.setRuntimeAttribute(j);
                }
            }
            d = true;
            g = 0;
            e = new Date();
        };
        this._handleTween = function () {
            var l = {duration:new Date() - this.getStartTime(), currentFrame:this.currentFrame};
            l.toString = function () {
                return("duration: " + l.duration + ", currentFrame: " + l.currentFrame);
            };
            this.onTween.fire(l);
            var k = this.runtimeAttributes;
            for (var j in k) {
                if (k.hasOwnProperty(j)) {
                    this.setAttribute(j, this.doMethod(j, k[j].start, k[j].end), k[j].unit);
                }
            }
            this.afterTween.fire(l);
            g += 1;
        };
        this._handleComplete = function () {
            var j = (new Date() - e) / 1000;
            var k = {duration:j, frames:g, fps:g / j};
            k.toString = function () {
                return("duration: " + k.duration + ", frames: " + k.frames + ", fps: " + k.fps);
            };
            d = false;
            g = 0;
            this.onComplete.fire(k);
        };
        this._onStart = new b.CustomEvent("_start", this, true);
        this.onStart = new b.CustomEvent("start", this);
        this.onTween = new b.CustomEvent("tween", this);
        this.afterTween = new b.CustomEvent("afterTween", this);
        this._onTween = new b.CustomEvent("_tween", this, true);
        this.onComplete = new b.CustomEvent("complete", this);
        this._onComplete = new b.CustomEvent("_complete", this, true);
        this._onStart.subscribe(this._handleStart);
        this._onTween.subscribe(this._handleTween);
        this._onComplete.subscribe(this._handleComplete);
    }};
    b.Anim = a;
})();
YAHOO.util.AnimMgr = new function () {
    var e = null;
    var c = [];
    var g = 0;
    this.fps = 1000;
    this.delay = 20;
    this.registerElement = function (j) {
        c[c.length] = j;
        g += 1;
        j._onStart.fire();
        this.start();
    };
    var f = [];
    var d = false;
    var h = function () {
        var j = f.shift();
        b.apply(YAHOO.util.AnimMgr, j);
        if (f.length) {
            arguments.callee();
        }
    };
    var b = function (k, j) {
        j = j || a(k);
        if (!k.isAnimated() || j === -1) {
            return false;
        }
        k._onComplete.fire();
        c.splice(j, 1);
        g -= 1;
        if (g <= 0) {
            this.stop();
        }
        return true;
    };
    this.unRegister = function () {
        f.push(arguments);
        if (!d) {
            d = true;
            h();
            d = false;
        }
    };
    this.start = function () {
        if (e === null) {
            e = setInterval(this.run, this.delay);
        }
    };
    this.stop = function (l) {
        if (!l) {
            clearInterval(e);
            for (var k = 0, j = c.length; k < j; ++k) {
                this.unRegister(c[0], 0);
            }
            c = [];
            e = null;
            g = 0;
        } else {
            this.unRegister(l);
        }
    };
    this.run = function () {
        for (var l = 0, j = c.length; l < j; ++l) {
            var k = c[l];
            if (!k || !k.isAnimated()) {
                continue;
            }
            if (k.currentFrame < k.totalFrames || k.totalFrames === null) {
                k.currentFrame += 1;
                if (k.useSeconds) {
                    i(k);
                }
                k._onTween.fire();
            } else {
                YAHOO.util.AnimMgr.stop(k, l);
            }
        }
    };
    var a = function (l) {
        for (var k = 0, j = c.length; k < j; ++k) {
            if (c[k] === l) {
                return k;
            }
        }
        return -1;
    };
    var i = function (k) {
        var n = k.totalFrames;
        var m = k.currentFrame;
        var l = (k.currentFrame * k.duration * 1000 / k.totalFrames);
        var j = (new Date() - k.getStartTime());
        var o = 0;
        if (j < k.duration * 1000) {
            o = Math.round((j / l - 1) * k.currentFrame);
        } else {
            o = n - (m + 1);
        }
        if (o > 0 && isFinite(o)) {
            if (k.currentFrame + o >= n) {
                o = n - (m + 1);
            }
            k.currentFrame += o;
        }
    };
    this._queue = c;
    this._getIndex = a;
};
YAHOO.util.Bezier = new function () {
    this.getPosition = function (e, d) {
        var f = e.length;
        var c = [];
        for (var b = 0; b < f; ++b) {
            c[b] = [e[b][0], e[b][1]];
        }
        for (var a = 1; a < f; ++a) {
            for (b = 0; b < f - a; ++b) {
                c[b][0] = (1 - d) * c[b][0] + d * c[parseInt(b + 1, 10)][0];
                c[b][1] = (1 - d) * c[b][1] + d * c[parseInt(b + 1, 10)][1];
            }
        }
        return[c[0][0], c[0][1]];
    };
};
(function () {
    var a = function (f, e, g, h) {
        a.superclass.constructor.call(this, f, e, g, h);
    };
    a.NAME = "ColorAnim";
    a.DEFAULT_BGCOLOR = "#fff";
    var c = YAHOO.util;
    YAHOO.extend(a, c.Anim);
    var d = a.superclass;
    var b = a.prototype;
    b.patterns.color = /color$/i;
    b.patterns.rgb = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;
    b.patterns.hex = /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
    b.patterns.hex3 = /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;
    b.patterns.transparent = /^transparent|rgba\(0, 0, 0, 0\)$/;
    b.parseColor = function (e) {
        if (e.length == 3) {
            return e;
        }
        var f = this.patterns.hex.exec(e);
        if (f && f.length == 4) {
            return[parseInt(f[1], 16), parseInt(f[2], 16), parseInt(f[3], 16)];
        }
        f = this.patterns.rgb.exec(e);
        if (f && f.length == 4) {
            return[parseInt(f[1], 10), parseInt(f[2], 10), parseInt(f[3], 10)];
        }
        f = this.patterns.hex3.exec(e);
        if (f && f.length == 4) {
            return[parseInt(f[1] + f[1], 16), parseInt(f[2] + f[2], 16), parseInt(f[3] + f[3], 16)];
        }
        return null;
    };
    b.getAttribute = function (e) {
        var g = this.getEl();
        if (this.patterns.color.test(e)) {
            var i = YAHOO.util.Dom.getStyle(g, e);
            var h = this;
            if (this.patterns.transparent.test(i)) {
                var f = YAHOO.util.Dom.getAncestorBy(g, function (j) {
                    return !h.patterns.transparent.test(i);
                });
                if (f) {
                    i = c.Dom.getStyle(f, e);
                } else {
                    i = a.DEFAULT_BGCOLOR;
                }
            }
        } else {
            i = d.getAttribute.call(this, e);
        }
        return i;
    };
    b.doMethod = function (f, k, g) {
        var j;
        if (this.patterns.color.test(f)) {
            j = [];
            for (var h = 0, e = k.length; h < e; ++h) {
                j[h] = d.doMethod.call(this, f, k[h], g[h]);
            }
            j = "rgb(" + Math.floor(j[0]) + "," + Math.floor(j[1]) + "," + Math.floor(j[2]) + ")";
        } else {
            j = d.doMethod.call(this, f, k, g);
        }
        return j;
    };
    b.setRuntimeAttribute = function (f) {
        d.setRuntimeAttribute.call(this, f);
        if (this.patterns.color.test(f)) {
            var h = this.attributes;
            var k = this.parseColor(this.runtimeAttributes[f].start);
            var g = this.parseColor(this.runtimeAttributes[f].end);
            if (typeof h[f]["to"] === "undefined" && typeof h[f]["by"] !== "undefined") {
                g = this.parseColor(h[f].by);
                for (var j = 0, e = k.length; j < e; ++j) {
                    g[j] = k[j] + g[j];
                }
            }
            this.runtimeAttributes[f].start = k;
            this.runtimeAttributes[f].end = g;
        }
    };
    c.ColorAnim = a;
})();
/*!
 TERMS OF USE - EASING EQUATIONS
 Open source under the BSD License.
 Copyright 2001 Robert Penner All rights reserved.

 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
YAHOO.util.Easing = {easeNone:function (e, a, g, f) {
    return g * e / f + a;
}, easeIn:function (e, a, g, f) {
    return g * (e /= f) * e + a;
}, easeOut:function (e, a, g, f) {
    return -g * (e /= f) * (e - 2) + a;
}, easeBoth:function (e, a, g, f) {
    if ((e /= f / 2) < 1) {
        return g / 2 * e * e + a;
    }
    return -g / 2 * ((--e) * (e - 2) - 1) + a;
}, easeInStrong:function (e, a, g, f) {
    return g * (e /= f) * e * e * e + a;
}, easeOutStrong:function (e, a, g, f) {
    return -g * ((e = e / f - 1) * e * e * e - 1) + a;
}, easeBothStrong:function (e, a, g, f) {
    if ((e /= f / 2) < 1) {
        return g / 2 * e * e * e * e + a;
    }
    return -g / 2 * ((e -= 2) * e * e * e - 2) + a;
}, elasticIn:function (g, e, k, j, f, i) {
    if (g == 0) {
        return e;
    }
    if ((g /= j) == 1) {
        return e + k;
    }
    if (!i) {
        i = j * 0.3;
    }
    if (!f || f < Math.abs(k)) {
        f = k;
        var h = i / 4;
    } else {
        var h = i / (2 * Math.PI) * Math.asin(k / f);
    }
    return -(f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e;
}, elasticOut:function (g, e, k, j, f, i) {
    if (g == 0) {
        return e;
    }
    if ((g /= j) == 1) {
        return e + k;
    }
    if (!i) {
        i = j * 0.3;
    }
    if (!f || f < Math.abs(k)) {
        f = k;
        var h = i / 4;
    } else {
        var h = i / (2 * Math.PI) * Math.asin(k / f);
    }
    return f * Math.pow(2, -10 * g) * Math.sin((g * j - h) * (2 * Math.PI) / i) + k + e;
}, elasticBoth:function (g, e, k, j, f, i) {
    if (g == 0) {
        return e;
    }
    if ((g /= j / 2) == 2) {
        return e + k;
    }
    if (!i) {
        i = j * (0.3 * 1.5);
    }
    if (!f || f < Math.abs(k)) {
        f = k;
        var h = i / 4;
    } else {
        var h = i / (2 * Math.PI) * Math.asin(k / f);
    }
    if (g < 1) {
        return -0.5 * (f * Math.pow(2, 10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i)) + e;
    }
    return f * Math.pow(2, -10 * (g -= 1)) * Math.sin((g * j - h) * (2 * Math.PI) / i) * 0.5 + k + e;
}, backIn:function (e, a, h, g, f) {
    if (typeof f == "undefined") {
        f = 1.70158;
    }
    return h * (e /= g) * e * ((f + 1) * e - f) + a;
}, backOut:function (e, a, h, g, f) {
    if (typeof f == "undefined") {
        f = 1.70158;
    }
    return h * ((e = e / g - 1) * e * ((f + 1) * e + f) + 1) + a;
}, backBoth:function (e, a, h, g, f) {
    if (typeof f == "undefined") {
        f = 1.70158;
    }
    if ((e /= g / 2) < 1) {
        return h / 2 * (e * e * (((f *= (1.525)) + 1) * e - f)) + a;
    }
    return h / 2 * ((e -= 2) * e * (((f *= (1.525)) + 1) * e + f) + 2) + a;
}, bounceIn:function (e, a, g, f) {
    return g - YAHOO.util.Easing.bounceOut(f - e, 0, g, f) + a;
}, bounceOut:function (e, a, g, f) {
    if ((e /= f) < (1 / 2.75)) {
        return g * (7.5625 * e * e) + a;
    } else {
        if (e < (2 / 2.75)) {
            return g * (7.5625 * (e -= (1.5 / 2.75)) * e + 0.75) + a;
        } else {
            if (e < (2.5 / 2.75)) {
                return g * (7.5625 * (e -= (2.25 / 2.75)) * e + 0.9375) + a;
            }
        }
    }
    return g * (7.5625 * (e -= (2.625 / 2.75)) * e + 0.984375) + a;
}, bounceBoth:function (e, a, g, f) {
    if (e < f / 2) {
        return YAHOO.util.Easing.bounceIn(e * 2, 0, g, f) * 0.5 + a;
    }
    return YAHOO.util.Easing.bounceOut(e * 2 - f, 0, g, f) * 0.5 + g * 0.5 + a;
}};
(function () {
    var a = function (h, g, i, j) {
        if (h) {
            a.superclass.constructor.call(this, h, g, i, j);
        }
    };
    a.NAME = "Motion";
    var e = YAHOO.util;
    YAHOO.extend(a, e.ColorAnim);
    var f = a.superclass;
    var c = a.prototype;
    c.patterns.points = /^points$/i;
    c.setAttribute = function (g, i, h) {
        if (this.patterns.points.test(g)) {
            h = h || "px";
            f.setAttribute.call(this, "left", i[0], h);
            f.setAttribute.call(this, "top", i[1], h);
        } else {
            f.setAttribute.call(this, g, i, h);
        }
    };
    c.getAttribute = function (g) {
        if (this.patterns.points.test(g)) {
            var h = [f.getAttribute.call(this, "left"), f.getAttribute.call(this, "top")];
        } else {
            h = f.getAttribute.call(this, g);
        }
        return h;
    };
    c.doMethod = function (g, k, h) {
        var j = null;
        if (this.patterns.points.test(g)) {
            var i = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;
            j = e.Bezier.getPosition(this.runtimeAttributes[g], i);
        } else {
            j = f.doMethod.call(this, g, k, h);
        }
        return j;
    };
    c.setRuntimeAttribute = function (q) {
        if (this.patterns.points.test(q)) {
            var h = this.getEl();
            var k = this.attributes;
            var g;
            var m = k["points"]["control"] || [];
            var j;
            var n, p;
            if (m.length > 0 && !(m[0] instanceof Array)) {
                m = [m];
            } else {
                var l = [];
                for (n = 0, p = m.length; n < p; ++n) {
                    l[n] = m[n];
                }
                m = l;
            }
            if (e.Dom.getStyle(h, "position") == "static") {
                e.Dom.setStyle(h, "position", "relative");
            }
            if (d(k["points"]["from"])) {
                e.Dom.setXY(h, k["points"]["from"]);
            } else {
                e.Dom.setXY(h, e.Dom.getXY(h));
            }
            g = this.getAttribute("points");
            if (d(k["points"]["to"])) {
                j = b.call(this, k["points"]["to"], g);
                var o = e.Dom.getXY(this.getEl());
                for (n = 0, p = m.length; n < p; ++n) {
                    m[n] = b.call(this, m[n], g);
                }
            } else {
                if (d(k["points"]["by"])) {
                    j = [g[0] + k["points"]["by"][0], g[1] + k["points"]["by"][1]];
                    for (n = 0, p = m.length; n < p; ++n) {
                        m[n] = [g[0] + m[n][0], g[1] + m[n][1]];
                    }
                }
            }
            this.runtimeAttributes[q] = [g];
            if (m.length > 0) {
                this.runtimeAttributes[q] = this.runtimeAttributes[q].concat(m);
            }
            this.runtimeAttributes[q][this.runtimeAttributes[q].length] = j;
        } else {
            f.setRuntimeAttribute.call(this, q);
        }
    };
    var b = function (g, i) {
        var h = e.Dom.getXY(this.getEl());
        g = [g[0] - h[0] + i[0], g[1] - h[1] + i[1]];
        return g;
    };
    var d = function (g) {
        return(typeof g !== "undefined");
    };
    e.Motion = a;
})();
(function () {
    var d = function (f, e, g, h) {
        if (f) {
            d.superclass.constructor.call(this, f, e, g, h);
        }
    };
    d.NAME = "Scroll";
    var b = YAHOO.util;
    YAHOO.extend(d, b.ColorAnim);
    var c = d.superclass;
    var a = d.prototype;
    a.doMethod = function (e, h, f) {
        var g = null;
        if (e == "scroll") {
            g = [this.method(this.currentFrame, h[0], f[0] - h[0], this.totalFrames), this.method(this.currentFrame, h[1], f[1] - h[1], this.totalFrames)];
        } else {
            g = c.doMethod.call(this, e, h, f);
        }
        return g;
    };
    a.getAttribute = function (e) {
        var g = null;
        var f = this.getEl();
        if (e == "scroll") {
            g = [f.scrollLeft, f.scrollTop];
        } else {
            g = c.getAttribute.call(this, e);
        }
        return g;
    };
    a.setAttribute = function (e, h, g) {
        var f = this.getEl();
        if (e == "scroll") {
            f.scrollLeft = h[0];
            f.scrollTop = h[1];
        } else {
            c.setAttribute.call(this, e, h, g);
        }
    };
    b.Scroll = d;
})();
YAHOO.register("animation", YAHOO.util.Anim, {version:"2.9.0", build:"2800"});