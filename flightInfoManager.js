'use strict';

/*
 * flightInfoManager.js - to validate slot-inputs from user (flight date, place, airline)
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-13
 */

const databaseManager = require('./databaseManager');
const _ = require('lodash');
var date = require('date-and-time');

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
    imageUrl : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Calendar_font_awesome.svg/2000px-Calendar_font_awesome.svg.png',
    buttons : getButtons(date_list)
  };
}

// 출발 일자 적합성 판단
module.exports.validateFlightDate = function(currentIntent, date_str, depORarr) { // YYYY-MM-DD

  var date_list = []; // 일주일치 날짜 담을 배열
  console.log('Let\'s Validate FlightDate... slotDetails값은 '+currentIntent.slotDetails+'이고 date는 '+date_str);

  // 한국의 현재 시간 구하기
  const now = new Date();
  var koreaCurrentDate = date.addHours(now, 9); // +9시간을 해줘서 한국 시간으로 변경
  console.log('한국의 현재 시간'+date.format(koreaCurrentDate, 'YYYY/MM/DD HH:mm:ss'));

  var slot_date = null;
  if(depORarr == 'departure')
    slot_date = currentIntent.slotDetails.daDepartureDate;
  else
    slot_date = currentIntent.slotDetails.aaArrivalDate;

  // 오리지널 입력값이 today이거나 tomorrow 인경우
  if(slot_date.originalValue == "today" || slot_date.originalValue == "tomorrow") {
    if(slot_date.originalValue == "tomorrow")
      koreaCurrentDate = date.addDays(koreaCurrentDate, 1); // 하루 더하기

    console.log('주어진 날짜 입력을 한국 날짜로 변환한 값'+date.format(koreaCurrentDate, 'YYYY/MM/DD HH:mm:ss'));
    date_str = date.format(koreaCurrentDate, 'YYYY-MM-DD');

    // 한국 시간으로 변경한 결과로 슬롯값 업데이트
    if(depORarr == 'departure')
      currentIntent.slots.daDepartureDate = date_str;
    else
      currentIntent.slots.aaArrivalDate = date_str;
  }

  // 문자열을 Date객체로 변환
  var input_date = date.parse(date_str, 'YYYY-MM-DD');

  // 조회일과 오늘 일수 차이 구하기 = input - today
  var diff_days = date.subtract(input_date, koreaCurrentDate).toDays();  // 날짜 차이 계산
  console.log('날짜 차이 : '+diff_days);

  // input_date가 오늘을 기준으로 일주일 이내의 날짜가 아니라면
  if(0 > diff_days || diff_days > 5) {
    // 오늘부터 일주일치 날짜 담아두기
    console.log('date_list 날짜 : '+date_list);
    for(var i=0; i<5; i++)
      date_list.push(date.format(date.addDays(koreaCurrentDate, i), 'YYYY-MM-DD'));

    // 출발 일자 다시 받아!
    const options = getOptions('Select a date', date_list);
    return {
      'isValid':false,
      'currentIntent':currentIntent,
      'options':options
    };
  }

  return {
    'isValid':true,
    'currentIntent':currentIntent,
  };


  /* NOTE:
  *   참고)미국·캐나다의 서머타임은 매년 3월 두번째 일요일에 시작되어 11월 첫번째 일요일에 끝난다.
  *   서머타임 적용시 -13시간 차이, 서머타임 해제시 -14시간 차이
  *   현재 미국 시간이 0~11시 사이(서머타임 적용시)라면 == 한국과 같은 날
  *   현재 미국 시간이 11~24시 사이라면 == 한국보다 하루 늦음
  */
  /*
  한국시간으로 0시~13시까지는 미국은 -1, 한국 0

  오리지널값에 today 또는 tomorrow가 들어있다면
    섬머타임이 시행중이라면
      한국시간이 0~13시 사이라면
        13시간 덧셈
        slot값 변경
    아니라면
      한국시간이 0~13시 사이라면
        14시간 덧셈
        slot값 변경
  */


};


//===========================================================================================
// 도착지 적합성 판단
module.exports.validateAirportName = function(place) {
  console.log('Let\'s Validate place...');

  // TODO: 도착지 적합성 판단 - airport-table DB
  // DB에 도착지 도시명이 있으면 그 데이터가 갈거고 아니면 null 반환
  return databaseManager.getAirportCode(place).then(item => {
    return item;
  });
};

//===========================================================================================
// 항공사 적합성 판단
module.exports.validateFlightAirline = function(airline) {
  console.log('Let\'s Validate Airline...');

  // TODO: 항공사 적합성 판단 - airport-table DB
  // DB에 국문 항공사명이 있으면 그 데이터가 갈거고 아니면 null 반환
  return databaseManager.getAirlineNameKR(airline).then(item => {
    return item;
  });
};
