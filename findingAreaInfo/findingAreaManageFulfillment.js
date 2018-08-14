'use strict';

/*
 * findingAreaManageFulfillment.js - to make flight information that user wants to know
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const lexResponses = require('../lexResponses');
const getDataFromAPI = require('../getDataFromAPI');
const _ = require('lodash');

module.exports = function(intentRequest, callback) {
  console.log("findingAreaManageFulfillment was called...");
  var faFindingArea=intentRequest.currentIntent.slots.faFindingArea;
  var areaMap = {
    'Check in counter':'chkinrange',
    'Boarding gate':'gatenumber',
    'Baggage claim':'carousel',
    'Exit':'exitnumber'
  };

  if(faFindingArea=='Check in counter' || faFindingArea == 'Boarding gate') {
    console.log('출발편 정보를 찾아야겠군');

    return getDataFromAPI.getTodayFlightSchedule(intentRequest.sessionAttributes, 'departure').then(flightSchedule_list => {
      console.log(`flightSchedule_list : ${JSON.stringify(flightSchedule_list)}`);
      if(flightSchedule_list.length == 0) {
        console.log(`조회결과 오늘 ${intentRequest.sessionAttributes.airlineNameKR}행 항공편은 없습니다`);
        // 세션정보 없애기
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There isn\'t your flight today`});
      }
      else {
        console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
        //console.log('반환할 결과값 : '+flightSchedule_list[0][areaMap[faFindingArea]][0]);
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: faFindingArea+' is at '+flightSchedule_list[0][areaMap[faFindingArea]][0]});
      }
    }).catch(error => {
      console.error(error);
      // 세션정보 없애기
      console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
      intentRequest.sessionAttributes={};
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There isn\'t your flight today`});
    });
  } else if(faFindingArea=='Baggage claim' || faFindingArea == 'Exit') {
    console.log('도착편 정보를 찾아야겠군');

    return getDataFromAPI.getTodayFlightSchedule(intentRequest.sessionAttributes, 'arrival').then(flightSchedule_list => {
      console.log(`flightSchedule_list : ${JSON.stringify(flightSchedule_list)}`);
      if(flightSchedule_list.length == 0) {
        console.log(`조회결과 오늘 ${intentRequest.sessionAttributes.airlineNameKR}으로부터 오는 항공편은 없습니다`);
        // 세션정보 없애기
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There isn\'t your flight today`});
      }
      else {
        console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
        //console.log('반환할 결과값 : '+flightSchedule_list[0][areaMap[faFindingArea]][0]);
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: faFindingArea+' is at '+flightSchedule_list[0][areaMap[faFindingArea]][0]});
      }
    }).catch(error => {
      console.error(error);
      // 세션정보 없애기
      console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
      intentRequest.sessionAttributes={};
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There isn\'t your flight today`});
    });
  } else {
    console.log('뭐라니');
    return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `Invaild input! Please say exact area name like \'Check in counter\'`}));
  }

};
