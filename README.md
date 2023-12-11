# Cal Copy

Copies all events from a corproate gSuite's calendar to a personal Google
calendar.

This is a work-around for restrictive corporate policies that do not let you
share event details outside the domain. This restriction makes it difficult to
have your Google Home be aware of your next meeting, etc. With the copied
events to a personal calendar, these works.

To preserve some semblance of corporate secrecy, the script does NOT copy the
description, attendee list, location, video conference details, etc. It only
copies the title and start/stop times.

## Installation

1. Go to <https://script.google.com> and create a new project.
2. Set contents of `code.js` to that of `calcopy.js` from this repo.
3. Update the `SRC_CAL_ID` to be your source calendar ID, e.g.
   `you@corpo.com`.
4. Update the `DST_CAL_ID` to the destination ID. I personally create a new
   secondary calendar in my personal account called CorpCopy, which results in
   an ID something like `bigrandomlettersandnumbers@goroup.calendar.google.com`
5. In the calendar settings for the destination calendar (in your peronal
   account), under "Share with specific people or groups", grant your work user
   to `Make changes to events`. No permission grants needed on the corpo side.
6. Under the "Triggers" section, click "+ Add Trigger".
   * function to run: `copyCalendar`
   * event source: `time-driven` (using a `from calendar`/`calendar updated`
     trigger might work, but I've never tried it)

