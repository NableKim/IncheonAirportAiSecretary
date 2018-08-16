'use strict';

/*
 * arrivalTimeManageFulfillment.js - to make flight information that user wants to know
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const lexResponses = require('../lexResponses');
const getDataFromAPI = require('../getDataFromAPI');
const util = require('util');
require('util.promisify').shim();
const _ = require('lodash');
var date = require('date-and-time');

function dateStringtoDate(dateTime_str) {
  var date_str = dateTime_str.substring(0,4)+'-'+dateTime_str.substring(4,6)+'-'+dateTime_str.substring(6,8); // YYYY-MM-DD
  var date_date = date.parse(date_str, 'YYYY-MM-DD');
  date_str = date.format(date_date, 'ddd MMM DD YYYY');

  var time_str = dateTime_str.substring(8,10)+":"+dateTime_str.substring(10,12); // HH:MM

  return `${time_str}, ${date_str}`;
}

module.exports = function(intentRequest, callback) {
  console.log("departureTimeManageFulfillment was called...");
  var atFlightStatus=intentRequest.currentIntent.slots.atFlightStatus;
  var atScheduleTime=dateStringtoDate(intentRequest.currentIntent.slots.atScheduleTime);    // 기존시간
  var atEstimatedTime=dateStringtoDate(intentRequest.currentIntent.slots.atEstimatedTime);  // 변경시간

  /*
  도착 Arrived
  결항 Cancelled v
  지연 Delayed v
  회황 Diverted
  착륙 Landed
  */

  var msg ='';
  if(atFlightStatus == 'Cancelled')
    msg = 'Your flight was cancelled...';
  else if(atFlightStatus == 'Delayed')
    msg = `Please Note! Your flight arrival time was changed from ${atScheduleTime} to ${atEstimatedTime}`;
  else if(atFlightStatus == 'Diverted')
    msg = `Please Note! Your flight was diverted`;
  else if(atFlightStatus == 'Disabled')
    msg = `Estimated arrival time is ${atEstimatedTime}`;
  else
    msg = `Estimated arrival time is ${atEstimatedTime}. Your flight status is ${atFlightStatus}`;
  return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: msg }));
};
