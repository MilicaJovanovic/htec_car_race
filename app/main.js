let allCars = [];
let selectedCars = [];
let distance = 0;
let speedLimits = [];
let trafficLights = [];

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
 * Generates empty lines on road
 */
const generateRoadLine = (carsNumber) => {
  $('#lanes').empty();
  for(let i = 0; i < carsNumber; i++) {
    $.get('../templates/lane.html', (template, textStatus, jqXhr) => {
      $('#lanes').append(Mustache.render($(template).filter('#lane').html()))
    });    
  }
}

/*
 * Generates race cars on the start of the road
 */
const generateRaceCar = (cars) => {
  $('#race-cars').empty();
  for(let i = 0; i < cars.length; i++) {
    $.get('../templates/race-car.html', (template, textStatus, jqXhr) => {
      $('#race-cars').append(Mustache.render($(template).filter('#race-car').html(), cars[i]))
    });
  }
}

/*
 * Generates speed limit sign
 */
const generateSpeedLimitSign = (speedLimits, distance) => {
  $("#signs").html("");
  for (let i = 0; i < speedLimits.length; i++) {
    let signPostion = (speedLimits[i].position * 100) / distance;
    speedLimits[i].pos = signPostion - 5.5;
    $.get('../templates/speed-limit-sign.html', (template, textStatus, jqXhr) => {
      $('#signs').append(Mustache.render($(template).filter('#speed-limit-sign').html(), speedLimits[i]))
    });
  }
}

/*
 * Generates traffic lights
 */
const generateTrafficLights = (trafficLights, distance) => {
  for (let i = 0; i < trafficLights.length; i++) {
    let lightsPostion = (trafficLights[i].position * 100) / distance;
    trafficLights[i].pos = lightsPostion - 2;
    $.get('../templates/traffic-lights.html', (template, textStatus, jqXhr) => {
      $('#signs').append(Mustache.render($(template).filter('#traffic-lights').html(), trafficLights[i]))
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
      
      // Generates road for race
      distance = data.distance;
      const distancePart = distance / 10;
      const roadHeader = {
        first :  Math.round((distancePart) * 100) / 100,
        second : Math.round((distancePart * 2) * 100) / 100,
        third : Math.round((distancePart * 3) * 100) / 100,
        fourth : Math.round((distancePart * 4) * 100) / 100,
        fifth : Math.round((distancePart * 5) * 100) / 100,
        sixth : Math.round((distancePart * 6) * 100) / 100,
        seventh : Math.round((distancePart * 7) * 100) / 100,
        eighth : Math.round((distancePart * 8) * 100) / 100,
        ninth : Math.round((distancePart * 9) * 100) / 100,
      }
      $.get('../templates/road-header.html', (template, textStatus, jqXhr) => {
        $('#road-header').append(Mustache.render($(template).filter('#road-header').html(), roadHeader))
      });

      speedLimits = data.speed_limits;
      trafficLights = data.traffic_lights;
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
    generateRoadLine(selectedCars.length);
    generateRaceCar(selectedCars);
  } else {
    selectedCars = selectedCars.filter(car => car.id != id);
    $(this).removeClass("clicked");
    generateRoadLine(selectedCars.length);
    generateRaceCar(selectedCars);
  }

  const height = 60 * selectedCars.length + 10;
  speedLimits.forEach(limit => {
    limit.height = height;
  });
  generateSpeedLimitSign(speedLimits, distance);

  trafficLights.forEach(lights => {
    lights.height = height;
  });
  generateTrafficLights(trafficLights, distance);

  startTrafficListener();
})

/**
 * Chagnes traffic light image based on class name.
 * @param {*} trafficLight - specific traffic light
 */
const generateTrafficLight = (trafficLight) => {
  if(trafficLight.hasClass("red-light")) {
    (trafficLight).removeClass("red-light");
    $(trafficLight).addClass("green-light");
  } else {
    (trafficLight).removeClass("green-light");
    $(trafficLight).addClass("red-light");
  }
}

/**
 * Starts an interval checking all traffic lights at
 * their exact duration. Calls function for checking
 * traffic light colors.
 */
const startTrafficListener = () => {
  trafficLights.forEach(light => {
    setInterval(() => {
      const uiLight = $('#light' + light.position);
      generateTrafficLight(uiLight);
    }, light.duration);
  });
}

/**
 * Moves cars to the end of the road.
 * Call function for comparing cars by speed.
 * Displays winners of the race.
 * 
 */
$(document).on("click","#start",function() {
  selectedCars.forEach(car => {
    $('#race-car' + car.id).css({
      'float': 'right',
      'margin-right' : '20px'
    });
  });

  selectedCars.sort(compareSpeed);
  try {
    $('#race-car' + selectedCars[selectedCars.length - 1].id).append("<h4>I</h4>");
    $('#race-car' + selectedCars[selectedCars.length - 1].id).addClass('first-place');
    $('#race-car' + selectedCars[selectedCars.length - 1].id + " .race-car-image").addClass('race-car-image-dark');

    $('#race-car' + selectedCars[selectedCars.length - 2].id).append("<h4>II</h4>");
    $('#race-car' + selectedCars[selectedCars.length - 2].id).addClass('second-place');
    $('#race-car' + selectedCars[selectedCars.length - 2].id + " .race-car-image").addClass('race-car-image-dark');

    $('#race-car' + selectedCars[selectedCars.length - 3].id).append("<h4>III</h4>");
    $('#race-car' + selectedCars[selectedCars.length - 3].id).addClass('third-place');
    $('#race-car' + selectedCars[selectedCars.length - 3].id + " .race-car-image").addClass('race-car-image-dark');
  }
  catch(err) {}
});

/**
 * Compares list by speed attribute
 * @param {*} a - first object for comparison
 * @param {*} b - second object for comparison
 */
const compareSpeed = (a,b) => {
  if (a.speed < b.speed)
    return -1;
  if (a.speed > b.speed)
    return 1;
  return 0;
}

/**
 * Checks if animation speed field is filled.
 * If field does not have content, start button is disabled.
 * If field has content, the race can be started.
 */
$(document).ready(function(){
  $('#start').prop('disabled', true);
  $('#animation-speed').keyup(function() {
      $('#start').prop('disabled', this.value == "" ? true : false);     
  })
});