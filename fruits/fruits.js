// NATIVE PROMISE

// 1. Lets create an async service that fetches fruit data from a DB
const getFruitInventory = () => {
  return new Promise((resolve, reject) => {
    const inventory = [
      { name: 'apple', id: 1, count:7 }, 
      { name: 'orange', id: 2, count:2 }, 
      { name: 'banana', id: 3, count:4 }
    ]
    return setTimeout(() => resolve(inventory), 700);
  });
};

// 2. We need another service to get the names of fruits
const getFruitNames = fruits => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => resolve(fruits.name), 500);
  });
};

// 3. Finally once we have the name, we need to format it
const capitalizeFruits = fruit => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => resolve(fruit.toUpperCase()), 300);
  });
};

// Lets try to fetch the fruit inventory, get available fruit 
// names and then format those names
const fetchFruits = async () => {
  const fruits = await getFruitInventory();

  for (let fruit of fruits) {
    const fruitName = await getFruitNames(fruit);
    console.log(fruitName);

    const formatFruit = await capitalizeFruits(fruitName);
    console.log(formatFruit);
  }

  console.log(fruits);
}

// We expect:
// [ { name: 'apple', id: 1, count:7 }
// { name: 'orange', id: 2, count:2 }
// { name: 'banana', id: 3, count:4 } ]
// apple
// orange
// banana
// APPLE
// ORANGE
// BANANA

// fetchFruits();

// Instead we got this: 
// apple
// APPLE
// orange
// ORANGE
// banana
// BANANA
// [ { name: 'apple', id: 1, count: 7 },
//   { name: 'orange', id: 2, count: 2 },
//   { name: 'banana', id: 3, count: 4 } ]

// Lets try to use promise all
const fetchFruitsAsync = async () => {
  const fruits = await getFruitInventory();

  // here we map over the array of fruits which returns an array of fruits to 
  // Promise.all() 
  Promise.all(
    fruits.map(async fruit => {
      const fruitName = await getFruitNames(fruit);
      console.log(fruitName);

      const formatFruit = await capitalizeFruits(fruitName);
      console.log(formatFruit);
    })
  );

  console.log(fruits);
};

fetchFruitsAsync();

// SUCCESS: 
// [ { name: 'apple', id: 1, count: 7 },
//   { name: 'orange', id: 2, count: 2 },
//   { name: 'banana', id: 3, count: 4 } ]
// apple
// orange
// banana
// APPLE
// ORANGE
// BANANA