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
  console.log('Lets find user latest flight!!!');

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
      userId
    }
  };

  const getAsync = util.promisify(dynamo.get, dynamo);

  return getAsync(params).then(response => {
    if(_.isEmpty(response)) {
      console.log(`User with userId:${userId} not found`);
      return Promise.reject(new Error(`User with userId:${userId} not found`));
    }
    return response.Item;
  });

};
