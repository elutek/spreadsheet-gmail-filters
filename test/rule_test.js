function ruleTest() {
  module('ruleTest');

  function createLabelCache() {
    return new LabelCache(new GmailAppMock());
  };

  test('matchesMessage', function(e) {
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const rule = new Rule(['testlabel'], [], filters);
    equal(rule.matchesMessage(new GmailMessageMock().setFrom('a')), true);
    equal(rule.matchesMessage(new GmailMessageMock().setFrom('b')), false);
  });

  test('matchesThread', function(e) {
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'z', null)];
    const rule = new Rule(['testlabel'], [], filters);
    const m1 = new GmailMessageMock().setTo('a').setFrom('z');
    const m2 = new GmailMessageMock().setTo('z').setFrom('b');
    const m3 = new GmailMessageMock().setTo('z').setFrom('c');
    equal(rule.matchesMessage(m1), true);
    equal(rule.matchesMessage(m2), false);
    equal(rule.matchesMessage(m3), false);
    equal(rule.matchesThread(new GmailThreadMock([], [m1 /* last*/, m2, m3])), true);
    equal(rule.matchesThread(new GmailThreadMock([], [m2 /* last*/, m1, m3])), true);
    equal(rule.matchesThread(new GmailThreadMock([], [m2 /* last*/, m3])), false);
  });

  test('applyToThread_basic_test', function(e) {
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const mb = new GmailMessageMock().setTo('b').setFrom('z');
    const rule = new Rule(['new'], [], filters);
    equal(true, rule.matchesMessage(ma));
    equal(false, rule.matchesMessage(mb));
  });

  test('applyToThread_matching', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const mb = new GmailMessageMock().setTo('b').setFrom('z');
    const ta = new GmailThreadMock([], [ma]);
    const tb = new GmailThreadMock([], [mb]);
    const rule = new Rule(['new'], [], filters);
    equal(true, rule.applyToThread(ta, labelCache, /* dryRun*/false));
    equal(false, rule.applyToThread(tb, labelCache, /* dryRun*/false));
    deepEqual(['new'], ta.getLabelNames());
    deepEqual([], tb.getLabelNames());
  });

  test('applyToThread_multiple_labels', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const ta = new GmailThreadMock([], [ma]);
    const rule1 = new Rule(['new1', 'new2'], [], filters);
    equal(true, rule1.applyToThread(ta, labelCache, /* dryRun*/false));
    deepEqual(['new1', 'new2'], ta.getLabelNames());
  });

  test('applyToThread_mute', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const ta = new GmailThreadMock([], [ma]);
    const rule = new Rule(['new'], [], filters);
    ta.addLabel(labelCache.getOrCreateLabel('mute'));

    equal(rule.applyToThread(ta, labelCache, /* dryRun*/false), false);
    deepEqual(ta.getLabelNames(), ['mute']);

    ma.star();

    equal(rule.applyToThread(ta, labelCache, /* dryRun*/false), true);
    deepEqual(ta.getLabelNames(), ['mute', 'new']);
  });

  test('applyToThread_archive', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const ta = new GmailThreadMock([], [ma]);

    const rule1 = new Rule(['new'], ['NO_ARCHIVE'], filters);
    equal(true, rule1.applyToThread(ta, labelCache, /* dryRun*/false));
    deepEqual(['new'], ta.getLabelNames());
    equal(false, ta.archived);

    const rule2 = new Rule(['new'], [], filters);
    equal(true, rule2.applyToThread(ta, labelCache, /* dryRun*/false));
    equal(true, ta.archived);
  });

  test('applyToThread_mark_read', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const ta = new GmailThreadMock([], [ma]);
    equal(ta.isUnread(), true);

    const rule1 = new Rule(['new1'], [], filters);
    equal(rule1.applyToThread(ta, labelCache, /* dryRun*/false), true);
    deepEqual(['new1'], ta.getLabelNames());
    equal(ta.isUnread(), true);

    const rule2 = new Rule(['new2'], ['MARK_READ'], filters);
    equal(rule2.applyToThread(ta, labelCache, /* dryRun*/false), true);
    deepEqual(['new1', 'new2'], ta.getLabelNames());
    equal(ta.isUnread(), false);
  });

  test('applyToThread_star', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const ta = new GmailThreadMock([], [ma]);
    equal(false, ta.hasStarredMessages());
    const rule = new Rule([], ['STAR'], filters);
    equal(true, rule.applyToThread(ta, labelCache, /* dryRun*/false));
    equal(true, ta.hasStarredMessages());
    equal(true, ma.isStarred());
  });

  test('applyToThread_dry_run', function(e) {
    const labelCache = createLabelCache();
    const filters = [CreateFilter(FilterType.FROM, ConditionType.IS, 'a', null)];
    const ma = new GmailMessageMock().setFrom('a').setTo('z');
    const ta = new GmailThreadMock([], [ma]);
    const rule = new Rule(['new'], [], filters);
    equal(true, rule.applyToThread(ta, labelCache, /* dryRun*/true));
    deepEqual([], ta.getLabelNames());
  });
}
