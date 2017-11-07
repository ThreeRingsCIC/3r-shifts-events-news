"use strict"; // We use ES6 Javascript

// Load Electron and get some requirements ready
const electron = require('electron');
const app = electron.app;
const path = require('path');
const url = require('url');

// Create a new Electron window
const BrowserWindow = electron.BrowserWindow;

// Keep a handle on the window so it doesn't close during garbage collection.
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({fullscreen: true, webPreferences: { experimentalFeatures: true }, blinkFeatures: 'CSSGridLayout'});

  // Load index.html into it
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Hide the menu bar
  win.setMenu(null);

  // In development, uncomment this line if you want DevTools
  //win.webContents.openDevTools();

  // When the window is closed, deference the window as we only have one.
  // This allows it to be garbage-collected.
  win.on('closed', ()=>{ win = null; });
}

// Wait for Electron to initialise, then create the window
app.on('ready', createWindow);

// Quit when all windows are closed (except on MacOS)
app.on('window-all-closed', ()=> {
  if(process.platform !== 'darwin') app.quit();
});

// When re-activated; if there are no windows (e.g. on MacOS), create the window
app.on('activate', ()=> {
  if (win === null) createWindow();
});
