const GSUITE_EMAIL_SENDER_SUFFIXES = [
  '(via google slides)',
  '(via google sheets)',
  '(via google docs)',
  '(google slides)',
  '(google docs)',
  '(google sheets)'
];

function utilsTest() {
  module('utilsTest');

  test('hasLabel', function(e) {
    equal(hasLabel(new GmailThreadMock(['a', 'b', 'c']), 'c'), true);
    equal(hasLabel(new GmailThreadMock(['a', 'b', 'c']), 'd'), false);
    equal(hasLabel(new GmailThreadMock([]), 'd'), false);
  });

  test('extractsOneEmail', function(e) {
    deepEqual(
        ExtractEmails('janedoe@example.blah.com'),
        {emails: ['janedoe@example.blah.com', 'janedoe'], count: 1});
    deepEqual(
        ExtractEmails('JaneDoe@Example.Blah.com'),
        {emails: ['janedoe@example.blah.com', 'janedoe'], count: 1});
    deepEqual(
        ExtractEmails('Jane Doe <janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe', 'jane doe'], count: 1});
    deepEqual(
        ExtractEmails('"Jane Doe" <janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe', 'jane doe'], count: 1});
    deepEqual(
        ExtractEmails('"Jane Doe (via Google Slides)" <janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe', 'jane doe'], count: 1});
    deepEqual(
        ExtractEmails('"Jane Doe (Google Docs)" <janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe', 'jane doe'], count: 1});
    deepEqual(
        ExtractEmails('"Jane Doe (via Google Sheets)" <janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe', 'jane doe'], count: 1});
    deepEqual(
        ExtractEmails('<janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe'], count: 1});
    deepEqual(
        ExtractEmails('really@@@badly<formatte....demail'),
        {emails: ['really@@@badly<formatte....demail'], count: 1});

    // With +
    deepEqual(ExtractEmails('<janedoe+abc@example.com>'), {
      emails: [
        'janedoe+abc@example.com', 'janedoe+abc', 'janedoe@example.com',
        'janedoe'
      ],
      count: 1
    });

    // With extra spaces and extra characters
    deepEqual(
        ExtractEmails('\t\njanedoe@example.blah.com  '),
        {emails: ['janedoe@example.blah.com', 'janedoe'], count: 1});
    deepEqual(
        ExtractEmails('  Jane Doe  <  janedoe@example.com\t\t>  '),
        {emails: ['janedoe@example.com', 'janedoe', 'jane doe'], count: 1});
    deepEqual(
        ExtractEmails('  <  janedoe@example.com>'),
        {emails: ['janedoe@example.com', 'janedoe'], count: 1});

    // Empty
    deepEqual(ExtractEmails(''), {emails: [], count: 0});
    deepEqual(ExtractEmails('   \t\n  '), {emails: [], count: 0});
  });

  test('extractsMultipleEmails', function(e) {
    deepEqual(
        ExtractEmails(
            `Jane Doe <janedoe@example.com>, ,
             Abraham Lincoln <abe@lincoln.com>,
             <thatguy@somewhere>,
             andhertoo@example.blah.com`),
        {
          emails: [
            'janedoe@example.com', 'janedoe', 'jane doe', 'abe@lincoln.com',
            'abe', 'abraham lincoln', 'thatguy@somewhere', 'thatguy',
            'andhertoo@example.blah.com', 'andhertoo'
          ],
          count: 4
        });
    deepEqual(
        ExtractEmails(
            'janedoe@example.com, \'Smith, Alice\' <alicesmith@gmail.com>'),
        {
          emails: [
            'janedoe@example.com', 'janedoe', 'alicesmith@gmail.com',
            'alicesmith', 'smith alice'
          ],
          count: 2
        });
  });
}
