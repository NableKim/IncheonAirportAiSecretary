'use strict';

/*
 * departureTimeManageFulfillment.js - to make flight information that user wants to know
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
  var dtFlightStatus=intentRequest.currentIntent.slots.dtFlightStatus;
  var dtScheduleTime=dateStringtoDate(intentRequest.currentIntent.slots.dtScheduleTime);    // 기존시간
  var dtEstimatedTime=dateStringtoDate(intentRequest.currentIntent.slots.dtEstimatedTime);  // 변경시간

  /*
  출발 Departed
  결항 Cancelled
  지연 Delayed
  탑승중 Borading
  마감예정 Final Call
  탑승마감 Gate Closing
  탑승준비 Gate Open
  */

  var msg ='';
  if(dtFlightStatus == 'Cancelled')
    msg = 'Your flight was cancelled...';
  else if(dtFlightStatus == 'Delayed')
    msg = `Please Note! Your flight departure time was changed from ${dtScheduleTime} to ${dtEstimatedTime}`;
  else if(dtFlightStatus == 'Disabled')
    msg = `Estimated departure time is ${dtEstimatedTime}`;
  else
    msg = `Estimated departure time is ${dtEstimatedTime}. Your flight status is ${dtFlightStatus}`;
  return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: msg }));
};
