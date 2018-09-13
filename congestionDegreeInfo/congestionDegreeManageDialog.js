'use strict';

const lexResponses = require('../conLexResponses');
const getCongestionDataFromAPI = require('./getCongestionDataFromAPI');
// const _ = require('lodash');
const terminalNumSample = ['Terminal 1', 'Terminal 2', 'terminal 1', 'terminal 2'];
//순서대로 0, 1, 2, 3, 9
const degreeEng = ['Fast', 'Normal', 'Busy', 'Very Crowded', 'Closed'];
const degreeKor = ['원활', '보통', '혼잡', '매우혼잡', '종료'];

var integerTerminalNum;

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

function translateResultForTer1(TerminalNum, gate1, gate2, gate3, gate4, gateinfo1, gateinfo2, gateinfo3, gateinfo4) {
  //T1
  //gate1/gateinfo1: 2번출국장 혼잡도/대기인수
  //gate2/gateinfo2: 3번출국장 혼잡도/대기인수
  //gate3/gateinfo3: 4번출국장 혼잡도/대기인수
  //gate4/gateinfo4: 5번출국장 혼잡도/대기인수
    var finalMessage = "";
    console.log("터미널1");
    finalMessage += "This is congestion degree of Terminal 1" + "\n";
    //gate1
    switch (gate1) {
      case '0':
        finalMessage += "Gate 2: Fast, ";
        finalMessage += gateinfo1 + " people are waiting" + "\n";
        break;
      case '1':
        finalMessage += "Gate 2: Normal, ";
        finalMessage += gateinfo1 + " people are waiting"+ "\n";
        break;
      case '2':
          finalMessage += "Gate 2: Busy, ";
          finalMessage += gateinfo1 + " people are waiting"+ "\n";
          break;
      case '3':
          finalMessage += "Gate 2: Very Crowded, ";
          finalMessage += gateinfo1 + " people are waiting"+ "\n";
          break;
      case '9':
          finalMessage += "Gate 2: Closed"+ "\n";
          break;
    }

    //gate1
    switch (gate2) {
      case '0':
        finalMessage += "Gate 3: Fast, ";
        finalMessage += gateinfo2 + " people are waiting"+ "\n";
        break;
      case '1':
        finalMessage += "Gate 3: Normal, ";
        finalMessage += gateinfo2 + " people are waiting"+ "\n";
        break;
      case '2':
          finalMessage += "Gate 3: Busy, ";
          finalMessage += gateinfo2 + " people are waiting"+ "\n";
          break;
      case '3':
          finalMessage += "Gate 3: Very Crowded, ";
          finalMessage += gateinfo2 + " people are waiting"+ "\n";
          break;
      case '9':
          finalMessage += "Gate 3: Closed"+ "\n";
          break;
    }

    //gate1
    switch (gate3) {
      case '0':
        finalMessage += "Gate 4: Fast, ";
        finalMessage += gateinfo3 + " people are waiting"+ "\n";
        break;
      case '1':
        finalMessage += "Gate 4: Normal, ";
        finalMessage += gateinfo3 + " people are waiting"+ "\n";
        break;
      case '2':
          finalMessage += "Gate 4: Busy, ";
          finalMessage += gateinfo3 + " people are waiting"+ "\n";
          break;
      case '3':
          finalMessage += "Gate 4: Very Crowded, ";
          finalMessage += gateinfo3 + " people are waiting"+ "\n";
          break;
      case '9':
          finalMessage += "Gate 4: Closed"+ "\n";
          break;
    }

    //gate1
    switch (gate4) {
      case '0':
        finalMessage += "Gate 5: Fast, ";
        finalMessage += gateinfo4 + " people are waiting"+ "\n";
        break;
      case '1':
        finalMessage += "Gate 5: Normal, ";
        finalMessage += gateinfo4 + " people are waiting"+ "\n";
        break;
      case '2':
          finalMessage += "Gate 5: Busy, ";
          finalMessage += gateinfo4 + " people are waiting"+ "\n";
          break;
      case '3':
          finalMessage += "Gate 5: Very Crowded, ";
          finalMessage += gateinfo4 + " people are waiting"+ "\n";
          break;
      case '9':
          finalMessage += "Gate 5: Closed"+ "\n";
          break;
    }
    console.log("Final Message: " + finalMessage);
    return finalMessage;
}
function translateResultForTer2(TerminalNum, gate1, gate2,gateinfo1, gateinfo2) {
  var finalMessage = "";
  console.log("터미널2");
  finalMessage += "This is congestion degree of Terminal 2"+ "\n";
  //T2
  //gate1/gateinfo1: 1번출국장 혼잡도/대기인수
  //gate2/gateinfo2: 2번출국장 혼잡도/대기인수
  switch (gate1) {
    case '0':
      finalMessage += "Gate 1: Fast, ";
      finalMessage += gateinfo1 + " people are waiting"+"\n";
      break;
    case '1':
      finalMessage += "Gate 1: Normal, ";
      finalMessage += gateinfo1 + " people are waiting"+"\n";
      break;
    case '2':
        finalMessage += "Gate 1: Busy, ";
        finalMessage += gateinfo1 + " people are waiting"+"\n";
        break;
    case '3':
        finalMessage += "Gate 1: Very Crowded, ";
        finalMessage += gateinfo1 + " people are waiting"+"\n";
        break;
    case '9':
        finalMessage += "Gate 1: Closed"+"\n";
        break;
  }
  switch (gate2) {
    case '0':
      finalMessage += "Gate 2: Fast, ";
      finalMessage += gateinfo2 + " people are waiting"+"\n";
      break;
    case '1':
      finalMessage += "Gate 2: Normal, ";
      finalMessage += gateinfo2 + " people are waiting"+"\n";
      break;
    case '2':
        finalMessage += "Gate 2: Busy, ";
        finalMessage += gateinfo2 + " people are waiting"+"\n";
        break;
    case '3':
        finalMessage += "Gate 2: Very Crowded, ";
        finalMessage += gateinfo2 + " people are waiting"+"\n";
        break;
    case '9':
        finalMessage += "Gate 2: Closed"+"\n";
        break;
  }
  console.log("Final Message: " + finalMessage);
  return finalMessage;
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
    integerTerminalNum = i;
    //api 요청
    return getCongestionDataFromAPI.getCongestionDegree(i).then(congestionDegree_list => {
      console.log(`congestionDegree_list : ${congestionDegree_list}`);

      if(congestionDegree_list.length == 0) {
        console.log('출국장 혼잡도 정보를 불러올 수 없습니다');
        return lexResponses.close(intentRequest.sessionAttributes, 'Failed', {contentType : 'PlainText', content: `I'm sorry. There is no information about congestion degree`}, null);
      }
      else {
        console.log('파싱작업중');

        console.log("api 배열 길이: " + congestionDegree_list.length);
        var gate1;
        var gate2;
        var gate3;
        var gate4;
        var gateinfo1;
        var gateinfo2;
        var gateinfo3;
        var gateinfo4;
        var j = 0;
        var message;
        if(integerTerminalNum == 1) {
          for(j = 0; j < congestionDegree_list.length; j++) {
            gate1 = congestionDegree_list[j].gate1[0];
            gate2 = congestionDegree_list[j].gate2[0];
            gate3 = congestionDegree_list[j].gate3[0];
            gate4 = congestionDegree_list[j].gate4[0];
            gateinfo1 = congestionDegree_list[j].gateinfo1[0];
            gateinfo2 = congestionDegree_list[j].gateinfo2[0];
            gateinfo3 = congestionDegree_list[j].gateinfo3[0];
            gateinfo4 = congestionDegree_list[j].gateinfo4[0];
          }
          message = translateResultForTer1(integerTerminalNum, gate1, gate2, gate3, gate4, gateinfo1, gateinfo2, gateinfo3, gateinfo4);
        } else if(integerTerminalNum == 2) {
          for(j = 0; j < congestionDegree_list.length; j++) {
            gate1 = congestionDegree_list[j].gate1[0];
            gate2 = congestionDegree_list[j].gate2[0];
            gateinfo1 = congestionDegree_list[j].gateinfo1[0];
            gateinfo2 = congestionDegree_list[j].gateinfo2[0];
          }
          message = translateResultForTer2(integerTerminalNum, gate1, gate2, gateinfo1, gateinfo2);
        }

        return lexResponses.close(intentRequest.sessionAttributes, 'Fulfilled',
        {'contentType' : 'PlainText', 'content': `${message}`},
        null);

        // console.log("gate 1: " + gate1);
        // console.log(message);

        // console.log(finalMessage);

      }
    });
  }



};
