let allCars = [];
let selectedCars = [];
let distance = 0;
let speedLimits = [];
let trafficLights = [];
let winners = [];

/**
 * Generates rows depending on cars number.
 * Calculates needed rows and use template for generating.
 * @param {*} carsNumber - number of cars loaded from JSON
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

/**
 * Generates cars using template.
 * Calculates row and places car in it.
 * @param {*} carsNumber - number of cars loaded from JSON
 * @param {*} cars - array with all cars loaded from JSON
 */
const generateCars = (carsNumber, cars) => {
  for(let i = 0; i < carsNumber; i++) {
    const currentRowNumber = Math.ceil((i+1)/3);
    const currentRowId = "#row" + currentRowNumber;
    $.get('../templates/car.html', (template, textStatus, jqXhr) => {
      $(currentRowId).append(Mustache.render($(template).filter('#car').html(), cars[i]))
    });
  }
}

/**
 * Generates lines from every selected car using template.
 * @param {*} carsNumber - number of selected cars
 */
const generateRoadLine = (carsNumber) => {
  $('#lanes').empty();
  for(let i = 0; i < carsNumber; i++) {
    $.get('../templates/lane.html', (template, textStatus, jqXhr) => {
      $('#lanes').append(Mustache.render($(template).filter('#lane').html()))
    });    
  }
}

/**
 * Generates cars for racing using template.
 * @param {*} cars - array with all selected cars
 */
const generateRaceCar = (cars) => {
  $('#race-cars').empty();
  for(let i = 0; i < cars.length; i++) {
    $.get('../templates/race-car.html', (template, textStatus, jqXhr) => {
      $('#race-cars').append(Mustache.render($(template).filter('#race-car').html(), cars[i]))
    });
  }
}

/**
 * Generates speed limit signs using specific template.
 * Calculates position for every sign depending of the position
 * in JSON and with of the HTML element where sign is placed.
 * @param {*} speedLimits - all speed limit signs from JSON
 * @param {*} distance - road distance
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

/**
 * Generates traffic lights using specific template.
 * Calculates position depending of the position
 * in JSON and with of the HTML element where sign is placed.
 * @param {*} trafficLights - all traffic lights from JSON
 * @param {*} distance - road distance
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

/**
 * Loads data from local JSON file.
 * Generates content using above functions.
 */
const loadJSON = _ => {
  fetch('../json/data.json')
  .then(response => {
    response.json()
    .then(data => {
      allCars = data.cars;
      const carsNumber = data.cars.length;
      generateRow(carsNumber);
      generateCars(carsNumber, data.cars);   
      
      // Generating road for race
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

/**
 * Handles mouse enter on cards with car details.
 * Adds and removes class depending on card state.
 */
$(document).on("mouseenter",".flipcard",function() {
  var $flipcard = $(this); 
  if ($flipcard.hasClass('flipped')) {
     $flipcard.removeClass('flipped');
  } else { 
    $flipcard.addClass('flipped');
  }
})

/**
 * Handles mouse click on cards with car details.
 * Adds and removes clicked car to the array of selected cars.
 * Calls functions for generating road lines and race cars. 
 * Calls functions for generating speed limit signs and traffic lights.
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
})

/**
 * Chagnes traffic light image based on class name.
 * @param {*} trafficLight - specific traffic light
 */
const generateTrafficLight = (trafficLight) => {
  if(trafficLight.hasClass("red-light")) {
    (trafficLight).removeClass("red-light");
    (trafficLight).addClass("green-light");
  } else {
    (trafficLight).removeClass("green-light");
    (trafficLight).addClass("red-light");
  }
}

/**
 * Moves cars to the end of the road.
 * Call function for comparing cars by speed.
 * Displays winners of the race.
 */
$(document).on("click","#start",function() {
  const animationSpeed = $("#animation-speed").val();

  let slowestCar = 0;
  selectedCars.forEach(car => {
    const carTimeForDistance = calculateTimeForDistance(car.speed, distance);
    if (carTimeForDistance > slowestCar) {
      slowestCar = carTimeForDistance;
    }
  });

  selectedCars.forEach(car => {
    const calculatedAnimationTime = calculateCarAnimationTime(slowestCar, calculateTimeForDistance(car.speed, distance), animationSpeed);

    $('#race-car' + car.id).css({
      '-webkit-animation': 'move-car ' + calculatedAnimationTime + 's forwards',
      'animation': 'move-car ' + calculatedAnimationTime + 's forwards',
      '-webkit-animation-timing-function': 'linear',
    });
  });

  // startSpeedListener(slowestCar, animationSpeed);
  startTrafficListener();
  startTrafficLogicListener();
  checkWinners();
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

/**
 * Calculates how many minutes does a car need to pass the
 * distance acquired from JSON, depending on car speed.
 * @param {*} carSpeed - speed of the car
 * @param {*} distance - distance that the car needs to cover
 */
const calculateTimeForDistance = (carSpeed, distance) => {
  const requiredTime = (60 * distance) / carSpeed;
  return requiredTime;
}

/**
 * Calculates how many seconds does the animation run for
 * a specific car, comparing it to the slowest car which needs
 * to be animated for the time that user entered for animation
 * time.
 * @param {*} slowestCar - time needed for the slowest car to pass
 * the distance required
 * @param {*} carTimeForDistance - time needed for selected car to
 * pass the distance required
 * @param {*} animationSpeed - time of the animation for the slowest
 * car
 */
const calculateCarAnimationTime = (slowestCar, carTimeForDistance, animationSpeed) => {
  return (animationSpeed * carTimeForDistance) / slowestCar;
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
 * Starts an interval checking if cars are at the traffic
 * light when red light is on. If a car reaches red traffic light, it's animation
 * must be stopped.
 */
const startTrafficLogicListener = () => {
  setInterval(() => {
    trafficLights.forEach(light => {
      selectedCars.forEach(car => {
        let stop = false;
        const uiCar = $('#race-car' + car.id);
        const uiLight = $('#light' + light.position);

        if (uiCar.position().left > (uiLight.position().left - 30) && uiCar.position().left <= (uiLight.position().left) + 20) {
          if (uiLight.hasClass("red-light") && !stop) {
            stop = true;
            $('#race-car' + car.id).css({
              'animation-play-state' : 'paused'
            });
          }
        }
        setInterval(() => {
          if (uiLight.hasClass('green-light') && stop) {
            stop = true;
            $('#race-car' + car.id).css({
              'animation-play-state' : 'running'
            });
          }
        }, 1000);
      });
    });
  }, 1000);
}

/**
 * Starts an interval checking if cars are at the speed
 * limit sign. If a car reaches speed limit, it's animation
 * speed must be appropriately adjusted.
 * During speeda adjustment new css animation is created.
 * @param {*} slowestCar - slowest car to compare new speed to
 * @param {*} animationSpeed - animation speed that user
 * entered
 */
const startSpeedListener = (slowestCar, animationSpeed) => {
  setInterval(() => {
    speedLimits.forEach(limit => {
      selectedCars.forEach(car => {
        const uiCar = $('#race-car' + car.id);
        const uiLimit = $('#speed-limit' + limit.speed);
  
        if (uiCar.position().left > parseInt(uiLimit.css('margin-left'))) {
          selectedCars.forEach(car => {
            const calculatedAnimationTime = calculateCarAnimationTime(slowestCar, calculateTimeForDistance(limit.speed, distance), animationSpeed);
            $('#race-car' + car.id).css({
              '-webkit-animation': 'move-car ' + calculatedAnimationTime + 's forwards',
              'animation': 'move-car ' + calculatedAnimationTime + 's forwards',
              '-webkit-animation-timing-function': 'linear'
            });
          });
        } 
      });
    });
  }, 1000);
}

/**
 * Interval check when cars hit the end of the road.
 * It adds cars to the winner list.
 * After all cars are at the end, CSS of the elements changes
 * to show first three places.
 */
const checkWinners = () => {
  const cheking = setInterval(() => {
    selectedCars.forEach(car => {
      const uiCar = $('#race-car' + car.id);
      const uiEnd = $('#race-car-line' + car.id);
      const raceEnd = uiEnd.offset().left + uiEnd.width();

      if (uiCar.position().left > (raceEnd - raceEnd * 0.12)) {
        const foundCar = winners.filter(winner => winner.id == car.id);
        if (foundCar.length == 0) {
          winners.push(car);
        }
      } 

      if (winners.length == selectedCars.length) {
        try {
          if(!($('#race-car' + winners[0].id).hasClass('first-place'))) {
            $('#race-car' + winners[0].id).append("<h4>I</h4>");
            $('#race-car' + winners[0].id).addClass('first-place');
            $('#race-car' + winners[0].id + " .race-car-image").addClass('race-car-image-dark');
          }
    
          if(!($('#race-car' + winners[1].id).hasClass('second-place'))) {
            $('#race-car' + winners[1].id).append("<h4>II</h4>");
            $('#race-car' + winners[1].id).addClass('second-place');
            $('#race-car' + winners[1].id + " .race-car-image").addClass('race-car-image-dark');
          }

          if(!($('#race-car' + winners[2].id).hasClass('third-place'))) {
            $('#race-car' + winners[2].id).append("<h4>III</h4>");
            $('#race-car' + winners[2].id).addClass('third-place');
            $('#race-car' + winners[2].id + " .race-car-image").addClass('race-car-image-dark');
          }
        } catch (err) {}
      }
    });
  }, 500);
}