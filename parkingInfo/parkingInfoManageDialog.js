'use strict';

/*
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * parkingInfoManageDialog.js
 * - Get parking information requested by the user
 *
*/

const lexResponses = require('../lexResponses');
const databaseManager = require('../databaseManager');
const _ = require('lodash');

const terminal = ['T1','T2'];
const term = ['long','short'];

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

function buildUserFavoriteResult(TermainalNum, Term, messageContent) {
  return {
    TermainalNum,
    Term,
    message: { contentType: 'PlainText', content: messageContent }
  };
}

function getButtons(options) {
  var buttons = [];
  _.forEach(options, option => {
    buttons.push({
      text: option,
      value: option
    });
  });
  return buttons;
}

function getOptions(title, types) {
  return {
    title,
    imageUrl: 'https://i2.wp.com/www.newdelhitimes.com/wp-content/uploads/2016/10/2000px-Information_road_sign_parking.svg_.png?w=2000',
    buttons: getButtons(types)
  };
}

function validateParkingInfo (terminalNum, term) {
  console.log("validateParkingInfo");

  //터미널번호를 잘못 입력
  if (IA_TerminalNum && terminal.indexOf(IA_TerminalNum.toLowerCase()) === -1) {
    const options = getOptions('What’s the termainal number?', terminal);
    return buildValidationResult(false, 'terminal', `We do not have ${IA_TerminalNum}, Which Terminal? T1 or T2?`, options);
  }
  //주차기간을 잘못 입력
  if (IA_Term && term.indexOf(IA_Term.toLowerCase()) === -1) {
    const options = getOptions('Do you want parking for a long time or shorttime?', term);
    return buildValidationResult(false, 'term', `We do not have ${IA_Term}, Do you want parking for a long time or short time?`, options);
  }

  return buildValidationResult(true, null, null);
}

function findUserFavorite(userId) {
  return databaseManager.findUserFavorite(userId).then(item => {
    return buildUserFavoriteResult(item.parking, `Would you want parking for ${item.Term} time at ${item.TerminalNum}?`);
  });
}

module.exports = function(intentRequest) {
  console.log("parkingInfoManageDialog was called ...");
  var IA_TerminalNum =  intentRequest.currentIntent.slots.TerminalNum;
  var IA_Term = intentRequest.currentIntent.slots.Term;
  var userId = intentRequest.userId;
  const slots = intentRequest.currentIntent.slots;

  //터미널 번호와 주차기간이 입력되지 않았을때
  if ( IA_TerminalNum === null || IA_Term === null) {
    return findUserFavorite(userId)
      .then(item => {
        slots.TerminalNum = item.TerminalNum;
        slots.Term = item.Term;
        //Ask the user if he will like to order this item
        return lexResponses.confirmIntent(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, item.message);
      })
      .catch(error => {
        //Need to ask the user what they want coffee they want?
        return lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots);
      });
    }
    //터미널 번호와 주차기간이 입력
    else {
       if(terminal === 'T1'){
         //1터미널 단기주차 (1~4)
         if(term === 'short'){

         }
         //1터미널 장기주차 (5~10)
         else{

         }
       }
       else{
         //2터미널 단기주차 (11~13)
         if(term === 'short'){

         }
         //2터미널 장기주차 (14)
         else{

         }
       }
     }
  //  else {
  //   const validationResult = validateParkingInfo(IA_terminalNum, IA_terminalNum);
  //
  //   if (!validationResult.isValid) {
  //     slots[`${validationResult.violatedSlot}`] = null;
  //     return Promise.resolve(
  //       lexResponses.elicitSlot(
  //         intentRequest.sessionAttributes,
  //         intentRequest.currentIntent.name,
  //         slots,
  //         validationResult.violatedSlot,
  //         validationResult.message,
  //         validationResult.options.title,
  //         validationResult.options.imageUrl,
  //         validationResult.options.buttons
  //       )
  //     );
  //   }
  //
  //   return Promise.resolve(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
  // }
};
