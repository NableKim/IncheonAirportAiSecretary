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
  };
}

module.exports = function(intentRequest, flightInfo) {
  console.log('flightInfo값은 : '+JSON.stringify(flightInfo));
  return databaseManager.saveMyArrivalflightToDB(intentRequest).then(item => {

    var terminal= {
      "P01":"Terminal 1",
      "P02":"Concourse A",
      "P03":"Terminal 2"
    };
    // 운항상태
    var status = {
      '도착':'Arrived',
      '결항':'Cancelled',
      '지연':'Delayed',
      '회황':'Diverted',
      '착륙':'Landed'
    };

    const terminalid = terminal[flightInfo.terminalid[0]];

    var fulfillMessage = `Your flight schedule is as follow.\n
    Date : ${flightInfo.estimatedDateTime[0].substring(0,8)}
    Source : ${intentRequest.currentIntent.slots.aaSource}(${flightInfo.airportcode[0]})
    Airline : ${intentRequest.currentIntent.slots.aaAirline}
    Flight Number : ${flightInfo.flightId[0]}
    Estimated Time : ${flightInfo.estimatedDateTime[0].substring(8,10)}:${flightInfo.estimatedDateTime[0].substring(10,12)}
    Scheduled Date(old) : ${flightInfo.scheduleDateTime[0].substring(0,8)}
    Scheduled Time(old) : ${flightInfo.scheduleDateTime[0].substring(8,10)}:${flightInfo.scheduleDateTime[0].substring(10,12)}
    Terminal : ${terminalid}`;

    // 비행편이 오늘날짜라면 응답메세지에 비행기 운항상태, 게이트 번호, 수화물 수취대, 출구번호가 추가로 올것이다. 이것을 추가해주자
    if(!_.isEmpty(flightInfo.gatenumber)) {
      fulfillMessage += `\nGate : ${flightInfo.gatenumber[0]}`;
    }

    if(!_.isEmpty(flightInfo.remark)) {
      fulfillMessage +=`\nStatus : ${status[flightInfo.remark[0]]}`;
    }

    if(!_.isEmpty(flightInfo.carousel)) {
      fulfillMessage += `\nCarousel : ${flightInfo.carousel[0]}`;
    }

    if(!_.isEmpty(flightInfo.exitnumber)) {
      fulfillMessage += `\nExit : ${flightInfo.exitnumber[0]}`;
    }

    return buildFulfillmentResult('Fulfilled', fulfillMessage);
  });
}
