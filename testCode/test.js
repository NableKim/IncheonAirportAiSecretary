/* NodeJs 샘플 코드 */


var request = require('request');
var format = require('xml-formatter');
var fs = require('fs');
var x2j = require('xml2js');
var api_config = require('../config/openAPIkey.json');

var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlights/getPassengerDepartures';
var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + api_config.flightSchedule_key; /* Service Key*/
queryParams += '&' + encodeURIComponent('to_time') + '=' + encodeURIComponent('2400'); /* 검색 종료 시간 (HHMM) */
queryParams += '&' + encodeURIComponent('airport') + '=' + encodeURIComponent(''); /* 도착지 공항 코드 */
queryParams += '&' + encodeURIComponent('flight_id') + '=' + encodeURIComponent(''); /* 운항 편명 */
queryParams += '&' + encodeURIComponent('airline') + '=' + encodeURIComponent(''); /* 항공사 코드 */
queryParams += '&' + encodeURIComponent('lang') + '=' + encodeURIComponent('E'); /* 국문=K, 영문=E, 중문=C, 일문=J, Null=K */
queryParams += '&' + encodeURIComponent('from_time') + '=' + encodeURIComponent('2300'); /* 검색 시작 시간 (HHMM) */


// 도착편
// var url = 'http://openapi.airport.kr/openapi/service/StatusOfPassengerFlights/getPassengerArrivals';
// var queryParams = '?' + encodeURIComponent('ServiceKey') + '=서비스키'; /* Service Key*/
// queryParams += '&' + encodeURIComponent('from_time') + '=' + encodeURIComponent('0000'); /* 검색 시작 시간 (HHMM) */
// queryParams += '&' + encodeURIComponent('to_time') + '=' + encodeURIComponent('2400'); /* 검색 종료 시간 (HHMM) */
// queryParams += '&' + encodeURIComponent('airport') + '=' + encodeURIComponent('　 HKG'); /* 출발지 공항 코드 */
// queryParams += '&' + encodeURIComponent('flight_id') + '=' + encodeURIComponent('　 KE846'); /* 운항 편명 */
// queryParams += '&' + encodeURIComponent('airline') + '=' + encodeURIComponent('　 KE'); /* 항공사 코드 */
// queryParams += '&' + encodeURIComponent('lang') + '=' + encodeURIComponent('　K'); /* 국문=K, 영문=E, 중문=C, 일문=J, Null=K */

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
