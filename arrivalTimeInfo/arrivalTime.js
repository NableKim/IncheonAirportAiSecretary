'use strict';

/*
 * arrivalTime.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-15
*/

const handleDialogCodeHook = require('./arrivalTimeManageDialog');
const handleFulfillmentCodeHook = require('./arrivalTimeManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered arrivalTime...");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running arrivalTime's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmentCodeHook') {
    console.log("Running arrivalTime's FulfillmentCodeHook...");
    return handleFulfillmentCodeHook(intentRequest);
  }
};
