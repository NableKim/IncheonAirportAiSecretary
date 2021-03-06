'use strict';

/*
 * arrivalAllManageFulfillment.js - to make flight information that user wants to know
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const lexResponses = require('../lexResponses');
const getDataFromAPI = require('../getDataFromAPI');
const saveMyFlight = require('./saveMyFlight');
const util = require('util');
require('util.promisify').shim();

module.exports = function(intentRequest, callback) {
  var aaSource=intentRequest.currentIntent.slots.aaSource;
  var aaAirline=intentRequest.currentIntent.slots.aaAirline;
  var aaArrivalDate=intentRequest.currentIntent.slots.aaArrivalDate;
  var aaFlightId=intentRequest.currentIntent.slots.aaflightId;

  // 운항정보 open API에서 정보 불러오기
  // 운항정보 API에 요청메세지를 보내 운항 일정을 불러온다
  const sourceCode = intentRequest.sessionAttributes.sourceCode;
  // 일주일치 aaSource발 항공편 받아오기
  return getDataFromAPI.getFlightSchedule(sourceCode, 'arrival').then(flightSchedule_list => {
    console.log(`flightSchedule_list : ${flightSchedule_list}`);

    // 입력받은 출발지, 항공사, 도착일자, 항공편명을 가지고 원하는 항공편만 골라내기
    // 도착일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
    var finalFlightSchedule = [];
    if(flightSchedule_list.length == 0) {
      console.log(`조회결과 앞으로 일주일간 ${aaSource}으로부터 오는 항공편은 없습니다`);
      // 세션정보 없애기
      console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
      intentRequest.sessionAttributes={};
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight from ${aaSource} during upcoming 7 days`});
    }
    else {
      console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
      const arrivalDate = intentRequest.sessionAttributes.arrivalDate;
      const airlineNameKR = intentRequest.sessionAttributes.airlineNameKR;
      const flightId = intentRequest.sessionAttributes.flightId;

      // 도착일자, 항공사, 항공편명 값을 대조하여 사용자가 탈 비행기 후보군을 압축해서 저장할 리스트
      var finalFlightSchedule = [];

      // 데이터 비교
      for(var i=0; i<flightSchedule_list.length; i++) {
        //날짜 yyyymmdd 형식으로 맞춤
        const flightSchedule_date = flightSchedule_list[i].scheduleDateTime[0].substring(0,8);
        if(arrivalDate==flightSchedule_date && airlineNameKR == flightSchedule_list[i].airline[0] && flightId == flightSchedule_list[i].flightId[0])
          finalFlightSchedule.push(flightSchedule_list[i]);
      }

      console.log('finalFlightSchedule 길이 : '+finalFlightSchedule.length);



      // 후보군 압축 과정 실행 결과
      if(finalFlightSchedule.length == 0) {
        console.log(`조회결과 ${aaArrivalDate} ${aaSource}발 ${airlineNameKR} 항공편은 없습니다`);
        // 세션정보 없애기
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight from ${aaSource} ${aaArrivalDate}`}, null);
      }
      else {
        console.log('사용자가 찾는 항공편 찾았다!');
        // Myflight DB에 새로 삽입 또는 업데이트
        return saveMyFlight(intentRequest, finalFlightSchedule[0]).then(fulFillmentResult => {
          // 세션정보 없애기
          console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
          intentRequest.sessionAttributes={};
          return lexResponses.close(intentRequest.sessionAttributes, fulFillmentResult.fulfillmentState, fulFillmentResult.message, null);
        });
      }
    }
  }).catch(error => {
    console.error(error);
    // 세션정보 없애기
    console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
    intentRequest.sessionAttributes={};
    return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight from ${aaSource} during upcoming 7 days`}, null);
  });
};
