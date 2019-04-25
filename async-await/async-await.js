/**
 * the entire foundation for async/await is promises. 
 * 
 * every async function will return a promise, 
 * everything await value be a promise.
 */

/**
 * THINGS TO DEFINE:
 * 1. promise chain
 * 2. await - waits for the passed Promise's resolution
 * 3. the return from an async function gets wrapped into a promise
 * 4. the return from a then() function is a new promise, different from the original
 */

// what happens when I return from a then() block? 
// it returns to the promise chain!!
//the return from an async function gets wrapped into a promise

// function makeFamilyMember(name, bored, outside) {
//   return {
//     name,
//     bored,
//     outside
//   }
// }


// function getFamily() {
//   const patsy = makeFamilyMember('Patsy', true, true);
//   const chris = makeFamilyMember('Chris', false, false);
//   const taco = makeFamilyMember('Taco', true, true);
//   const jim = makeFamilyMember('Jim', true, true);

//   return new Promise((resolve, reject) => {
//     setTimeout(() => {resolve([patsy, chris, taco, jim])}, 300);
//   });
// }

// function getPatsy() {
//   return getFamily().then(fam => fam[0]);
// }

// function getChris() {
//   return getFamily().then(fam => fam[1]);
// }

// const patsy = getPatsy();
// const chris = getChris();

// patsy.then(p => {console.log(p.name, 'wants to go outside', p.outside)})

const serviceA = async (data) => {
  return new Promise((resolve, reject) => {
    if(!data) reject(new Error('Service Error.'));
    else resolve({data, message:'ServiceA Success!'});
  })
}

const serviceB = async (obj) => {
  return new Promise(resolve => {
    resolve({data: obj, message: 'ServiceB Success!'});
  }) 
}

const gateway = async (event) => {
  try {
    const resultA = await serviceA(event);
    const resultB = await serviceB(resultA);
    return resultB;
  } catch(error) {
    return error;
  }
}

const client = async (options) => {
  const request = await gateway(options);
  console.log("request", request);
}

// main
client("IAMDAATA");