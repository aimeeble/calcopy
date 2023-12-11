var SRC_CAL_ID = '';                                    // account to copy events from (run the script in this account)
var DST_CAL_ID = '';                                    // private calendar to copy into (owned by your personal Google account)
var MAX_DURATION_MILLIS = 6 * 60 * 60 * 1000;           // events longer than this are not copied.
var START_DATE = new Date();                            // new Date('2018-02-19T00:00:00.000Z');
var NUM_DAYS = 14;                                      // number of day to look forward.
var END_DATE = new Date(START_DATE.valueOf() + (NUM_DAYS * 24 * 60 * 60 * 1000));

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
  var evts = src.getEvents(START_DATE, END_DATE);
  Logger.log("");
  Logger.log("Found " + evts.length + " events.");
  for (var i = 0; i < evts.length; i++) {
    var evt = evts[i];
    var start = evt.getStartTime();
    var end = evt.getEndTime();
    var duration = end - start;
    var title = evt.getTitle();

    Logger.log("  evt: " + start + " for " + humanize(duration));
    Logger.log("      Title ... " + title);
    Logger.log("      ID ...... " + evt.getId());

    if (duration > MAX_DURATION_MILLIS) {
      Logger.log("    -> Skipping (too long)");
      continue;
    }

    var existingEvts = dst.getEvents(start, end);
    var foundEvt = null;
    for (var j = 0; j < existingEvts.length; j++) {
      var existingEvt = existingEvts[j];
      var existingDur = existingEvt.getEndTime() - existingEvt.getStartTime();
      if (existingEvt.getStartTime().getTime() === evt.getStartTime().getTime() && duration === existingDur) {
        foundEvt = existingEvt;
        break;
      }
    }
    if (foundEvt != null) {
      if (evt.getMyStatus() == CalendarApp.GuestStatus.NO) {
        Logger.log("    -> Deleting newly-declined event.");
        foundEvt.deleteEvent();
      } else {
        Logger.log("    -> Skipping/Updating only (already exists)");
        foundEvt.setTitle(title);
      }
    } else if (evt.getMyStatus() == GuestStatus.NO) {
      Logger.log("    -> Skipping event that was declined on source calendar");
    } else {
      Logger.log("    -> Adding");
      var newevt = dst.createEvent(title, start, end);
      updateStatus("      ", newevt, evt.getMyStatus());
    }
  }

  // Remove/mod any removed events in dest calendar no longer in source.
  evts = dst.getEvents(START_DATE, END_DATE);
  Logger.log("");
  Logger.log("Found " + evts.length + " events to scan for removals.");
  for (var i = 0; i < evts.length; i++) {
    var evt = evts[i];
    var start = evt.getStartTime();
    var end = evt.getEndTime();
    var duration = end - start;

    Logger.log("  evt: " + start + " for " + humanize(duration));

    var existingEvts = src.getEvents(start, end);
    var found = false;
    for (var j = 0; j < existingEvts.length; j++) {
      var existingEvt = existingEvts[j];
      var existingDur = existingEvt.getEndTime() - existingEvt.getStartTime();
      if (existingEvt.getStartTime().getTime() === evt.getStartTime().getTime() && duration === existingDur) {
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

