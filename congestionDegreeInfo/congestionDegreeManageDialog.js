'use strict';

const lexResponses = require('../conLexResponses');
const getCongestionDataFromAPI = require('../getCongestionDataFromAPI');
// const _ = require('lodash');
const terminalNumSample = ['Terminal 1', 'Terminal 2', 'terminal 1', 'terminal 2'];
//순서대로 0, 1, 2, 3, 9
const degreeEng = ['Fast', 'Normal', 'Busy', 'Very Crowded', 'Closed'];
const degreeKor = ['원활', '보통', '혼잡', '매우혼잡', '종료'];

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

function validateCongestionDegree(TerminalNum) {
  var result = 0;
  for(var i = 0; i < terminalNumSample.length; i++) {
    if(terminalNumSample[i] != TerminalNum) { result+=1; }
    else {result = 0; break;}
  }

  if(result != 0) { //터미널 넣으라고
    console.log("잘못된 입력이거나 받은 데이터가 없습니다");
    return buildValidationResult(false, 'TerminalNum', 'Please enter terminal number');
  } else {
    return buildValidationResult(true, null, null);
  }
}

function convertTerminalNumberToNumber (TerminalNum) {
  if(TerminalNum == terminalNumSample[0] || TerminalNum == terminalNumSample[2]) return 1;
  else if(TerminalNum == terminalNumSample[1] || TerminalNum == terminalNumSample[3]) return 2;
}

module.exports = function(intentRequest, callback) {
  console.log("CongestionDegreelManageDialog was called...");
  var TerminalNum=intentRequest.currentIntent.slots.TerminalNum;
  const slots = intentRequest.currentIntent.slots;
  console.log("User entered....." + TerminalNum);

  const validationResult = validateCongestionDegree(TerminalNum);
  if(!validationResult.isValid) {
    console.log("validation 통과못함");
    slots[`${validationResult.violatedSlot}`] = null;
    console.log("슬롯초기화");
    return Promise.resolve(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot,validationResult.message));
       // validationResult.violatedSlot,validationResult.message
  } else {
    console.log("validation 통과함");
    //터미널 번호만 빼오기
    var i = convertTerminalNumberToNumber(TerminalNum);
    //api 요청
    return getCongestionDataFromAPI.getCongestionDegree(i).then(congestionDegree_list => {
      console.log(`congestionDegree_list : ${congestionDegree_list}`);

      if(congestionDegree_list.length == 0) {
        console.log('출국장 혼잡도 정보를 불러올 수 없습니다');
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `I'm sorry. There is no information about congestion degree`}, null);
      }
      else {
        console.log('파싱작업중');
        //출국장 혼잡도
        console.log("api 배열 길이: " + congestionDegree_list.length);
        //errors

      }
    });
  }



};
