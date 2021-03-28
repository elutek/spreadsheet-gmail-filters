class LabelCache {
  constructor(gmailApp) {
    this.gmailApp = gmailApp;
    this.labels = {};
  }

  getOrCreateLabel(labelName) {
    if (!(labelName in this.labels)) {
      let label = this.gmailApp.getUserLabelByName(labelName);
      if (label === null) {
        label = this.gmailApp.createLabel(labelName);
      }
      this.labels[labelName] = label;
    }
    return this.labels[labelName];
  }
}
