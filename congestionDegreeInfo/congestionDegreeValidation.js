'use strict';

//Slot 타당성 검사
function buildValidationResult(isValid, violatedSlot, sessionAttributes, currentIntent, messageContent, options) {
  if(messageContent == null) {
    return {
      isValid,
      violatedSlot,
      sessionAttributes,
      currentIntent,
      options
    };
  }
