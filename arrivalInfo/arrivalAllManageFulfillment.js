'use strict';

/*
 * arrivalAllManageFulfillment.js - to make flight information that user wants to know
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const lexResponses = require('../lexResponses');
const databaseManager = require('../databaseManager');
const getDataFromAPI = require('../getDataFromAPI');
const util = require('util');
require('util.promisify').shim();
const _ = require('lodash');

function buildFulfillmentResult(fulfillmentState, messageContent) {
  return {
    fulfillmentState,
    message: { contentType: 'PlainText', content: messageContent},
  };
}

function saveMyFlight(intentRequest, flightInfo) {
  console.log('flightInfo값은 : '+JSON.stringify(flightInfo));
  return databaseManager.saveMyArrivalflightToDB(intentRequest).then(item => {

    var terminal= {
      "P01":"Terminal 1",
      "P02":"Concourse A",
      "P03":"Terminal 2"
    };
    // 운항상태
    var status = {
      "도착":"arrived",
      "결항":"arrived",
      "지연":"arrived",
      "회항":"arrived",
      "착륙":"arrived"
    };

    const terminalid = terminal[flightInfo.terminalid[0]];

    var fulfillMessage = `
      Date : ${flightInfo.estimatedDateTime[0].substring(0,8)}\n
      Source : ${intentRequest.currentIntent.slots.aaSource}(${flightInfo.airportcode[0]})\n
      Airline : ${intentRequest.currentIntent.slots.aaAirline}\n
      Flight Number : ${flightInfo.flightId[0]}\n
      Estimated Time : ${flightInfo.estimatedDateTime[0].substring(8,10)}:${flightInfo.estimatedDateTime[0].substring(10,12)}\n
      Scheduled Date(old) : ${flightInfo.scheduleDateTime[0].substring(0,8)}\n
      Scheduled Time(old) : ${flightInfo.scheduleDateTime[0].substring(8,10)}:${flightInfo.scheduleDateTime[0].substring(10,12)}\n
      Terminal : ${terminalid}`;

    // 비행편이 오늘날짜라면 응답메세지에 비행기 운항상태, 게이트 번호, 수화물 수취대, 출구번호가 추가로 올것이다. 이것을 추가해주자
    if(!_.isEmpty(flightInfo.gatenumber)) {
      fulfillMessage += `\n Gate : ${flightInfo.gatenumber[0]}`;
    }

    if(!_.isEmpty(flightInfo.remark)) {
      fulfillMessage +=`\n Status : ${status[flightInfo.remark[0]]}`;
    }

    if(!_.isEmpty(flightInfo.carousel)) {
      fulfillMessage += `\n Carousel : ${flightInfo.carousel[0]}`;
    }

    if(!_.isEmpty(flightInfo.exitnumber)) {
      fulfillMessage += `\n Exit : ${flightInfo.exitnumber[0]}`;
    }

    return buildFulfillmentResult('Fulfilled', fulfillMessage);
  });
}


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

    // 입력받은 목적지, 항공사, 출발일자, 항공편명을 가지고 원하는 항공편만 골라내기
    // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
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

      // 출발일자, 항공사 , 항공편명 값을 대조하여 사용자가 탈 비행기 후보군을 압축해서 저장할 리스트
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
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight from ${daDestination} during upcoming 7 days`}, null);
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
