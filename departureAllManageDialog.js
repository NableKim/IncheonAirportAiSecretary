'use strict';

/*
 * departureAllManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-26
*/

module.exports = function(intentRequest, callback) {
  console.log("departureAllManageDialog was called...");

  // Slot 데이터가 아무것도 없을 때(대화의 시작)
  if(daDestination === null && daAirline === null && daDepartureDate === null) {
    // 최근 비행기 정보를 가져와서 사용자에게 뿌려주기 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    console.log("사용자로부터 받은 데이터가 없습니다!");

  }
  else { // Slot 데이터를 받아온게 있다면(대화 진행 중)
    console.log("사용자로부터 받은 데이터가 있어요!");
  }
};
