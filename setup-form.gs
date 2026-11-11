// Run once in your own Google account: script.google.com → New project → paste this → Run "setup".
// It creates one Google Form (fields: email, app, answer, source) and a Sheet that collects the answers,
// then prints the values to paste into config.js. All three waitlist pages share this one form.
function setup() {
  var form = FormApp.create('App waitlists');
  form.setDescription('Filled by the waitlist pages. Do not share this form link.');
  form.setCollectEmail(false);
  try { form.setRequireLogin(false); } catch (e) {}   // Workspace-only setting; personal accounts skip it
  var titles = ['email', 'app', 'answer', 'source'];
  var items = titles.map(function (t) { return form.addTextItem().setTitle(t); });
  items[0].setRequired(true);

  var sheet = SpreadsheetApp.create('App waitlists (responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  try { form.setPublished(true); } catch (e) {}       // newer accounts create forms unpublished

  // The entry.NNN ids only show up in a prefilled link, so build one and read them back.
  var resp = form.createResponse();
  items.forEach(function (it, i) { resp.withItemResponse(it.createResponse('field' + i)); });
  var ids = {};
  resp.toPrefilledUrl().split('?')[1].split('&').forEach(function (pair) {
    var kv = pair.split('=');
    if (kv[0].indexOf('entry.') === 0) ids[decodeURIComponent(kv[1])] = kv[0];
  });

  Logger.log('Paste into config.js:\n' + JSON.stringify({
    formUrl: form.getPublishedUrl().replace(/\/viewform.*$/, '/formResponse'),
    entries: { email: ids.field0, app: ids.field1, answer: ids.field2, source: ids.field3 }
  }, null, 2));
  Logger.log('Responses sheet: ' + sheet.getUrl());
  Logger.log('Form editor: ' + form.getEditUrl());
}
