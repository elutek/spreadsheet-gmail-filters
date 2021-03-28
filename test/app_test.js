function appTest() {
  module('appTest');

  function createLabelCache() {
    return new LabelCache(new GmailAppMock());
  };

  test('onOffRules', function(e) {
    deepEqual(
        CreateRuleFromRow(['ON', 'rt', '', FilterType.TO_CC_BCC, ConditionType.IS, 'a@b']),
        new Rule(['rt'], [], [new ToCcBccFilter(ConditionType.IS, 'a@b')])
    );
  });

  test('acceptEverything', function(e) {
    deepEqual(
        CreateRuleFromRow(['ON', 'rt', '', FilterType.ACCEPT_EVERYTHING, '*', '*']),
        new Rule(['rt'], [], [new AcceptEverythingFilter()])
    );
  });

  test('multipleFilters', function(e) {
    deepEqual(
        CreateRuleFromRow(['ON', 'rt', '', FilterType.TO_CC_BCC, ConditionType.IS, 'a@b',
          FilterType.FROM, ConditionType.RE, 'z.*']),
        new Rule(['rt'], [], [new ToCcBccFilter(ConditionType.IS, 'a@b'), new FromFilter(ConditionType.RE, 'z.*')])
    );
  });

  // Final big test.
  test('ProcessEmails', function(e) {
    // Setup inbox.
    const message1 = new GmailMessageMock().setFrom('a').setTo('c');
    const message1a = new GmailMessageMock().setFrom('b').setTo('d');
    const thread1 = new GmailThreadMock([], [message1, message1a]);

    const message2 = new GmailMessageMock().setFrom('x').setTo('y');
    const thread2 = new GmailThreadMock([], [message2]);

    const message3 = new GmailMessageMock().setFrom('Z').setTo('Z');
    const thread3 = new GmailThreadMock([], [message3]);

    const gmailApp = new GmailAppMock([thread1, thread2, thread3]);

    // Setup the spreadhseet.
    const sheet1 = new SheetMock('META', []);
    const sheet2 = new SheetMock('Filters', [
      ['ON', 'p0', '', FilterType.FROM, ConditionType.IS, 'a'],
      ['ON', 'p0', '', FilterType.FROM, ConditionType.IS, 'c']
    ]);
    const sheet3 = new SheetMock('More Filters', [
      ['ON', 'p1', '', FilterType.FROM, ConditionType.IS, 'x'],
      ['ON', 'p1', '', FilterType.TO_CC_BCC, ConditionType.IS, 'd'],
      ['ON', 'p2', '', FilterType.ACCEPT_EVERYTHING, '*', '*']
    ]);
    const spreadsheetApp = new SpreadsheetAppMock(
        [sheet1, sheet2, sheet3], /* activeSheet=*/ sheet1);

    const rules = ReadRulesFromSpreadsheet(/* onlySelectedRules=*/ false, spreadsheetApp);

    deepEqual(
        rules[0],
        new Rule(['p0'], [], [new FromFilter(ConditionType.IS, 'a')]));
    deepEqual(
        rules[1],
        new Rule(['p0'], [], [new FromFilter(ConditionType.IS, 'c')]));
    deepEqual(
        rules[2],
        new Rule(['p1'], [], [new FromFilter(ConditionType.IS, 'x')]));
    deepEqual(
        rules[3],
        new Rule(['p1'], [], [new ToCcBccFilter(ConditionType.IS, 'd')]));
    deepEqual(
        rules[4],
        new Rule(['p2'], [], [new AcceptEverythingFilter()]));
    equal(rules.length, 5);

    ProcessEmails(
        /* maxThreads=*/ 0,
        /* onlySelectedRules=*/ false,
        /* dryRun=*/ false,
        gmailApp,
        spreadsheetApp);

    deepEqual(['p0'], thread1.getLabelNames());
    deepEqual(['p1'], thread2.getLabelNames());
    deepEqual(['p2'], thread3.getLabelNames());
  });
}
