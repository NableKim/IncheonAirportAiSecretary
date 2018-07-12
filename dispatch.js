'use strict';

module.exports = function(intentRequest, callback) {
  console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
  const intentName = intentRequest.currentIntent.name;

  // Run the appropriate logic depending on intentName value
  if(intentName === 'AirlineInfo') {
    // Implement this logic
  }
  else if(intentName === 'ArrivalAll') {
    // Implement this logic
  }
  else if(intentName === 'ArrivalLocation') {
    // Implement this logic
  }
  else if(intentName === 'ArrivalTime') {
    // Implement this logic
  }
  else if(intentName === 'CityWeather') {
    // Implement this logic
  }
  else if(intentName === 'CongestionDegree') {
    // Implement this logic
  }
  else if(intentName === 'DepartureAll') {
    // Implement this logic
  }
  else if(intentName === 'DepartureLocation') {
    // Implement this logic
  }
  else if(intentName === 'DepartureTime') {
    // Implement this logic
  }
  else if(intentName === 'ExchangeRate') {
    // Implement this logic
  }
  else if(intentName === 'FacilityInfo') {
    // Implement this logic
  }
  else if(intentName === 'ParkingInfo') {
    // Implement this logic
  }
  else {
    throw new Error(`Error : There is no intent with name ${intentName}!!!`);
  }



}
