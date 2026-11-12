(function () {
  "use strict";
  // Keep campaign attribution when an existing recruitment link is opened.
  const target = new URL("/schedule-interview.html", window.location.origin);
  target.search = window.location.search;
  window.location.replace(target.href);
})();
