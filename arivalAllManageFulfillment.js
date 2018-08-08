'use strict';

/*
 * arivalAllManageFulfillment.js - to make flight information that user wants to know
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/
const lexResponses = require('./lexResponses');
const databaseManager = require('./databaseManager');
const getDataFromAPI = require('./getDataFromAPI');

module.exports = function(intentRequest, callback) {
  // 운항정보 API에 요청메세지를 보내 운항 일정을 불러온다
  const destinationCode = intentRequest.sessionAttributes.confirmIntent.destinationCode;
  var flightSchedule_list = getDataFromAPI.getFlightDepartureSchedule(destinationCode); // 일주일치 daDestination행 항공편 받아오기

  // 출발일자, 항공사 값을 대조하여 사용자가 탈 비행기 후보군을 압축
  var finalFlightSchedule = [];
  if(flightSchedule_list.length == 0) {
    console.log(`조회결과 앞으로 일주일간 ${daDestination}행 항공편은 없습니다`);
    return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Failed', `There is no flight going to ${daDestination} during upcoming 7 days`));
  }
  else {
    console.log('Length of flightSchedule_list : %d', flightSchedule_list.length);
    const departureDate = intentRequest.sessionAttributes.confirmIntent.daDepartureDate;  // YYYYMMDD
    const airlineNameKR = intentRequest.sessionAttributes.confirmIntent.airlineNameKR;  // 항공사 국문명
    const flightId = intentRequest.currentIntent.slots.daflightId;  // KE357

    // 출발일자, 항공사, 항공편명 값을 대조하여 사용자가 탈 비행기 후보군을 압축해서 저장할 리스트
    var finalFlightSchedule = [];

    // 데이터 비교
    for(var i=0; i<flightSchedule_list.length; i++) {
      //날짜 yyyymmdd 형식으로 맞춤
      const flightSchedule_date = (flightSchedule_list[i].scheduleDateTime).substring(0,8);
      if(departureDate == flightSchedule_date && airlineNameKR == flightSchedule_list[i].airline && flightId == flightSchedule_list[i].flightId)
        finalFlightSchedule.push(flightSchedule_list[i]);

      // NOTE : 국제편 노선의 경우, 같은 비행기는 하루에 단 한번만 그 노선을 운행한다고 가정했음 == KE357비행기는 하루 한번만 인천->시애틀 노선을 운행한다고 생각.

      // 후보군 압축 과정 실행 결과
      if(finalFlightSchedule.length == 0) {
        console.log(`조회결과 ${daDepartureDate} ${daDestination}행 ${airlineNameKR} 항공편은 없습니다`);
        return Promise.resolve(lexResponses.close(intentRequest.sessionAttributes, 'Failed', `There is no flight going to ${daDestination} during upcoming 7 days`));
      }
      else {
        console.log('사용자가 찾는 항공편 찾았다!');

      }

    }
  // 찾은 비행편을 사용자의 최신 항공편으로 등록 - Myflight DB에 추가
  // fulfillment response 만들어서 반환
};
