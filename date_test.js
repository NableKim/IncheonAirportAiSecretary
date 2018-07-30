var date = require('date-and-time');

var now = new Date();
console.log(date.format(now, 'YYYY/MM/DD HH:mm:ss'));
var day = date.parse('2015-02-01', 'YYYY-DD-MM');
console.log(date.format(day, 'YYYY/MM/DD'));  
