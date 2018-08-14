var maps = [
{
    "airline": [
        "Asiana Airlines"
    ],
    "airport": [
        "SEATTLE"
    ],
    "airportCode": [
        "SEA"
    ],
    "chkinrange": [
        "L22-M18"
    ],
    "estimatedDateTime": [
        "1946"
    ],
    "flightId": [
        "OZ272"
    ],
    "gatenumber": [
        "28"
    ],
    "remark": [
        "Departed"
    ],
    "scheduleDateTime": [
        "1815"
    ],
    "terminalId": [
        "P01"
    ]
}
];

var str = {
  'airline':'chkinrange'
};

var text = 'airline'

console.log(maps[0][str[text]][0]);
