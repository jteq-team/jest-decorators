
/**
 * @hidden
 */
declare var describe: any;

/**
 * @hidden
 */
declare var it: any;

/**
 * @hidden
 */
declare var beforeAll: any;

/**
 * @hidden
 */
declare var beforeEach: any;

/**
 * @hidden
 */
declare var afterEach: any;

/**
 * @hidden
 */
declare var afterAll: any;

import { Type } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';

export type DoneCallback = () => void;

/**
 * Defines the test suite behavior
 */
export enum TestTypes {
  /**
   * Causes test runner to inject a ComponentFixture into your tests versus just an instance of what you're testing
   */
  Component,
  /**
   * Default behavior, injects a new instance of what is being tested into each test case
   */
  Service
}

/**
 * @hidden
 */
interface TestMetadata {
  attr: string;
  testName: string;
}

/**
 * Configuration that gets passed to the angular test bench. Used for adding dependencies to what's being tested.
 */
interface DescribeConfig {
  /**
   * Defines components that can be dynamically created (i.e. modals)
   */
  entryComponents?: Type<any>[];
  /**
   * Defines classes that can be used as components
   */
  declarations?: Type<any>[];
  /**
   * Defines classes that can be injected into other classes within this module
   */
  providers?: Type<any>[];
  /**
   * Defines the behavior of the test runner.
   * @default TestTypes.Service
   */
  testType?: TestTypes;
}

/**
 * Configuration that defines the test target and the angular test bench configuration. Used for adding dependencies to what's being tested.
 */
interface TestCaseConfig<T> extends DescribeConfig {
  target: Type<T>;
}

/**
 * @hidden
 */
interface TestSuiteMetadata {
  tests: TestMetadata[];
  beforeAll: string[];
  beforeEach: string[];
  afterEach: string[];
  afterAll: string[];
  testTarget: any;
  testBedConfig: DescribeConfig;
}

/**
 * An interface that all test suites should follow. Enforces the types that are used in each test case.
 */
export type Spec<S, T> = {
  [P in keyof S]: S[P] extends Function ? S[P] extends (arg: T, done?: () => void) => any ? S[P] : never : S[P];
};

/**
 * @hidden
 */
const Storage = new WeakMap<any, TestSuiteMetadata>();

/**
 * @hidden
 */
function getOrDefault (target: any): TestSuiteMetadata {
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
function Hook (type: 'beforeAll'|'beforeEach'|'afterEach'|'afterAll') {
  return (target: any, attr: string, desc: PropertyDescriptor) => {
    let storage = getOrDefault(target.constructor);
    storage = {
      ...storage,
      [type]: [
        ...storage[type],
        attr
      ]
    };
    Storage.set(target.constructor, storage);
    return desc;
  };
}

/**
 * Decorator for functions that should be run before each test case. Useful for resetting test data
 */
export function BeforeEach () {
  return Hook('beforeEach');
}

/**
 * Decorator for functions that should be run once, before any test case runs. Useful for prepping test data
 */
export function BeforeAll () {
  return Hook('beforeAll');
}

/**
 * Decorator for functions that should be run after each test case. Useful for clearing data
 */
export function AfterEach () {
  return Hook('afterEach');
}

/**
 * Decorator for functions that should be run once, before any test case runs. Useful for tearing down a test suite
 */
export function AfterAll () {
  return Hook('afterAll');
}

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
export function Describe<T, P extends Spec<P, T>>(testTarget: Type<T>, testBedConfig: DescribeConfig = {}): ClassDecorator {
  if (!('testType' in testBedConfig)) {
    testBedConfig.testType = TestTypes.Service;
  }

  return (target: any) => {
    let storage = getOrDefault(target);
    storage = {
      ...storage,
      testBedConfig: {
        ...testBedConfig,
        declarations: [
          ...(testBedConfig.declarations || []).concat(testBedConfig.testType === TestTypes.Component ? [testTarget] : [])
        ],
        providers: [
          ...(testBedConfig.providers || []).concat(testBedConfig.testType === TestTypes.Service ? [testTarget] : []),
          target
        ]
      },
      testTarget
    };
    Storage.set(target, storage);
    runSuite(target);
  };
}

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
export const It: MethodDecorator = (target: any, attr: string|symbol, desc?: PropertyDescriptor) => {
  let storage = getOrDefault(target.constructor);
  const testName = attr.toString();
  storage = {
    ...storage,
    tests: [
      ...storage.tests,
      {
        attr: testName,
        testName
      }
    ]
  };
  Storage.set(target.constructor, storage);
  return desc;
}

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
export function TestSuite<T>(config: TestCaseConfig<T>): ClassDecorator {
  return Describe(config.target, config);
}

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
export function TestCase (testName?: string): MethodDecorator {
  return (target: any, attr: string|symbol, desc: PropertyDescriptor) => {
    testName = testName || attr.toString();
    let storage = getOrDefault(target.constructor);
    storage = {
      ...storage,
      tests: [
        ...storage.tests,
        {
          attr: attr.toString(),
          testName
        }
      ]
    };
    Storage.set(target.constructor, storage);
    return desc;
  };
}

/**
 * @hidden
 */
function runSuite(func: Function) {
  const configuredTests = Storage.get(func);
  describe(configuredTests.testTarget, () => {
    let arg: any;
    let test: any;
    const prepArgs = () => {
      const mod = TestBed.configureTestingModule(configuredTests.testBedConfig);
      if (!test) {
        test = TestBed.get(func);
      }
      switch (configuredTests.testBedConfig.testType) {
        case TestTypes.Service:
          arg = TestBed.get(configuredTests.testTarget);
          break;
        case TestTypes.Component:
          mod.compileComponents().then(() => {
            arg = TestBed.createComponent(configuredTests.testTarget);
          });
          break;
      }
    };

    if (configuredTests.beforeAll.length) {
      beforeAll(async(prepArgs));
    }
    beforeEach(async(prepArgs));

    configuredTests.beforeAll.forEach(hookName => {
      const length = func.prototype[hookName].length;
      if (length < 2) {
        beforeAll(() => {
          return test[hookName](arg);
        });
      } else {
        beforeAll((done: any) => {
          test[hookName](arg, done);
        });
      }
    });

    configuredTests.beforeEach.forEach(hookName => {
      const length = func.prototype[hookName].length;
      if (length < 2) {
        beforeEach(() => {
          return test[hookName](arg);
        });
      } else {
        beforeEach((done: any) => {
          test[hookName](arg, done);
        });
      }
    });

    configuredTests.afterEach.forEach(hookName => {
      const length = func.prototype[hookName].length;
      if (length < 2) {
        afterEach(() => {
          return test[hookName](arg);
        });
      } else {
        afterEach((done: any) => {
          test[hookName](arg, done);
        });
      }
    });

    configuredTests.afterAll.forEach(hookName => {
      const length = func.prototype[hookName].length;
      if (length < 2) {
        afterAll(() => {
          return test[hookName](arg);
        });
      } else {
        afterAll((done: any) => {
          test[hookName](arg, done);
        });
      }
    });

    configuredTests.tests.forEach(testMetadata => {
      const { testName, attr } = testMetadata;
      const length = func.prototype[attr].length;
      if (length < 2) {
        it(testName, () => {
          return test[attr](arg);
        });
      } else {
        it(testName, (done: any) => {
          test[attr](arg, done);
        });
      }
    });
  });
}
