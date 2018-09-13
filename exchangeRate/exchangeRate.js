'use strict';

const handleDialogCodeHook = require('./exchangeRateManageDialog');
const handleFulfillmentCodeHook = require('./exchangeRateManageFulfillment');

module.exports = function(intentRequest, callback) {
  console.log("Entered ExchangeRate~~~");
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
