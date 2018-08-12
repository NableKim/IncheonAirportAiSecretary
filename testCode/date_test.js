var date = require('date-and-time');

var now = new Date();
console.log(date.format(now, 'YYYY/MM/DD HH:mm:ss'));
console.log(date.format(now, 'YYYYMMDD'));
console.log(date.format(now, 'YYYY-MM-DD'));

//var day = date.parse('2015-02-01', 'YYYY-DD-MM');
var day = date.parse('20150201', 'YYYY-DD-MM');
console.log(date.format(day, 'YYYY-MM-DD'));
