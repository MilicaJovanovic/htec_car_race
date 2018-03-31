let allCars = [];

/*
 * Generates rows depending on cars number 
 */
const generateRow = (carsNumber) => {
  const rowsNumber = Math.ceil(carsNumber/3);
  for(let i = 0; i < rowsNumber; i++ ) {
    const row = {
      id: "row" + (i+1)
    }
    $.get('../templates/row.html', (template, textStatus, jqXhr) => {
      $('#cars').append(Mustache.render($(template).filter('#row').html(), row))
    });
  }
}

/*
 * Generates cars defined in JSON 
 */
const generateCar = (carsNumber, cars) => {
  for(let i = 0; i < carsNumber; i++) {
    const currentRowNumber = Math.ceil((i+1)/3);
    const currentRowId = "#row" + currentRowNumber;
    $.get('../templates/car.html', (template, textStatus, jqXhr) => {
      $(currentRowId).append(Mustache.render($(template).filter('#car').html(), cars[i]))
    });
  }
}
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
      const carsNumber = data.cars.length;
      generateRow(carsNumber);
      generateCar(carsNumber, data.cars);   
    })
  })
  .catch(error => {throw new Error(error)})
}

loadJSON()