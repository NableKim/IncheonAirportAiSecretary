'use strict';

/*
 * findingAreaManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-13
 */

const lexResponses = require('../lexResponses');
const findUserLatestFlight = require('../findUserLatestFlight');
var date = require('date-and-time');

module.exports = function(intentRequest, callback) {
  console.log("findingAreaManageDialog was called...");
  var faFindingArea=intentRequest.currentIntent.slots.faFindingArea;

  console.log(faFindingArea);

  const now = new Date(); // 현재 UTC 표준시를 가져옴
  var koreaCurrentDate = date.addHours(now, 9); // +9시간을 해줘서 한국 시간으로 변경
  console.log('한국의 현재 날짜와 시간'+date.format(koreaCurrentDate, 'YYYY/MM/DD HH:mm:ss'));
  const todayString = date.format(koreaCurrentDate, 'YYYYMMDD');

  if(faFindingArea=='Check in counter' || faFindingArea == 'Boarding gate') {
    console.log('출발편 정보를 찾아야겠군');

    // 사용자가 최근 출발 항공편 조회한 적이 있는지 검사 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    return findUserLatestFlight(intentRequest.userId, intentRequest.sessionAttributes, 'departure').then(item => {

      // 사용자가 기존에 조회한 내역이 없다면 대화 끝내기
      if(item==null)
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `No any your flight info. Do you want to register your flight and get flight Information? Then, please say \"Departure information\"`});

      // 있으면 오늘 날짜인지 비교
      console.log('slots 값 출력 : '+ JSON.stringify(item));

      var dateString = item.sessionAttributes.departureDate;  // YYYYMMDD

      if(dateString == todayString) {
        intentRequest.sessionAttributes = item.sessionAttributes;
        return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
      } else {
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `You can get that data on only the departure date!`});
      }
    }).catch(error => {
      console.error(error);
      // 오류 처리 = DB에서 최근 항공 정보를 불러오기 실패 = 사용자로부터 데이터 수집 시작
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `We can't check your flight!`});
    });
  } else if(faFindingArea=='Baggage claim' || faFindingArea == 'Exit') {
    console.log('도착편 정보를 찾아야겠군');
    // 사용자가 최근 도착 항공편 조회한 적이 있는지 검사 -  myArrflight DB에서 userId를 식별자로 항공편 정보 불러오기
    return findUserLatestFlight(intentRequest.userId, intentRequest.sessionAttributes, 'arrival').then(item => {

      // 사용자가 기존에 조회한 내역이 없다면 대화 끝내기
      if(item==null)
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `No any your flihgt info. Do you want to register your flight and get flight Information? Then, please say \"Arrival information\"`});

      // 있으면 오늘 날짜인지 비교
      console.log('slots 값 출력 : '+ JSON.stringify(item));

      var dateString = item.sessionAttributes.arrivalDate;  // YYYYMMDD

      if(dateString == todayString) {
        intentRequest.sessionAttributes = item.sessionAttributes;
        return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
      } else {
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `You can get that data on only the arrival date!`});
      }
    }).catch(error => {
      console.error(error);
      // 오류 처리 = DB에서 최근 항공 정보를 불러오기 실패 = 사용자로부터 데이터 수집 시작
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `We can't check your flight!`});
    });
  } else {
    console.log('뭐라니');
    return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `Invaild input! Please say exact area name like \'Check in counter\'`}));
  }
};
