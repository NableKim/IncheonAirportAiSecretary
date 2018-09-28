'use strict';

const handleDialogCodeHook = require('./congestionDegreeManageDialog');
//const handleFulfillmentCodeHook = require('./congestionDegreeManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered congestionDegree~~~");
  const source = intentRequest.invocationSource;

  if(source === 'DialogCodeHook' || 'FulfillmentCodeHook') {
    console.log("Running congestionDegree's CodeHook...");
    return handleDialogCodeHook(intentRequest);
  }
  // else if(source === 'FulfillmentCodeHook') {
  //   console.log("Running congestionDegree's FulfillmentCodeHook...");
  //   return handleFulfillmentCodeHook(intentRequest);
  // }
};
