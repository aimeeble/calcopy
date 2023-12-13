# Cal Copy

Copies all events from a corporate gSuite's calendar to a personal Google
calendar.

This is a work-around for restrictive corporate policies that do not let you
share event details outside the domain. This restriction makes it difficult to
share info with your significant other, or have Google Assistant tell you your
next meeting, etc. With the copied events to a personal calendar, these works.

To preserve some semblance of corporate secrecy, the script does NOT copy the
description, attendee list, location, video conference details, etc. It only
copies the title and start/stop times.

## Installation

### Prepare destination calendar

From your personal account:

1. Go to Calendar, and create a new secondary calendar (i.e. an additional
   calendar in your normal account).
2. In the calendar settings for the new calendar, under "Share with specific
   people or groups", grant your work user to `Make changes to events`. No
   permission grants needed on the corpo side.

### Install script

From your corporate account:

1. Go to <https://script.google.com> and create a new project.
2. Set contents of `code.js` to that of `calcopy.js` from this repo.
3. Update the `SRC_CAL_ID` to be your source calendar ID, e.g.
   `you@corpo.com`.
4. Update the `DST_CAL_ID` to the calendar ID of the one you created earlier.
   It should be something like `randomacharacters@group.calendar.google.com`.
5. Under the "Triggers" section, click "+ Add Trigger".
   * function to run: `copyCalendar`
   * event source: `time-driven` (using a `from calendar`/`calendar updated`
     trigger might work, but I've never tried it)

