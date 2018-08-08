'use strict';

const uuidV1 = require('uuid/v1');
const AWS = require('aws-sdk');
const util = require('util');
require('util.promisify').shim();
//const promisify = require('es6-promisify');
const dynamo = new AWS.DynamoDB.DocumentClient();
const _ = require('lodash');



// myFlight-table에서 최근 조회한 항공 정보 가져오기
module.exports.findUserLatestFlight = function(userId) {
  console.log('myFlight-table DB에서 최근 조회한 항공편을 가져오겠습니다');

  // userId를 가지고 디비 정보 검색 후 반환
  const params = {
    TableName : 'myFlight-table',
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
          resolve(data.Item);
        }
      }
    });
  });
};

// 도착지 영문명 -> 코드로 바꾸기 위해 DB에서 읽어옴
module.exports.getDestinationCode = function(destinationName_en) {
  console.log('Entered databaseManager\'s getDestinationCode...');

  const params = {
    TableName: 'airport-table',
    Key:{
      "name_en" : destinationName_en
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
          console.log(`GetItem succeeded. But, There is no data for ${destinationName_en} in airport-table`);
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
