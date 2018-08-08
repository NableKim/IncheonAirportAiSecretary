'use strict';

/* NodeJs 샘플 코드 */
// 전체 운항

var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('./config/openAPIKey.json');

// 도착편
// var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerArrivalsDS';
// var queryParams = '?' + encodeURIComponent('ServiceKey') + '=서비스키'; /* Service Key*/
// queryParams += '&' + encodeURIComponent('파라미터영문명') + '=' + encodeURIComponent('파라미터기본값'); /* 파라미터설명 */


module.exports.getFlightDepartureSchedule = function(destination_code) {
  console.log(`api_config : ${api_config.flightSchedule_key}`);
  var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerDeparturesDS';
  //var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + 'sIHubBZe%2FsPM76R2dlHOOuve9RZrmuzKynUIxWar%2BtvOb209aOTFQikgz0vxGLRBFoSckQ3dZdbrdYLMozHCDg%3D%3D';
  queryParams += '&' + encodeURIComponent('airport_code') + '=' + encodeURIComponent(destination_code); /* 도착지 코드 */


  return new Promise(function(resolve, reject){
    request(
      {
        url: url + queryParams,
        method: 'GET'
      },
      function(error, response, body) {
        //console.log('Status', response.statusCode);
        //console.log('Headers', JSON.stringify(response.headers));

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
            //console.log("Result"+"\n", s, "\n");
            console.log(result.response.body[0].items[0].item);
            resolve(result.response.body[0].items[0].item);
          }
        });
      }
    );
  });
};
