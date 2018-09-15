'use strict';

const lexResponses = require('../conLexResponses');
const getExchangeRateDataFromAPI = require('./getExchangeRateDataFromAPI');

const currencySample = ['AED', 'AUD', 'BHD', 'CHF', 'CNH', 'DKK', 'EUR',
                        'GBP', 'HKD', 'IDR', 'JPY', 'KRW', 'KWD', 'MYR',
                        'NOK', 'NZD', 'SAR', 'SEK', 'SGD', 'THB', 'USD'];

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot,
        // options
      };
    }
    return {
      isValid,
      violatedSlot,
      message: { contentType: 'PlainText', content: messageContent},
      // options
    };
  }

function validateExchangeRate(currency) { //제대로 된 통화를 입력받았는지 check
  var result = 0;
  for(var i = 0; i < currencySample.length; i++) {
    if(currencySample[i] != currency) { result+=1; }
    else {result = 0; break;}
  }

  if(result != 0) { //터미널 넣으라고
    console.log("잘못된 입력이거나 받은 데이터가 없습니다");
    return buildValidationResult(false, 'Currency', 'Please enter Currency Unit');
  } else {
    return buildValidationResult(true, null, null);
  }
}

function getTodayDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  var day = today.getDay();
  //0일요일 1월요일 2화요일....6토요일
  if(day == 0 || day == 6) { //주말이면
    if(day == 0)  dd-=2;
    else if(day == 6) dd -=1;
  }
  if(dd<10) {dd='0'+dd;}
  if(mm<10) {mm='0'+mm;}
  today = yyyy+mm+dd;
  return today;
}
module.exports = function(intentRequest, callback) {
  console.log("ExchangeRatelManageDialog was called...");
  var currency = intentRequest.currentIntent.slots.Currency; //user가 입력한 currency unit 보관
  var currency_rate = 0;
  var message = "";
  const slots = intentRequest.currentIntent.slots;
  console.log("User entered..." + currency);

  const validationResult = validateExchangeRate(currency);
  if(!validationResult.isValid) {
    console.log("validation 통과 못함");
    slots[`${validationResult.violatedSlot}`] = null;
    console.log("슬롯초기화");
    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot,validationResult.message));
  } else {
    console.log("validation 통과함");
    //api 요청
    //오늘 날짜 받아오기
    var today = getTodayDate();
    return getExchangeRateDataFromAPI.getExchangeRate(today).then(exchangeRate_list => {
      console.log(`exchangeRate_list : ${exchangeRate_list}`);
      if(exchangeRate_list.length == 0) {
        console.log('오늘의 환율 정보를 불러올 수 없습니다');
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `I'm sorry. There is no information about exchange rate for today`}, null);
      } else {
        console.log('환율 정보가 존재합니다');
        console.log(exchangeRate_list.length);
        currency = currency.toUpperCase();
        var i = 0;
        for(i = 0; i < exchangeRate_list.length; i++) {
          console.log("result!!!!!! " + exchangeRate_list[i].cur_unit);
          if(exchangeRate_list[i].cur_unit == currency) {
            currency_rate = exchangeRate_list[i].deal_bas_r;
          }
        }
        message = "1 " + currency + " is " + currency_rate + " KRW";
      }
      return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled',
      {'contentType' : 'PlainText', 'content': `${message}`},
      null);
    });
  }

}
