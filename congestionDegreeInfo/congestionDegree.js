'use strict';

const handleDialogCodeHook = require('./congestionDegreeManageDialog');
const handleFulfillmentCodeHook = require('./congestionDegreeManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered congestionDegree~~~");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running congestionDegree's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmentCodeHook') {
    console.log("Running congestionDegree's FulfillmentCodeHook...");
    return handleFulfillmentCodeHook(intentRequest);
  }
};
// const lexResponses = require('../lexResponses');
// module.exports = function(intentRequest, callback) {
//   var Immigration = intentRequest.currentIntent.slots.Immigration;
//   var TerminalNum = intentRequest.currentIntent.slots.TerminalNum;
//   console.log(immigration + ', ' + terminalNum);
//
//   const source = intentRequest.currentIntent.invocationSource;
//   if(source ==='DialogCodeHook') {
//     const slots = intentRequest.currentIntent.slots;
//     const validationResult = validateCongestionDegree(TerminalNum);
//
//     if(!validationResult.isValid) {
//       slots['${validationResult.violatedSlot}'] = null;
//       callback(lexResponses.elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validation))
//
//     }
//   }
// }

// const source = intentRequest.invocationSource;
// if(source == 'DialogCodeHook') {
//   callback(lexResponses.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
//   return;
// }
