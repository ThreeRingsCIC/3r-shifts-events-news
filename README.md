# 3R My Branch Today

Show today's shifts, upcoming events and current news items for easy digestion
by volunteers.

# Requirements

* A _Three Rings_ account with stats access.
* A _Three Rings_ API key (get this by clicking "API Keys" from your Directory
page).
* [NodeJS](https://nodejs.org/)

# Installation

Check out the code or download as a ZIP file.

Run `npm install` to install the dependencies.

# Usage

Run `npm start` to run the application. On first run, you will be asked for
your API key. Only a valid API key that provides access to the Directory will
be accepted.  You can also set the refresh interval for shifts and events, and
the display interval for news items.

My Branch Today will connect to _Three Rings_ and show a full-screen display
with three panes:

On the left, the date and today's shifts.  If there are more shifts than can be
comfortably displayed, it will trim them from the beginning of the day or the
end of the day, depending on the current time.  If it's early, from the end of
the day; if it's late, from the beginning.

In the middle, a single news item.  This rotates through the list of news items
on your Overview page.

On the right, upcoming events.  If there are more than can be comfortably
displayed, those furthest away are hidden.

# License/development

This work is released under the GPL: you're free to run, study, share and
modify the software, but if you redistribute it then you must also license it
under the same license terms. You could use it as a learning project or a
starting if you're hoping to implement a client to the
[Three Rings API](https://www.3r.org.uk/api). And if you get stuck,
[get in touch](https://www.threerings.org.uk/contact/) and we might be able to
give you some pointers.
