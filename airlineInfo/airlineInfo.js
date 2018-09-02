'use strict';

/*
 * airlineInfo.js - To distinguish CodeHook
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-09-03
*/

const handleDialogCodeHook = require('./airlineInfoDialog');

module.exports = function(intentRequest, callback) {
  console.log("Entered airlineInfo...");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook' || source === 'FulfillmentCodeHook') {
    console.log("Running airlineInfo's DialogCodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
};
