'use strict';

/*
 * dispatch.js - To distinguish intents
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const departureAll = require('./departureAll');
//const arrivalAll = require('./arrivalAll');

module.exports = function(intentRequest) {
  console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
  const intentName = intentRequest.currentIntent.name;

  console.log(intentName+' was called!sss');

  // Run the appropriate logic depending on intentName value
  if(intentName === 'AirlineInfo') {
    // Implement this logic
  }
  else if(intentName === 'ArrivalAll') {
    // Implement this logic
    //return arrivalAll(intentRequest);
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
    return departureAll(intentRequest);
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



};
