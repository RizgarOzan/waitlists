// Shared by the Hypewall pack pages. Load after ../../config.js.
// Does three things: the marble texture (Stoic), the "Next line" demo, and the contact links.
(function () {
  var root = document.documentElement, pack = root.dataset.pack;
  var $ = function (id) { return document.getElementById(id); };

  if (pack === 'stoic') {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="900"><filter id="v" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency="0.0032 0.0105" numOctaves="5" seed="11"/><feColorMatrix values="0 0 0 0 .42 0 0 0 0 .42 0 0 0 0 .42 -5.5 0 0 0 1"/></filter><filter id="c" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .62 0 0 0 0 .62 0 0 0 0 .62 0 0 0 .55 -.15"/></filter><rect width="420" height="900" fill="#ebe8e2"/><rect width="420" height="900" filter="url(#c)"/><g transform="rotate(-28 210 450)"><rect x="-300" y="-300" width="1020" height="1500" filter="url(#v)" opacity=".5"/></g></svg>';
    root.style.setProperty('--marble', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
  }

  // Mail links only show when config.js has a contact address. No address, no link.
  var contact = (window.WAITLIST_CONFIG || {}).contact;
  document.querySelectorAll('[data-contact]').forEach(function (el) {
    if (!contact) return;
    el.querySelector('a').href = 'mailto:' + contact + '?subject=' + encodeURIComponent(el.getAttribute('data-contact'));
    el.hidden = false;
  });

  // "Next line": cycles the real lines listed in <script type="application/json" id="lines">.
  var data = $('lines'), home = $('home');
  if (!data || !home) return;
  data = JSON.parse(data.textContent);
  var lines = data.lines, i = 0, tr = 'kjv';
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var textOf = function (L) { return L.t || L[tr]; };
  var label = function () { return tr.toUpperCase(); };

  function render() {
    var L = lines[i], t = textOf(L), n = t.length, html;
    if (pack === 'anime') {
      html = '<span class="speed" aria-hidden="true"></span><p class="w-line" style="font-size:' + (n <= 40 ? 34 : n <= 60 ? 29 : 25) + 'px">' + esc(t) + '</p>' +
        '<div class="w-foot"><span class="w-src">' + esc(L.s) + '</span>' + (L.tag ? '<span class="tag">' + esc(L.tag) + '</span>' : '') + '</div>';
      if ($('lockLine')) { $('lockLine').textContent = t; $('lockSrc').textContent = L.s; }
    } else if (pack === 'stoic') {
      html = '<span class="rule" aria-hidden="true"></span><p class="w-line" style="font-size:' + (n > 120 ? 15 : n > 80 ? 17 : 19) + 'px">' + esc(t) + '</p>' +
        '<div class="w-foot"><span class="w-src">' + esc(L.s) + '<br>' + esc(L.tr) + '</span></div>';
    } else {
      var dc = t.match(/^[“"‘]?./)[0];
      html = '<p class="w-line" style="font-size:' + (n > 140 ? 18 : n > 90 ? 20 : 22) + 'px"><span class="dc">' + esc(dc) + '</span>' + esc(t.slice(dc.length)) + '</p>' +
        '<div class="w-foot"><span class="w-src">' + esc(L.s) + ' · ' + label() + '</span></div>';
      if (data.lock && $('lockLine')) { $('lockLine').textContent = data.lock[tr]; $('lockSrc').textContent = data.lock.s + ' · ' + label(); }
    }
    home.innerHTML = html;
    $('lineCount').textContent = 'Line ' + (i + 1) + ' of ' + lines.length;
  }

  $('nextLine').addEventListener('click', function () { i = (i + 1) % lines.length; render(); });
  document.querySelectorAll('input[name="tr"]').forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) { tr = r.value; render(); } });
  });
  render();
})();
