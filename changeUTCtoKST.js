'use strict';

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1); // 영국 런던의 1월 1일 시간  - 서머타임 X - (-9시간 차이) - (+540)
    console.log('jan : '+jan+' '+jan.getTimezoneOffset());
    var jul = new Date(this.getFullYear(), 6, 1);  // 영국 런던의 7월 1일 시간 - 서머타임 o - (-8시간 차이) - (+480)
    console.log('jul : '+jul+' '+jul.getTimezoneOffset());
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
  console.log('getTime : '+this.getTimezoneOffset());
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

module.exports = function() {
  var now = new Date(); // UTC 표준시
  return date.addHours(now, 9);
};
