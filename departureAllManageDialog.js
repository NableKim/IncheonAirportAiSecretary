'use strict';

/*
 * departureAllManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-26
*/
//const _ = require('lodash');

const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');
const flightInfoManager = require('./flightInfoManager');

const _ = require('lodash');

// Slot값 타당성 검사 후 사용자에게 보낼 메세지 구성요소 만들기
function buildValidationResult(isValid, violatedSlot, messageContent, options) {
  if(messageContent == null) {
    return {
      isValid,
      violatedSlot,
      options
    };
  }

  if(options == null) {
    return {
      isValid,
      violatedSlot,
      message : {contentType : 'PlainText', content: messageContent},
    };
  }

  return {
    isValid,
    violatedSlot,
    message : {contentType : 'PlainText', content: messageContent},
    options
  };
}

// =======================================================================================================================================
// 사용자가 입력한 목적지, 항공사, 출발 일자, 항공편명이 적절한 입력인지 판단하는 함수
function validateFlightInfo(sessionAttributes, departureDate, destination, airline) {
  console.log("validateFlightInfo : 사용자로부터 받은 Slot값 적절성 판단");

  // sessionAttributes가 비어있다면
  if(_.isEmpty(sessionAttributes)) {
    sessionAttributes['confirmIntent'] = {
      'departureDate' : null,
      'destination' : null, // 도착지 공항 코드
      'airline' : null
    };
  }

  // 출발 일자 적합성 판단
  if(departureDate!=null && sessionAttributes.confirmIntent.departureDate == null) {
    const validateResultOfDate=flightInfoManager.validateFlightDate(departureDate);
    // 이 결과가 참
    if(validateResultOfDate.isValid) {
      // sessionAttributes에 날짜 정보 반영
      // departureDate가 YYYY-MM-DD 형식이므로 YYYYMMDD로 변환해서 넣기
      sessionAttributes['confirmIntent']['departureDate']=departureDate.substring[0,4]+departureDate.substring[5,7]+departureDate.substring[8,10];
    }
    // 이 결과가 거짓
    else {
      // 출발 일자를 다시 받도록 하자
      console.log('출발일자가 부적합하여 다시 받아야겠어요');
      return buildValidationResult(false, 'daDepartureDate', `it's invalid date. Please tell me date inside 7 days!`, validateResultofDate.options);
    }
  }

  console.log('출발일자가 적합하군요!');

  // 도착지 정보 적합성 판단
  if(destination!=null && sessionAttributes.confirmIntent.destination != null) {
    const validateResultOfDestination=flightInfoManager.validateFlightDestination(destination);
    if(validateResultOfDestination) {
      // DB에서 가져온 도착지 코드를 sessionAttributes에 업데이트
      sessionAttributes['confirmIntent']['destination']=validateResultOfDestination.lata_code;
    }
    else {  // 결과값이 없다면
      // 도착지를 다시 받도록 하자
      console.log('도착지 이름이 부적합하여 다시 받아야겠어요');
      return buildValidationResult(false, 'daDestination', `${destination} is not exact city name. Please say correct name`);
    }
  }

  console.log('도착지 이름이 적합하군요!');

}



// =======================================================================================================================================
// Myflght DB에서 가져온 정보와 메세지 정보를 객체로 만들어서 리턴
function buildUserLatestFlightResult(slots, messageContent) {
  return {
    slots,
    message:{contentType: 'PlainText', content : messageContent}
  };
}

// Myflght DB에서 사용자의 최근 비행기 정보를 가져오기
function findUserLatestFlight(userId) {
  console.log('MyFlight DB를 조회하자!');
  return databaseManager.findUserLatestFlight(userId).then(item => {
    // DB에서 비행기 운항일자, 항공편명, 도착/출발 구분 정보를 가져옴
    console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);

    // 사용자가 기존에 조회한 내역이 없다면
    if(item == null)
      return null;

    // item.departureDate은 YYYYMMDD 형태이므로 -> YYYY-MM-DD 변환 후 slot에 반영
    var dateString=item.departureDate;
    console.log(`findUserLatestFlight's Result : ${dateString}`)
    const slots = {
      departureDate: dateString.substring[0,4]+'-'+dateString.substring[4,6]+'-'+dateString.substring[6,8],
      destName_en: item.destName_en,
      airline: item.airline,
      flightId: item.flightId
    };
    return buildValidationResult(slots, `Would you like to order a ${item.daDepartureDate} ${item.flightId}?`);
  });
}

// =======================================================================================================================================
module.exports = function(intentRequest, callback) {
  console.log("departureAllManageDialog was called...");
  var daDepartureDate=intentRequest.currentIntent.slots.daDepartureDate;
  var daDestination=intentRequest.currentIntent.slots.daDestination;
  var daAirline=intentRequest.currentIntent.slots.daAirline;
  var daFlightNum=intentRequest.currentIntent.slots.daFlightNum;
  const slots = intentRequest.currentIntent.slots;

  // Slot 데이터가 아무것도 없을 때(대화의 시작)
  if(daDestination === null && daAirline === null && daDepartureDate === null) {
    // 최근 비행기 정보를 가져와서 사용자에게 뿌려주기 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    console.log("사용자로부터 받은 데이터가 없습니다!");
    return findUserLatestFlight(intentRequest.userId).then(item => {

      // 사용자가 기존에 조회한 내역이 없다면
      if(item==null)
        return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);

      // 조회한 내역이 있다면
      console.log(`findUserLatestFlight : ${JSON.stringify(item)}`);

      slots.daDepartureDate = item.departureDate; // 출발일자
      slots.daDestination = item.destName_en; // 도착지(영문명)
      slots.daAirline = item.airline; // 항공사(영문)
      slots.daFlightNum = item.flightId; // 항공편명

      console.log('slots 값 출력 : '+ slots);

      // 찾은 항공편이 사용자가 찾고 있는 항공편이 맞는지 묻기
      // 최근에 조회했던 비행기 정보를 사용자에게 확인하기위해 메세지 전송
      return lexResponses.confirmIntent(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, item.message);
    }).catch(error => {
      console.error(error);
      // 오류 처리 = DB에서 최근 항공 정보를 불러오기 실패 = 사용자로부터 데이터 수집 시작
      return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
    });
  }
  else { // Slot 데이터를 받아온게 있다면(대화 진행 중)
    console.log("사용자로부터 받은 데이터가 있어요!");

    const validationResult = validateFlightInfo(intentRequest.sessionAttributes, daDepartureDate, daDestination, daAirline);

  }
};
