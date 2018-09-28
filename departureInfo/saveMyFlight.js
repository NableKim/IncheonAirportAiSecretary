'use strict';

/*
 * saveMyFlight.js - To save search result to DB and make a response message for user
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-15
*/

const databaseManager = require('../databaseManager');
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

module.exports = function(intentRequest, flightInfo) {
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
      "결항":"Cancelled",
      "지연":"Delayed",
      "탑승중":"Borading",
      "마감예정":"Final Call",
      "탑승마감":"Gate Closing",
      "탑승준비":"Gate Open"
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
