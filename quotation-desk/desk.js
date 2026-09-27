'use strict';
(() => {
  const config = window.QUOTATION_DESK_CONFIG || {};
  const status = document.getElementById('connection-status');
  const frame = document.getElementById('desk-frame');
  const retry = document.getElementById('reconnect');
  let credential = '', channel = '', connected = false, timer, expiryTimer;
  const message = (text, error = false) => { status.textContent = text; status.classList.toggle('error', error); };
  const configured = /^\d+-[a-z0-9-]+\.apps\.googleusercontent\.com$/.test(config.googleClientId || '') && /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.appsScriptUrl || '');
  function connect() {
    if (!credential) return;
    channel = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    connected = false; retry.hidden = true;
    document.getElementById('welcome').hidden = true;
    document.getElementById('workspace').hidden = false;
    document.getElementById('session-status').textContent = '· Connecting securely';
    frame.src = config.appsScriptUrl + '?origin=' + encodeURIComponent(location.origin) + '&channel=' + channel;
    message('Opening your secure workspace…');
    clearTimeout(timer); timer = setTimeout(() => { if (!connected) { document.getElementById('workspace').hidden = true; document.getElementById('welcome').hidden = false; message('The secure workspace did not respond. If you are using an in-app browser, open this page in Chrome. Otherwise try again or contact the administrator. Your access permissions are unchanged.', true); retry.hidden = false; } }, 45000);
  }
  window.addEventListener('message', event => {
    const data = event.data;
    if (!data || !channel || data.channel !== channel || !/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/.test(event.origin)) return;
    if (data.type === 'ca1-ready' && !connected && event.source) {
      connected = true; clearTimeout(timer);
      event.source.postMessage({ type: 'ca1-credential', channel, credential }, event.origin);
      document.getElementById('welcome').hidden = true;
      document.getElementById('workspace').hidden = false;
      document.getElementById('session-status').textContent = '· Verifying access';
    }
    if (data.type === 'ca1-status') {
      document.getElementById('session-status').textContent = '· ' + String(data.label || '').slice(0, 120);
      if (Number.isFinite(data.expires)) {
        clearTimeout(expiryTimer);
        expiryTimer = setTimeout(() => signOut('Your session ended. Sign in again to continue.'), Math.max(0, data.expires * 1000 - Date.now()));
      }
    }
    if (data.type === 'ca1-expired') signOut('Your session ended. Sign in again to continue.');
  });
  function signOut(text = 'Signed out. Sign in to continue.') {
    credential = ''; channel = ''; connected = false; clearTimeout(timer); clearTimeout(expiryTimer); frame.src = 'about:blank';
    document.getElementById('workspace').hidden = true; document.getElementById('welcome').hidden = false;
    window.google?.accounts.id.disableAutoSelect(); message(text);
  }
  document.getElementById('sign-out').onclick = () => signOut(); retry.onclick = connect;
  if (!configured) { message('Connection setup pending. Google sign-in and the private register must be connected by the administrator before this desk can be used.'); return; }
  const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true;
  script.onerror = () => message('Google sign-in could not load. Check your connection and reload this page.', true);
  script.onload = () => {
    google.accounts.id.initialize({ client_id: config.googleClientId, auto_select: false, callback: result => { credential = result.credential; connect(); } });
    google.accounts.id.renderButton(document.getElementById('google-signin'), { theme: 'outline', size: 'large', text: 'continue_with', width: 260 });
    message('Sign in, then request access if your account has not yet been approved.');
  };
  document.head.append(script);
})();
