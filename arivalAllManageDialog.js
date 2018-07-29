'use strict';

/*
 * arivalAllManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

module.exports = function(intentRequest, callback) {
  // 최근 비행기 정보 가져오기 -  myflight DB에서 userId를 식별자로 항공편 정보 불러오기
    // 최근 비행기 정보가 있으면
        // 찾은 항공편이 사용자가 찾고 있는 항공편이 맞는지 묻기
          // 맞으면
            // OPEN API를 호출해서 항공편 정보 목록을 불러옴
            // 일시, 항공편명을 가지고 사용자가 찾는 항공편만 고르기
            // 각 Slot 값에 항공편의 정보를 넣어줌
            // Delegate 형식으로 리턴
          // 틀리면
            // 사용자로부터 출발지, 항공사, 도착일자를 입력받음
            // 출발지, 항공사, 도착일자를 가지고 사용자가 찾는 항공편만 고르기
            // 항공편 한개가 골라질 때까지 사용자에게 질문 - ElicitSlot으로 추가 정보를 획득할 수도 있음
      // 최근 비행기 정보가 없으면
        // 사용자로부터 출발지, 항공사, 도착일자를 입력받음
        // 출발지, 항공사, 도착일자를 가지고 사용자가 찾는 항공편만 고르기
        // 항공편 한개가 골라질 때까지 사용자에게 질문 - ElicitSlot으로 추가 정보를 획득할 수도 있음
};
