"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular/core/testing");
/**
 * Defines the test suite behavior
 */
var TestTypes;
(function (TestTypes) {
    /**
     * Causes test runner to inject a ComponentFixture into your tests versus just an instance of what you're testing
     */
    TestTypes[TestTypes["Component"] = 0] = "Component";
    /**
     * Default behavior, injects a new instance of what is being tested into each test case
     */
    TestTypes[TestTypes["Service"] = 1] = "Service";
})(TestTypes = exports.TestTypes || (exports.TestTypes = {}));
/**
 * @hidden
 */
var Storage = new WeakMap();
/**
 * @hidden
 */
function getOrDefault(target) {
    return Storage.get(target) || {
        tests: [],
        beforeAll: [],
        beforeEach: [],
        afterEach: [],
        afterAll: [],
        testTarget: null,
        testBedConfig: null
    };
}
/**
 * @hidden
 */
function Hook(type) {
    return function (target, attr, desc) {
        var _a;
        var storage = getOrDefault(target.constructor);
        storage = __assign({}, storage, (_a = {}, _a[type] = storage[type].concat([
            attr
        ]), _a));
        Storage.set(target.constructor, storage);
        return desc;
    };
}
/**
 * Decorator for functions that should be run before each test case. Useful for resetting test data
 */
function BeforeEach() {
    return Hook('beforeEach');
}
exports.BeforeEach = BeforeEach;
/**
 * Decorator for functions that should be run once, before any test case runs. Useful for prepping test data
 */
function BeforeAll() {
    return Hook('beforeAll');
}
exports.BeforeAll = BeforeAll;
/**
 * Decorator for functions that should be run after each test case. Useful for clearing data
 */
function AfterEach() {
    return Hook('afterEach');
}
exports.AfterEach = AfterEach;
/**
 * Decorator for functions that should be run once, before any test case runs. Useful for tearing down a test suite
 */
function AfterAll() {
    return Hook('afterAll');
}
exports.AfterAll = AfterAll;
/**
 * Decorator for a test suite.
 * Reads more like a traditional jest test.
 * Should be used with It
 *
 * ex.
 *
 * ```js
 * import { SomeService } from './some.service.ts';
 * import { Describe, It } from 'angular-test-decorators';
 *
 * @Decribe(SomeService)
 * export class SomeServiceSpec {
 *   @It 'should exist' (someService: SomeService) {
 *     expect(someService).not.to.be(undefined);
 *   }
 * }
 * ```
 */
function Describe(testTarget, testBedConfig) {
    if (testBedConfig === void 0) { testBedConfig = {}; }
    if (!('testType' in testBedConfig)) {
        testBedConfig.testType = TestTypes.Service;
    }
    return function (target) {
        var storage = getOrDefault(target);
        storage = __assign({}, storage, { testBedConfig: __assign({}, testBedConfig, { declarations: (testBedConfig.declarations || []).concat(testBedConfig.testType === TestTypes.Component ? [testTarget] : []).slice(), providers: (testBedConfig.providers || []).concat(testBedConfig.testType === TestTypes.Service ? [testTarget] : []).concat([
                    target
                ]) }), testTarget: testTarget });
        Storage.set(target, storage);
        runSuite(target);
    };
}
exports.Describe = Describe;
/**
 * Decorator for each test case in a given test
 * Should be used with Describe
 * Reads more like a traditional jest test
 *
 * ex.
 *
 * ```js
 * @It 'should add 1 and 1' () {
 *   expect(1 + 1).to.equal(2);
 * }
 * ```
 */
exports.It = function (target, attr, desc) {
    var storage = getOrDefault(target.constructor);
    var testName = attr.toString();
    storage = __assign({}, storage, { tests: storage.tests.concat([
            {
                attr: testName,
                testName: testName
            }
        ]) });
    Storage.set(target.constructor, storage);
    return desc;
};
/**
 * Decorator for a test suite.
 * Reads more like an mstest
 * Should be used with TestCase
 *
 * ex.
 *
 * ```js
 * import { SomeService } from './some.service.ts';
 * import { TestSuite, TestCase } from 'angular-test-decorators';
 *
 * @TestSuite({
 *   target: SomeService
 * })
 * export class SomeServiceSpec {
 *   @TestCase('should exist')
 *   testShouldExist (someService: SomeService) {
 *     expect(someService).not.to.be(undefined);
 *   }
 * }
 * ```
 */
function TestSuite(config) {
    return Describe(config.target, config);
}
exports.TestSuite = TestSuite;
/**
 * Decorator for each test case in a given test suite
 * Should be used with TestSuite
 * Reads more like an mstest
 *
 *
 * ex.
 *
 * ```js
 * @TestCase('should add 1 and 1')
 * testAdd1And1 () {
 *   expect(1 + 1).to.equal(2);
 * }
 * ```
 */
function TestCase(testName) {
    return function (target, attr, desc) {
        testName = testName || attr.toString();
        var storage = getOrDefault(target.constructor);
        storage = __assign({}, storage, { tests: storage.tests.concat([
                {
                    attr: attr.toString(),
                    testName: testName
                }
            ]) });
        Storage.set(target.constructor, storage);
        return desc;
    };
}
exports.TestCase = TestCase;
/**
 * @hidden
 */
function runSuite(func) {
    var configuredTests = Storage.get(func);
    describe(configuredTests.testTarget, function () {
        var arg;
        var test;
        var prepArgs = function () {
            var mod = testing_1.TestBed.configureTestingModule(configuredTests.testBedConfig);
            if (!test) {
                test = testing_1.TestBed.get(func);
            }
            switch (configuredTests.testBedConfig.testType) {
                case TestTypes.Service:
                    arg = testing_1.TestBed.get(configuredTests.testTarget);
                    break;
                case TestTypes.Component:
                    mod.compileComponents().then(function () {
                        arg = testing_1.TestBed.createComponent(configuredTests.testTarget);
                    });
                    break;
            }
        };
        if (configuredTests.beforeAll.length) {
            beforeAll(testing_1.async(prepArgs));
        }
        beforeEach(testing_1.async(prepArgs));
        configuredTests.beforeAll.forEach(function (hookName) {
            var length = func.prototype[hookName].length;
            if (length < 2) {
                beforeAll(function () {
                    return test[hookName](arg);
                });
            }
            else {
                beforeAll(function (done) {
                    test[hookName](arg, done);
                });
            }
        });
        configuredTests.beforeEach.forEach(function (hookName) {
            var length = func.prototype[hookName].length;
            if (length < 2) {
                beforeEach(function () {
                    return test[hookName](arg);
                });
            }
            else {
                beforeEach(function (done) {
                    test[hookName](arg, done);
                });
            }
        });
        configuredTests.afterEach.forEach(function (hookName) {
            var length = func.prototype[hookName].length;
            if (length < 2) {
                afterEach(function () {
                    return test[hookName](arg);
                });
            }
            else {
                afterEach(function (done) {
                    test[hookName](arg, done);
                });
            }
        });
        configuredTests.afterAll.forEach(function (hookName) {
            var length = func.prototype[hookName].length;
            if (length < 2) {
                afterAll(function () {
                    return test[hookName](arg);
                });
            }
            else {
                afterAll(function (done) {
                    test[hookName](arg, done);
                });
            }
        });
        configuredTests.tests.forEach(function (testMetadata) {
            var testName = testMetadata.testName, attr = testMetadata.attr;
            var length = func.prototype[attr].length;
            if (length < 2) {
                it(testName, function () {
                    return test[attr](arg);
                });
            }
            else {
                it(testName, function (done) {
                    test[attr](arg, done);
                });
            }
        });
    });
}
