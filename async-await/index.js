/**
 * 'async' functions automatically return a promise, 
 * where the .then(…) contains a return value or 
 * if an error is thrown, the .catch(…) is triggered 
 * with the error.
 * 
 * 'await' inside an async function automatically resolves 
 * the value as a promise. This is the same value that 
 * would be inside the .then(…) of that promise OR the thrown
 * error inside the .catch(…) of that promise.
 * 
 * any errors bubble up in the same way that a reject call 
 * would, which allows for the same handling of synchronous 
 * errors and promise rejections.
 */

/**
 * Synchronous Error
 * all async functions return a promise and any errors that
 * are thrown automatically trigger the nearest catch method (their own).
 */

async function example() {
  throw new Error("test error at top of example");
}

try {
  example()
    .then(r => console.log(`.then(${r})`))
    .catch(e => console.log(`.catch(${e})`));
} catch (e) {
  console.error(`try/catch(${e})`);
}

// > Output:
//
// .catch(Error: test error at top of example)


/**
 * Synchronous Error (from await)
 * await expects and parses a __returned__ promise.
 * If the inner function throws an error outside the promise, then
 * the error gets thrown INSIDE the async function. Finally, the 
 * error will bubble up to the catch of its own promise.
 */
async function example() {
  return await inner();
}

const inner = () => {
  throw new Error("test error outside promise");
  return new Promise((resolve, reject) => {
    resolve(true);
  });
};

try {
  example()
    .then(r => console.log(`.then(${r})`))
    .catch(e => console.log(`.catch(${e})`));
} catch (e) {
  console.error(`try/catch(${e})`);
}

// > Output:
//
// .catch(Error: test error outside promise)