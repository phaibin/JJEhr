/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
YAHOO.namespace("tool");
(function () {
    var a = 0;
    YAHOO.tool.TestCase = function (b) {
        this._should = {};
        for (var c in b) {
            this[c] = b[c];
        }
        if (!YAHOO.lang.isString(this.name)) {
            this.name = "testCase" + (a++);
        }
    };
    YAHOO.tool.TestCase.prototype = {resume:function (b) {
        YAHOO.tool.TestRunner.resume(b);
    }, wait:function (d, c) {
        var b = arguments;
        if (YAHOO.lang.isFunction(b[0])) {
            throw new YAHOO.tool.TestCase.Wait(b[0], b[1]);
        } else {
            throw new YAHOO.tool.TestCase.Wait(function () {
                YAHOO.util.Assert.fail("Timeout: wait() called but resume() never called.");
            }, (YAHOO.lang.isNumber(b[0]) ? b[0] : 10000));
        }
    }, setUp:function () {
    }, tearDown:function () {
    }};
    YAHOO.tool.TestCase.Wait = function (c, b) {
        this.segment = (YAHOO.lang.isFunction(c) ? c : null);
        this.delay = (YAHOO.lang.isNumber(b) ? b : 0);
    };
})();
YAHOO.namespace("tool");
YAHOO.tool.TestSuite = function (a) {
    this.name = "";
    this.items = [];
    if (YAHOO.lang.isString(a)) {
        this.name = a;
    } else {
        if (YAHOO.lang.isObject(a)) {
            YAHOO.lang.augmentObject(this, a, true);
        }
    }
    if (this.name === "") {
        this.name = YAHOO.util.Dom.generateId(null, "testSuite");
    }
};
YAHOO.tool.TestSuite.prototype = {add:function (a) {
    if (a instanceof YAHOO.tool.TestSuite || a instanceof YAHOO.tool.TestCase) {
        this.items.push(a);
    }
}, setUp:function () {
}, tearDown:function () {
}};
YAHOO.namespace("tool");
YAHOO.tool.TestRunner = (function () {
    function b(c) {
        this.testObject = c;
        this.firstChild = null;
        this.lastChild = null;
        this.parent = null;
        this.next = null;
        this.results = {passed:0, failed:0, total:0, ignored:0, duration:0};
        if (c instanceof YAHOO.tool.TestSuite) {
            this.results.type = "testsuite";
            this.results.name = c.name;
        } else {
            if (c instanceof YAHOO.tool.TestCase) {
                this.results.type = "testcase";
                this.results.name = c.name;
            }
        }
    }

    b.prototype = {appendChild:function (c) {
        var d = new b(c);
        if (this.firstChild === null) {
            this.firstChild = this.lastChild = d;
        } else {
            this.lastChild.next = d;
            this.lastChild = d;
        }
        d.parent = this;
        return d;
    }};
    function a() {
        a.superclass.constructor.apply(this, arguments);
        this.masterSuite = new YAHOO.tool.TestSuite("yuitests" + (new Date()).getTime());
        this._cur = null;
        this._root = null;
        this._running = false;
        this._lastResults = null;
        var d = [this.TEST_CASE_BEGIN_EVENT, this.TEST_CASE_COMPLETE_EVENT, this.TEST_SUITE_BEGIN_EVENT, this.TEST_SUITE_COMPLETE_EVENT, this.TEST_PASS_EVENT, this.TEST_FAIL_EVENT, this.TEST_IGNORE_EVENT, this.COMPLETE_EVENT, this.BEGIN_EVENT];
        for (var c = 0; c < d.length; c++) {
            this.createEvent(d[c], {scope:this});
        }
    }

    YAHOO.lang.extend(a, YAHOO.util.EventProvider, {TEST_CASE_BEGIN_EVENT:"testcasebegin", TEST_CASE_COMPLETE_EVENT:"testcasecomplete", TEST_SUITE_BEGIN_EVENT:"testsuitebegin", TEST_SUITE_COMPLETE_EVENT:"testsuitecomplete", TEST_PASS_EVENT:"pass", TEST_FAIL_EVENT:"fail", TEST_IGNORE_EVENT:"ignore", COMPLETE_EVENT:"complete", BEGIN_EVENT:"begin", getName:function () {
        return this.masterSuite.name;
    }, setName:function (c) {
        this.masterSuite.name = c;
    }, isRunning:function () {
        return this._running;
    }, getResults:function (c) {
        if (!this._running && this._lastResults) {
            if (YAHOO.lang.isFunction(c)) {
                return c(this._lastResults);
            } else {
                return this._lastResults;
            }
        } else {
            return null;
        }
    }, getCoverage:function (c) {
        if (!this._running && typeof _yuitest_coverage == "object") {
            if (YAHOO.lang.isFunction(c)) {
                return c(_yuitest_coverage);
            } else {
                return _yuitest_coverage;
            }
        } else {
            return null;
        }
    }, getName:function () {
        return this.masterSuite.name;
    }, setName:function (c) {
        this.masterSuite.name = c;
    }, _addTestCaseToTestTree:function (c, d) {
        var e = c.appendChild(d);
        for (var f in d) {
            if (f.indexOf("test") === 0 && YAHOO.lang.isFunction(d[f])) {
                e.appendChild(f);
            }
        }
    }, _addTestSuiteToTestTree:function (c, f) {
        var e = c.appendChild(f);
        for (var d = 0; d < f.items.length; d++) {
            if (f.items[d] instanceof YAHOO.tool.TestSuite) {
                this._addTestSuiteToTestTree(e, f.items[d]);
            } else {
                if (f.items[d] instanceof YAHOO.tool.TestCase) {
                    this._addTestCaseToTestTree(e, f.items[d]);
                }
            }
        }
    }, _buildTestTree:function () {
        this._root = new b(this.masterSuite);
        for (var c = 0; c < this.masterSuite.items.length; c++) {
            if (this.masterSuite.items[c] instanceof YAHOO.tool.TestSuite) {
                this._addTestSuiteToTestTree(this._root, this.masterSuite.items[c]);
            } else {
                if (this.masterSuite.items[c] instanceof YAHOO.tool.TestCase) {
                    this._addTestCaseToTestTree(this._root, this.masterSuite.items[c]);
                }
            }
        }
    }, _handleTestObjectComplete:function (c) {
        if (YAHOO.lang.isObject(c.testObject)) {
            c.parent.results.passed += c.results.passed;
            c.parent.results.failed += c.results.failed;
            c.parent.results.total += c.results.total;
            c.parent.results.ignored += c.results.ignored;
            c.parent.results[c.testObject.name] = c.results;
            if (c.testObject instanceof YAHOO.tool.TestSuite) {
                c.testObject.tearDown();
                c.results.duration = (new Date()) - c._start;
                this.fireEvent(this.TEST_SUITE_COMPLETE_EVENT, {testSuite:c.testObject, results:c.results});
            } else {
                if (c.testObject instanceof YAHOO.tool.TestCase) {
                    c.results.duration = (new Date()) - c._start;
                    this.fireEvent(this.TEST_CASE_COMPLETE_EVENT, {testCase:c.testObject, results:c.results});
                }
            }
        }
    }, _next:function () {
        if (this._cur === null) {
            this._cur = this._root;
        } else {
            if (this._cur.firstChild) {
                this._cur = this._cur.firstChild;
            } else {
                if (this._cur.next) {
                    this._cur = this._cur.next;
                } else {
                    while (this._cur && !this._cur.next && this._cur !== this._root) {
                        this._handleTestObjectComplete(this._cur);
                        this._cur = this._cur.parent;
                    }
                    if (this._cur == this._root) {
                        this._cur.results.type = "report";
                        this._cur.results.timestamp = (new Date()).toLocaleString();
                        this._cur.results.duration = (new Date()) - this._cur._start;
                        this._lastResults = this._cur.results;
                        this._running = false;
                        this.fireEvent(this.COMPLETE_EVENT, {results:this._lastResults});
                        this._cur = null;
                    } else {
                        this._handleTestObjectComplete(this._cur);
                        this._cur = this._cur.next;
                    }
                }
            }
        }
        return this._cur;
    }, _run:function () {
        var e = false;
        var d = this._next();
        if (d !== null) {
            this._running = true;
            this._lastResult = null;
            var c = d.testObject;
            if (YAHOO.lang.isObject(c)) {
                if (c instanceof YAHOO.tool.TestSuite) {
                    this.fireEvent(this.TEST_SUITE_BEGIN_EVENT, {testSuite:c});
                    d._start = new Date();
                    c.setUp();
                } else {
                    if (c instanceof YAHOO.tool.TestCase) {
                        this.fireEvent(this.TEST_CASE_BEGIN_EVENT, {testCase:c});
                        d._start = new Date();
                    }
                }
                if (typeof setTimeout != "undefined") {
                    setTimeout(function () {
                        YAHOO.tool.TestRunner._run();
                    }, 0);
                } else {
                    this._run();
                }
            } else {
                this._runTest(d);
            }
        }
    }, _resumeTest:function (h) {
        var c = this._cur;
        var i = c.testObject;
        var f = c.parent.testObject;
        if (f.__yui_wait) {
            clearTimeout(f.__yui_wait);
            delete f.__yui_wait;
        }
        var l = (f._should.fail || {})[i];
        var d = (f._should.error || {})[i];
        var g = false;
        var j = null;
        try {
            h.apply(f);
            if (l) {
                j = new YAHOO.util.ShouldFail();
                g = true;
            } else {
                if (d) {
                    j = new YAHOO.util.ShouldError();
                    g = true;
                }
            }
        } catch (k) {
            if (k instanceof YAHOO.util.AssertionError) {
                if (!l) {
                    j = k;
                    g = true;
                }
            } else {
                if (k instanceof YAHOO.tool.TestCase.Wait) {
                    if (YAHOO.lang.isFunction(k.segment)) {
                        if (YAHOO.lang.isNumber(k.delay)) {
                            if (typeof setTimeout != "undefined") {
                                f.__yui_wait = setTimeout(function () {
                                    YAHOO.tool.TestRunner._resumeTest(k.segment);
                                }, k.delay);
                            } else {
                                throw new Error("Asynchronous tests not supported in this environment.");
                            }
                        }
                    }
                    return;
                } else {
                    if (!d) {
                        j = new YAHOO.util.UnexpectedError(k);
                        g = true;
                    } else {
                        if (YAHOO.lang.isString(d)) {
                            if (k.message != d) {
                                j = new YAHOO.util.UnexpectedError(k);
                                g = true;
                            }
                        } else {
                            if (YAHOO.lang.isFunction(d)) {
                                if (!(k instanceof d)) {
                                    j = new YAHOO.util.UnexpectedError(k);
                                    g = true;
                                }
                            } else {
                                if (YAHOO.lang.isObject(d)) {
                                    if (!(k instanceof d.constructor) || k.message != d.message) {
                                        j = new YAHOO.util.UnexpectedError(k);
                                        g = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (g) {
            this.fireEvent(this.TEST_FAIL_EVENT, {testCase:f, testName:i, error:j});
        } else {
            this.fireEvent(this.TEST_PASS_EVENT, {testCase:f, testName:i});
        }
        f.tearDown();
        var e = (new Date()) - c._start;
        c.parent.results[i] = {result:g ? "fail" : "pass", message:j ? j.getMessage() : "Test passed", type:"test", name:i, duration:e};
        if (g) {
            c.parent.results.failed++;
        } else {
            c.parent.results.passed++;
        }
        c.parent.results.total++;
        if (typeof setTimeout != "undefined") {
            setTimeout(function () {
                YAHOO.tool.TestRunner._run();
            }, 0);
        } else {
            this._run();
        }
    }, _runTest:function (f) {
        var c = f.testObject;
        var d = f.parent.testObject;
        var g = d[c];
        var e = (d._should.ignore || {})[c];
        if (e) {
            f.parent.results[c] = {result:"ignore", message:"Test ignored", type:"test", name:c};
            f.parent.results.ignored++;
            f.parent.results.total++;
            this.fireEvent(this.TEST_IGNORE_EVENT, {testCase:d, testName:c});
            if (typeof setTimeout != "undefined") {
                setTimeout(function () {
                    YAHOO.tool.TestRunner._run();
                }, 0);
            } else {
                this._run();
            }
        } else {
            f._start = new Date();
            d.setUp();
            this._resumeTest(g);
        }
    }, fireEvent:function (c, d) {
        d = d || {};
        d.type = c;
        a.superclass.fireEvent.call(this, c, d);
    }, add:function (c) {
        this.masterSuite.add(c);
    }, clear:function () {
        this.masterSuite = new YAHOO.tool.TestSuite("yuitests" + (new Date()).getTime());
    }, resume:function (c) {
        this._resumeTest(c || function () {
        });
    }, run:function (c) {
        var d = YAHOO.tool.TestRunner;
        if (!c && this.masterSuite.items.length == 1 && this.masterSuite.items[0] instanceof YAHOO.tool.TestSuite) {
            this.masterSuite = this.masterSuite.items[0];
        }
        d._buildTestTree();
        d._root._start = new Date();
        d.fireEvent(d.BEGIN_EVENT);
        d._run();
    }});
    return new a();
})();
YAHOO.namespace("util");
YAHOO.util.Assert = {_formatMessage:function (b, a) {
    var c = b;
    if (YAHOO.lang.isString(b) && b.length > 0) {
        return YAHOO.lang.substitute(b, {message:a});
    } else {
        return a;
    }
}, fail:function (a) {
    throw new YAHOO.util.AssertionError(this._formatMessage(a, "Test force-failed."));
}, areEqual:function (b, c, a) {
    if (b != c) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Values should be equal."), b, c);
    }
}, areNotEqual:function (a, c, b) {
    if (a == c) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(b, "Values should not be equal."), a);
    }
}, areNotSame:function (a, c, b) {
    if (a === c) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(b, "Values should not be the same."), a);
    }
}, areSame:function (b, c, a) {
    if (b !== c) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Values should be the same."), b, c);
    }
}, isFalse:function (b, a) {
    if (false !== b) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value should be false."), false, b);
    }
}, isTrue:function (b, a) {
    if (true !== b) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value should be true."), true, b);
    }
}, isNaN:function (b, a) {
    if (!isNaN(b)) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value should be NaN."), NaN, b);
    }
}, isNotNaN:function (b, a) {
    if (isNaN(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Values should not be NaN."), NaN);
    }
}, isNotNull:function (b, a) {
    if (YAHOO.lang.isNull(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Values should not be null."), null);
    }
}, isNotUndefined:function (b, a) {
    if (YAHOO.lang.isUndefined(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should not be undefined."), undefined);
    }
}, isNull:function (b, a) {
    if (!YAHOO.lang.isNull(b)) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value should be null."), null, b);
    }
}, isUndefined:function (b, a) {
    if (!YAHOO.lang.isUndefined(b)) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value should be undefined."), undefined, b);
    }
}, isArray:function (b, a) {
    if (!YAHOO.lang.isArray(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should be an array."), b);
    }
}, isBoolean:function (b, a) {
    if (!YAHOO.lang.isBoolean(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should be a Boolean."), b);
    }
}, isFunction:function (b, a) {
    if (!YAHOO.lang.isFunction(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should be a function."), b);
    }
}, isInstanceOf:function (b, c, a) {
    if (!(c instanceof b)) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value isn't an instance of expected type."), b, c);
    }
}, isNumber:function (b, a) {
    if (!YAHOO.lang.isNumber(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should be a number."), b);
    }
}, isObject:function (b, a) {
    if (!YAHOO.lang.isObject(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should be an object."), b);
    }
}, isString:function (b, a) {
    if (!YAHOO.lang.isString(b)) {
        throw new YAHOO.util.UnexpectedValue(this._formatMessage(a, "Value should be a string."), b);
    }
}, isTypeOf:function (b, c, a) {
    if (typeof c != b) {
        throw new YAHOO.util.ComparisonFailure(this._formatMessage(a, "Value should be of type " + b + "."), b, typeof c);
    }
}};
YAHOO.util.AssertionError = function (a) {
    this.message = a;
    this.name = "AssertionError";
};
YAHOO.lang.extend(YAHOO.util.AssertionError, Object, {getMessage:function () {
    return this.message;
}, toString:function () {
    return this.name + ": " + this.getMessage();
}});
YAHOO.util.ComparisonFailure = function (b, a, c) {
    YAHOO.util.AssertionError.call(this, b);
    this.expected = a;
    this.actual = c;
    this.name = "ComparisonFailure";
};
YAHOO.lang.extend(YAHOO.util.ComparisonFailure, YAHOO.util.AssertionError, {getMessage:function () {
    return this.message + "\nExpected: " + this.expected + " (" + (typeof this.expected) + ")" + "\nActual:" + this.actual + " (" + (typeof this.actual) + ")";
}});
YAHOO.util.UnexpectedValue = function (b, a) {
    YAHOO.util.AssertionError.call(this, b);
    this.unexpected = a;
    this.name = "UnexpectedValue";
};
YAHOO.lang.extend(YAHOO.util.UnexpectedValue, YAHOO.util.AssertionError, {getMessage:function () {
    return this.message + "\nUnexpected: " + this.unexpected + " (" + (typeof this.unexpected) + ") ";
}});
YAHOO.util.ShouldFail = function (a) {
    YAHOO.util.AssertionError.call(this, a || "This test should fail but didn't.");
    this.name = "ShouldFail";
};
YAHOO.lang.extend(YAHOO.util.ShouldFail, YAHOO.util.AssertionError);
YAHOO.util.ShouldError = function (a) {
    YAHOO.util.AssertionError.call(this, a || "This test should have thrown an error but didn't.");
    this.name = "ShouldError";
};
YAHOO.lang.extend(YAHOO.util.ShouldError, YAHOO.util.AssertionError);
YAHOO.util.UnexpectedError = function (a) {
    YAHOO.util.AssertionError.call(this, "Unexpected error: " + a.message);
    this.cause = a;
    this.name = "UnexpectedError";
    this.stack = a.stack;
};
YAHOO.lang.extend(YAHOO.util.UnexpectedError, YAHOO.util.AssertionError);
YAHOO.util.ArrayAssert = {contains:function (e, d, b) {
    var c = false;
    var f = YAHOO.util.Assert;
    for (var a = 0; a < d.length && !c; a++) {
        if (d[a] === e) {
            c = true;
        }
    }
    if (!c) {
        f.fail(f._formatMessage(b, "Value " + e + " (" + (typeof e) + ") not found in array [" + d + "]."));
    }
}, containsItems:function (c, d, b) {
    for (var a = 0; a < c.length; a++) {
        this.contains(c[a], d, b);
    }
}, containsMatch:function (e, d, b) {
    if (typeof e != "function") {
        throw new TypeError("ArrayAssert.containsMatch(): First argument must be a function.");
    }
    var c = false;
    var f = YAHOO.util.Assert;
    for (var a = 0; a < d.length && !c; a++) {
        if (e(d[a])) {
            c = true;
        }
    }
    if (!c) {
        f.fail(f._formatMessage(b, "No match found in array [" + d + "]."));
    }
}, doesNotContain:function (e, d, b) {
    var c = false;
    var f = YAHOO.util.Assert;
    for (var a = 0; a < d.length && !c; a++) {
        if (d[a] === e) {
            c = true;
        }
    }
    if (c) {
        f.fail(f._formatMessage(b, "Value found in array [" + d + "]."));
    }
}, doesNotContainItems:function (c, d, b) {
    for (var a = 0; a < c.length; a++) {
        this.doesNotContain(c[a], d, b);
    }
}, doesNotContainMatch:function (e, d, b) {
    if (typeof e != "function") {
        throw new TypeError("ArrayAssert.doesNotContainMatch(): First argument must be a function.");
    }
    var c = false;
    var f = YAHOO.util.Assert;
    for (var a = 0; a < d.length && !c; a++) {
        if (e(d[a])) {
            c = true;
        }
    }
    if (c) {
        f.fail(f._formatMessage(b, "Value found in array [" + d + "]."));
    }
}, indexOf:function (e, d, a, c) {
    for (var b = 0; b < d.length; b++) {
        if (d[b] === e) {
            YAHOO.util.Assert.areEqual(a, b, c || "Value exists at index " + b + " but should be at index " + a + ".");
            return;
        }
    }
    var f = YAHOO.util.Assert;
    f.fail(f._formatMessage(c, "Value doesn't exist in array [" + d + "]."));
}, itemsAreEqual:function (d, f, c) {
    var a = Math.max(d.length, f.length || 0);
    var e = YAHOO.util.Assert;
    for (var b = 0; b < a; b++) {
        e.areEqual(d[b], f[b], e._formatMessage(c, "Values in position " + b + " are not equal."));
    }
}, itemsAreEquivalent:function (e, f, b, d) {
    if (typeof b != "function") {
        throw new TypeError("ArrayAssert.itemsAreEquivalent(): Third argument must be a function.");
    }
    var a = Math.max(e.length, f.length || 0);
    for (var c = 0; c < a; c++) {
        if (!b(e[c], f[c])) {
            throw new YAHOO.util.ComparisonFailure(YAHOO.util.Assert._formatMessage(d, "Values in position " + c + " are not equivalent."), e[c], f[c]);
        }
    }
}, isEmpty:function (c, a) {
    if (c.length > 0) {
        var b = YAHOO.util.Assert;
        b.fail(b._formatMessage(a, "Array should be empty."));
    }
}, isNotEmpty:function (c, a) {
    if (c.length === 0) {
        var b = YAHOO.util.Assert;
        b.fail(b._formatMessage(a, "Array should not be empty."));
    }
}, itemsAreSame:function (d, f, c) {
    var a = Math.max(d.length, f.length || 0);
    var e = YAHOO.util.Assert;
    for (var b = 0; b < a; b++) {
        e.areSame(d[b], f[b], e._formatMessage(c, "Values in position " + b + " are not the same."));
    }
}, lastIndexOf:function (e, d, a, c) {
    var f = YAHOO.util.Assert;
    for (var b = d.length; b >= 0; b--) {
        if (d[b] === e) {
            f.areEqual(a, b, f._formatMessage(c, "Value exists at index " + b + " but should be at index " + a + "."));
            return;
        }
    }
    f.fail(f._formatMessage(c, "Value doesn't exist in array."));
}};
YAHOO.namespace("util");
YAHOO.util.ObjectAssert = {propertiesAreEqual:function (d, g, c) {
    var f = YAHOO.util.Assert;
    var b = [];
    for (var e in d) {
        b.push(e);
    }
    for (var a = 0; a < b.length; a++) {
        f.isNotUndefined(g[b[a]], f._formatMessage(c, "Property '" + b[a] + "' expected."));
    }
}, hasProperty:function (a, b, c) {
    if (!(a in b)) {
        var d = YAHOO.util.Assert;
        d.fail(d._formatMessage(c, "Property '" + a + "' not found on object."));
    }
}, hasOwnProperty:function (a, b, c) {
    if (!YAHOO.lang.hasOwnProperty(b, a)) {
        var d = YAHOO.util.Assert;
        d.fail(d._formatMessage(c, "Property '" + a + "' not found on object instance."));
    }
}};
YAHOO.util.DateAssert = {datesAreEqual:function (b, d, a) {
    if (b instanceof Date && d instanceof Date) {
        var c = YAHOO.util.Assert;
        c.areEqual(b.getFullYear(), d.getFullYear(), c._formatMessage(a, "Years should be equal."));
        c.areEqual(b.getMonth(), d.getMonth(), c._formatMessage(a, "Months should be equal."));
        c.areEqual(b.getDate(), d.getDate(), c._formatMessage(a, "Day of month should be equal."));
    } else {
        throw new TypeError("DateAssert.datesAreEqual(): Expected and actual values must be Date objects.");
    }
}, timesAreEqual:function (b, d, a) {
    if (b instanceof Date && d instanceof Date) {
        var c = YAHOO.util.Assert;
        c.areEqual(b.getHours(), d.getHours(), c._formatMessage(a, "Hours should be equal."));
        c.areEqual(b.getMinutes(), d.getMinutes(), c._formatMessage(a, "Minutes should be equal."));
        c.areEqual(b.getSeconds(), d.getSeconds(), c._formatMessage(a, "Seconds should be equal."));
    } else {
        throw new TypeError("DateAssert.timesAreEqual(): Expected and actual values must be Date objects.");
    }
}};
YAHOO.namespace("tool");
YAHOO.tool.TestManager = {TEST_PAGE_BEGIN_EVENT:"testpagebegin", TEST_PAGE_COMPLETE_EVENT:"testpagecomplete", TEST_MANAGER_BEGIN_EVENT:"testmanagerbegin", TEST_MANAGER_COMPLETE_EVENT:"testmanagercomplete", _curPage:null, _frame:null, _logger:null, _timeoutId:0, _pages:[], _results:null, _handleTestRunnerComplete:function (a) {
    this.fireEvent(this.TEST_PAGE_COMPLETE_EVENT, {page:this._curPage, results:a.results});
    this._processResults(this._curPage, a.results);
    this._logger.clearTestRunner();
    if (this._pages.length) {
        this._timeoutId = setTimeout(function () {
            YAHOO.tool.TestManager._run();
        }, 1000);
    } else {
        this.fireEvent(this.TEST_MANAGER_COMPLETE_EVENT, this._results);
    }
}, _processResults:function (c, a) {
    var b = this._results;
    b.passed += a.passed;
    b.failed += a.failed;
    b.ignored += a.ignored;
    b.total += a.total;
    b.duration += a.duration;
    if (a.failed) {
        b.failedPages.push(c);
    } else {
        b.passedPages.push(c);
    }
    a.name = c;
    a.type = "page";
    b[c] = a;
}, _run:function () {
    this._curPage = this._pages.shift();
    this.fireEvent(this.TEST_PAGE_BEGIN_EVENT, this._curPage);
    this._frame.location.replace(this._curPage);
}, load:function () {
    if (parent.YAHOO.tool.TestManager !== this) {
        parent.YAHOO.tool.TestManager.load();
    } else {
        if (this._frame) {
            var a = this._frame.YAHOO.tool.TestRunner;
            this._logger.setTestRunner(a);
            a.subscribe(a.COMPLETE_EVENT, this._handleTestRunnerComplete, this, true);
            a.run();
        }
    }
}, setPages:function (a) {
    this._pages = a;
}, start:function () {
    if (!this._initialized) {
        this.createEvent(this.TEST_PAGE_BEGIN_EVENT);
        this.createEvent(this.TEST_PAGE_COMPLETE_EVENT);
        this.createEvent(this.TEST_MANAGER_BEGIN_EVENT);
        this.createEvent(this.TEST_MANAGER_COMPLETE_EVENT);
        if (!this._frame) {
            var a = document.createElement("iframe");
            a.style.visibility = "hidden";
            a.style.position = "absolute";
            document.body.appendChild(a);
            this._frame = a.contentWindow || a.contentDocument.parentWindow;
        }
        if (!this._logger) {
            this._logger = new YAHOO.tool.TestLogger();
        }
        this._initialized = true;
    }
    this._results = {passed:0, failed:0, ignored:0, total:0, type:"report", name:"YUI Test Results", duration:0, failedPages:[], passedPages:[]};
    this.fireEvent(this.TEST_MANAGER_BEGIN_EVENT, null);
    this._run();
}, stop:function () {
    clearTimeout(this._timeoutId);
}};
YAHOO.lang.augmentObject(YAHOO.tool.TestManager, YAHOO.util.EventProvider.prototype);
YAHOO.namespace("tool");
YAHOO.tool.TestLogger = function (b, a) {
    YAHOO.tool.TestLogger.superclass.constructor.call(this, b, a);
    this.init();
};
YAHOO.lang.extend(YAHOO.tool.TestLogger, YAHOO.widget.LogReader, {footerEnabled:true, newestOnTop:false, formatMsg:function (b) {
    var a = b.category;
    var c = this.html2Text(b.msg);
    return'<pre><p><span class="' + a + '">' + a.toUpperCase() + "</span> " + c + "</p></pre>";
}, init:function () {
    if (YAHOO.tool.TestRunner) {
        this.setTestRunner(YAHOO.tool.TestRunner);
    }
    this.hideSource("global");
    this.hideSource("LogReader");
    this.hideCategory("warn");
    this.hideCategory("window");
    this.hideCategory("time");
    this.clearConsole();
}, clearTestRunner:function () {
    if (this._runner) {
        this._runner.unsubscribeAll();
        this._runner = null;
    }
}, setTestRunner:function (a) {
    if (this._runner) {
        this.clearTestRunner();
    }
    this._runner = a;
    a.subscribe(a.TEST_PASS_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.TEST_FAIL_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.TEST_IGNORE_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.BEGIN_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.COMPLETE_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.TEST_SUITE_BEGIN_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.TEST_SUITE_COMPLETE_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.TEST_CASE_BEGIN_EVENT, this._handleTestRunnerEvent, this, true);
    a.subscribe(a.TEST_CASE_COMPLETE_EVENT, this._handleTestRunnerEvent, this, true);
}, _handleTestRunnerEvent:function (d) {
    var a = YAHOO.tool.TestRunner;
    var c = "";
    var b = "";
    switch (d.type) {
        case a.BEGIN_EVENT:
            c = "Testing began at " + (new Date()).toString() + ".";
            b = "info";
            break;
        case a.COMPLETE_EVENT:
            c = "Testing completed at " + (new Date()).toString() + ".\nPassed:" + d.results.passed + " Failed:" + d.results.failed + " Total:" + d.results.total;
            b = "info";
            break;
        case a.TEST_FAIL_EVENT:
            c = d.testName + ": " + d.error.getMessage();
            b = "fail";
            break;
        case a.TEST_IGNORE_EVENT:
            c = d.testName + ": ignored.";
            b = "ignore";
            break;
        case a.TEST_PASS_EVENT:
            c = d.testName + ": passed.";
            b = "pass";
            break;
        case a.TEST_SUITE_BEGIN_EVENT:
            c = 'Test suite "' + d.testSuite.name + '" started.';
            b = "info";
            break;
        case a.TEST_SUITE_COMPLETE_EVENT:
            c = 'Test suite "' + d.testSuite.name + '" completed.\nPassed:' + d.results.passed + " Failed:" + d.results.failed + " Total:" + d.results.total;
            b = "info";
            break;
        case a.TEST_CASE_BEGIN_EVENT:
            c = 'Test case "' + d.testCase.name + '" started.';
            b = "info";
            break;
        case a.TEST_CASE_COMPLETE_EVENT:
            c = 'Test case "' + d.testCase.name + '" completed.\nPassed:' + d.results.passed + " Failed:" + d.results.failed + " Total:" + d.results.total;
            b = "info";
            break;
        default:
            c = "Unexpected event " + d.type;
            c = "info";
    }
    YAHOO.log(c, b, "TestRunner");
}});
YAHOO.namespace("tool.TestFormat");
(function () {
    YAHOO.tool.TestFormat.JSON = function (b) {
        return YAHOO.lang.JSON.stringify(b);
    };
    function a(b) {
        return b.replace(/["'<>&]/g, function (d) {
            switch (d) {
                case"<":
                    return"&lt;";
                case">":
                    return"&gt;";
                case'"':
                    return"&quot;";
                case"'":
                    return"&apos;";
                case"&":
                    return"&amp;";
            }
        });
    }

    YAHOO.tool.TestFormat.XML = function (c) {
        function b(f) {
            var d = YAHOO.lang, e = "<" + f.type + ' name="' + a(f.name) + '"';
            if (d.isNumber(f.duration)) {
                e += ' duration="' + f.duration + '"';
            }
            if (f.type == "test") {
                e += ' result="' + f.result + '" message="' + a(f.message) + '">';
            } else {
                e += ' passed="' + f.passed + '" failed="' + f.failed + '" ignored="' + f.ignored + '" total="' + f.total + '">';
                for (var g in f) {
                    if (d.hasOwnProperty(f, g) && d.isObject(f[g]) && !d.isArray(f[g])) {
                        e += b(f[g]);
                    }
                }
            }
            e += "</" + f.type + ">";
            return e;
        }

        return'<?xml version="1.0" encoding="UTF-8"?>' + b(c);
    };
    YAHOO.tool.TestFormat.JUnitXML = function (b) {
        function c(f) {
            var d = YAHOO.lang, e = "", g;
            switch (f.type) {
                case"test":
                    if (f.result != "ignore") {
                        e = '<testcase name="' + a(f.name) + '">';
                        if (f.result == "fail") {
                            e += '<failure message="' + a(f.message) + '"><![CDATA[' + f.message + "]]></failure>";
                        }
                        e += "</testcase>";
                    }
                    break;
                case"testcase":
                    e = '<testsuite name="' + a(f.name) + '" tests="' + f.total + '" failures="' + f.failed + '">';
                    for (g in f) {
                        if (d.hasOwnProperty(f, g) && d.isObject(f[g]) && !d.isArray(f[g])) {
                            e += c(f[g]);
                        }
                    }
                    e += "</testsuite>";
                    break;
                case"testsuite":
                    for (g in f) {
                        if (d.hasOwnProperty(f, g) && d.isObject(f[g]) && !d.isArray(f[g])) {
                            e += c(f[g]);
                        }
                    }
                    break;
                case"report":
                    e = "<testsuites>";
                    for (g in f) {
                        if (d.hasOwnProperty(f, g) && d.isObject(f[g]) && !d.isArray(f[g])) {
                            e += c(f[g]);
                        }
                    }
                    e += "</testsuites>";
            }
            return e;
        }

        return'<?xml version="1.0" encoding="UTF-8"?>' + c(b);
    };
    YAHOO.tool.TestFormat.TAP = function (c) {
        var d = 1;

        function b(f) {
            var e = YAHOO.lang, g = "";
            switch (f.type) {
                case"test":
                    if (f.result != "ignore") {
                        g = "ok " + (d++) + " - " + f.name;
                        if (f.result == "fail") {
                            g = "not " + g + " - " + f.message;
                        }
                        g += "\n";
                    } else {
                        g = "#Ignored test " + f.name + "\n";
                    }
                    break;
                case"testcase":
                    g = "#Begin testcase " + f.name + "(" + f.failed + " failed of " + f.total + ")\n";
                    for (prop in f) {
                        if (e.hasOwnProperty(f, prop) && e.isObject(f[prop]) && !e.isArray(f[prop])) {
                            g += b(f[prop]);
                        }
                    }
                    g += "#End testcase " + f.name + "\n";
                    break;
                case"testsuite":
                    g = "#Begin testsuite " + f.name + "(" + f.failed + " failed of " + f.total + ")\n";
                    for (prop in f) {
                        if (e.hasOwnProperty(f, prop) && e.isObject(f[prop]) && !e.isArray(f[prop])) {
                            g += b(f[prop]);
                        }
                    }
                    g += "#End testsuite " + f.name + "\n";
                    break;
                case"report":
                    for (prop in f) {
                        if (e.hasOwnProperty(f, prop) && e.isObject(f[prop]) && !e.isArray(f[prop])) {
                            g += b(f[prop]);
                        }
                    }
            }
            return g;
        }

        return"1.." + c.total + "\n" + b(c);
    };
})();
YAHOO.namespace("tool.CoverageFormat");
YAHOO.tool.CoverageFormat.JSON = function (a) {
    return YAHOO.lang.JSON.stringify(a);
};
YAHOO.tool.CoverageFormat.XdebugJSON = function (b) {
    var a = {}, c;
    for (c in b) {
        if (b.hasOwnProperty(c)) {
            a[c] = b[c].lines;
        }
    }
    return YAHOO.lang.JSON.stringify(a);
};
YAHOO.namespace("tool");
YAHOO.tool.TestReporter = function (a, b) {
    this.url = a;
    this.format = b || YAHOO.tool.TestFormat.XML;
    this._fields = new Object();
    this._form = null;
    this._iframe = null;
};
YAHOO.tool.TestReporter.prototype = {constructor:YAHOO.tool.TestReporter, _convertToISOString:function (a) {
    function b(c) {
        return c < 10 ? "0" + c : c;
    }

    return a.getUTCFullYear() + "-" + b(a.getUTCMonth() + 1) + "-" + b(a.getUTCDate()) + "T" + b(a.getUTCHours()) + ":" + b(a.getUTCMinutes()) + ":" + b(a.getUTCSeconds()) + "Z";
}, addField:function (a, b) {
    this._fields[a] = b;
}, clearFields:function () {
    this._fields = new Object();
}, destroy:function () {
    if (this._form) {
        this._form.parentNode.removeChild(this._form);
        this._form = null;
    }
    if (this._iframe) {
        this._iframe.parentNode.removeChild(this._iframe);
        this._iframe = null;
    }
    this._fields = null;
}, report:function (a) {
    if (!this._form) {
        this._form = document.createElement("form");
        this._form.method = "post";
        this._form.style.visibility = "hidden";
        this._form.style.position = "absolute";
        this._form.style.top = 0;
        document.body.appendChild(this._form);
        if (YAHOO.env.ua.ie) {
            this._iframe = document.createElement('<iframe name="yuiTestTarget" />');
        } else {
            this._iframe = document.createElement("iframe");
            this._iframe.name = "yuiTestTarget";
        }
        this._iframe.src = "javascript:false";
        this._iframe.style.visibility = "hidden";
        this._iframe.style.position = "absolute";
        this._iframe.style.top = 0;
        document.body.appendChild(this._iframe);
        this._form.target = "yuiTestTarget";
    }
    this._form.action = this.url;
    while (this._form.hasChildNodes()) {
        this._form.removeChild(this._form.lastChild);
    }
    this._fields.results = this.format(a);
    this._fields.useragent = navigator.userAgent;
    this._fields.timestamp = this._convertToISOString(new Date());
    for (var b in this._fields) {
        if (YAHOO.lang.hasOwnProperty(this._fields, b) && typeof this._fields[b] != "function") {
            if (YAHOO.env.ua.ie) {
                input = document.createElement('<input name="' + b + '" >');
            } else {
                input = document.createElement("input");
                input.name = b;
            }
            input.type = "hidden";
            input.value = this._fields[b];
            this._form.appendChild(input);
        }
    }
    delete this._fields.results;
    delete this._fields.useragent;
    delete this._fields.timestamp;
    if (arguments[1] !== false) {
        this._form.submit();
    }
}};
YUITest = {TestRunner:YAHOO.tool.TestRunner, ResultsFormat:YAHOO.tool.TestFormat, CoverageFormat:YAHOO.tool.CoverageFormat};
YAHOO.register("yuitest", YAHOO.tool.TestRunner, {version:"2.9.0", build:"2800"});