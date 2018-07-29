'use strict';

const uuidV1 = require('uuid/v1');
const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const dynamo = new AWS.DynamoDB.DocumentClient();
const _ = require('lodash');

// myFlight-table에서 최근 조회한 항공 정보 가져오기
module.exports.findUserLatestFlight = function(userId) {
  console.log('Lets find user latest flight!!!');

  // 디비에서 데이터 찾아왔다고 치고
  return {
    Item: {
        "userId": "tzglofqw286zg4i5zrreo3m10in3pxs9",
        "date": "20180729",
        "flightNum": "KE657",
        "flightClassifi": "D"
      }
  };
  /*
  // userId를 가지고 디비 정보 검색 후 반환
  const params = {
    TableName: 'myFlight-table',
    Key : {
      userId
    }
  };

  const getAsync = function(params) {
    return new Promise(function(resolve, reject) {
      dynamo.get(params, function(err, data) {
        if(err) reject(Error("Error : Can't get data from DB!"));
        else if(_.isEmpty(data)) {
          console.log(`User with userId:${userId} not found`);
          reject(new Error(`User with userId:${userId} not found`));
        }
        else {
          console.log(data);
          resolve(data);
        }
      });
    });
  };

  return getAsync(params).then((item) => {
    console.log(`Getting myFlight Info : ${JSON.stringify(item)}`);
    return item;
  }).catch((error) => {
    console.log(error);
  });
  */
};
