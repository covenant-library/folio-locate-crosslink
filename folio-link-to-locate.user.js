// ==UserScript==
// @name         FOLIO: Link instance to EBSCO Locate catalog
// @namespace    http://folio.org/
// @version      2026-11-10
// @description  Adds a link to the corresponding EBSCO Locate catalog record to the instance view in FOLIO. The link is placed as an icon in the record's title bar, directly next to the X. The instance UUID is taken from the page URL.
// @author       Based on a script by Martin Scholz, Universitätsbibliothek Erlangen-Nürnberg
// @icon         https://www.google.com/s2/favicons?sz=64&domain=folio.org
// @grant        none
// @run-at       idle
// @match        https://mobius.folio.ebsco.com/*
// @downloadURL  https://github.com/covenant-library/folio-locate-crosslink/raw/refs/heads/main/folio-link-to-locate.user.js
// @updateURL    https://github.com/covenant-library/folio-locate-crosslink/raw/refs/heads/main/folio-link-to-locate.user.js
// ==/UserScript==

(function() {

  console.log("add EBSCO Locate link activated");

  // Simple inline SVG icon (magnifying glass), so no external image is needed.
  // Replace with your own data URI or image URL if you prefer a different icon.
  const locateIcon = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1960A4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="11" cy="11" r="7"/><line x1="16.65" y1="16.65" x2="21" y2="21"/></svg>'
  );
  const locateUrlTemplate = "https://covenant.searchmobius.org/instances/";

  // Matches e.g. /inventory/view/a073f4c9-4c22-51e2-a79c-637c482732d6
  // (the query string, e.g. ?sort=title, is not part of location.pathname)
  const urlPathRegex = new RegExp('^/inventory/view/([-a-f0-9]+)$');

  // with an observer instance we get triggered on dom changes.
  // every time something changes, we check whether the page url path has changed
  let currentUrlPath = '';
  const observer = new MutationObserver((mutationList, observer) => {
    if (currentUrlPath !== document.location.pathname) {
      currentUrlPath = document.location.pathname;
      const match = urlPathRegex.exec(currentUrlPath);
      console.log("path changed", currentUrlPath, !!match);
      // now we need to check whether the path is relevant to us
      if (match) {
        const instanceId = match[1];
        const titleheader = document.getElementById("paneHeaderpane-instancedetails-pane-title");
        if (!titleheader) {
          // the DOM/React has probably not finished loading yet, so we simply wait for the next change,
          // by resetting the path
          currentUrlPath = '';
        }
        else {
          const existing = document.getElementById('monkey-user-locate-link');
          if (existing) {
            // link already present: make sure it points to the current instance
            existing.href = locateUrlTemplate + instanceId;
            console.log("locate link already present, href updated", existing.href);
          }
          else {
            // add the icon with link to the header
            console.log("add link to", instanceId);
            const a = document.createElement('a');
            a.id = 'monkey-user-locate-link';
            a.href = locateUrlTemplate + instanceId;
            a.target = "_blank";
            a.title = "Open in EBSCO Locate catalog";
            a.style = "margin-left: 5px; margin-right: 5px;";
            const img = document.createElement("img");
            img.src = locateIcon;
            img.width = 20;
            a.append(img);
            titleheader.parentElement.before(a);
            console.log("added link");
          }
        }
      }
    }
  });

  // We observe the entire body
  observer.observe(document.querySelector("body"), { childList: true, subtree: true });
  console.log("observer registered");

  // we probably never need to disconnect
  //observer.disconnect();

})();