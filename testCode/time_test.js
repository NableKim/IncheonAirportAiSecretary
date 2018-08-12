Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1); // 미국 로스엔젤레스의 1월 1일 시간  - 서머타임 X - (-8시간 차이) - (+480)
    console.log('jan : '+jan+' '+jan.getTimezoneOffset());
    var jul = new Date(this.getFullYear(), 6, 1);  // 미국 로스엔젤레스의 7월 1일 시간 - 서머타임 o - (-7시간 차이) - (+420)
    console.log('jul : '+jul.getTimezoneOffset());
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
  console.log('getTime : '+this.getTimezoneOffset());
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

var today = new Date();
if (today.isDstObserved()) {
  console.log('Daylight saving time!');
} else {
  console.log('응 아니야');
}
