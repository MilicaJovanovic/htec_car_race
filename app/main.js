let allCars = [];
let selectedCars = [];

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
      const carsNumber = data.cars.length;
      generateRow(carsNumber);
      generateCar(carsNumber, data.cars);   
    })
  })
  .catch(error => {throw new Error(error)})
}

loadJSON()

/*
 * Event that handles flipcard rotation
 */
$(document).on("mouseenter",".flipcard",function() {
  var $flipcard = $(this); 
  if ($flipcard.hasClass('flipped')) {
     $flipcard.removeClass('flipped');
  } else { 
    $flipcard.addClass('flipped');
  }
})

/*
 * Event that adds selected car to the list for racing
 */
$(document).on("click",".flipcard",function() {
  const wholeId = this.id;
  const id = wholeId.substring(3);
  const selectedCar = allCars.filter(car => car.id == id);

  const foundCar = selectedCars.filter(car => car.id == id);
  if (foundCar.length == 0) {
    selectedCars.push(selectedCar[0]);
    $(this).addClass("clicked");
  } else {
    selectedCars = selectedCars.filter(car => car.id != id);
    $(this).removeClass("clicked");
  }
  console.log(selectedCars);
})