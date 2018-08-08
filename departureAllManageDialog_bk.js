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
//var api_config = require('./config/openAPIkey.json');

var date = require('date-and-time');
var date_list = []; // 일주일치 날짜 담을 배열

const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');
const getDataFromAPI = require('./getDataFromAPI');

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

function getButtons(options) {
  var buttons = [];
  _.forEach(options, option => {
    buttons.push({
      text: option,
      value: option
    });
  });
  return buttons;
}

function getOptions(title, date_list) {
  return {
    title,
    imageUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyDigAdGpSj9gTufkHNKpospNRMXUwrS03YMJzN3yYXYznbZadQg',
    buttons : getButtons(date_list)
  };
}

// 사용자가 입력한 목적지, 항공사, 출발 일자, 항공편명이 적절한 입력인지 판단하는 함수
function validateFlightInfo(daDepartureDate, daDestination, daAirline, daFlightNum) {
  console.log("validateFlightInfo : 사용자로부터 받은 Slot값 적절성 판단");

  // TODO : intentRequest의 sessionAttributes에 적합성 판단 여부 값을 추가해서 불필요한 로직을 중복해서 실행하지 못하게 하자

  // 출발 일자 적합성 판단
  if(!daDepartureDate) {
    // change string to date
    var input_date = date.parse(daDepartureDate, 'YYYY-MM-DD');
/*
    // TODO : 사용자가 다음주, 이번주 이런식으로 입력하면 날짜값이 이상하게 올테니 그거에 대한 예외처리 하기

    // NOTE : input_date는 버지니아 북부 시간 기준이므로 한국 시간으로 변경해주기
    var diff_days = date.subtract(today, input_date).toDays();  // 날짜 차이 계산
    // input_date가 어제, 오늘, 내일이라면
    if(-1<=diff_days && diff_days <= 1) {
      // 섬머 타임 확인
        // 예스
          // input_data = date.addHours(input_data, 13);
        // 노우
          // input_data = date.addHours(input_data, 14);
    }
*/

    const today = new Date();
/*
    // 오늘부터 일주일치 날짜 담아두기
    for(var i=0; i<7; i++)
      date_list.push(date.addDays(today, i));
*/
    diff_days = date.subtract(today, input_date).toDays();  // 날짜 차이 계산

    // input_date가 오늘을 기준으로 일주일 이내의 날짜가 아니라면
    if(0 > diff_days || diff_days > 6) {
        // 출발 일자 다시 받아!
        const options = getOptions('Select a date', date_list);
        return buildValidationResult(false, 'daDepartureDate', `it's invalid date. Please tell me date inside 7 days!`, options);
    }

    /* NOTE:
    *   참고)미국·캐나다의 서머타임은 매년 3월 두번째 일요일에 시작되어 11월 첫번째 일요일에 끝난다.
    *   서머타임 적용시 -13시간 차이, 서머타임 해제시 -14시간 차이
    *   현재 미국 시간이 0~11시 사이(서머타임 적용시)라면 == 한국과 같은 날
    *   현재 미국 시간이 11~24시 사이라면 == 한국보다 하루 늦음
    */
  }

  // 도착지 정보 적합성 판단
  if(!daDestination) {
    // TODO: 도착지 적합성 판단 - airport-table DB
    var result = databaseManager.getDestinationCode(daDestination);

    // DB에 도착지 도시명이 없다면
    if(result == null) {
      // 도착지 도시명 다시 받아!
      return buildValidationResult(false, 'daDestination', `${daDestination} is not exact city name. Please say correct name`);
    }
  }

  // 항공사 정보 적합성 판단
  if(!daAirline) {
    // TODO: 항공사 적합성 판단 - airline-tabla DB
    var result = databaseManager.getAirlineNameKR(daAirline);

    // DB에 항공사 정보가 없다면
     if(result == null) {
       // 항공사 이름 다시 받아!
       return buildValidationResult(false, 'daAirline', `${daAirline} is not exact airline name. Please say correct name`);
     }
  }

  return buildValidationResult(true, null, null, null);

}

function buildUserLatestFlightResult(slots, messageContent) {
  return {
    slots,
    message:{contentType: 'PlainText', content : messageContent}
  };
}

// Myflght DB에서 사용자의 최근 비행기 정보를 가져오기
function findUserLatestFlight(userId) {
/*
  // 최근 조회한 항공편의 일자, 도착지, 항공사, 항공편명 가져오고
  const item = databaseManager.findUserLatestFlight(userId);
  console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);

  // 골라낸 후 값 저장
  const slots = {
    destination: item.Item.date,
    airline: item.Item.airline,
    departureDate: item.Item.date,
    flightNum: item.Item.flightNum
  };

  // 확인 메세지 구성
  return buildUserLatestFlightResult(slots, `Your flight is ${slots.flightNum} leaving for ${slots.destination}?`);
*/

  return databaseManager.findUserLatestFlight(userId).then(item => {
    // DB에서 비행기 운항일자, 항공편명, 도착/출발 구분 정보를 가져옴
    console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);
    const slots = {
      destination: item.Item.date,
      airline: item.Item.airline,
      departureDate: item.Item.date,
      flightNum: item.Item.flightNum
    };
    return buildUserLatestFlightResult(slots, `Would you like to order a ${item.Item.date} ${item.Item.flightNum}?`);
  });

}

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
    console.log("최근 비행기 정보를 불러올게용~");

    // 최근 비행기 정보가 있으면
    return findUserLatestFlight(intentRequest.userId).then(item => {
      console.log(`findUserLatestFlight : ${JSON.stringify(item)}`);
      slots.daDestination = item.slots.destination; // 도착지
      slots.daAirline = item.slots.airline; // 항공사
      slots.daDepartureDate = item.slots.departureDate; // 출발일자
      slots.daFlightNum = item.slots.flightNum; // 항공편명

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
    const validationResult = validateFlightInfo(daDepartureDate, daDestination, daAirline);

    // 사용자로부터 받은 4가지 slot값들 중에 부적절한 값이 있다면
    if(!validationResult.isValid) {
      // 부적절한 값을 가진 slot은 null로 초기화
      slots[`${validationResult.violatedSlot}`] = null;

      // TODO : slot 값을 다시 받아오기 위해 elicitSlot 실행
      if(validationResult.violatedSlot == daDepartureDate) {
        return Promise.resolve(lexResponses.elicitSlot(
          intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message,
          validationResult.options.title, validationResult.options.imageUrl, validationResult.options.buttons)
        ));
      }
      else {
        return Promise.resolve(lexResponses.elicitSlot(
          intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message)
        ));
      }
    }
    else { // 사용자가 입력한 slot값들이 모두 적절하다면
      // TODO: 운항정보 API에 요청메세지를 보내기 위한 파라미터로 도착지 code가 필요
      // 방법 1. 세션정보를 이용할 수 있다면 하기
      // 방법 2. 디비에서 도착지 code를 가져오는 수 밖에...
      var dst_result = databaseManager.getDestinationCode(daDestination);
      const destinationCode = dst_result['airport_code'];
      var flightSchedule_list = getDataFromAPI.getFlightDepartureSchedule(destinationCode); // 일주일치 daDestination행 항공편 받아오기

      // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
      var finalFlightSchedule = [];
      if(flightSchedule_list.length == 0)
        console.log(`조회결과 ${daDestination}행 항공편은 없습니다`);
        // TODO : 뭔가를 리턴
      else {
        console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);

        // 출발일자 20180807 형식
        var strArray=daDepartureDate.split('-');
        const departureDate=strArray[0]+strArray[1]+strArray[2];

        // 항공사 국문명
        var aln_result = databaseManager.getAirlineNameKR(daAirline);
        const airlineNameKR = aln_result['name_kr'];

        // 데이터 비교
        for(var i=0; i<flightSchedule_list.length; i++) {
          //날짜 yyyymmdd 형식으로 맞춤
          flightSchedule_date = (flightSchedule_list[i].scheduleDateTime).substring(0,8);
          if(departureDate==flightSchedule_date && airlineNameKR == flightSchedule_list[i].airline)
            finalFlightSchedule.push(flightSchedule_list[i]);
        }

        if(finalFlightSchedule.length == 0) {
          console.log(`조회결과 ${daDepartureDate} ${daDestination}행 ${airlineNameKR} 항공편은 없습니다`);
          // TODO : 뭔가를 리턴
        }
        else if(finalFlightSchedule.length == 1) {
            console.log('사용자가 찾는 항공편 찾았다!');
            // 찾은 데이터로 slot값 갱신
        }
        else {
          console.log(`후보군 압축 결과 : ${finalFlightSchedule}`);
          // ElcitSlot으로 사용자로부터 항공편명 선택받도록 함
        }

        // 여기까지 오면 사용자로부
      }
    }
  }
};
