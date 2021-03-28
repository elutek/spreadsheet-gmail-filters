function ProcessEmails(
    maxThreads, onlySelectedRules, dryRun, gmailApp, spreadsheetApp) {
  if (INFO) {
    Logger.log('Processing threads');
  }

  // Get a bunch of threads.
  const threads = maxThreads === 0 ? gmailApp.getInboxThreads() :
    gmailApp.getInboxThreads(0, maxThreads);
  Logger.log('Got threads: ' + threads.length);

  // Process the threads.
  const rules = ReadRulesFromSpreadsheet(onlySelectedRules, spreadsheetApp);

  const labelCache = new LabelCache(gmailApp);
  for (const thread of threads) {
    const m = thread.getMessages()[0];
    Logger.log(
        'Processing thread:\n' +
      '\tsubject ' + m.getSubject() + '\n' +
      '\tfrom    ' + m.getFrom() + '\n' +
      '\tto      ' + m.getTo() + '\n' +
      '\tcc      ' + m.getCc() + '\n' +
      '\tbcc     ' + m.getBcc() + '\n' +
      '\tsender  ' + m.getHeader('Sender'));

    try {
      let matchedRule = null;
      for (const rule of rules) {
        if (rule.matchesThread(thread)) {
          matchedRule = rule;
          Logger.log('\tRule MATCHED: ' + rule.toString());
          break;
        } else if (DDEBUG) {
          Logger.log('\tRule did NOT match: ' + rule.toString());
        }
      }

      if (matchedRule !== null) {
        matchedRule.applyToThread(thread, labelCache, dryRun);
      }
    } catch (e) {
      Logger.log('Exception when processing this gmail thread, skipping it', e);
      Logger.log(e.stack);
    }
  }

  Logger.log('Done processing threads: ' + threads.length);
}

function ReadRulesFromSpreadsheet(onlySelectedRules, spreadsheetApp) {
  Logger.log('Starting reading rules');
  const result = [];
  const allSheets = onlySelectedRules ? [spreadsheetApp.getActiveSheet()] :
    spreadsheetApp.getActive().getSheets();
  const shouldSkipSheet = (sheet) =>
    sheet === null || sheet.getName() === 'META' || sheet.getName() === '';
  const shouldSkipRow = (row) =>
    row === null || row.length < 3 || row[0] !== 'ON';
  for (const sheet of allSheets) {
    if (!shouldSkipSheet(sheet)) {
      const sheetName = sheet.getName();
      Logger.log('Processing sheet: ' + sheetName);
      const rows = onlySelectedRules ? sheet.getActiveRange().getValues() :
        sheet.getDataRange().getValues();
      for (const row of rows) {
        if (!shouldSkipRow(row)) {
          try {
            const rule = CreateRuleFromRow(row);
            if (rule !== null && rule !== undefined) {
              Logger.log('Found rule: ' + rule.toString());
              result.push(rule);
            }
          } catch (e) {
            Logger.log('Exception when creating rule from row: ' + row + ': ' + e);
          }
        } else {
          Logger.log('Skipping row: ' + row);
        }
      }
    }
  }
  Logger.log('Done reading rules: ', result.length);
  return result;
}

function CreateRuleFromRow(row) {
  // Logger.log('Processing row ' + row);
  const labelNames = row[1].split(',');
  const actions = row[2].split(',');
  const filters = [];
  for (let i = 3; i < row.length; i += 3) {
    if (row[i] === '') {
      continue;
    }
    const filterType = FilterType[row[i]];
    if (filterType === undefined || filterType === null) {
      throw new Error('Unrecognized filter type: ' + row[i]);
    }
    if (filterType === FilterType.ACCEPT_EVERYTHING) {
      filters.push(CreateFilter(filterType, ConditionType.IS, '', ''));
      continue;
    }
    if ((i + 2 >= row.length) || (row[i + 1] === '' && row[i + 2] === '')) {
      throw new Error('Found filter type but not condition and argument');
    }
    const conditionType = ConditionType[row[i + 1]];
    if (conditionType === undefined || conditionType === null) {
      throw new Error('Unrecognized condition type: ' + row[i + 1]);
    }
    let arg = row[i + 2];
    let arg2 = null;
    if (filterType === FilterType.BODY_TO) {
      const i = arg.indexOf(';');
      arg = arg.substr(0, i);
      arg2 = arg.substr(i + 1);
    }
    if (arg === '' || (arg2 !== null && arg2 === '')) {
      throw new Error('No argument in filter in row: ' + row);
    }
    filters.push(CreateFilter(filterType, conditionType, arg, arg2));
  }
  return new Rule(labelNames, actions, filters);
}
