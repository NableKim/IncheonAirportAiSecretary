var request = require('request');

var url = 'http://openapi.airport.kr/openapi/service/StatusOfSrvAirlines/getServiceAirlineInfo';
var queryParams = '?' + encodeURIComponent('ServiceKey') + '=sIHubBZe%2FsPM76R2dlHOOuve9RZrmuzKynUIxWar%2BtvOb209aOTFQikgz0vxGLRBFoSckQ3dZdbrdYLMozHCDg%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('airline_iata') + '=' + encodeURIComponent('GA'); /* 항공사 IATA 코드 */
//queryParams += '&' + encodeURIComponent('airline_icao') + '=' + encodeURIComponent('　GIA'); /* 항공사 ICAO 코드 */

request({
    url: url + queryParams,
    method: 'GET'
}, function (error, response, body) {
    //console.log('Status', response.statusCode);
    //console.log('Headers', JSON.stringify(response.headers));
    console.log('Reponse received', body);
});
