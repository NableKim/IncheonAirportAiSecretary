'use strict';

/*
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * parkingInfo.js - Cordhook classification
 *
*/

const dialogCodeHook = require('./parkingInfoManageDialog');
const fulfillmentCodeHook = require('./parkingInfoManageFulfillment');

module.exports = function(intentRequest) {
  console.log("parkingInfo");

  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook') {
    console.log("Running parkingInfo DialogCodeHook ...");

    return dialogCodeHook(intentRequest);
  }
  else if(source === 'FulfillmnetCodeHook') {
    return fulfillmentCodeHook(intentRequest);
  }
}
