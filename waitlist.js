// Shared waitlist logic for every app page.
// A form opts in with data-waitlist="<app>". It sends email + app + answer + source
// to a Google Form (responses land in a Google Sheet) and counts visits/joins in GoatCounter.
(function () {
  var C = window.WAITLIST_CONFIG || {};
  var connected = !!(C.formUrl && C.entries && C.entries.email);
  var params = new URLSearchParams(location.search);
  var source = params.get('r') || params.get('utm_source') || (document.referrer ? new URL(document.referrer).hostname : 'direct');

  function store(k, v) { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  if (C.goatcounter) {
    var s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', C.goatcounter);
    document.head.appendChild(s);
  }
  function countJoin(app) {
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'join/' + app, title: 'join ' + app, event: true });
  }

  function answerOf(form) {
    // Several checked boxes join with ", ". Extra fields marked data-answer-label="level" add " | level: ...".
    var a = Array.prototype.map.call(form.querySelectorAll('[name="answer"]:checked'), function (el) { return el.value; }).join(', ');
    var other = form.querySelector('[name="other"]');
    if (other && other.value.trim()) a = (a ? a + ' | ' : '') + 'other: ' + other.value.trim();
    form.querySelectorAll('[data-answer-label]').forEach(function (el) {
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      if (el.value.trim()) a = (a ? a + ' | ' : '') + el.getAttribute('data-answer-label') + ': ' + el.value.trim();
    });
    return a;
  }

  document.querySelectorAll('form[data-waitlist]').forEach(function (form) {
    var app = form.getAttribute('data-waitlist');
    var status = form.querySelector('[data-status]');
    var button = form.querySelector('button[type="submit"]');
    function say(text, kind) { if (status) { status.textContent = text; status.dataset.kind = kind || ''; } }

    if (read('joined:' + app)) form.dataset.state = 'done';

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = form.querySelector('[name="email"]').value.trim();
      var answer = answerOf(form);
      if (form.hasAttribute('data-needs-answer') && !answer) { say(form.getAttribute('data-needs-answer'), 'error'); return; }
      if (!connected) {
        console.info('[waitlist] not connected; would send', { app: app, email: email, answer: answer, source: source });
        say("Sign-ups aren't connected yet. Please try again in a day or two.", 'error');
        return;
      }
      var body = new URLSearchParams();
      body.append(C.entries.email, email);
      if (C.entries.app) body.append(C.entries.app, app);
      if (C.entries.answer) body.append(C.entries.answer, answer);
      if (C.entries.source) body.append(C.entries.source, source);
      button.disabled = true; say('Adding you…');
      // Google Forms gives no readable reply to other sites (no-cors); only a network failure rejects.
      fetch(C.formUrl, { method: 'POST', mode: 'no-cors', body: body })
        .then(function () {
          store('joined:' + app, '1');
          countJoin(app);
          form.dataset.state = 'done';
          say('');
          var done = form.querySelector('[data-done]'); if (done) done.focus();
        })
        .catch(function () { say("That didn't go through. Check your connection and try again.", 'error'); })
        .then(function () { button.disabled = false; });
    });
  });
})();
