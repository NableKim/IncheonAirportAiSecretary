'use strict';

/*
 * arivalAllManageFulfillment.js - to make flight information that user wants to know
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

module.exports = function(intentRequest, callback) {
  var daDestination=intentRequest.currentIntent.slots.daDestination;
  var daAirline=intentRequest.currentIntent.slots.daAirline;
  var daDepartureDate=intentRequest.currentIntent.slots.daDepartureDate;

  // 운항정보 open API에서 정보 불러오기
  // 입력받은 목적지, 항공사, 출발일자를 가지고 원하는 항공편만 골라내기
  // 찾은 비행편을 사용자의 최신 항공편으로 등록 - Myflight DB에 추가
  // fulfillment response 만들어서 반환
};
