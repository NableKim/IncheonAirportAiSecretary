'use strict';

/*
 * handler.js - To accept trigger from AWS
 *
 * Incheon Airport AI Secretary based on AWS Lex
 *
 * Created by Nablekim94@gmail.com 2018-07-13
*/

const dispatch = require('./dispatch');

module.exports.intents = (event, context, callback) => {
  try {
    console.log(`event.bot.name=${event.bot.name}`);

    // Distinguish intents
    dispatch(event, function(response) {
      callback(null, response);
    });
  } catch(err) {
    callback(err);
  }
};
