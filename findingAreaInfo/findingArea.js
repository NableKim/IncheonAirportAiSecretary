'use strict';

/*
 * findingPlace.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-08-11
*/

const handleDialogCodeHook = require('./findingAreaManageDialog');
const handleFulfillmentCodeHook = require('./findingAreaManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered findingArea...");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running findingArea's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmentCodeHook') {
    console.log("Running findingArea's FulfillmentCodeHook...");
    return handleFulfillmentCodeHook(intentRequest);
  }
};
