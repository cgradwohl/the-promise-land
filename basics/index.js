/**
 * throw vs reject
 */



// ___Non Promisified Async Callbacks___
return asyncIsPermitted()
    .then(function(result) {
        if (result === true) {
            return true;
        }
        else {
            return Promise.reject(new PermissionDenied());
        }
    });

// - vs -

return asyncIsPermitted()
    .then(function(result) {
        if (result === true) {
            return true;
        }
        else {
            throw new PermissionDenied();
        }
    });

// In this example both results are the same. 
// ** The .then() handler catches the thrown exception
// and turns it into a rejected promise automatically.




// ___Where throw will NOT work___
// Any time you are inside of a promise callback, you 
// can use throw. However, if you're in any other 
// asynchronous callback, you must use reject.
new Promise(function() {
  setTimeout(function() { // you should NOT put async callbacks inside of promises.
    throw 'or nah';
    // return Promise.reject('or nah'); also won't work
  }, 1000);
}).catch(function(e) {
  console.log(e); // doesn't happen
});

// This won't trigger the catch, instead you're left with an 
// unresolved promise and an uncaught exception. That is a 
// case where you would want to instead use reject. However, 
// you could fix this by promisifying the timeout:

function timeout(duration) { // Thanks joews
  return new Promise(function(resolve) {
    setTimeout(resolve, duration);
  });
}

timeout(1000).then(function() {
  throw 'worky!';
  // return Promise.reject('worky'); also works
}).catch(function(e) {
  console.log(e); // 'worky!'
});

// ___Bottom Line___
// A function is hard to use when it sometimes returns 
// a promise and sometimes throws an exception. When 
// writing an async function, prefer to signal failure
// by returning a rejected promise.

/**
 * Your particular example obfuscates some important 
 * distinctions between them:
 * 
 * Since in the above examples you are error handling 
 * inside a promise chain, thrown exceptions get 
 * automatically converted to rejected promises. This 
 * may explain why they seem to be interchangeable - they are not.
 * 
 * Consider the situation below:
 */

 // ANTI-PATTERN
const checkCredentials = () => {
  let idToken = localStorage.getItem('some token');
  if ( idToken ) {
    return fetch(`https://someValidateEndpoint`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    })
  } else {
    throw new Error('No Token Found In Local Storage')
  }
}

// This would be an anti-pattern because you would 
// then need to support both async and sync error 
// cases. It might look something like:
try {
  function onFulfilled() { ... do the rest of your logic }
  function onRejected() { // handle async failure - like network timeout }
  checkCredentials(x).then(onFulfilled, onRejected);
} catch (e) {
  // Error('No Token Found In Local Storage')
  // handle synchronous failure
}

// Instead, use Promise.reject available in the global scope ). comes to the 
// It effectively differentiates itself from throw. 
// The refactor now becomes:
const checkCredentials = () => {
  let idToken = localStorage.getItem('some_token');
  if (!idToken) {
    return Promise.reject('No Token Found In Local Storage')
  }
  return fetch(`https://someValidateEndpoint`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  })
}

// This now lets you use just one catch() for network failures and 
// the synchronous error check for lack of tokens:
checkCredentials()
  .then(() => { ... do the rest of your logic })
  .catch((error) => if ( error == 'No Token' ) {
  // do no token modal
  } else if ( error === 400 ) {
  // do not authorized modal. etc.
  }
