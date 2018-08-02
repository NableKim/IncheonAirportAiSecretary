'use strict';

const databaseManager = require('./databaseManager');

var date = require('date-and-time');
var date_list = []; // 일주일치 날짜 담을 배열

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

// 출발 일자 적합성 판단
module.exports.validateFlightDate = function(departureDate) {
  console.log('Let\'s Validate FlightDate...');

  // 문자열을 Date객체로 변환
  var input_date = date.parse(departureDate, 'YYYY-MM-DD');
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

  // 조회일과 오늘 일수 차이 구하기
  var diff_days = date.subtract(today, input_date).toDays();  // 날짜 차이 계산

  // input_date가 오늘을 기준으로 일주일 이내의 날짜가 아니라면
  if(0 > diff_days || diff_days > 6) {
    // 오늘부터 일주일치 날짜 담아두기
    for(var i=0; i<7; i++)
      date_list.push(date.addDays(today, i));

    // 출발 일자 다시 받아!
    const options = getOptions('Select a date', date_list);
    return {
      'isValid':false,
      'options':options
    };
  }

  return {
    'isValid':true
  };


  /* NOTE:
  *   참고)미국·캐나다의 서머타임은 매년 3월 두번째 일요일에 시작되어 11월 첫번째 일요일에 끝난다.
  *   서머타임 적용시 -13시간 차이, 서머타임 해제시 -14시간 차이
  *   현재 미국 시간이 0~11시 사이(서머타임 적용시)라면 == 한국과 같은 날
  *   현재 미국 시간이 11~24시 사이라면 == 한국보다 하루 늦음
  */


};


//===========================================================================================
// 출발 일자 적합성 판단
module.exports.validateFlightDestination = function(destination) {
  console.log('Let\'s Validate Destination...');

  // TODO: 도착지 적합성 판단 - airport-table DB
  // DB에 도착지 도시명이 있으면 그 데이터가 갈거고 아니면 null 반환
  return databaseManager.getDestinationCode(destination);
};
