'use strict';

/*
 * departureTime.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-15
*/

const handleDialogCodeHook = require('./departureTimeManageDialog');
const handleFulfillmentCodeHook = require('./departureTimeManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered departureTime...");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running departureTime's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmentCodeHook') {
    console.log("Running departureTime's FulfillmentCodeHook...");
    return handleFulfillmentCodeHook(intentRequest);
  }
};
