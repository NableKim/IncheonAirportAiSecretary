'use strict';

/*
 * airlineInfoManageDialog.js - to validate inputs from user and call flight schedule from Open API
 *                            ultimately, get essential datas to search for only specific flight
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-13
 */

const lexResponses = require('../lexResponses');
const flightInfoManager = require('../flightInfoManager');
const getDataFromAPI = require('../getDataFromAPI');

module.exports = function(intentRequest, callback) {
  console.log("airlineInfoManageDialog was called...");
  var anAirline=intentRequest.currentIntent.slots.anAirline;

  // 디비에서 항공사에 대한 IATA 코드 가져오기
    // 정상적으로 가져오면 API 호출
      // API 결과를 정상적으로 가져오면 결과메세지 구성
      // 아니면 해당 항공사 정보가 없습니다 메세지 뿌리기
    // 못가져오면 해당 항공사 정보가 없습니다 메세지 뿌리기

  return flightInfoManager.validateFlightAirline(anAirline).then(validateResultOfAirline => {
    if(validateResultOfAirline!=null) {
      // DB에서 항공사 코드 가져오기 성공!
      console.log('항공사 IATA 코드를 찾았다! : '+ validateResultOfAirline.lata_code);
      return getDataFromAPI.getAirlineInfo(validateResultOfAirline.lata_code).then(item => {
        const message = anAirline+'\'s Tel Number'
        +'\nCompany Tel : '+item[0].airlineIcTel[0]
        +'\nAirport Tel : '+item[0].airlineTel[0];
        /*
        [
          {
            "airlineIata":["OZ"],
            "airlineIcTel":["1588-8000"],
            "airlineIcao":["AAR"],
            "airlineImage":["http://www.airport.kr/ap/dep/apAirlineIconDown.do?IATA_CODE=OZ"],
            "airlineName":["아시아나항공"],
            "airlineTel":["1588-8000"]
          }
        ]
        */

        const responseCard = {
          "contentType": "application/vnd.amazonaws.card.generic",
          "genericAttachments": [
            {
               "title":anAirline+'\'s Tel Number',
               //"subTitle":"card-sub-title",
               "imageUrl":item[0].airlineImage[0]
               //"attachmentLinkUrl":"http://www.airport.kr/ap/dep/apAirlineIconDown.do?IATA_CODE=OZ"
            }
          ]
        };
        return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled', {contentType: 'PlainText', content: message}, responseCard);
      }).catch(error => {
        console.log(error);
        const message = 'There is no data about'+anAirline;
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType: 'PlainText', content: message}, null);
      });
    }
    else {  // 실패시
      console.log('항공사 IATA 코드를 못찾음');
      const message = 'There is no data about'+anAirline;
      return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType: 'PlainText', content: message}, null);
    }
  }).catch(error => {
    console.log(error);
    const message = 'There is no data about'+anAirline;
    return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType: 'PlainText', content: message}, null);
  });
};
