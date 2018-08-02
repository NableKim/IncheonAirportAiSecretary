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

/*
  // 디비에서 데이터 찾아왔다고 치고
  return {
    Item: {
        "userId": "tzglofqw286zg4i5zrreo3m10in3pxs9",
        "date": "20180729",
        "flightNum": "KE657",
        "airline" : "Korean Air",
        "place" : "Seattle",
        "flightClassifi": "D"
      }
  };
*/

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




/*
  const getAsync = util.promisify(dynamo.get, dynamo);

  return getAsync(params).then(response => {
    if(_.isEmpty(response)) {
      console.log(`User with userId:${userId} not found`);
      return Promise.reject(new Error(`User with userId:${userId} not found`));
    }
    return response.Item;
  });
*/
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

  dynamo.get(params, function(err, data) {
    if(err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      return null;
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      return data;
    }
  });

};