function removeEmptyElements(arr) {
  if (arr === null || arr.length === 0) return arr;
  const result = [];
  for (const el of arr) {
    if (el !== '') {
      result.push(el);
    }
  }
  return result;
}

function arrayContains(arr, val) {
  for (const el of arr) {
    if (el ===val) {
      return true;
    }
  }
  return false;
}

function hasLabel(thread, labelName) {
  if (thread) {
    const labels = thread.getLabels();
    if (labels) {
      for (const label of labels) {
        if (label && label.getName() === labelName) {
          return true;
        }
      }
    }
  }
  return false;
}

function gSuiteTrim(val) {
  for (const suffix of GSUITE_EMAIL_SENDER_SUFFIXES) {
    if (val.endsWith(suffix)) {
      return val.substr(0, val.length - suffix.length).trim();
    }
  }
  return val;
}

function cleanEscapedCommas(str) {
  let in1 = false;
  let in2 = false;
  let result = '';
  for (let i = 0; i < str.length; ++i) {
    const ch = str.charAt(i);
    if (ch === '"') {
      in1 = !in1;
    }
    if (ch === '\'') {
      in2 = !in2;
    }
    result += (ch === ',' && (in1 || in2)) ? ' ' : ch;
  }
  return result;
}

function unifyAndSqueezeSpaces(str) {
  let result = '';
  let prevIsSpace = false;
  for (let i = 0; i < str.length; ++i) {
    const ch = str.charAt(i);
    const isSpace = ch === ' ' || ch === '\t' || ch === '\n';
    if (!isSpace) {
      result += ch;
    } else if (!prevIsSpace) {
      result += ' ';
    }
    prevIsSpace = isSpace;
  }
  return result;
}

function ExtractEmails(emailListStr) {
  const descape = (x) => (x.startsWith('\'') && x.endsWith('\'')) ||
    (x.startsWith('\"') && x.endsWith('\"')) ||
    (x.startsWith('<') && x.endsWith('>')) ?
    x.substr(1, x.length - 2) :
    x;
  const Descape = (x) => descape(x.trim()).trim();

  const result = [];
  let numEmails = 0;

  const cleanedEmailList =
    unifyAndSqueezeSpaces(cleanEscapedCommas(emailListStr));
  for (const origEmail of cleanedEmailList.toLowerCase().split(',')) {
    const trimmed = origEmail.trim();
    if (trimmed.length === 0 ||
      trimmed.indexOf('undisclosed-recipients') >= 0) {
      continue;
    }

    let email = '';
    let name = '';

    numEmails++;

    if (trimmed.endsWith('>')) {
      const i = trimmed.lastIndexOf('<');
      if (i < 0) {
        Logger.log('cannot parse incorrect nesting:' + email);
        result.push(trimmed);
        continue;
      }
      email = Descape(trimmed.substr(i + 1, trimmed.length - i - 2));
      name = Descape(this.gSuiteTrim(Descape(trimmed.substr(0, i))));
    } else {
      email = Descape(trimmed);
    }

    const j = email.indexOf('@');
    if (j < 0) {
      Logger.log('cannot parse email with no @:', email);
      result.push(trimmed);
      continue;
    } else if (email.indexOf('@', j + 1) >= 0) {
      Logger.log('cannot parse email with multiple @:', email);
      result.push(trimmed);
      continue;
    }

    const username = email.substr(0, j);
    const domain = email.substr(j + 1);
    let usernameBeforePlus = '';
    const k = username.indexOf('+');
    if (k >= 0) {
      usernameBeforePlus = username.substr(0, k);
    }

    result.push(email);
    result.push(username);
    if (usernameBeforePlus !== '') {
      result.push(usernameBeforePlus + '@' + domain);
      result.push(usernameBeforePlus);
    }
    if (name !== '') {
      result.push(name);
    }
  }
  return {emails: result, count: numEmails};
}
