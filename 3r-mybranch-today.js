"use strict"; // We use ES6 Javascript

// Electron app and related dependencies
const electron     = require('electron');
const https        = require('https');
const fs           = require('fs');
const moment       = require('moment');

// Get a handle on the electron-settings module and load the settings from it
const settings               = require('electron-settings');
let apiKey                   = settings.get('settings.apiKey');
let newsRotateSpeedInSeconds = settings.get('settings.newsRotateSpeed');
let refreshIntervalInMinutes = settings.get('settings.refreshInterval');

// Convenience function to create a new element
const newElement = (elementtype, elementclass, elementparent) => {
  // Create a new element of the specified type
  let element = document.createElement(elementtype);
  element.classList.add(elementclass);
  elementparent.appendChild(element);
  return element;
}

// Convenience function which returns a string bracketed with <p> and </p>
const p = (content) => {return '<p>' + content + '</p>';}

// Convenience function for checking whether a div is in the current viewport
const elementIsInViewport = (element) => {
    var rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Event: handy during development, click on the shifts banner to close the window
document.getElementById('shiftsContainer').addEventListener('click', ()=>{
  window.close();
});

// Event: when the events banner is clicked, switch to the setup page
document.getElementById('eventsContainer').addEventListener('click', ()=>{
  topContainer.style.display = 'none';
  setup();
});

// Event: when the start button is clicked, save the settings and start the app
document.getElementById('start').addEventListener('click', ()=>{
  settings.set('settings.apiKey',          apiKey = document.getElementById('apiToken').value);
  settings.set('settings.newsRotateSpeed', newsRotateSpeedInSeconds = document.getElementById('newsToken').value);
  settings.set('settings.refreshInterval', refreshIntervalInMinutes = document.getElementById('shiftsEventsToken').value);
  // Launch the application
  setupContainer.style.display = 'none';
  start();
});

// The major HTML elements
const setupContainer = document.getElementById('setupContainer');
const topContainer = document.getElementById('topContainer');
const shiftsContainer = document.getElementById('shiftsContainer');
const newsContainer = document.getElementById('newsContainer');
const eventsContainer = document.getElementById('eventsContainer');

// Which news item we are showing
let currentnewsitem = 0;

const setup = () => {
  setupContainer.style.display = 'block';
  document.getElementById('apiToken').value = apiKey;
  document.getElementById('newsToken').value = newsRotateSpeedInSeconds;
  document.getElementById('shiftsEventsToken').value = refreshIntervalInMinutes;
}

const shifts = () => {
  
  // Clear previous data
  shiftsContainer.innerHTML = '';
  
  // Attempt to load today's shifts
  fetch('https://3r.org.uk/stats/export_rotas.json', {
    headers: { 'Authorization': `APIKEY ${apiKey}` }
  }).then(res => {
    if(!res.ok){
      // A problem occurred; probably an invalid API Key
      setup();
      return;
    }
    // Load the returned JSON
    res.json().then(shiftslist => {

      newElement ('div', 'shiftsDate', shiftsContainer).innerHTML = p(moment(shiftslist.shifts[0].start_datetime).utc().format('MMMM Do YYYY'));
      
      var stripenow;
      for (let count = 0; count < shiftslist.shifts.length; count++) {
        // Create a stripe to hold the shifts in each time block: eg 15:30 to 18:30
        let shift = shiftslist.shifts[count];
        let now = moment(new Date());
        let startdate = moment(shift.start_datetime);
        let enddate = moment(startdate).add(shift.duration, 's');
        let stripeid = 'shiftStripe_' + (moment(startdate) + "_to_" + moment(startdate).add(shift.duration, 's'));
        let stripe = document.getElementById(stripeid);
        // Check it doesn't already exist, create it if it doesn't
        if (stripe == null) {
          // Remember the first shift stripe which starts after now
          if ((startdate >= now) && !stripenow) stripenow = shiftsContainer.getElementsByClassName('shiftStripe').length;
          stripe = newElement('div','shiftStripe', shiftsContainer);
          stripe.id = stripeid;
          stripe.innerHTML = startdate.utc().format('HH:mm') + " to " + enddate.utc().format('HH:mm');
        }
        // Create a slot for a shift inside the appropriate stripe
        let singleshift = newElement('div', 'singleShift', stripe);
        // Add in the shift name, and then the volunteer names
        singleshift.innerHTML = "(" + shift.rota + ")";
        for (let vol_count = 0; vol_count < shift.volunteers.length; vol_count++) {
          singleshift.innerHTML += "   " + shift.volunteers[vol_count].name + ((vol_count < shift.volunteers.length - 1) ? "," : "");
        }
      }
      // Check whether all shifts are visible.  If they are not, try to make the most useful ones visible
      // Hide elements at the top if it's late in the day, or at the bottom if it's early in the day
      let stripelist = Array.prototype.slice.call(shiftsContainer.getElementsByClassName('shiftStripe'));
      // Hide elements from the top or bottom of the list until the last element is visible
      while (!elementIsInViewport(document.getElementById(stripelist[stripelist.length - 1].id))) {
        let elementtohide = (stripenow >= (stripelist.length / 2) ? 0 : stripelist.length - 1);
        document.getElementById(stripelist[elementtohide].id).style.display = "none";
        stripelist.splice(elementtohide, 1);
      };
      // Refresh in a while
      setTimeout (shifts, refreshintervalInMinutes * 1000 * 60);
      });
    });
  };
  
  const news = () => {
    
    // Clear previous data
    newsContainer.innerHTML = '';
    
    // Attempt to load the news
    fetch('https://3r.org.uk/news.json', {
      headers: { 'Authorization': `APIKEY ${apiKey}` }
    }).then(res => {
      if(!res.ok){
        // A problem occurred; probably an invalid API Key
        setup();
        return;
      }
      // Load the returned JSON
      res.json().then(newslist => {
        
        newElement('div', 'newsHeading', newsContainer).innerHTML = p("Current News");

        if (newslist.news_items.length > 0) {
          if (currentnewsitem > (newslist.news_items.length - 1)) currentnewsitem = 0;
          let newsblock = newElement('div', 'newsBlock', newsContainer);
          newElement('div', 'newsBlockTitle', newsblock).innerHTML = p(newslist.news_items[currentnewsitem].title);
          newElement('div', 'newsBlockBody', newsblock).innerHTML =  p(newslist.news_items[currentnewsitem].body);
          currentnewsitem++;
          // Refresh in a while
          setTimeout (news, newsRotateSpeedInSeconds * 1000);
        }
      });
    });
  };
  
  const events = () => {
    
    // Clear previous data
    eventsContainer.innerHTML = '';
    
    // Attempt to load the events
    fetch('https://3r.org.uk/events.json', {
      headers: { 'Authorization': `APIKEY ${apiKey}` }
    }).then(res => {
      if(!res.ok){
        // A problem occurred; probably an invalid API Key
        setup();
        return;
      }
      // Load the returned JSON
      res.json().then(eventslist => {
        
        newElement('div', 'eventsHeading', eventsContainer).innerHTML = p("Upcoming Events");
        
        for (let count = 0; count < eventslist.events.length; count++) {
          let event = eventslist.events[count];
          let eventblock = newElement('div', 'eventBlock', eventsContainer);
          newElement('div', 'eventBlockDate', eventblock).innerHTML = moment(event.date).utc().format('dddd[, ]MMMM Do YYYY');
          newElement('div', 'eventBlockName', eventblock).innerHTML = event.name;
          if (event.description != '') newElement('div', 'eventBlockBody', eventblock).innerHTML =  p(event.description);
        }
        // Trim events from the end of the list until the last element is visible in the viewport
        while (!elementIsInViewport(eventsContainer.lastElementChild)) {
          eventsContainer.removeChild(eventsContainer.lastElementChild);
        };
        // Refresh in a while
       setTimeout (events, refreshintervalInMinutes * 1000 * 60);
      });
    });
  }
  
  const start = () => {
    if (settings.get('settings.apiKey') == '') setup ();
    topContainer.style.display = 'grid';
    shifts();
    news();
    events();
  }

start();
