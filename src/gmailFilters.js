var DRY_RUN = true;
var DEBUG = true;
var DDEBUG = false;
var INFO = true;
var MAX_THREADS = 100;
var META_SHEET_NAME = 'META';

function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu('Gmail Filters', [
    {name: 'Install', functionName: 'Install'},
    {name: 'Run Now - All', functionName: 'RunNowAll'},
    {name: 'Run Now - Selected', functionName: 'RunNowSelected'},
    {name: 'Uninstall:', functionName: 'Uninstall'}
  ]);
}

function Install() {
  createTriggers();
  SpreadsheetApp.getActiveSpreadsheet().toast('Triggers installed');
}

function RunNowAll() {
  doReadGmail(/* selected= */ false);
  SpreadsheetApp.getActiveSpreadsheet().toast('All triggers executed');
}

function RunNowSelected() {
  Logger.log('RunNowSelected');
  doReadGmail(/* selected= */ true);
  SpreadsheetApp.getActiveSpreadsheet().toast('Selected triggers executed');
}

function Uninstall() {
  deleteAllTriggers();
  SpreadsheetApp.getActiveSpreadsheet().toast('Deleted all triggers');
}

function deleteAllTriggers() {
  for (const trigger of ScriptApp.getProjectTriggers()) {
    ScriptApp.deleteTrigger(trigger);
  }
}

function createTriggers() {
  deleteAllTriggers();
  ScriptApp.newTrigger('readGmailAll').timeBased().everyMinutes(10).create();
}

function readGmailAll() {
  doReadGmail(false);
}

function doReadGmail(selected) {
  Logger.log('Starting reading email: ', selected ? 'selected' : 'all');
  ProcessEmails(MAX_THREADS, selected, DRY_RUN, GmailApp, SpreadsheetApp);
  Logger.log('Done');
}
