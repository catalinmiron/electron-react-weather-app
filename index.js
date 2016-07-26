var app = require('app');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var menubar = require('menubar')
var AutoLaunch = require('auto-launch');
var ipc = require('ipc');
var Tray = require('tray')

//-- reports any crashes to the server
require('crash-reporter').start();

var mb = menubar({
  dir           : __dirname + '/dist',
  icon          : __dirname + '/weather-icon-small.png',
  preloadWindow : true, // TODO: enable if already logged in
  width         : 520,
  height        : 500,
  resizable     : false
});

var options = {};
options.name = "WeatheReact"


var autolauncher = new AutoLaunch(options);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
mb.app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    mb.app.quit();
  }
});


function isInt(n){
  return Number(n) === n && n % 1 === 0;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
mb.app.on('ready', function() {
  // const debugWindow = new BrowserWindow({
  //     width  : 400,
  //     height : 460,
  //     type   : 'desktop',
  //     frame  : true
  //   });
  //
  // debugWindow.loadUrl('http://localhost:3000')
  // mb.window.setSize(400, 460)
  // mb.window.loadUrl('http://localhost:3000')

  ipc.on('set-title', function(event, args) {
    var temperature = Math.round(args.temperature) + '°C';
    mb.tray.setToolTip(args.location + ' - ' + temperature);
    mb.tray.setTitle(temperature);
    mb.tray.setImage(__dirname + '/weather-icon-small.png')
  });
});

mb.app.on('will-quit', function() {
  globalShortcut.unregisterAll();
});
