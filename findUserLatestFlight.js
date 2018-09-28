'use strict';

/*
 * findUserLatestFlight.js - To confirm whether user searched for his flight schedule few days age
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const databaseManager = require('./databaseManager');

// Myflght DB에서 가져온 정보와 메세지 정보를 객체로 만들어서 리턴
function buildUserLatestFlightResult(slots, messageContent, sessionAttributes) {
  return {
    slots,
    message:{contentType: 'PlainText', content : messageContent},
    sessionAttributes
  };
}

// Myflght DB에서 사용자의 최근 비행기 정보를 가져와서 세션 정보에 저장
module.exports = function(userId, sessionAttributes, str) {
  console.log('MyFlight DB를 조회하자!');
  return databaseManager.findUserLatestFlight(userId, str).then(item => {
    // DB에서 비행기 운항일자, 항공편명, 도착/출발 구분 정보를 가져옴
    console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);

    // 사용자가 기존에 조회한 내역이 없다면
    if(item == null)
      return null;

    // 출발편에 대한 기록을 가져온 경우
    if(str=='departure') {
      sessionAttributes = {};
      sessionAttributes['departureDate'] = item.departureDate;
      sessionAttributes['destinationCode'] = item.destinationCode;  // 도착지 공항 코드
      sessionAttributes['airlineNameKR'] = item.airlineName_kr;
      sessionAttributes['flightId'] = item.flightId;

      // item.departureDate은 YYYYMMDD 형태이므로 -> YYYY-MM-DD 변환 후 slot에 반영
      var dateString=item.departureDate;
      console.log(`findUserLatestFlight's Result : ${dateString}`)
      const slots = {
        departureDate: dateString.substring(0,4)+'-'+dateString.substring(4,6)+'-'+dateString.substring(6,8),
        destinationName_en: item.destinationName_en,
        airlineName_en: item.airlineName_en,
        flightId: item.flightId
      };
      return buildUserLatestFlightResult(slots, `You recently searched ${item.departureDate} ${item.flightId} goint to ${item.destinationName_en}. Do you want to know about that?`, sessionAttributes);
    }
    else {  // 도착편에 대한 정보를 가져온 경우
      sessionAttributes = {};
      sessionAttributes['arrivalDate'] = item.arrivalDate;
      sessionAttributes['sourceCode'] = item.sourceCode;  // 도착지 공항 코드
      sessionAttributes['airlineNameKR'] = item.airlineName_kr;
      sessionAttributes['flightId'] = item.flightId;

      // item.departureDate은 YYYYMMDD 형태이므로 -> YYYY-MM-DD 변환 후 slot에 반영
      var dateString=item.arrivalDate;
      console.log(`findUserLatestFlight's Result : ${dateString}`)
      const slots = {
        arrivalDate: dateString.substring(0,4)+'-'+dateString.substring(4,6)+'-'+dateString.substring(6,8),
        sourceName_en: item.sourceName_en,
        airlineName_en: item.airlineName_en,
        flightId: item.flightId
      };
      return buildUserLatestFlightResult(slots, `You recently searched ${item.arrivalDate} ${item.flightId} from ${item.sourceName_en}. Do you want to know about that?`, sessionAttributes);
    }
  });
}
