'use strict';

//출국장 혼잡도 API 이용

var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('../config/openAPIKey.json');

/*
https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?
authkey=비공개 (키)
searchdate=20180102& 날짜(안나오면 더 이전으로)
data=AP01 고정
*/


module.exports.getExchangeRate = function(date) {
  // console.log(`api_config : ${api_config.flightSchedule_key}`);
  var url = 'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON';
  var queryParams = '?' + encodeURIComponent('authkey') + '=' + api_config.exchangeRate_key;
  //terminalNum = 1 or 2
  queryParams += '&' + encodeURIComponent('searchdate') + '=' + date;
  queryParams += '&' + encodeURIComponent('data') + '=' + 'AP01';

  return new Promise(function(resolve, reject) {
    request(
      {
        url: url + queryParams,
        method: 'GET'
      }, function(error, response, body) {
        // console.log('Headers', JSON.stringify(response.headers));
        console.log("Responses received..." + JSON.parse(body));
        resolve(JSON.parse(body));
      });

        // xml -> json 변환
        // var xml = body; // 실제 데이터
        // var formattedXml = format(xml);
        // var p = new x2j.Parser();
        // p.parseString(xml, function(err, result) {
        //   if(err){
        //     console.log(err);
        //     reject(err);
        //   }
        //   else {
        //     var s = JSON.stringify(result, undefined, 3);
        //     console.log(result.response.body[0].items[0].item);
        //     resolve(result.response.body[0].items[0].item);
        //   }
        // });
      }
    );
  // });


};
