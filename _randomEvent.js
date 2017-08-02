var samples = require('./samples');
var argv = require('./argv');
let _ = require('lodash');

var eventCounter = -1;
var count = argv.total;

var countOfDays = (function () {
  var cursor = argv.start.clone();
  var count = 0;
  var end = argv.end.valueOf();

  if (cursor.valueOf() <= end) {
    do {
      cursor.add(1, 'day');
      count += 1;
    } while (cursor.valueOf() <= end);
  }

  return count;
}());
var countPerDay = Math.ceil(count / countOfDays);

var indexInterval = argv.indexInterval;
var dayMoment = argv.start.clone();
var day;

module.exports = function RandomEvent(indexPrefix) {
  var i = ++eventCounter;
  var iInDay = i % countPerDay;

  if (day && iInDay === 0) {
    dayMoment.add(1, 'day');
    day = null;
  }

  if (day == null) {
    day = {
      year: dayMoment.year(),
      month: dayMoment.month(),
      date: dayMoment.date(),
    };
  }

  var ms = samples.lessRandomMsInDay();

  // extract number of hours from the milliseconds
  var hours = Math.floor(ms / 3600000);
  ms = ms - hours * 3600000;

  // extract number of minutes from the milliseconds
  var minutes = Math.floor(ms / 60000);
  ms = ms - minutes * 60000;

  // extract number of seconds from the milliseconds
  var seconds = Math.floor(ms / 1000);
  ms = ms - seconds * 1000;

  // apply the values found to the date
  var date = new Date(day.year, day.month, day.date, hours, minutes, seconds, ms);
  var dateAsIso = date.toISOString();

  let event = {
      "controllerType": "testType",
      "originDate": dateAsIso
  };

  event['@timestamp'] = dateAsIso;
  event.utc_time = dateAsIso;
    switch (indexInterval) {
        case 'yearly':
            event.index = indexPrefix + dateAsIso.substr(0, 4);
            break;

        case 'monthly':
            event.index = indexPrefix + dateAsIso.substr(0, 4) + '.' + dateAsIso.substr(5, 2);
            break;
        case 'daily':
            event.index = indexPrefix + dateAsIso.substr(0, 4) + '.' + dateAsIso.substr(5, 2) + '.' + dateAsIso.substr(8, 2);
            break;

        default:
            event.index = indexPrefix + Math.floor(i / indexInterval);
            break;
    }

  let serialNumbers = [12345, 67890, "abcdef"];

  event.controllerSerialNumber = serialNumbers[_.random(0, 2)];

  let eventType =_.random(0,16);
  console.log('event type of: ', eventType);

  switch (eventType) {
      case 0:
        event.event = { "eventType": "Restraint engaged"};
        break;
      case 1:
        event.event = { "eventType": "Restraint released"};
        break;
      case 2:
        event.event = { "eventType": "Restraint bypassed"};
        break;
      case 3:
        event.event = { "eventType": "Leveler deployed / stowed"};
        break;
      case 4:
        event.event = { "eventType": "Leveler raised (if equipment allows)"};
        break;
      case 5:
        event.event = { "eventType": "Leveler lowered"};
        break;
      case 6:
        event.event = { "eventType": "Leveler hydraulic fluid level low"};
        break;
      case 7:
        event.event = { "eventType": "Door open (Not Open on falling edge)"};
        break;
      case 8:
        event.event = { "eventType": "Door closed (Not Closed on Falling Edge)"};
        break;
      case 9:
        event.event = { "eventType": "Controller heartbeat"};
        break;
      case 10:
        event.event = { "eventType": "Fork truck enter / exit (single event)"};
        break;
      case 11:
        event.event = { "eventType": "Possible event that is always generated"};
        break;
      case 12:
        event.event = { "eventType": "Truck Present (Not Present on Falling Edge)"};
        break;
      case 13:
        event.event = { "eventType": "Possible event that is always generated"};
        break;
      case 14:
        event.event = { "eventType": "Service Performed"};
        break;
      case 15:
        event.event = { "eventType": "Power-On"};
        break;
      case 16:
        event.event = { "eventType": "Faults"};
        break;
      default:
        event.event = { "eventType": "default" };
        break;
  }

  return event;
};
