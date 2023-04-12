

// test for static variable.


function test()
{
    let s = 10;
}

// (1)
let withNew = new test();
console.dir(withNew);
// (2)
let withoutNew = test;
console.dir(withoutNew);
