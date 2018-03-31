let allCars = [];

/*
 * Loads data from API
 * Generates content 
 */
const loadJSON = _ => {
  fetch('../json/data.json')
  .then(response => {
    response.json()
    .then(data => {
      allCars = data.cars;
      console.log(allCars);
    })
  })
  .catch(error => {throw new Error(error)})
}

loadJSON()