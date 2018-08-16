'use strict';

/*
 * arrivalTimeManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-13
 */

const lexResponses = require('../lexResponses');
const getDataFromAPI = require('../getDataFromAPI');
const findUserLatestFlight = require('../findUserLatestFlight');
const _ = require('lodash');

module.exports = function(intentRequest, callback) {
  console.log("arrivalTimeManageDialog was called...");

  return findUserLatestFlight(intentRequest.userId, intentRequest.sessionAttributes, 'arrival').then(item => {

    // 사용자가 기존에 조회한 내역이 없다면 대화 끝내기
    if(item==null)
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `No any your flight info. Do you want to register your flight and get flight Information? Then, please say \"Arrival information\"`});

    intentRequest.sessionAttributes = item.sessionAttributes;
    // sessionAttributes = {};
    // sessionAttributes['arrivalDate'] = item.arrivalDate;
    // sessionAttributes['sourceCode'] = item.sourceCode;  // 도착지 공항 코드
    // sessionAttributes['airlineNameKR'] = item.airlineName_kr;
    // sessionAttributes['flightId'] = item.flightId;
    return getDataFromAPI.getFlightSchedule(item.sessionAttributes.sourceCode, 'arrival').then(flightSchedule_list => {
      console.log(`flightSchedule_list : ${flightSchedule_list}`);

      // DB에서 가져온 목적지, 항공사, 출발일자, 항공편명을 가지고 원하는 항공편만 골라내기
      // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
      var finalFlightSchedule = [];
      if(flightSchedule_list.length == 0) {
        console.log(`조회결과 앞으로 일주일간 ${item.sessionAttributes.sourceCode}에서 오는 항공편은 없습니다`);
        // 세션정보 없애기
        console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
        intentRequest.sessionAttributes={};
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${item.sessionAttributes.sourceCode} during upcoming 7 days`});
      }
      else {
        console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
        const arrivalDate = intentRequest.sessionAttributes.arrivalDate;
        const airlineNameKR = intentRequest.sessionAttributes.airlineNameKR;
        const flightId = intentRequest.sessionAttributes.flightId;

        // 출발일자, 항공사 , 항공편명 값을 대조하여 사용자가 탈 비행기 후보군을 압축해서 저장할 리스트
        var finalFlightSchedule = [];

        // 데이터 비교
        for(var i=0; i<flightSchedule_list.length; i++) {
          //날짜 yyyymmdd 형식으로 맞춤
          const flightSchedule_date = flightSchedule_list[i].scheduleDateTime[0].substring(0,8);
          if(arrivalDate==flightSchedule_date && airlineNameKR == flightSchedule_list[i].airline[0] && flightId == flightSchedule_list[i].flightId[0])
            finalFlightSchedule.push(flightSchedule_list[i]);
        }

        console.log('finalFlightSchedule 길이 : '+finalFlightSchedule.length);

        // 후보군 압축 과정 실행 결과
        if(finalFlightSchedule.length == 0) {
          console.log(`조회결과 ${arrivalDate} ${item.sessionAttributes.sourceCode}에서 오는 ${airlineNameKR} 항공편은 없습니다`);
          // 세션정보 없애기
          console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
          intentRequest.sessionAttributes={};
          return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight from ${item.sessionAttributes.sourceCode} ${arrivalDate}`}, null);
        }
        else {
          console.log('사용자가 찾는 항공편 찾았다!');
          console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
          intentRequest.sessionAttributes={};

          // 운항상태
          var status = {
            '도착':'Arrived',
            '결항':'Cancelled',
            '지연':'Delayed',
            '회황':'Diverted',
            '착륙':'Landed'
          };

          intentRequest.currentIntent.slots.atFlightStatus = "Disabled";
          if(!_.isEmpty(finalFlightSchedule[0].remark))
            intentRequest.currentIntent.slots.atFlightStatus = status[finalFlightSchedule[0].remark[0]];    // 운항상태
          intentRequest.currentIntent.slots.atScheduleTime = finalFlightSchedule[0].scheduleDateTime[0];    // 예정시간
          intentRequest.currentIntent.slots.atEstimatedTime = finalFlightSchedule[0].estimatedDateTime[0];  // 변경시간
          return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
        }
      }
    });
  }).catch(error => {
    console.error(error);
    // 오류 처리 = DB에서 최근 항공 정보를 불러오기 실패 = 사용자로부터 데이터 수집 시작
    return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `We can't check your flight!`});
  });

};
