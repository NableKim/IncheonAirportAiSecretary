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


module.exports.getFlightSchedule = function(airport_code, str) {
  console.log(`api_config : ${api_config.flightSchedule_key}`);

  var url = '';
  if(str=='departure') {
    url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerDeparturesDS';
    //var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
  } else {  // 도착
    url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerArrivalsDS';
  }

  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + 'sIHubBZe%2FsPM76R2dlHOOuve9RZrmuzKynUIxWar%2BtvOb209aOTFQikgz0vxGLRBFoSckQ3dZdbrdYLMozHCDg%3D%3D';
  queryParams += '&' + encodeURIComponent('airport_code') + '=' + encodeURIComponent(airport_code); /* 공항 코드 */


// ##################api 응답시간 측정 ##############
  var now = new Date();
  console.log('API 응답시간'+now);
// ##################api 응답시간 측정 ##############

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
          // ##################api 응답시간 측정 ##############
          now = new Date();
          console.log('API 응답시간'+now);
          // ##################api 응답시간 측정 ##############
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

module.exports.getTodayFlightSchedule = function(sessionAttributes, str) {
  console.log(`api_config : ${api_config.flightSchedule_key}`);

  var url = '';
  var airportCode = null;
  if(str=='departure') {
    url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlights/getPassengerDepartures';
    airportCode = sessionAttributes.destinationCode;
  } else {  // 도착
    url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlights/getPassengerArrivals';
    airportCode = sessionAttributes.sourceCode;
  }

  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
  queryParams += '&' + encodeURIComponent('to_time') + '=' + encodeURIComponent('2400'); /* 검색 종료 시간 (HHMM) */
  queryParams += '&' + encodeURIComponent('airport') + '=' + encodeURIComponent(airportCode); /* 도착지 공항 코드 */
  queryParams += '&' + encodeURIComponent('flight_id') + '=' + encodeURIComponent(sessionAttributes.flightId); /* 운항 편명 */
  //queryParams += '&' + encodeURIComponent('airline') + '=' + encodeURIComponent(''); /* 항공사 코드 */
  queryParams += '&' + encodeURIComponent('lang') + '=' + encodeURIComponent('E'); /* 국문=K, 영문=E, 중문=C, 일문=J, Null=K */
  queryParams += '&' + encodeURIComponent('from_time') + '=' + encodeURIComponent('0000'); /* 검색 시작 시간 (HHMM) */

  // ##################api 응답시간 측정 ##############
    var now = new Date();
    console.log('API 응답시간'+now);
  // ##################api 응답시간 측정 ##############

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
          // ##################api 응답시간 측정 ##############
          now = new Date();
          console.log('API 응답시간'+now);
          // ##################api 응답시간 측정 ##############
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

module.exports.getAirlineInfo = function(lata_code) {
  var url = 'http://openapi.airport.kr/openapi/service/StatusOfSrvAirlines/getServiceAirlineInfo';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
  queryParams += '&' + encodeURIComponent('airline_iata') + '=' + encodeURIComponent(lata_code); /* 항공사 IATA 코드 */
  //queryParams += '&' + encodeURIComponent('airline_icao') + '=' + encodeURIComponent('　GIA'); /* 항공사 ICAO 코드 */

  return new Promise(function(resolve, reject){
    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {

      if(error)
        reject(error);
        
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
    });
  });





};
