class GmailLabelMock {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}

class GmailThreadMock {
  constructor(labelNames, messages) {
    this.labels = [];
    this.labelNames = [];
    for (const labelName of labelNames) {
      this.labelNames.push(labelName);
      this.labels.push(new GmailLabelMock(labelName));
    }
    this.messages = messages;
    this.archived = false;
    this.isRead = false;
  }
  getLabels() {
    return this.labels;
  }
  getLabelNames() {
    return this.labelNames;
  }
  getMessages() {
    return this.messages;
  }
  addLabel(label) {
    this.labels.push(label);
    this.labelNames.push(label.getName());
  }
  moveToArchive() {
    this.archived = true;
  }
  hasStarredMessages() {
    for (const m of this.messages) {
      if (m.isStarred()) {
        return true;
      }
    }
    return false;
  }
  markRead() {
    this.isRead = true;
  }
  isUnread() {
    return !this.isRead;
  }
}

class GmailMessageMock {
  constructor() {
    this.from = '';
    this.to = '';
    this.subject = '';
    this.cc = '';
    this.bcc = '';
    this.senders = '';
    this.lists = '';
    this.starred = false;
  }
  setFrom(from) {
    this.from = from;
    return this;
  }
  setTo(to) {
    this.to = to;
    return this;
  }
  setSubject(subject) {
    this.subject = subject;
    return this;
  }
  setCc(cc) {
    this.cc = cc;
    return this;
  }
  setBcc(bcc) {
    this.bcc = bcc;
    return this;
  }
  setSenders(senders) {
    this.senders = senders;
    return this;
  }
  setLists(lists) {
    this.lists = lists;
    return this;
  }
  getFrom() {
    return this.from;
  }
  getTo() {
    return this.to;
  }
  getSubject() {
    return this.subject;
  }
  getCc() {
    return this.cc;
  }
  getBcc() {
    return this.bcc;
  }
  getHeader(name) {
    const lower = name.toLowerCase();
    if (lower === 'list-id') return this.lists;
    if (lower === 'sender') return this.senders;
    return null;
  }
  star() {
    this.starred = true;
  }
  isStarred() {
    return this.starred;
  }
}

class GmailAppMock {
  constructor(threads) {
    this.threads = threads;
    this.labels = {};
  }
  createLabel(name) {
    const label = new GmailLabelMock(name);
    this.labels[name] = label;
    return label;
  }
  getUserLabelByName(name) {
    return (name in this.labels) ? this.labels[name] : this.createLabel(name);
  }
  getInboxThreads() {
    return this.threads;
  }
  getInboxThreads(min, max) {
    return this.threads.slice(min, max);
  }
}

class SheetMock {
  constructor(name, rows) {
    this.name = name;
    this.rows = rows;
  }
  getName() {
    return this.name;
  }
  getDataRange() {
    return {
      getValues: () => {
        return this.rows;
      }
    };
  }
}

class SpreadsheetMock {
  constructor(sheets, activeSheet) {
    this.sheets = sheets;
    this.activeSheet = activeSheet;
  }
  getActiveSheet() {
    return activeSheet;
  }
  getSheets() {
    return this.sheets;
  }
}

class SpreadsheetAppMock {
  constructor(sheets, activeSheet) {
    this.spreadsheet = new SpreadsheetMock(sheets, activeSheet);
  }
  getActiveSpreadsheet() {
    return this.spreadsheet;
  }
  getActive() {
    return this.spreadsheet;
  }
}
