'use strict';

const databaseManager = require('./databaseManager');
const _ = require('lodash');
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
    imageUrl : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Calendar_font_awesome.svg/2000px-Calendar_font_awesome.svg.png',
    buttons : getButtons(date_list)
  };
}

/*
Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1); // 미국 로스엔젤레스의 1월 1일 시간  - 서머타임 X - (-8시간 차이) - (+480)
    console.log('jan : '+jan+' '+jan.getTimezoneOffset());
    var jul = new Date(this.getFullYear(), 6, 1);  // 미국 로스엔젤레스의 7월 1일 시간 - 서머타임 o - (-7시간 차이) - (+420)
    console.log('jul : '+jul.getTimezoneOffset());
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
  console.log('getTime : '+this.getTimezoneOffset());
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}
*/

// 출발 일자 적합성 판단
module.exports.validateFlightDate = function(slotDetails, date_str) { // YYYY-MM-DD
  console.log('Let\'s Validate FlightDate... slotDetails값은 '+slotDetails+'이고 date는 '+date_str);

  // 문자열을 Date객체로 변환
  var input_date = date.parse(date_str, 'YYYY-MM-DD');
  /*
  // TODO : 사용자가 다음주, 이번주 이런식으로 입력하면 날짜값이 이상하게 올테니 그거에 대한 예외처리 하기

  // NOTE : input_date는 버지니아 북부 시간 기준이므로 한국 시간으로 변경해주기



  if(-1<=diff_days && diff_days <= 1) {
    // 섬머 타임 확인
      // 예스
        // input_data = date.addHours(input_data, 13);
      // 노우
        // input_data = date.addHours(input_data, 14);
  }
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

/*
  // 사용자의 날짜 입력이 오늘 또는 내일이라는 단어로 들어왔다면
  if((slotDetails.dadate.originalValue).toLowerCase().indexOf("today")!=-1 || (slotDetails.dadate.originalValue).toLowerCase().indexOf("tomorrow")!=-1) {
    // 섬머타임인지 확인
  }




  var today = new Date();
  if (today.isDstObserved()) {
    console.log('Daylight saving time!');
  } else {
    console.log('응 아니야');
  }

*/
//===============

  const today = new Date();
  console.log('현재 날짜와 시간'+date.format(today, 'YYYY/MM/DD HH:mm:ss'));
  date.format(today, 'YYYY/MM/DD HH:mm:ss')
  // 조회일과 오늘 일수 차이 구하기 = input - today
  var diff_days = date.subtract(input_date, today).toDays();  // 날짜 차이 계산

  // input_date가 오늘을 기준으로 일주일 이내의 날짜가 아니라면
  if(0 > diff_days || diff_days > 6) {
    // 오늘부터 일주일치 날짜 담아두기
    for(var i=0; i<5; i++)
      date_list.push(date.format(date.addDays(today, i), 'YYYY-MM-DD'));

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
