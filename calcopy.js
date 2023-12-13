var SRC_CAL_ID = '';                                                            // account to copy events from (run the script in this account)
var DST_CAL_ID = '';                                                            // private calendar to copy into (owned by your personal Google account)
var MAX_DURATION_MILLIS = 6 * 60 * 60 * 1000;                                   // events longer than this are not copied.
var START_DATE = new Date();                                                    // new Date('2018-02-19T00:00:00.000Z');
var NUM_DAYS = 14;                                                              // number of day to look forward.
var END_DATE = new Date(START_DATE.valueOf() + (NUM_DAYS * 24 * 60 * 60 * 1000));

// List of strings that if found at the start of an event prevents it from being synced.
var blockedTitlePrefixes = [
  "OOO",
  "DNS",
  "PTO",
];

function humanize(millis) {
  var secs = Math.floor(millis/1000);
  millis = millis - (secs * 1000);
  var mins = Math.floor(secs / 60);
  secs = secs - (mins * 60);
  var hours = Math.floor(mins / 60);
  mins = mins - (hours * 60);

  var res = "";
  if (hours > 0) {
    res += hours + "h";
  }
  if (mins > 0) {
    res += mins + "m";
  }
  return res;
}

function isBlockedEntry(title) {
  title = title.trim();
  for (const x of blockedTitlePrefixes) {
    if (title.startsWith(x)) {
      return true;
    }
  }
  return false;
}

function eventsMatch(evt1, evt2) {
  var dur1 = evt1.getEndTime() - evt1.getStartTime();
  var dur2 = evt2.getEndTime() - evt2.getStartTime();
  return evt1.getStartTime().getTime() === evt2.getStartTime().getTime() && dur1 === dur2;
}

// copyCalendar is the main entry point that should be triggered on a regular (e.g. hourly) basis.
function copyCalendar() {
  Logger.log("Copying events...");
  Logger.log("  src ....... " + SRC_CAL_ID);
  Logger.log("  dst ....... " + DST_CAL_ID);
  Logger.log("  max ....... " + humanize(MAX_DURATION_MILLIS));
  Logger.log("  days ...... " + NUM_DAYS);
  Logger.log("  starting .. " + START_DATE);
  Logger.log("  ending .... " + END_DATE);

  var src = CalendarApp.getCalendarById(SRC_CAL_ID);
  if (!src) {
    Logger.log("Failed to get calendar");
    return;
  }
  var dst = CalendarApp.getCalendarById(DST_CAL_ID);
  if (!dst) {
    Logger.log("Failed to get calendar " + DST_CAL_ID);
    return;
  }

  // Add new events from source to dest calendar.
  var srcEvents = src.getEvents(START_DATE, END_DATE);
  Logger.log("");
  Logger.log("Found " + srcEvents.length + " events.");
  for (var i = 0; i < srcEvents.length; i++) {
    var srcEvent = srcEvents[i];
    var start = srcEvent.getStartTime();
    var end = srcEvent.getEndTime();
    var duration = end - start;
    var title = srcEvent.getTitle();

    Logger.log("  evt: " + start + " for " + humanize(duration));
    Logger.log("      Title ... " + title);
    Logger.log("      ID ...... " + srcEvent.getId());

    if (duration > MAX_DURATION_MILLIS) {
      Logger.log("    -> Skipping (too long)");
      continue;
    }

    var dstEvents = dst.getEvents(start, end);
    var existingEvent = null;
    for (var j = 0; j < dstEvents.length; j++) {
      if (eventsMatch(srcEvent, dstEvents[j])) {
        existingEvent = dstEvents[j];
        break;
      }
    }
    if (existingEvent != null) {
      // Handle updating (or removing) a previously synced entry.
      if (srcEvent.getMyStatus() == CalendarApp.GuestStatus.NO) {
        Logger.log("    -> Deleting newly-declined event.");
        existingEvent.deleteEvent();
      } else if (isBlockedEntry(title)) {
        Logger.log("    -> Deleting new block-list matching event.");
        existingEvent.deleteEvent();
      } else {
        Logger.log("    -> Skipping/Updating only (already exists).");
        existingEvent.setTitle(title);
      }
    } else {
      // Handle new events.
      if (srcEvent.getMyStatus() == CalendarApp.GuestStatus.NO) {
        Logger.log("    -> Skipping event that was declined on source calendar.");
      } else if (isBlockedEntry(title)) {
        Logger.log("    -> Skipping new event that has block-list match.");
      } else {
        Logger.log("    -> Adding new event.");
        var newevt = dst.createEvent(title, start, end);
      }
    }
  }

  // Remove any events no longer in source calendar.
  existingEvents = dst.getEvents(START_DATE, END_DATE);
  Logger.log("");
  Logger.log("Found " + existingEvents.length + " events to scan for removals.");
  for (var i = 0; i < existingEvents.length; i++) {
    var existingEvent = existingEvents[i];
    var start = existingEvent.getStartTime();
    var end = existingEvent.getEndTime();
    var duration = end - start;

    Logger.log("  evt: " + start + " for " + humanize(duration));

    var srcEvents = src.getEvents(start, end);
    var found = false;
    for (var j = 0; j < srcEvents.length; j++) {
      if (eventsMatch(existingEvent, srcEvents[j])) {
        found = true;
        break;
      }
    }
    if (found) {
      Logger.log("    -> Keeping.");
    } else {
      Logger.log("    -> Removing (no longer in src)");
      evt.deleteEvent();
    }
  }

  Logger.log("Done.");
}

