'use strict';

//출국장 혼잡도 API 이용

var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('../config/openAPIKey.json');

module.exports.getCongestionDegree = function(terminalNum) {
  console.log(`api_config : ${api_config.flightSchedule_key}`);
  var url = 'http://openapi.airport.kr/openapi/service/StatusOfDepartures/getDeparturesCongestion';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + 'sIHubBZe%2FsPM76R2dlHOOuve9RZrmuzKynUIxWar%2BtvOb209aOTFQikgz0vxGLRBFoSckQ3dZdbrdYLMozHCDg%3D%3D';
  //terminalNum = 1 or 2
  queryParams += '&' + encodeURIComponent('terno') + '=' + encodeURIComponent(terminalNum);


  return new Promise(function(resolve, reject){
    request(
      {
        url: url + queryParams,
        method: 'GET'
      },
      function(error, response, body) {
        //console.log('Status', response.statusCode);
        // console.log('Headers', JSON.stringify(response.headers));

        // xml -> json 변환
        var xml = body; // 실제 데이터
        var formattedXml = format(xml);
        var p = new x2j.Parser();
        p.parseString(xml, function(err, result) {
          if(err){
            console.log(err);
            reject(err);
          }
          else {
            var s = JSON.stringify(result, undefined, 3);
            console.log("API file..... " + result.response.body[0].items[0].item);
            resolve(result.response.body[0].items[0].item);
          }
        });
      }
    );
  });
};
