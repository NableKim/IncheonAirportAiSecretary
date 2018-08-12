var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

var docClient = new AWS.DynamoDB.DocumentClient()

// var params = {
//   TableName: 'myFlight-table',
//   Key:{
//       "userId": 'odn47r5fjcat5v3hcua1gfpms0myh1o1'
//   },
//   UpdateExpression:"set departureDate=:de, airlineName_en=:ae, airlineName_kr=:ak, flightId=:id, destinationName_en=:dn, destinationCode=:dc",
//   ExpressionAttributeValues:{
//       ":de":'aaaaa',
//       ":ae":'aaaaa',
//       ":ak":'aaaaa',
//       ":id":'aaaaa',
//       ":dn":'aaaaa',
//       ":dc":'aaaaa'
//   },
//   ReturnValues:"UPDATED_NEW"
// };
//
// console.log("Updating the item...");
// docClient.update(params, function(err, data) {
//     if (err) {
//         console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
//     }
// });


const SEARCH_KEYWORD = "Air";

var params = {
 ExpressionAttributeValues: {
  ":topic": {
    S: "sia"
   }
 },
 FilterExpression: "contains (name_en, :topic)",
 ProjectionExpression: "name_en",
 TableName: "airline-table"
};

docClient.scan(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log(data);
    data.Items.forEach(function(element, index, array) {
      console.log(1);
    });
  }
});
