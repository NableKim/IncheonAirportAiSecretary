'use strict';

/*
 * departureAllManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-26
*/

// open api에서 정보를 가져오기 위해 사용하는 모듈
var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('./config/openAPIkey.json');

const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');

// 전체 항공편 정보
var flghtDepartureSchedule = [];

// Slot값 타당성 검사 후 사용자에게 보낼 메세지 구성요소 만들기
function buildValidationResult(isValid, violatedSlot, messageContent, options) {
  if(messageContent == null) {
    return {
      isValid,
      violatedSlot,
      options
    };
  }
  return {
    isValid,
    violatedSlot,
    message : {contentType : 'PlainText', content: messageContent},
    options
  };
}

// 사용자가 입력한 목적지, 항공사, 출발 일자, 항공편명이 적절한 입력인지 판단하는 함수
function validateFlightInfo(daDepartureDate, daDestination, daAirline, daFlightNum) {
  console.log("validateFlightInfo : 사용자로부터 받은 Slot값 적절성 판단");

  if(!daDepartureDate) {
    // 참고)미국·캐나다의 서머타임은 매년 3월 두번째 일요일에 시작되어 11월 첫번째 일요일에 끝난다.
    // 서머타임 적용시 -13시간 차이, 서머타임 해제시 -14시간 차이

    // TODO: 출발 일자 적합성 판단
    // 서머 타임 확인
      // 오늘을 기준으로 일주일 이내의 날짜라면
        // 입력받은 날짜가 오늘 또는 내일 날짜라면
          // 오늘이라면
            // 현재 미국 시간이 0~11시 사이(서머타임 적용시)라면 == 한국과 같은 날
            // 현재 미국 시간이 11~24시 사이라면 == 한국보다 하루 늦음
              // 일자 하루 증가시켜서 계산
          // 내일이라면
            // 현재 미국 시간이 0~11시 사이(서머타임 적용시)라면 == 한국과 같은 날
              // 오늘 일자에 1일 추가
            // 현재 미국 시간이 11~24시 사이라면 == 한국보다 하루 늦음
              // 일자 이틀 증가시켜서 계산
        // 입력받은 날짜가 오늘 또는 내일 날짜가 아니라면
      // 오늘을 기준으로 일주일 이내의 날짜가 아니라면
        // 출발 일자 다시 받아!
  }

  // 항공편명 정보가 입력되었다면
  if(!daFlightNum) {
    // TODO: 항공편명 적합성 판단
      // 입력받은 항공편명에서 항공사코드 부분이 적절한지 Airline DB를 통해 확인
        // 있으면
          // 트루
        // 없으면
          // 항공편명 다시 받아!
  } else {  // 항공편 정보가 없다면
    // 도착지, 항공사 정보 적합성 판단
    if(!daDestination) {
      // TODO: 도착지 적합성 판단 - Airport DB
        // DB에 도착지 도시명이 있다면
          // true
        // DB에 도착지 도시명이 없다면
          // 도착지 도시명 다시 받아!
    }

    if(!daAirline) {
      // TODO: 항공사 적합성 판단 - Airline DB
        // DB에 항공사 이름이 있다면
          // true
        // DB에 항공사 이름이 없다면
          // 항공사 이름 다시 받아!!
    }
  }

  //return buildValidationResult(true, null, null, null);

}

function buildUserLatestFlightResult(slots, messageContent) {
  return {
    slots,
    message:{contentType: 'PlainText', content : messageContent}
  };
}

function getFlightDepartureSchedule() {
  var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerDeparturesDS';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
  //queryParams += '&' + encodeURIComponent('airport_code') + '=' + encodeURIComponent('SEA'); // 도착지 공항코드


}

// Myflght DB에서 사용자의 최근 비행기 정보를 가져오기
function findUserLatestFlight(userId) {

  // DB에서 데이터 가져오고
  const item = databaseManager.findUserLatestFlight(userId);
  console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);

  // TODO: 운항정보 API에서 운항 스케줄 전부 가져오기

  // TODO: 운항 일자와 비행기편명을 가지고 사용자의 항공편을 골라내기
  const departureDate = item.Item.date;
  const flightNum = item.Item.flightNum;

  // 골라낸 후 값 저장
  const slots = {
    destination: "",
    airline: "",
    departureDate: "",
    departureTiem: "",
    flightNum: "",
  };

  // 확인 메세지 구성
  return buildUserLatestFlightResult(slots, `Your flight is ${slots.flightNum} leaving for ${slots.destination}?`);


/* ~.then()를 쓰니가 함수로 인식이 안되는 오류가 있음... 그래서 일단 보류
  return databaseManager.findUserLatestFlight(userId).then(item => {
    // DB에서 비행기 운항일자, 항공편명, 도착/출발 구분 정보를 가져옴
    console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);
    return buildValidationResult(item.Item.date, item.Item.flightNum, `Would you like to order a ${item.Item.date} ${item.Item.flightNum}?`);
  });
*/
}

module.exports = function(intentRequest, callback) {
  console.log("departureAllManageDialog was called...");
  var daDestination=intentRequest.currentIntent.slots.daDestination;
  var daAirline=intentRequest.currentIntent.slots.daAirline;
  var daDepartureDate=intentRequest.currentIntent.slots.daDepartureDate;
  var daDepartureTime=intentRequest.currentIntent.slots.daDepartureTime;
  var daFlightNum=intentRequest.currentIntent.slots.daFlightNum;
  const slots = intentRequest.currentIntent.slots;

  // Slot 데이터가 아무것도 없을 때(대화의 시작)
  if(daDestination === null && daAirline === null && daDepartureDate === null) {
    // 최근 비행기 정보를 가져와서 사용자에게 뿌려주기 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    console.log("최근 비행기 정보를 불러올게용~");

    // 최근 비행기 정보가 있으면
    return findUserLatestFlight(intentRequest.userId).then(item => {
      console.log(`findUserLatestFlight : ${JSON.stringify(item)}`);
      slots.daDestination = slots.destination;
      slots.daAirline = slots.airline;
      slots.daDepartureDate = slots.departureDate;
      slots.daDepartureTime = slots.departureTiem;
      slots.daFlightNum = slots.flightNum;

      // 찾은 항공편이 사용자가 찾고 있는 항공편이 맞는지 묻기
      // 최근에 조회했던 비행기 정보를 사용자에게 확인하기위해 메세지 전송
      return lexResponses.confirmIntent(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, item.message)
    }).catch(error => {
      console.log(error);
      // 오류 처리 = DB에서 최근 항공 정보를 불러오기 실패 = 사용자로부터 데이터 수집 다시
      return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
    });
  }
  else { // Slot 데이터를 받아온게 있다면(대화 진행 중)
    const validationResult = validateFlightInfo(daDepartureDate, daDestination, daAirline, daFlightNum);

    // 사용자로부터 받은 4가지 slot값들 중에 부적절한 값이 있다면
    if(!validationResult.isValid) {
      // 부적절한 값을 가진 slot은 null로 초기화
      slots[`${validationResult.violatedSlot}`] = null;
      // TODO : slot 값을 다시 받아오기 위해 elicitSlot 실행
    }
    else { // 사용자가 입력한 slot값들이 모두 적절하다면
      // 항공편명을 알고 있다면
        // API에서 정보 불러와서
        // 사용자의 비행기만 골라내기
        // 도착지, 항공사 slot값에 세팅해주기
      // 항공편명은 모르고 도착지, 항공사 정보만 안다면
        // 사용자로부터 입력받은 3가지 슬롯으로 대상을 압축하고
        // 압축한 대상들을 card형식으로 사용자에게 반환
         // 사용자 최종적인 하나의 운항편을 선택하게금 유도 >> flightNum을 알아냄
    }
  }
};
