'use strict';

const lexResponses = require('../lexResponses');
const getCongestionDataFromAPI = require('../getCongestionDataFromAPI');
const _ = require('lodash');
const terminalNum = ['T1', 'T2'];
//순서대로 0, 1, 2, 3, 9
const degreeEng = ['Fast', 'Normal', 'Busy', 'Very Crowded', 'Closed'];
const degreeKor = ['원활', '보통', '혼잡', '매우혼잡', '종료'];

function buildValidationResult(isValid, violatedSlot, messageContent, options) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot,
      options
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
    options
  };
}

function validateCongestionDegree(terminalNum) {
  if(terminalNum !== 'T1' || terminalNum !== 'T2') { //잘못된 입력. 무조건 T1, T2중 하나 입력필요
    const options = getOptions('Which Terminal? T1 or T2?', terminalNum);
    return buildValidationResult(false, 'TerminalNum'. 'Please input valid Terminal number(T1 or T2)');
  }

  return buildValidationResult(true, null, null);
}


module.exports = function(intentRequest, callback) {
  console.log("CongestionDegreelManageDialog was called...");
  var TerminalNum=intentRequest.currentIntent.slots.TerminalNum;
  var slots = intentRequest.currentIntent.slots;

//TerminalNum 입력 완료
  //T1, T2 변환
  if(TerminalNum === 'T1') {TerminalNum = '1'}
  else if(TerminalNum == 'T2') {TerminalNum = '2'}
  return getCongestionDataFromAPI.getCongestionDegree(TerminalNum).then(congestionDegree_list => {
    console.log('congestionDegree_list : ${congestionDegree_list}');

    if(congestionDegree_list.length === 0) {
      console.log('출국장 혼잡도 정보를 불러올 수 없습니다');
    }
    else {
      console.log('파싱작업중');
      //출국장 혼잡도
      var gate1 = congestionDegree_list.gate1[0];
      var gate2 = congestionDegree_list.gate2[0];
      var gate3 = congestionDegree_list.gate3[0];
      var gate4 = congestionDegree_list.gate4[0];
      //출국장 대기인수
      var gateinfo1 = congestionDegree_list.gateinfo1[0];
      var gateinfo2 = congestionDegree_list.gateinfo2[0];
      var gateinfo3 = congestionDegree_list.gateinfo3[0];
      var gateinfo4 = congestionDegree_list.gateinfo4[0];
      console.log('Gate1: 'test_result);
    }
  });
}
