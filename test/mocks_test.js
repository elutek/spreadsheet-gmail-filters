function mocksTest() {
  module('mocksTest');

  test('canCreateLabel', function(e) {
    equal('a', new GmailLabelMock('a').getName());
  });
  test('canCreateThread', function(e) {
    const t = new GmailThreadMock(['a', 'b']);
    deepEqual(
        t.getLabels(), [new GmailLabelMock('a'), new GmailLabelMock('b')]);
  });
  test('canCreateMessage', function(e) {
    equal('X', new GmailMessageMock().setFrom('X').getFrom());
    equal('X', new GmailMessageMock().setTo('X').getTo());
    equal('X', new GmailMessageMock().setSubject('X').getSubject());
    equal('X', new GmailMessageMock().setCc('X').getCc());
    equal('X', new GmailMessageMock().setBcc('X').getBcc());
    equal('X', new GmailMessageMock().setSenders('X').getHeader('Sender'));
    equal('X', new GmailMessageMock().setLists('X').getHeader('List-Id'));
  });
  test('canArchive', function(e) {
    const t = new GmailThreadMock(['a', 'b']);
    equal(false, t.archived);
    t.moveToArchive();
    equal(true, t.archived);
  });
  test('canMarkRead', function(e) {
    const t = new GmailThreadMock(['a', 'b']);
    equal(true, t.isUnread());
    t.markRead();
    equal(false, t.isUnread());
  });
  test('canStarMessage', function(e) {
    const m = new GmailMessageMock();
    const t = new GmailThreadMock([], [m]);
    equal(false, t.hasStarredMessages());
    equal(false, m.isStarred());
    m.star();
    equal(true, t.hasStarredMessages());
    equal(true, m.isStarred());
  });
  test('canCreateGmailApp', function(e) {
    const t1 = new GmailThreadMock(['label1']);
    const t2 = new GmailThreadMock(['label2']);
    const t3 = new GmailThreadMock(['label3']);
    const threads = [t1, t2, t3];
    deepEqual(new GmailAppMock(threads).getInboxThreads(), threads);
    deepEqual(new GmailAppMock(threads).getInboxThreads(1, 3), [t2, t3]);
  });
  test('canCreateSheet', function(e) {
    const row = ['a', 'b', 'c'];
    const sheet = new SheetMock('sheet-name', [row], 'my-label');
    equal(sheet.getName(), 'sheet-name');
    deepEqual(sheet.getDataRange().getValues(), [row]);
  });
}
