'use strict';

/*
 * arrivalAll.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-15
*/

const handleDialogCodeHook = require('./departureAllManageDialog');
const handleFulfillmentCodeHook = require('./departureAllManageFulfillment');

module.exports = function(intentRequest, callback) {
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    return handleDialogCodeHook();
  }
  else if(source === 'FulfillmnetCodeHook') {
    return handleFulfillmentCodeHook();
  }
}
