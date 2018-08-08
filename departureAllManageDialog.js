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
const getDataFromAPI = require('./getDataFromAPI');

const _ = require('lodash');

// Slot값 타당성 검사 후 사용자에게 보낼 메세지 구성요소 만들기
function buildValidationResult(isValid, violatedSlot, messageContent, options, sessionAttributes) {
  if(messageContent == null) {
    return {
      isValid,
      violatedSlot,
      options,
      sessionAttributes
    };
  }

  if(options == null) {
    return {
      isValid,
      violatedSlot,
      message : {contentType : 'PlainText', content: messageContent},
      sessionAttributes
    };
  }

  return {
    isValid,
    violatedSlot,
    message : {contentType : 'PlainText', content: messageContent},
    options,
    sessionAttributes
  };
}

// =======================================================================================================================================
// 사용자가 입력한 목적지, 항공사, 출발 일자, 항공편명이 적절한 입력인지 판단하는 함수
function validateFlightInfo(sessionAttributes, slotDetails, departureDate, destination, airline) {
  console.log("validateFlightInfo : 사용자로부터 받은 Slot값 적절성 판단");

  // sessionAttributes가 비어있다면
  if(_.isEmpty(sessionAttributes)) {
    console.log('sessionAttributes가 비어있으니 안에 confirmIntent 객체를 만들게요');
    sessionAttributes['departureDate'] = null;
    sessionAttributes['destinationCode'] = null;  // 도착지 공항 코드
    sessionAttributes['airlineNameKR'] = null;
    sessionAttributes['flightId'] = null;
  }

  // 출발 일자 적합성 판단
  if(departureDate!=null && sessionAttributes.departureDate == null) {
    const validateResultOfDate=flightInfoManager.validateFlightDate(slotDetails, departureDate);
    // 이 결과가 참
    if(validateResultOfDate.isValid) {
      // sessionAttributes에 날짜 정보 반영
      // departureDate가 YYYY-MM-DD 형식이므로 YYYYMMDD로 변환해서 넣기
      sessionAttributes['departureDate']=departureDate.substring(0,4)+departureDate.substring(5,7)+departureDate.substring(8,10);
      console.log(`날짜가 들어갔는가!? : ${JSON.stringify(sessionAttributes)}`);
      console.log('출발일자가 적합하군요!');
      return Promise.resolve(buildValidationResult(true, null, null, null, sessionAttributes));
    }
    // 이 결과가 거짓
    else {
      // 출발 일자를 다시 받도록 하자
      console.log('출발일자가 부적합하여 다시 받아야겠어요');
      return Promise.resolve(buildValidationResult(false, 'daDepartureDate', 'it\'s invalid date. Please tell me date inside 7 days!', validateResultOfDate.options, sessionAttributes));
    }
  }


  // 도착지 정보 적합성 판단
  if(destination!=null && sessionAttributes.destinationCode == null) {
    return flightInfoManager.validateFlightDestination(destination).then(validateResultOfDestination => {
      if(validateResultOfDestination!=null) {
        // DB에서 가져온 도착지 코드를 sessionAttributes에 업데이트
        sessionAttributes['destinationCode']=validateResultOfDestination.airport_code;
        console.log('도착지 이름이 적합하군요!');
        return buildValidationResult(true, null, null, null, sessionAttributes);
      }
      else {  // 결과값이 없다면
        // 도착지를 다시 받도록 하자
        console.log('도착지 이름이 부적합하여 다시 받아야겠어요');
        return buildValidationResult(false, 'daDestination', `${destination} is not exact city name. Please say correct name`, sessionAttributes);
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
        return buildValidationResult(true, null, null, null, sessionAttributes);
      }
      else {  // 결과값이 없다면
        // 도착지를 다시 받도록 하자
        console.log('항공사 이름이 부적합하여 다시 받아야겠어요');
        return buildValidationResult(false, 'daAirline', `${airline} is not exact airline name. Please say correct name`, sessionAttributes);
      }
    });
  }

  // 현재까지의 입력값이 적합할 경우
  return Promise.resolve(buildValidationResult(true, null, null, null, sessionAttributes));
}

// =======================================================================================================================================
// Myflght DB에서 가져온 정보와 메세지 정보를 객체로 만들어서 리턴
function buildUserLatestFlightResult(slots, messageContent, sessionAttributes) {
  return {
    slots,
    message:{contentType: 'PlainText', content : messageContent},
    sessionAttributes
  };
}

// Myflght DB에서 사용자의 최근 비행기 정보를 가져오기
function findUserLatestFlight(userId, sessionAttributes) {
  console.log('MyFlight DB를 조회하자!');
  return databaseManager.findUserLatestFlight(userId).then(item => {
    // DB에서 비행기 운항일자, 항공편명, 도착/출발 구분 정보를 가져옴
    console.log(`findUserLatestFlight's Result : ${JSON.stringify(item)}`);

    // 사용자가 기존에 조회한 내역이 없다면
    if(item == null)
      return null;

    sessionAttributes['departureDate'] = item.departureDate;
    sessionAttributes['destinationCode'] = item.destinationCode;  // 도착지 공항 코드
    sessionAttributes['airlineNameKR'] = item.airlineName_kr;
    sessionAttributes['flightId'] = item.flightId;

    // item.departureDate은 YYYYMMDD 형태이므로 -> YYYY-MM-DD 변환 후 slot에 반영
    var dateString=item.departureDate;
    console.log(`findUserLatestFlight's Result : ${dateString}`)
    const slots = {
      departureDate: dateString.substring(0,4)+'-'+dateString.substring(4,6)+'-'+dateString.substring(6,8),
      destinationName_en: item.destinationName_en,
      airlineName_en: item.airlineName_en,
      flightId: item.flightId
    };
    return buildUserLatestFlightResult(slots, `You recently searched ${item.departureDate} ${item.flightId} goint to ${item.destinationName_en}. Do you want to know about that?`, sessionAttributes);
  });
}

// =======================================================================================================================================
module.exports = function(intentRequest, callback) {
  console.log("departureAllManageDialog was called...");
  var daDepartureDate=intentRequest.currentIntent.slots.daDepartureDate;
  var daDestination=intentRequest.currentIntent.slots.daDestination;
  var daAirline=intentRequest.currentIntent.slots.daAirline;
  var daFlightId=intentRequest.currentIntent.slots.daFlightId;
  const slots = intentRequest.currentIntent.slots;

  // Slot 데이터가 아무것도 없을 때(대화의 시작)
  if(daDestination === null && daAirline === null && daDepartureDate === null) {
    // 최근 비행기 정보를 가져와서 사용자에게 뿌려주기 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    console.log("사용자로부터 받은 데이터가 없습니다!");
    return findUserLatestFlight(intentRequest.userId, intentRequest.sessionAttributes).then(item => {

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

    return validateFlightInfo(intentRequest.sessionAttributes, intentRequest.currentIntent.slotDetails, daDepartureDate, daDestination, daAirline).then(validationResult => {
      //const validationResult = validateFlightInfo(intentRequest.sessionAttributes, daDepartureDate, daDestination, daAirline);
      // 세션값 업데이트
      intentRequest.sessionAttributes = validationResult.sessionAttributes;

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
          return getDataFromAPI.getFlightDepartureSchedule(intentRequest.sessionAttributes.destinationCode).then(flightSchedule_list => {
            console.log(`flightSchedule_list : ${flightSchedule_list}`);

            // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
            var finalFlightSchedule = [];
            if(flightSchedule_list.length == 0) {
              console.log(`조회결과 앞으로 일주일간 ${daDestination}행 항공편은 없습니다`);
              // 세션정보 없애기
              console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
              intentRequest.sessionAttributes={};
              return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} during upcoming 7 days`});
            }
            else {
              console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
              const departureDate = intentRequest.sessionAttributes.departureDate;
              const airlineNameKR = intentRequest.sessionAttributes.airlineNameKR;

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

              console.log('finalFlightSchedule 길이 : '+finalFlightSchedule.length);
              // 후보군 압축 과정 실행 결과
              if(finalFlightSchedule.length == 0) {
                console.log(`조회결과 ${daDepartureDate} ${daDestination}행 ${airlineNameKR} 항공편은 없습니다`);
                // 세션정보 없애기
                console.log('세션 삭제 전 intentRequest 출력'+JSON.stringify(intentRequest));
                intentRequest.sessionAttributes={};
                return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `There is no flight going to ${daDestination} during upcoming 7 days`});
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
