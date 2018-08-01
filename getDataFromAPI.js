/* NodeJs 샘플 코드 */
// 전체 운항

var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('./config/openAPIkey.json');

// 도착편
// var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerArrivalsDS';
// var queryParams = '?' + encodeURIComponent('ServiceKey') + '=서비스키'; /* Service Key*/
// queryParams += '&' + encodeURIComponent('파라미터영문명') + '=' + encodeURIComponent('파라미터기본값'); /* 파라미터설명 */


module.exports.getFlightDepartureSchedule = function(destination_code) {
  var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerDeparturesDS';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
  queryParams += '&' + encodeURIComponent('airport_code') + '=' + encodeURIComponent(destination_code); /* 도착지 코드 */

  request({
      url: url + queryParams,
      method: 'GET'
  }, function (error, response, body) {
      //console.log('Status', response.statusCode);
      //console.log('Headers', JSON.stringify(response.headers));

      // xml -> json 변환
      var xml = body; // 실제 데이터
      var formattedXml = format(xml);
      var p = new x2j.Parser();
      p.parseString(xml, function(err, result) {
        if(err){
          console.log(err);
          return null;
        }
        else {
          var s = JSON.stringify(result, undefined, 3);
          console.log("Result"+"\n", s, "\n");
          return result;
        }
      });
  });
};
