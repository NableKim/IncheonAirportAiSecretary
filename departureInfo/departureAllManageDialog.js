'use strict';

/*
 * departureAllManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-26
*/

const lexResponses = require('../lexResponses');
const getDataFromAPI = require('../getDataFromAPI');
const validateDepFlightInfo = require('./validateDepFlightInfo');
const findUserLatestFlight = require('../findUserLatestFlight');
const _ = require('lodash');

// =======================================================================================================================================
module.exports = function(intentRequest, callback) {
  console.log("departureAllManageDialog was called...");
  var daDepartureDate=intentRequest.currentIntent.slots.daDepartureDate;
  var daDestination=intentRequest.currentIntent.slots.daDestination;
  var daAirline=intentRequest.currentIntent.slots.daAirline;
  var daFlightId=intentRequest.currentIntent.slots.daFlightId;
  var slots = intentRequest.currentIntent.slots;

  // 확인 메세지에 대한 응답으로 부정적 대답이 들어온 경우 delegate실행
  if(intentRequest.currentIntent.confirmationStatus == 'Denied') {
    console.log('confirmIntent에 대한 사용자의 입력 : ' + intentRequest.currentIntent.confirmationStatus);

    // 슬롯값 초기화
    intentRequest.currentIntent.slots.daDepartureDate = null; // 출발일자
    intentRequest.currentIntent.slots.daDestination = null; // 도착지(영문명)
    intentRequest.currentIntent.slots.daAirline = null; // 항공사(영문)
    intentRequest.currentIntent.slots.daFlightId = null; // 항공편명

    // 세션값 초기화
    intentRequest.sessionAttributes={};

    //return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, intentRequest.currentIntent.slots, 'daDepartureDate', {contentType : 'PlainText', content: 'When are you leaving?'}));
  }

  // Slot 데이터가 아무것도 없을 때(대화의 시작)
  if(daDestination === null && daAirline === null && daDepartureDate === null) {
    // 최근 비행기 정보를 가져와서 사용자에게 뿌려주기 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    console.log("사용자로부터 받은 데이터가 없습니다!");
    return findUserLatestFlight(intentRequest.userId, intentRequest.sessionAttributes, 'departure').then(item => {

      // 사용자가 기존에 조회한 내역이 없다면
      if(item==null)
        return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);

      // 조회한 내역이 있다면
      console.log(`findUserLatestFlight : ${JSON.stringify(item)}`);

      slots.daDepartureDate = item.slots.departureDate; // 출발일자
      slots.daDestination = item.slots.destinationName_en; // 도착지(영문명)
      slots.daAirline = item.slots.airlineName_en; // 항공사(영문)
      slots.daFlightId = item.slots.flightId; // 항공편명

      // 세션정보에 저장
      intentRequest.sessionAttributes = item.sessionAttributes;

      console.log('slots 값 출력 : '+ JSON.stringify(slots));

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

    return validateDepFlightInfo(intentRequest.sessionAttributes, intentRequest.currentIntent, daDepartureDate, daDestination, daAirline).then(validationResult => {
      //const validationResult = validateFlightInfo(intentRequest.sessionAttributes, daDepartureDate, daDestination, daAirline);
      // 세션값 및 slot값 업데이트
      intentRequest.sessionAttributes = validationResult.sessionAttributes;
      intentRequest.currentIntent = validationResult.currentIntent;

      // 사용자로부터 받은 4가지 slot값들 중에 부적절한 값이 있다면
      if(!validationResult.isValid) {
        // 부적절한 값을 가진 slot은 null로 초기화
        slots[`${validationResult.violatedSlot}`] = null;

        // TODO : slot 값을 다시 받아오기 위해 elicitSlot 실행
        if(validationResult.violatedSlot == 'daDepartureDate') {
          return lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message,
            validationResult.options.title, validationResult.options.imageUrl, validationResult.options.buttons);
        }
        else {
          return lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message);
        }
      }
      else { // 사용자가 현재까지 입력한 Slot값들이 모두 적합하다면
          // 3개의 슬롯값이 다 갖춘게 아니라면
          if(intentRequest.sessionAttributes.departureDate == null || intentRequest.sessionAttributes.destinationCode == null || intentRequest.sessionAttributes.airlineNameKR == null)
            return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);

          // 출발일, 목적지, 항공사 슬롯값을 다 갖췄다면
          // 운항정보 API에 요청메세지를 보내 운항 일정을 불러온다
          return getDataFromAPI.getFlightSchedule(intentRequest.sessionAttributes.destinationCode, 'departure').then(flightSchedule_list => {
            console.log(`flightSchedule_list : ${flightSchedule_list}`);

            // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
            var finalFlightSchedule = [];
            if(flightSchedule_list.length == 0) {
              console.log(`조회결과 앞으로 일주일간 ${daDestination}행 항공편은 없습니다`);
              // 세션정보 없애기
              console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
              intentRequest.sessionAttributes={};
              return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} during upcoming 7 days`}, null);
            }
            else {
              console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
              const departureDate = intentRequest.sessionAttributes.departureDate;
              const airlineNameKR = intentRequest.sessionAttributes.airlineNameKR;
              console.log('날짜 '+departureDate+'  항공사 '+airlineNameKR);

              // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축해서 저장할 리스트
              var finalFlightSchedule = [];

              // 데이터 비교
              for(var i=0; i<flightSchedule_list.length; i++) {
                //날짜 yyyymmdd 형식으로 맞춤
                var flightSchedule_date = flightSchedule_list[i].scheduleDateTime[0].substring(0,8);
                //console.log('날짜 : '+departureDate+' '+flightSchedule_date+' , 항공사 이름 : '+airlineNameKR +' '+flightSchedule_list[i].airline[0]);
                if(departureDate==flightSchedule_date && airlineNameKR == flightSchedule_list[i].airline[0]) {
                  console.log('들어갔나요? '+JSON.stringify(flightSchedule_list[i]));
                  finalFlightSchedule.push(flightSchedule_list[i]);
                }
              }

              console.log('finalFlightSchedule 길이 : '+ finalFlightSchedule.length);
              // 후보군 압축 과정 실행 결과
              if(finalFlightSchedule.length == 0) {
                console.log(`조회결과 ${daDepartureDate} ${daDestination}행 ${airlineNameKR} 항공편은 없습니다`);
                // 세션정보 없애기
                console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
                intentRequest.sessionAttributes={};
                return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} during upcoming 7 days`}, null);
              }
              else if(finalFlightSchedule.length == 1) {
                console.log('사용자가 찾는 항공편 찾았다!');
                // 세션 및 슬롯에 항공편명 업데이트
                intentRequest.sessionAttributes.flightId=finalFlightSchedule[0].flightId[0];
                intentRequest.currentIntent.slots.daFlightId=finalFlightSchedule[0].flightId[0];
                return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
              }
              else {
                console.log(`후보군 압축 결과 : ${finalFlightSchedule}`);

                // responseCard를 통해 사용자가 타려는 비행기의 편명을 획득하려고 함
                var buttons = [];
                _.forEach(finalFlightSchedule, schedule => {
                  buttons.push({
                    text: schedule.airline+', '+schedule.flightId+', '+schedule.scheduleDateTime,
                    value: schedule.flightId
                  });
                });

                const cardOpt = {
                  title : `Search result - ${daDepartureDate} Flight Schedules`,
                  imageUrl : 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Air_Departure_Symbol_%28dark%29.svg/1024px-Air_Departure_Symbol_%28dark%29.svg.png',
                  buttons : buttons
                };

                // ElcitSlot으로 사용자로부터 항공편명 선택받도록 함
                return lexResponses.elicitSlot(
                  intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, 'daFlightId',
                    {contentType : 'PlainText', content: 'There are several flight schedules. Please choose your flight!'},
                    cardOpt.title, cardOpt.imageUrl, cardOpt.buttons);
              }
            }
          });
      }
    }).catch(error => {
      console.error(error);
      // 오류 처리 = DB에서 최근 항공 정보를 불러오기 실패 = 사용자로부터 데이터 수집 시작
      return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
    });
  }
};
