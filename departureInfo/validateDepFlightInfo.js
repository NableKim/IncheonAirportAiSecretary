'use strict';

const flightInfoManager = require('../flightInfoManager');
const _ = require('lodash');

// Slot값 타당성 검사 후 사용자에게 보낼 메세지 구성요소 만들기
function buildValidationResult(isValid, violatedSlot, sessionAttributes, currentIntent, messageContent, options) {
  if(messageContent == null) {
    return {
      isValid,
      violatedSlot,
      sessionAttributes,
      currentIntent,
      options
    };
  }

  if(options == null) { // 항공사 정보가 부정확경우 이 결과를 반환
    return {
      isValid,
      violatedSlot,
      sessionAttributes,
      currentIntent,
      message : {contentType : 'PlainText', content: messageContent}
    };
  }

  return {  // 출발일 정보가 부정확경우 이 결과를 반환
    isValid,
    violatedSlot,
    sessionAttributes,
    currentIntent,
    message : {contentType : 'PlainText', content: messageContent},
    options
  };
}

// 사용자가 입력한 목적지, 항공사, 출발 일자, 항공편명이 적절한 입력인지 판단하는 함수
module.exports = function(sessionAttributes, currentIntent, departureDate, destination, airline) {
  console.log("validateDepFlightInfo : 사용자로부터 받은 Slot값 적절성 판단");

  // sessionAttributes가 비어있다면
  if(_.isEmpty(sessionAttributes)) {
    console.log('sessionAttributes가 비어있으니 안에 confirmIntent 객체를 만들게요');
    sessionAttributes = {};
    sessionAttributes['departureDate'] = null;
    sessionAttributes['destinationCode'] = null;  // 도착지 공항 코드
    sessionAttributes['airlineNameKR'] = null;
    sessionAttributes['flightId'] = null;
  }

  // 출발 일자 적합성 판단
  if(departureDate!=null && sessionAttributes.departureDate == null) {
    const validateResultOfDate=flightInfoManager.validateFlightDate(currentIntent, departureDate, 'departure');
    // 이 결과가 참
    if(validateResultOfDate.isValid) {
      // sessionAttributes에 날짜 정보 반영
      // departureDate가 YYYY-MM-DD 형식이므로 YYYYMMDD로 변환해서 넣기
      sessionAttributes['departureDate']=departureDate.substring(0,4)+departureDate.substring(5,7)+departureDate.substring(8,10);
      console.log(`날짜가 들어갔는가!? : ${JSON.stringify(sessionAttributes)}`);
      console.log('출발일자가 적합하군요!');
      return Promise.resolve(buildValidationResult(true, null, sessionAttributes, validateResultOfDate.currentIntent, null, null));
    }
    // 이 결과가 거짓
    else {
      // 출발 일자를 다시 받도록 하자
      console.log('출발일자가 부적합하여 다시 받아야겠어요');
      return Promise.resolve(buildValidationResult(false, 'daDepartureDate', sessionAttributes, currentIntent, null, 'it\'s invalid date. Please tell me date inside 7 days! If there is not your date below list, PLEASE WRITE THE DATE such as \"YYYY-MM-DD\"', validateResultOfDate.options));
    }
  }

  // 도착지 정보 적합성 판단
  if(destination!=null && sessionAttributes.destinationCode == null) {
    return flightInfoManager.validateAirportName(destination).then(validateResultOfDestination => {
      if(validateResultOfDestination!=null) {
        // DB에서 가져온 도착지 코드를 sessionAttributes에 업데이트
        sessionAttributes['destinationCode']=validateResultOfDestination.airport_code;
        console.log('도착지 이름이 적합하군요!');
        return buildValidationResult(true, null, sessionAttributes, currentIntent, null, null);
      }
      else {  // 결과값이 없다면
        // 도착지를 다시 받도록 하자
        console.log('도착지 이름이 부적합하여 다시 받아야겠어요');
        return buildValidationResult(false, 'daDestination', sessionAttributes, currentIntent, `${destination} is not exact city name. Please say correct name`);
      }
    });
  }

  // 항공사 정보 적합성 판단
  if(airline!=null && sessionAttributes.airlineNameKR == null) {
    return flightInfoManager.validateFlightAirline(airline).then(validateResultOfAirline => {
      if(validateResultOfAirline!=null) {
        // DB에서 가져온 도착지 코드를 sessionAttributes에 업데이트
        sessionAttributes['airlineNameKR']=validateResultOfAirline.name_kr;  // 항공사 국문명을 세션에 저장
        console.log('항공사 이름이 적합하군요!');
        return buildValidationResult(true, null, sessionAttributes, currentIntent, null, null);
      }
      else {  // 결과값이 없다면
        // 도착지를 다시 받도록 하자
        console.log('항공사 이름이 부적합하여 다시 받아야겠어요');
        return buildValidationResult(false, 'daAirline', sessionAttributes, currentIntent, `${airline} is not exact airline name. Please say correct name`);
      }
    });
  }

  // 현재까지의 입력값이 적합할 경우
  return Promise.resolve(buildValidationResult(true, null, sessionAttributes, currentIntent, null, null));
};
