'use strict';

/*
 * arrivalAll.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-11
*/

const handleDialogCodeHook = require('./arrivalAllManageDialog');
const handleFulfillmentCodeHook = require('./arrivalAllManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered arrivalAll...");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running arrivalAll's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmentCodeHook') {
    console.log("Running arrivalAll's FulfillmentCodeHook...");
    return handleFulfillmentCodeHook(intentRequest);
  }
};
