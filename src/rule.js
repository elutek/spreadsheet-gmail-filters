class Rule {
  constructor(labelNames, actions, filters) {
    this.markRead = arrayContains(actions, 'MARK_READ');
    this.archive = !arrayContains(actions, 'NO_ARCHIVE');
    this.star = arrayContains(actions, 'STAR');
    this.labelNames = labelNames;
    this.filters = filters;
  }

  matchesThread(gmailThread) {
    const messages = gmailThread.getMessages();
    if (!messages || messages.length === 0) {
      return false;
    }
    for (const message of gmailThread.getMessages()) {
      if (this.matchesMessage(message)) {
        return true;
      }
    }
    return false;
  }

  matchesMessage(gmailMessage) {
    for (const filter of this.filters) {
      if (!filter.matchesMessage(gmailMessage)) {
        return false;
      }
    }
    return true;
  }

  applyToThread(gmailThread, labelCache, dryRun) {
    const matched = this.matchesThread(gmailThread);
    if (!matched) {
      return false;
    }
    if (hasLabel(gmailThread, 'mute') && !gmailThread.hasStarredMessages()) {
      // Was muted, do not do anything and return true
      // to indicate that this thread was processed.
      return false;
    }
    if (dryRun) {
      return true;
    }
    for (const labelName of this.labelNames) {
      gmailThread.addLabel(labelCache.getOrCreateLabel(labelName));
    }
    if (this.archive) {
      gmailThread.moveToArchive();
    }
    if (this.markRead) {
      gmailThread.markRead();
    }
    if (this.star) {
      gmailThread.getMessages()[0].star();
    }
    return true;
    // return this.toString();
  }

  toString() {
    let result = 'markRead:' + this.markRead + ', archive:' + this.archive + ', star:' + this.star + ', ';
    if (this.filters) {
      for (const filter of this.filters) {
        if (filter !== null) {
          result += filter.toString();
        }
      }
    }
    return this.labelNames + ': ' + result;
  }
}
