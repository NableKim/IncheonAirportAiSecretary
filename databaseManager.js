'use strict';

const uuidV1 = require('uuid/v1');
const AWS = require('aws-sdk');
const util = require('util');
require('util.promisify').shim();
//const promisify = require('es6-promisify');
const dynamo = new AWS.DynamoDB.DocumentClient();
const _ = require('lodash');
var date = require('date-and-time');



// myFlight-table에서 최근 조회한 항공 정보 가져오기
module.exports.findUserLatestFlight = function(userId, str) {
  console.log('myFlight-table DB에서 최근 조회한 항공편을 가져오겠습니다');

  var tableName = null;
  if(str=='departure') {
    tableName = 'myFlight-table';
  } else if(str=='arrival'){
    tableName = 'myArrFlight-table';
  }

  // userId를 가지고 디비 정보 검색 후 반환
  const params = {
    TableName : tableName,
    Key : {
      "userId":userId
    }
  };

  return new Promise(function(resolve, reject){
    dynamo.get(params, function(err, data) {
      if(err) {
        reject(new Error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2)));
      } else {
        if(_.isEmpty(data)) {
          console.log(`GetItem succeeded. But, There is no data for ${userId}`);
          //reject(new Error(`User with userId:${userId} not found`));
          resolve(null);
        } else {
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

          // 저장되어 있는 운항편의 날짜가 이미 지난 운항편인지 확인
          var date_str = ''; //YYYYMMDD
          if(str=='departure') {
            date_str = data.Item.departureDate;
          } else if(str=='arrival'){
            date_str = data.Item.arrivalDate;
          }

          // DB상에 저장된 날짜값
          date_str = date_str.substring(0,4)+'-'+date_str.substring(4,6)+'-'+date_str.substring(6,8); // YYYY-MM-DD
          var date_date = date.parse(date_str, 'YYYY-MM-DD');

          // 한국의 현재 시간 구하기
          const now = new Date();
          var koreaCurrentDate = date.addHours(now, 9); // +9시간을 해줘서 한국 시간으로 변경
          console.log('한국의 현재 시간'+date.format(koreaCurrentDate, 'YYYY/MM/DD HH:mm:ss'));

          // date_date - now < 0 이면 과거 운항편이므로 데이터를 다시 받도록 함
          if(date.subtract(date_date, now).toDays() < 0) {
            resolve(null);
          } else {
            resolve(data.Item);
          }
        }
      }
    });
  });
};

// 도착지 영문명 -> 코드로 바꾸기 위해 DB에서 읽어옴
module.exports.getAirportCode = function(airportName_en) {
  console.log('Entered databaseManager\'s getAirportCode...');

  const params = {
    TableName: 'airport-table',
    Key:{
      "name_en" : airportName_en
    }
  };

/*
  dynamo.get(params, function(err, data) {
    if(err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      return null;
    } else {
      if(_.isEmpty(data)) {
        console.log(`GetItem succeeded. But, There is no data for ${destinationName_en} in airport-table`);
        //reject(new Error(`User with userId:${userId} not found`));
        return null;
      } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        return data.Item;
      }
    }
  });
*/
  return new Promise(function(resolve, reject){
    dynamo.get(params, function(err, data) {
      if(err) {
        reject(new Error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2)));
      } else {
        if(_.isEmpty(data)) {
          console.log(`GetItem succeeded. But, There is no data for ${airportName_en} in airport-table`);
          //reject(new Error(`User with userId:${userId} not found`));
          resolve(null);
        } else {
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
          resolve(data.Item);
        }
      }
    });
  });

};

// 항공사 영문명 -> 국문으로 바꾸기 위해 DB에서 읽어옴
module.exports.getAirlineNameKR = function(airlineName_en) {
  console.log('Entered databaseManager\'s getAirlineNameKR...');

  const params = {
    TableName: 'airline-table',
    Key:{
      "name_en" : airlineName_en
    }
  };

  // dynamo.get(params, function(err, data) {
  //   if(err) {
  //     console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
  //     return null;
  //   } else {
  //     if(_.isEmpty(data)) {
  //       console.log(`GetItem succeeded. But, There is no data for ${airlineName_en} in airline-table`);
  //       //reject(new Error(`User with userId:${userId} not found`));
  //       return null;
  //     } else {
  //       console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
  //       return data.Item;
  //     }
  //   }
  // });

  return new Promise(function(resolve, reject){
    dynamo.get(params, function(err, data) {
      if(err) {
        reject(new Error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2)));
      } else {
        if(_.isEmpty(data)) {
          console.log(`GetItem succeeded. But, There is no data for ${airlineName_en} in airline-table`);
          //reject(new Error(`User with userId:${userId} not found`));
          resolve(null);
        } else {
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
          resolve(data.Item);
        }
      }
    });
  });
};

module.exports.saveMyflightToDB = function(intentRequest) {
  console.log('Entered databaseManager\'s saveMyflightToDB...');
  // TODO: 이미 사용자가 있다면 Updaye
  // 없다면 Insert를 해야함

/*
 유저아이디  userId
 출발일자 departureDate            20180807
 항공사 영문명 airlineName_en
 항공사 국문명 airlineName_kr
 항공편명 flightId
 도착지 영문명 destinationName_en
 도착지 국문명 destinationName_kr
 도착지 코드 destinationCode
*/
const item = {};
  item.userId = intentRequest.userId;
  item.departureDate = intentRequest.sessionAttributes.departureDate;
  item.airlineName_en = intentRequest.currentIntent.slots.daAirline;
  item.airlineName_kr = intentRequest.sessionAttributes.airlineNameKR;
  item.flightId = intentRequest.sessionAttributes.flightId;
  item.destinationName_en = intentRequest.currentIntent.slots.daDestination;
  item.destinationCode = intentRequest.sessionAttributes.destinationCode;

  console.log('myFlightDB에 삽입 또는 업데이트 전 item 값 : '+JSON.stringify(item));
  var params = {
    TableName: 'myFlight-table',
    Key:{
        "userId": item.userId
    }
  };

  return new Promise(function(resolve, reject){
    // 조회
    dynamo.get(params, function(err, data) {
      if(err) {
        reject(new Error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2)));
      } else {
        if(_.isEmpty(data)) { // 새롭게 삽입해야겠군
          console.log(`GetItem succeeded. But, There is no data for ${item.userId}. So We will add new USER`);
          params = {
            TableName: 'myFlight-table',
            Item:item
          };

          dynamo.put(params, function(err, data) {
            if(err) {
              reject(new Error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2)));
            } else {
              console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
              resolve(data.Item);
            }
          });
        } else {  // 업데이트해야겠군
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

          params = {
            TableName: 'myFlight-table',
            Key:{
                "userId": item.userId
            },
            UpdateExpression:"set departureDate=:de, airlineName_en=:ae, airlineName_kr=:ak, flightId=:id, destinationName_en=:dn, destinationCode=:dc",
            ExpressionAttributeValues:{
                ":de":item.departureDate,
                ":ae":item.airlineName_en,
                ":ak":item.airlineName_kr,
                ":id":item.flightId,
                ":dn":item.destinationName_en,
                ":dc":item.destinationCode
            },
            ReturnValues:"UPDATED_NEW"
          };

          console.log('params : '+JSON.stringify(params));

          dynamo.update(params, function(err, data) {
            if(err) {
              reject(new Error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2)));
            } else {
              console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
              resolve(data.Item);
            }
          });
        }
      }
    });
  });
};

module.exports.saveMyArrivalflightToDB = function(intentRequest) {
  console.log('Entered databaseManager\'s saveMyArrivalflightToDB...');
  // TODO: 이미 사용자가 있다면 Updaye
  // 없다면 Insert를 해야함

/*
 유저아이디  userId
 출발일자 arrivalDate            20180807
 항공사 영문명 airlineName_en
 항공사 국문명 airlineName_kr
 항공편명 flightId
 출발지 영문명 sourceName_en
 출발지 국문명 sourceName_kr
 출발지 코드 sourceCode
*/
const item = {};
  item.userId = intentRequest.userId;
  item.arrivalDate = intentRequest.sessionAttributes.arrivalDate;
  item.airlineName_en = intentRequest.currentIntent.slots.aaAirline;
  item.airlineName_kr = intentRequest.sessionAttributes.airlineNameKR;
  item.flightId = intentRequest.sessionAttributes.flightId;
  item.sourceName_en = intentRequest.currentIntent.slots.aaSource;
  item.sourceCode = intentRequest.sessionAttributes.sourceCode;

  console.log('myArrFlightDB에 삽입 또는 업데이트 전 item 값 : '+JSON.stringify(item));
  var params = {
    TableName: 'myArrFlight-table',
    Key:{
        "userId": item.userId
    }
  };

  return new Promise(function(resolve, reject){
    // 조회
    dynamo.get(params, function(err, data) {
      if(err) {
        reject(new Error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2)));
      } else {
        if(_.isEmpty(data)) { // 새롭게 삽입해야겠군
          console.log(`GetItem succeeded. But, There is no data for ${item.userId}. So We will add new USER`);
          params = {
            TableName: 'myArrFlight-table',
            Item:item
          };

          dynamo.put(params, function(err, data) {
            if(err) {
              reject(new Error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2)));
            } else {
              console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
              resolve(data.Item);
            }
          });
        } else {  // 업데이트해야겠군
          console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

          params = {
            TableName: 'myArrFlight-table',
            Key:{
                "userId": item.userId
            },
            UpdateExpression:"set arrivalDate=:ad, airlineName_en=:ae, airlineName_kr=:ak, flightId=:id, sourceName_en=:se, sourceCode=:sc",
            ExpressionAttributeValues:{
                ":ad":item.arrivalDate,
                ":ae":item.airlineName_en,
                ":ak":item.airlineName_kr,
                ":id":item.flightId,
                ":se":item.sourceName_en,
                ":sc":item.sourceCode
            },
            ReturnValues:"UPDATED_NEW"
          };

          console.log('params : '+JSON.stringify(params));

          dynamo.update(params, function(err, data) {
            if(err) {
              reject(new Error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2)));
            } else {
              console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
              resolve(data.Item);
            }
          });
        }
      }
    });
  });
};
