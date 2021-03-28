function labelsTest() {
  module('labelsTest');

  test('works', function(e) {
    const gmailApp = new GmailAppMock([]);
    const labelCache = new LabelCache(gmailApp);
    const label1 = labelCache.getOrCreateLabel("blah");
    deepEqual(label, null);
    const label2 = labelCache.getOrCreateLabel("blah");
    equal(label1, label2);
  });
}
