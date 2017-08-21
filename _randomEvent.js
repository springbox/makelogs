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

let restraintCounter = 0;
let levelerCounter = 0;
let doorCounter = 0;
let maintenanceServiceCounter = 0;
let faultCounter = 0;
let truckPresentCounter = 0;
let forkTruckCounter = 0;
let bypassCounter = 0;

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
        metadata: {
            "controllerSerialNumber": "1234321",
            "controllerAliasName": "lifter near the front door",
            "levelerSerialNumber": "6543456",
            "restraintSerialNumber": "0987890",
            "commissionedTimestamp": 1502896616,
            "installationTimestamp": 1502896616,
            "softwareVersion": "1.0.0",
            "modelConfiguration": "power lifter 9000",
            "gateway": {
                "mac": "00-14-22-01-23-45",
                "ip": "10.0.0.1",
                "softwareVersion": "2.0.1"
            }
        },
        statistics: {
            "restraintCycles": restraintCounter,
            "levelerCycles": levelerCounter,
            "lifetimeHours": 12345,
            "lifetimeFaultCounter": faultCounter,
            "doorCycles": doorCounter,
            "maintenanceServiceCycles": maintenanceServiceCounter,
            "forkTruckCycles": forkTruckCounter,
            "truckPresentCycles": truckPresentCounter,
            "bypassModeCounter": bypassCounter,
            "hydraulicFluidLevelLow": true
        },
        event: {
            "type": "Restraint engaged",
            "timestamp": 1502896616,
            "ioState": "binary",
            "operationalState": "working",
        }
    };

    event['@timestamp'] = dateAsIso;
    event.event.timestamp = dateAsIso;
    event.utc_time = dateAsIso;
    event.index = indexPrefix + Math.floor(i / indexInterval);

    let serialNumbers = [12345, 67890, 998768];

    event.metadata.controllerSerialNumber = serialNumbers[_.random(0, 2)];

    let eventType =_.random(0,16);

    switch (eventType) {
        case 0:
            Object.assign(event.event, { "type": "Restraint engaged"});
            break;
        case 1:
            restraintCounter += 1;
            event.statistics.restraintCycles = restraintCounter;
            Object.assign(event.event, { "type": "Restraint released"});
            break;
        case 2:
            bypassCounter += 1;
            event.statistics.bypassModeCounter = bypassCounter;
            Object.assign(event.event, { "type": "Restraint bypassed"});
            break;
        case 3:
            levelerCounter += 1;
            event.statistics.levelerCycles = levelerCounter;
            Object.assign(event.event, { "type": "Leveler deployed / stowed"});
            break;
        case 4:
            Object.assign(event.event, { "type": "Leveler raised (if equipment allows)"});
            break;
        case 5:
            Object.assign(event.event, { "type": "Leveler lowered"});
            break;
        case 6:
            Object.assign(event.event, { "type": "Leveler hydraulic fluid level low"});
            break;
        case 7:
            Object.assign(event.event, { "type": "Door open (Not Open on falling edge)"});
            break;
        case 8:
            doorCounter += 1;
            event.statistics.doorCycles = doorCounter;
            Object.assign(event.event, { "type": "Door closed (Not Closed on Falling Edge)"});
            break;
        case 9:
            Object.assign(event.event, { "type": "Controller heartbeat"});
            break;
        case 10:
            forkTruckCounter += 1;
            event.statistics.forkTruckCycles = forkTruckCounter;
            Object.assign(event.event, { "type": "Fork truck enter / exit (single event)"});
            break;
        case 11:
            Object.assign(event.event, { "type": "Possible event that is always generated"});
            break;
        case 12:
            truckPresentCounter += 1;
            event.statistics.truckPresentCycles = truckPresentCounter;
            Object.assign(event.event, { "type": "Truck Present (Not Present on Falling Edge)"});
            break;
        case 13:
            Object.assign(event.event, { "type": "Possible event that is always generated"});
            break;
        case 14:
            maintenanceServiceCounter += 1;
            event.statistics.maintenanceServiceCycles = maintenanceServiceCounter;
            Object.assign(event.event, { "type": "Service Performed"});
            break;
        case 15:
            Object.assign(event.event, { "type": "Power-On"});
            break;
        case 16:
            faultCounter += 1;
            event.statistics.lifetimeFaultCounter = faultCounter;
            Object.assign(event.event, { "type": "Faults"});
            break;
        default:
            Object.assign(event.event, { "type": "default" });
            break;
    };

    return event;
};
