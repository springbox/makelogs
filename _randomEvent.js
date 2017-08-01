var samples = require('./samples');
var argv = require('./argv');

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

  return {
      "controllerType": "testType",
      "originDate": dateAsIso
  };
};
