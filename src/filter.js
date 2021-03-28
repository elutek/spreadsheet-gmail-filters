const FilterType = {
  BODY_TO: 'BODY_TO',
  EXACT_TO: 'EXACT_TO',
  FROM: 'FROM',
  LIST: 'LIST',
  ONLY_TO: 'ONLY_TO',
  SENDER: 'SENDER',
  SUBJECT: 'SUBJECT',
  TO_CC_BCC: 'TO_CC_BCC',
  ACCEPT_EVERYTHING: 'ACCEPT_EVERYTHING'
};

const ConditionType = {
  IS: 'IS',
  RE: 'RE',
  REI: 'REI',
  IS_NOT: 'IS_NOT',
  NOT_RE: 'NOT_RE'
};

class Filter {
  constructor(displayFieldName, conditionType, arg, arg2, isEmailMatch) {
    this.displayFieldName = displayFieldName;
    this.conditionType = conditionType;
    this.isCaseSensitive = !isEmailMatch || conditionType === ConditionType.REI;
    this.arg = this.isCaseSensitive ? arg : arg.toLowerCase();
    this.arg2 = this.isCaseSensitive || !arg2 ? arg2 : arg2.toLowerCase();
    this.re = this.isRe() && this.arg.length > 0 ?
      new RegExp('^' + this.arg + '$', (this.isCaseSensitive ? 'i' : '')) :
      null;
    this.not = this.conditionType === ConditionType.IS_NOT || this.conditionType === ConditionType.NOT_RE;
  }

  isRe() {
    return this.conditionType === ConditionType.RE ||
      this.conditionType === ConditionType.NOT_RE ||
      this.conditionType === ConditionType.REI;
  }

  // Matches simple text.
  isTextMatch(value, argToCheck) {
    if (!value) return false;
    const v = this.isCaseSensitive ? value : value.toLowerCase();
    const isMatch = this.re ? v.match(this.re) !== null : argToCheck === v;
    return this.not ? !isMatch : isMatch;
  }

  // Matches any in a list of comma-separated value.
  isListMatch(value) {
    if (!value) return false;
    const v = this.isCaseSensitive ? value : value.toLowerCase();
    let isMatch = false;
    for (const value of v.split(',')) {
      const v = value.trim();
      if ((this.re && v.match(this.re) !== null) || this.arg === v) {
        isMatch = true;
        break;
      }
    }
    return this.not ? !isMatch : isMatch;
  }

  // Matches email-based fields like from, to (matches any of them).
  isEmailMatch(value, exactlyOneEmailExpected = false) {
    if (!value) return false;
    let isMatch = false;
    const result = ExtractEmails(value.toLowerCase());
    if (exactlyOneEmailExpected && result.count !== 1) {
      return false;
    }
    for (const v of result.emails) {
      if (this.re && v.match(this.re) !== null || this.arg === v) {
        isMatch = true;
        break;
      }
    }
    return this.not ? !isMatch : isMatch;
  }

  toString() {
    const a1 = this.arg === null ? '' : (',' + this.arg);
    const a2 = this.arg2 === null ? '' : (',' + this.arg2);
    return 'if(' + this.displayFieldName + ',' + ConditionType[this.conditionType] + a1 + a2 + ')';
  }
}

class AcceptEverythingFilter {
  constructor() {
  }
  matchesMessage(gmailMessage) {
    return true;
  }
}

class FromFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('from', conditionType, arg, null, /* isEmailMatch=*/ true);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isEmailMatch(gmailMessage.getFrom());
  }
}

class ToFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('to', conditionType, arg, null, /* isEmailMatch=*/ true);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isEmailMatch(gmailMessage.getTo());
  }
}

class OnlyToFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('only_to', conditionType, arg, null, /* isEmailMatch=*/ true);
  }
  matchesMessage(gmailMessage) {
    const emails = gmailMessage.getTo() + ',' + gmailMessage.getCc();
    return this.filter.isEmailMatch(emails, /* exactlyOneEmailExpected */true);
  }
}

class BodyToFilter {
  constructor(conditionType, arg, arg2) {
    this.filter =
      new Filter('body_to', conditionType, arg, arg2, /* isEmailMatch=*/ true);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isEmailMatch(gmailMessage.getTo()) &&
      this.filter.isTextMatch(gmailMessage.getBody(), this.filter.arg2);
  }
}

class ToCcBccFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('to/cc/bcc', conditionType, arg, null, /* isEmailMatch=*/ true);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isEmailMatch(
        '' + gmailMessage.getTo() + ',' + gmailMessage.getCc() + ',' +
      gmailMessage.getBcc());
  }
}

class SubjectFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('subject', conditionType, arg, null, /* isEmailMatch=*/ false);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isTextMatch(gmailMessage.getSubject(), this.filter.arg);
  }
}

class ListFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('list', conditionType, arg, null, /* isEmailMatch=*/ false);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isListMatch(gmailMessage.getHeader('List-ID'));
  }
}

class SenderFilter {
  constructor(conditionType, arg) {
    this.filter =
      new Filter('sender', conditionType, arg, null, /* isEmailMatch=*/ true);
  }
  matchesMessage(gmailMessage) {
    return this.filter.isEmailMatch(gmailMessage.getHeader('Sender'));
  }
}

function CreateFilter(filterType, conditionType, arg, arg2) {
  if (filterType === FilterType.ONLY_TO && conditionType !== ConditionType.IS) {
    throw Error('only_to can be combined with \'is\' contdition only');
  }
  if (conditionType !== null && arg !== null) {
    switch (filterType) {
      case FilterType.FROM: return new FromFilter(conditionType, arg);
      case FilterType.EXACT_TO: return new ToFilter(conditionType, arg);
      case FilterType.TO_CC_BCC: return new ToCcBccFilter(conditionType, arg);
      case FilterType.ONLY_TO: return new OnlyToFilter(conditionType, arg);
      case FilterType.BODY_TO: return new BodyToFilter(conditionType, arg, arg2);
      case FilterType.SUBJECT: return new SubjectFilter(conditionType, arg);
      case FilterType.SENDER: return new SenderFilter(conditionType, arg);
      case FilterType.LIST: return new ListFilter(conditionType, arg);
      case FilterType.ACCEPT_EVERYTHING: return new AcceptEverythingFilter();
    }
  }
  throw new Error('Could not create filter: ' + filterType + ', ' + conditionType +
    ', ' + arg + ', ' + arg2);
}
