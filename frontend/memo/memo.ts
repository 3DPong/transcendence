/** -------------------------------------------------------------------
 * https://yamoo9.gitbook.io/typescript/namespace-vs-module/namespace
 * Typescript 가이드북
 * -------------------------------------------------------------------*/

let n = 4;
let str: string = "hello";

let k = 3.15;

// ------------------------------------------
// Union type.
//      +) 타입 뿐 아니라 내용까지 정할 수도 있음.
// ------------------------------------------
type t_Style = "bold" | "italic" | 23;
// 위 3개에 있는 것만 사용 가능함.
let font: t_Style;

// ----------------------------------
// * 좋은 Comments Doc 형식.
/**
 * Returns the average of two numbers.
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */

// ---------------------------
// interface
// ---------------------------
interface i_Person {
  name: string;
  age: number;
  [key: string]: any; // 요건 규칙 완화용임. 그러나 별로인듯.
}
// interface는 type과 동일지만, 유일한 차이는 중복 선언시 확장(+) 된다는 점.
interface i_Person {
  gender: "male" | "female";
}
// 사용 예시
const person: i_Person = {
  name: "Jack",
  age: 32,
  gender: "male",
};

// function
function pow(x: number, y: number): string {
  // return type
  return Math.pow(x, y).toString();
}

// array
const arr: number[] = [];
arr.push(1);
arr.push(4);

// number 혹은 string이 들어올 수 있다. ?를 붙인건 빈 array 초기화 때문.
type t_List = [number?, string?];
const arr2: t_List = [];
arr2.push(1);
arr2.push("hi");
// arr2.push(true); // not working

// --------------------------------------
// Generic
// --------------------------------------
class Wrapper<T> {
  public constructor(public value: T) {}
}
let x: Wrapper<number>;
let y: Wrapper<i_Person>;
let z = new Wrapper(10); // automatic type matching

// --------------------------------------
// Classes
// --------------------------------------
interface CarInterface {
  size: number;
  model: string;
}

/**
 * https://yamoo9.gitbook.io/typescript/classes/getter-setter
 * Typescript를 쓰니까 C++ 처럼 코드를 쓸 수 있구만...
 */

class Car implements CarInterface {
  private _size: number = 10; // 일반 초기화 (C++ 과 동일)
  private _model: string;

  static size2: number = 42; // static 초기화
  // 그 아래 버전에서는 private을 지정할 수 있는 방법이 없음.

  constructor(_model_name: string, _size: number) {
    this._model = _model_name;
    this._size = _size;
  }

  public get model(): string {
    return this.model;
  }

  public set model(_name: string) {
    this.model = _name;
  }

  public get size() {
    return this._size;
  }

  public static sayHello() {
    console.log("hello!");
  }

  private foo() {
    console.log("hi");
  }
}

// --------------------------------------
// Creating abstract class
// --------------------------------------
abstract class test {
  public abstract foo(): void;
  public abstract bar(): void;
}

class testImpl extends test {
  public foo(): void {
    /* ... some implementation */
  }

  public bar(): void {
    /* ... some implementation */
  }
}

let c1 = new Car("Honda", 2);
console.log(c1.model);
c1.model = "Toyota";
console.log(c1.model);
c1.size;
// c1.size = 10; // Error! can't set value on size.
// 왜냐면 setter를 정의하지 않았기 때문.

// static member function.
Car.sayHello();
console.log(Car.size2);

class Truck extends Car {
  constructor() {
    super("Volvo", 2); // call Base's constructor
  }
}

let c2 = new Truck();
console.log(c2.model);

//---------------------
// Namespace
// --------------------
namespace FT_PRIVATE {
  const t1 = "이 변수는 namespace 밖에서 접근 못함.";
  export const t2 = "이건 접근 가능";

  export function say_hello() {
    console.log(t1);
  }
}

console.log(FT_PRIVATE.t2);

//---------------------
// Assertion operator !, ?, ??
// --------------------
// https://stackoverflow.com/questions/40238144/safe-navigation-operator-or-and-null-property-paths

// [ ! ] : non-null assertion operator

// [ ?. ] : optinal chaining operator

// --------------------------------------
// Generic && Type Template Literal
// --------------------------------------
// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
