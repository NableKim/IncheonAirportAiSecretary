'use strict';

/* NodeJs 샘플 코드 */
// 전체 운항

var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('./config/openAPIKey.json');

var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlightsDS/getPassengerDeparturesDS';
//var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + 'sIHubBZe%2FsPM76R2dlHOOuve9RZrmuzKynUIxWar%2BtvOb209aOTFQikgz0vxGLRBFoSckQ3dZdbrdYLMozHCDg%3D%3D';
queryParams += '&' + encodeURIComponent('airport_code') + '=' + encodeURIComponent('ORD'); /* 도착지 코드 */

request({
    url: url + queryParams,
    method: 'GET'
}, function (error, response, body) {
    //console.log('Status', response.statusCode); // 응답 결과 번호
    //console.log('Headers', JSON.stringify(response.headers)); // 응답 헤더
    //console.log('Reponse received', body);
    var xml = body; // 실제 데이터
    var formattedXml = format(xml);
    //console.log(formattedXml);

    var p = new x2j.Parser();
    p.parseString(xml, function(err, result) {
        var s = JSON.stringify(result, undefined, 3);
        console.log("Result"+"\n", s, "\n");
    });

});
