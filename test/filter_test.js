function filterTest() {
  module('filterTest');

  test('canFilterFrom_just_email', function(e) {
    const m = new GmailMessageMock().setFrom('a@b.com');

    equal(new FromFilter(ConditionType.IS, 'a@b.com').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'a').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'b').matchesMessage(m), false);

    equal(new FromFilter(ConditionType.RE, 'a.*').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, '.*b.com').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'a.*@b.com').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'blah').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.RE, '.*@something.com').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.RE, '.*').matchesMessage(m), true);

    equal(new FromFilter(ConditionType.IS_NOT, 'a@b.com').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.NOT_RE, 'a.*').matchesMessage(m), false);

    const m2 = new GmailMessageMock().setFrom('blah blah <blah@blah.appannie.com>');
    equal(new FromFilter(ConditionType.RE, '.*appannie.com').matchesMessage(m2), true);
    equal(new FromFilter(ConditionType.RE, '.*@blah.appannie.com').matchesMessage(m2), true);
  });

  test('canFilterFrom_email_with_name', function(e) {
    const m = new GmailMessageMock().setFrom('Alicia Smith <alicia@smith.com>');

    equal(new FromFilter(ConditionType.IS, 'alicia@smith.com').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'alicia').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'AliciA').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'alicia smith').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'Alicia Smith').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.IS, 'blah').matchesMessage(m), false);

    equal(new FromFilter(ConditionType.RE, 'alicia@smith.com').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'alicia.*').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, '.*smith.com').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'alicia').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'ali.*').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'Alicia Smith').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'Alic.*').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.RE, 'smith').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.RE, 'blah').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.RE, '.*@something.com').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.RE, '.*').matchesMessage(m), true);

    equal(new FromFilter(ConditionType.IS_NOT, 'alicia').matchesMessage(m), false);
    equal(new FromFilter(ConditionType.IS_NOT, 'blah').matchesMessage(m), true);
    equal(new FromFilter(ConditionType.NOT_RE, 'a.*').matchesMessage(m), false);
  });

  test('canAcceptEverything', function(e) {
    const m =
      new GmailMessageMock()
          .setTo('to1@b.com, Person <to2@somewhere>');

    equal(new AcceptEverythingFilter().matchesMessage(m), true);
  });

  test('canFilterToCcBcc', function(e) {
    const m =
      new GmailMessageMock()
          .setTo('to1@b.com, Person <to2@somewhere>')
          .setCc('cc1@north.pole,cc2@north.pole, Santa <cc3@nortth.pole>')
          .setBcc('bcc1@blah, bcc2@blah');

    equal(new ToCcBccFilter(ConditionType.IS, 'to1').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'to2').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'cc1').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'cc2').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'cc3').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'bcc1').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'bcc2').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'bcc2@blah').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'cc3@nortth.pole').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'Santa').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'Person').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.IS, 'someone').matchesMessage(m), false);
    equal(new ToCcBccFilter(ConditionType.IS, 'else@blah').matchesMessage(m), false);

    equal(new ToCcBccFilter(ConditionType.RE, 'to1').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'to.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, '.*to1.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'cc1').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'cc.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, '.*c.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'bcc1').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'bcc.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'bcc1.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'Santa').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'Person').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'Sa.*ta').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'Pers.*').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.RE, 'some.*@blah').matchesMessage(m), false);
    equal(new ToCcBccFilter(ConditionType.RE, 'else@.*').matchesMessage(m), false);
    equal(new ToCcBccFilter(ConditionType.RE, '.*').matchesMessage(m), true);

    equal(new ToCcBccFilter(ConditionType.IS_NOT, 'to1').matchesMessage(m), false);
    equal(new ToCcBccFilter(ConditionType.IS_NOT, 'nonexistent').matchesMessage(m), true);
    equal(new ToCcBccFilter(ConditionType.NOT_RE, 'to.*').matchesMessage(m), false);
    equal(new ToCcBccFilter(ConditionType.RE, 'else@.*').matchesMessage(m), false);
    equal(new ToCcBccFilter(ConditionType.NOT_RE, 'else@.*').matchesMessage(m), true);
  });

  test('canFilterTo', function(e) {
    const m =
      new GmailMessageMock()
          .setTo('to1@b.com, Person <to2@somewhere>')
          .setCc('cc1@north.pole,cc2@north.pole, Santa <cc3@nortth.pole>')
          .setBcc('bcc1@blah, bcc2@blah');
    equal(new ToFilter(ConditionType.IS, 'to1').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.IS, 'to2').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.IS, 'cc1').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'cc2').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'cc3').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'bcc1').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'bcc2').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'bcc2@blah').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'cc3@nortth.pole').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'Santa').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'Person').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.IS, 'someone').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS, 'else@blah').matchesMessage(m), false);

    equal(new ToFilter(ConditionType.RE, 'to1').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.RE, 'to.*').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.RE, '.*to1.*').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.RE, 'cc1').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'cc.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, '.*x.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'bcc1').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'bcc.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'bcc1.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'Santa').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'Person').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.RE, 'Sa.*ta').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'Pers.*').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.RE, 'some.*@blah').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'else@.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, '.*').matchesMessage(m), true);

    equal(new ToFilter(ConditionType.IS_NOT, 'to1').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.IS_NOT, 'else@blah').matchesMessage(m), true);
    equal(new ToFilter(ConditionType.NOT_RE, 'to.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.RE, 'else@.*').matchesMessage(m), false);
    equal(new ToFilter(ConditionType.NOT_RE, 'else@.*').matchesMessage(m), true);
  });

  test('canFilterOnlyTo', function(e) {
    const m1 = new GmailMessageMock().setTo('Alicia <alicia@blah.com>');
    const m1b = new GmailMessageMock().setTo('alicia@blah.com').setBcc('blah@blah.com');
    const m2a = new GmailMessageMock().setTo('alicia@blah.com').setCc('blah@blah.com');
    const m2b = new GmailMessageMock().setTo('alicia@blah.com, bob@something.com');

    equal(new OnlyToFilter(ConditionType.IS, 'alicia').matchesMessage(m1), true);
    equal(new OnlyToFilter(ConditionType.IS, 'Alicia').matchesMessage(m1), true);
    equal(new OnlyToFilter(ConditionType.IS, 'Bob').matchesMessage(m1), false);

    equal(new OnlyToFilter(ConditionType.IS, 'alicia').matchesMessage(m1b), true);
    equal(new OnlyToFilter(ConditionType.IS, 'blah').matchesMessage(m1b), false);

    equal(new OnlyToFilter(ConditionType.IS, 'alicia').matchesMessage(m2a), false);
    equal(new OnlyToFilter(ConditionType.IS, 'alicia').matchesMessage(m2b), false);
  });

  test('canFilterSubject', function(e) {
    const m = new GmailMessageMock().setSubject('interesting topic');

    equal(new SubjectFilter(ConditionType.IS, 'interesting topic').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.IS, 'Interesting Topic').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.IS, 'interesting.*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.IS, 'something boring').matchesMessage(m), false);

    equal(new SubjectFilter(ConditionType.RE, 'interesting topic').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.RE, 'interesting.*').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.RE, 'intere.*ic').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.RE, '[a-z]+ topic').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.RE, 'something boring').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.RE, 'something .*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.RE, '.*boring').matchesMessage(m), false);

    equal(new SubjectFilter(ConditionType.IS_NOT, 'interesting topic').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.IS_NOT, 'blah').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.NOT_RE, 'interesting.*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.NOT_RE, '.*boring').matchesMessage(m), true);
  });

  test('canFilterSender', function(e) {
    const m = new GmailMessageMock().setSenders('aa@blah.com, ab@blah.com,blah <ac@blah>');

    equal(new SenderFilter(ConditionType.IS, 'aa').matchesMessage(m), true);
    equal(new SenderFilter(ConditionType.IS, 'ab').matchesMessage(m), true);
    equal(new SenderFilter(ConditionType.IS, 'ac').matchesMessage(m), true);
    equal(new SenderFilter(ConditionType.IS, 'dd').matchesMessage(m), false);

    equal(new SenderFilter(ConditionType.RE, 'aa.*').matchesMessage(m), true);
    equal(new SenderFilter(ConditionType.RE, 'a.*').matchesMessage(m), true);
    equal(new SenderFilter(ConditionType.RE, 'z.*').matchesMessage(m), false);

    equal(new SenderFilter(ConditionType.IS_NOT, 'aa').matchesMessage(m), false);
    equal(new SenderFilter(ConditionType.IS_NOT, 'asdfs').matchesMessage(m), true);
    equal(new SenderFilter(ConditionType.NOT_RE, 'a.*').matchesMessage(m), false);
    equal(new SenderFilter(ConditionType.NOT_RE, 'different.*').matchesMessage(m), true);
  });

  test('canFilterLists', function(e) {
    const m = new GmailMessageMock().setLists('1, 32,33');

    equal(new ListFilter(ConditionType.IS, '1').matchesMessage(m), true);
    equal(new ListFilter(ConditionType.IS, '32').matchesMessage(m), true);
    equal(new ListFilter(ConditionType.IS, '40').matchesMessage(m), false);

    equal(new ListFilter(ConditionType.RE, '1').matchesMessage(m), true);
    equal(new ListFilter(ConditionType.RE, '3.*').matchesMessage(m), true);
    equal(new ListFilter(ConditionType.RE, '.*4').matchesMessage(m), false);

    equal(new ListFilter(ConditionType.IS_NOT, '1').matchesMessage(m), false);
    equal(new ListFilter(ConditionType.IS_NOT, '40').matchesMessage(m), true);
    equal(new ListFilter(ConditionType.NOT_RE, '1').matchesMessage(m), false);
    equal(new ListFilter(ConditionType.NOT_RE, '7.*').matchesMessage(m), true);
  });

  test('specialRegExSymbols', function(e) {
    const m = new GmailMessageMock().setSubject('[Launched] blah-blah?');

    equal(new SubjectFilter(ConditionType.RE, '[Launched].*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.RE, '\[Launched\].*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.RE, '\\[Launched\\].*').matchesMessage(m), true);

    equal(new SubjectFilter(ConditionType.RE, '.*-.*').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.RE, '.*\-.*').matchesMessage(m), true);

    equal(new SubjectFilter(ConditionType.RE, '.*\\?').matchesMessage(m), true);
    equal(new SubjectFilter(ConditionType.RE, '.*blah?blah.*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.RE, '.*blah\?blah.*').matchesMessage(m), false);
    equal(new SubjectFilter(ConditionType.RE, '.*blah.blah.*').matchesMessage(m), true);
  });

  test('toString', function(e) {
    equal(new FromFilter(ConditionType.IS, 'blah').filter.toString(), 'if(from,IS,blah)');
    equal(
        new ToCcBccFilter(ConditionType.IS_NOT, 'blah').filter.toString(),
        'if(to/cc/bcc,IS_NOT,blah)');
    equal(
        new SubjectFilter(ConditionType.RE, 'blah.*').filter.toString(),
        'if(subject,RE,blah.*)');
    equal(
        new SenderFilter(ConditionType.NOT_RE, 'blah').filter.toString(),
        'if(sender,NOT_RE,blah)');
    equal(
        new ListFilter(ConditionType.NOT_RE, 'BLAH').filter.toString(),
        'if(list,NOT_RE,BLAH)');
  });

  test('createFilter', function(e) {
    deepEqual(CreateFilter(FilterType.FROM, ConditionType.IS, 'a@b', null), new FromFilter(ConditionType.IS, 'a@b'));
    deepEqual(CreateFilter(FilterType.TO_CC_BCC, ConditionType.IS, 'a@b', null), new ToCcBccFilter(ConditionType.IS, 'a@b'));
    deepEqual(CreateFilter(FilterType.SUBJECT, ConditionType.IS, 'abc', null), new SubjectFilter(ConditionType.IS, 'abc'));
    deepEqual(CreateFilter(FilterType.LIST, ConditionType.IS, 'blah', null), new ListFilter(ConditionType.IS, 'blah'));
    deepEqual(CreateFilter(FilterType.SENDER, ConditionType.IS, 'a@b', null), new SenderFilter(ConditionType.IS, 'a@b'));
    throws(() => {
      CreateFilter(null, ConditionType.IS, 'a@b', null);
    });
    throws(() => {
      CreateFilter(FilterType.FROM, null, 'a@b', null);
    });
  });
}
