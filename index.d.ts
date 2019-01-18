import { Type } from '@angular/core';
export declare type DoneCallback = () => void;
/**
 * Defines the test suite behavior
 */
export declare enum TestTypes {
    /**
     * Causes test runner to inject a ComponentFixture into your tests versus just an instance of what you're testing
     */
    Component = 0,
    /**
     * Default behavior, injects a new instance of what is being tested into each test case
     */
    Service = 1
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
 * An interface that all test suites should follow. Enforces the types that are used in each test case.
 */
export declare type Spec<S, T> = {
    [P in keyof S]: S[P] extends Function ? S[P] extends (arg: T, done?: () => void) => any ? S[P] : never : S[P];
};
/**
 * Decorator for functions that should be run before each test case. Useful for resetting test data
 */
export declare function BeforeEach(): (target: any, attr: string, desc: PropertyDescriptor) => PropertyDescriptor;
/**
 * Decorator for functions that should be run once, before any test case runs. Useful for prepping test data
 */
export declare function BeforeAll(): (target: any, attr: string, desc: PropertyDescriptor) => PropertyDescriptor;
/**
 * Decorator for functions that should be run after each test case. Useful for clearing data
 */
export declare function AfterEach(): (target: any, attr: string, desc: PropertyDescriptor) => PropertyDescriptor;
/**
 * Decorator for functions that should be run once, before any test case runs. Useful for tearing down a test suite
 */
export declare function AfterAll(): (target: any, attr: string, desc: PropertyDescriptor) => PropertyDescriptor;
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
export declare function Describe<T, P extends Spec<P, T>>(testTarget: Type<T>, testBedConfig?: DescribeConfig): ClassDecorator;
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
export declare const It: MethodDecorator;
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
export declare function TestSuite<T>(config: TestCaseConfig<T>): ClassDecorator;
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
export declare function TestCase(testName?: string): MethodDecorator;
export {};
//# sourceMappingURL=index.d.ts.map