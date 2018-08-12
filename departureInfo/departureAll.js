'use strict';

/*
 * departureAll.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const handleDialogCodeHook = require('./departureAllManageDialog');
const handleFulfillmentCodeHook = require('./departureAllManageFulfillment');

module.exports = function(intentRequest) {
  console.log("Entered departureAll...");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running departureAll's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmentCodeHook') {
    console.log("Running departureAll's FulfillmentCodeHook...");
    return handleFulfillmentCodeHook(intentRequest);
  }
};
