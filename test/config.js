// This is QUnit config (it must be named config.js)
// To run tests, deplow as web app.

QUnit.helpers(this);

function tests() {
  console = Logger;
  mocksTest();
  utilsTest();
  filterTest();
  ruleTest();
  appTest();
}

function doGet(e) {
  QUnit.urlParams(e.parameter);
  QUnit.config({title: 'Gmail Filters test'});
  QUnit.load(tests);
  return QUnit.getHtml();
};
