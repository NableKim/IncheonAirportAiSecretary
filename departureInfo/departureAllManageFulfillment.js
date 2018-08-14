'use strict';

/*
 * departureAllManageFulfillment.js - to make flight information that user wants to know
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
    /*responseCard: {
      "contentType": "application/vnd.amazonaws.card.generic",
      "genericAttachments": [
          {
             "title":"Departure Flight Search Result",
             "subTitle":"card-sub-title",
             "imageUrl":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCkfhVc-OcAJNS7pEAYeQjq5yg6cYEziefkc39EruT3Pog9EHm",
             "attachmentLinkUrl":"https://www.airport.kr/ap/ko/map/mapInfo.do#",
             "buttons":[
              ]
           }
       ]
     }*/
  };
}

function saveMyFlight(intentRequest, flightInfo) {
  console.log('flightInfo값은 : '+JSON.stringify(flightInfo));
  return databaseManager.saveMyflightToDB(intentRequest).then(item => {
    var terminal= {
      "P01":"Terminal 1",
      "P02":"Concourse A",
      "P03":"Terminal 2"
    };
    // 운항상태
    var status = {
      "출발":"Departed",
      "결항":"Departed",
      "지연":"Departed",
      "탑승중":"Departed",
      "마감예정":"Departed",
      "탑승마감":"Gate Closing",
      "탑승준비":"Departed"
    };

    const terminalid = terminal[flightInfo.terminalid[0]];

    var fulfillMessage = `
      Date : ${flightInfo.estimatedDateTime[0].substring(0,8)}\n
      Destination : ${intentRequest.currentIntent.slots.daDestination}(${flightInfo.airportcode[0]})\n
      Airline : ${intentRequest.currentIntent.slots.daAirline}\n
      Flight Number : ${flightInfo.flightId[0]}\n
      Estimated Time : ${flightInfo.estimatedDateTime[0].substring(8,10)}:${flightInfo.estimatedDateTime[0].substring(10,12)}\n
      Scheduled Date(old) : ${flightInfo.scheduleDateTime[0].substring(0,8)}\n
      Scheduled Time(old) : ${flightInfo.scheduleDateTime[0].substring(8,10)}:${flightInfo.scheduleDateTime[0].substring(10,12)}\n
      Check in : ${flightInfo.chkinrange[0]}\n
      Terminal : ${terminalid}`;

    // 비행편이 오늘날짜라면 응답메세지에 비행기 운항상태 및 게이트 번호가 추가로 올것이다. 이것을 추가해주자
    if(!_.isEmpty(flightInfo.gatenumber)) {
      fulfillMessage += `\nGate : ${flightInfo.gatenumber[0]}`;
    }

    if(!_.isEmpty(flightInfo.remark)) {
      fulfillMessage +=`\n Status : ${status[flightInfo.remark[0]]}`;
    }

    return buildFulfillmentResult('Fulfilled', fulfillMessage);
  });
}


module.exports = function(intentRequest, callback) {
  var daDestination=intentRequest.currentIntent.slots.daDestination;
  var daAirline=intentRequest.currentIntent.slots.daAirline;
  var daDepartureDate=intentRequest.currentIntent.slots.daDepartureDate;
  var daFlightId=intentRequest.currentIntent.slots.daflightId;

  // 운항정보 open API에서 정보 불러오기
  // 운항정보 API에 요청메세지를 보내 운항 일정을 불러온다
  const destinationCode = intentRequest.sessionAttributes.destinationCode;
  // 일주일치 daDestination행 항공편 받아오기
  return getDataFromAPI.getFlightSchedule(destinationCode, 'departure').then(flightSchedule_list => {
    console.log(`flightSchedule_list : ${flightSchedule_list}`);

    // 입력받은 목적지, 항공사, 출발일자, 항공편명을 가지고 원하는 항공편만 골라내기
    // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
    var finalFlightSchedule = [];
    if(flightSchedule_list.length == 0) {
      console.log(`조회결과 앞으로 일주일간 ${daDestination}행 항공편은 없습니다`);
      // 세션정보 없애기
      console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
      intentRequest.sessionAttributes={};
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} during upcoming 7 days`});
    }
    else {
      console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
      const departureDate = intentRequest.sessionAttributes.departureDate;
      const airlineNameKR = intentRequest.sessionAttributes.airlineNameKR;
      const flightId = intentRequest.sessionAttributes.flightId;

      // 출발일자, 항공사 , 항공편명 값을 대조하여 사용자가 탈 비행기 후보군을 압축해서 저장할 리스트
      var finalFlightSchedule = [];

      // 데이터 비교
      for(var i=0; i<flightSchedule_list.length; i++) {
        //날짜 yyyymmdd 형식으로 맞춤
        const flightSchedule_date = flightSchedule_list[i].scheduleDateTime[0].substring(0,8);
        if(departureDate==flightSchedule_date && airlineNameKR == flightSchedule_list[i].airline[0] && flightId == flightSchedule_list[i].flightId[0])
          finalFlightSchedule.push(flightSchedule_list[i]);
      }

      console.log('finalFlightSchedule 길이 : '+finalFlightSchedule.length);



      // 후보군 압축 과정 실행 결과
      if(finalFlightSchedule.length == 0) {
        console.log(`조회결과 ${daDepartureDate} ${daDestination}행 ${airlineNameKR} 항공편은 없습니다`);
        // 세션정보 없애기
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} ${daDepartureDate}`}, null);
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
    return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} during upcoming 7 days`}, null);
  });
};
