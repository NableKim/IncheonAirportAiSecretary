'use strict';

const lexResponses = require('../weatherInlexResponses');
const getWeatherDataFormAPI = require('../getWeatherDataFormAPI');
// const databaseManager = require('../databaseManager');
// const = require('lodash');

function buildValidationResult(isValid, violatedSlot, messageContent, options) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot,
      // options
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
    // options
  };
}

function validateWeatherInfo(cityName) {
  if (cityName == null) {
    console.log('잘못된 입력이거나 입력된 데이터가 없습니다...');
    return buildValidationResult(false,'cityName','Please enter cityName');
  }else{
    return buildValidationResult(true,null,null);
  }
}

module.exports = function(intentRequest, callback) {
  console.log("weatherInfoManageDialog was called...");
  var cityName = intentRequest.currentIntent.slots.CityName;
  var message = "";

  const slots = intentRequest.currentIntent.slots;
  console.log("User entered..." + cityName);

  const validationResult = validateWeatherInfo(cityName);
  if(!validationResult.isValid) {
    console.log("Failed to pass validation...");
    slots[`${validationResult.violatedSlot}`] = null;
    console.log("Initialize Slot...");
    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot,validationResult.message));
  } else {
    console.log("Passing through validation");
    //api 요청
    return getWeatherDataFormAPI.getWeather(cityName).then(weather_list => {
      console.log(`weather_list : ${weather_list}`);
      if(weather_list.length == 0) {
        console.log('No weather information...');
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `I'm sorry. There is no weather information for the city... `}, null);
      } else {
        console.log('Parsing...');

        for(i = 0; i < weather_list.length; i++) {
          console.log("weather information of the " + cityName);

          message = "The temperature in " + cityName + "is "+ weather_list[0].currently.temperature
          +", and " + weather_list[0].currently.summary;
      }
      return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled',
      {'contentType' : 'PlainText', 'content': `${message}`},
      null);
    });
  }
}
