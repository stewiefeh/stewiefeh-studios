/* stewiefeh studios */
(function () {
  "use strict";

  /* header hairline: one passive listener, always reads the live header */
  var headTick = function () {
    var h = document.querySelector(".site-head");
    if (h) h.classList.toggle("scrolled", window.scrollY > 8);
  };
  headTick();
  window.addEventListener("scroll", headTick, { passive: true });
  document.addEventListener("page:swap", headTick);

  /* dropdown nav: delegated, so it survives soft page swaps */
  var closeMenu = function () {
    var b = document.querySelector(".menu-btn");
    var p = document.querySelector(".nav-panel");
    if (b) b.setAttribute("aria-expanded", "false");
    if (p) p.classList.remove("open");
  };
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var btn = e.target.closest(".menu-btn");
    if (btn) {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      var p = document.querySelector(".nav-panel");
      if (p) p.classList.toggle("open", open);
      return;
    }
    var panel = document.querySelector(".nav-panel");
    if (panel && panel.classList.contains("open")) {
      if (e.target.closest(".nav-panel a")) { closeMenu(); return; }
      var b = document.querySelector(".menu-btn");
      if (b && !b.contains(e.target) && !panel.contains(e.target)) closeMenu();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* review + contact forms: mailto handoff, delegated */
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || !form.hasAttribute || (!form.hasAttribute("data-review-form") && !form.hasAttribute("data-contact-form"))) return;
    e.preventDefault();
    var get = function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      return el ? el.value.trim() : "";
    };
    var review = form.hasAttribute("data-review-form");
    var body = review
      ? "Review of stewiefeh studios\n\nName: " + get("name") +
        "\nSite built for me: " + get("site") +
        "\nRating: " + (get("rating") || "5") + " / 5\n\n" + get("opinion")
      : "Business: " + get("business") +
        "\nName: " + get("name") +
        "\n\nWhat I'd want the site to do:\n" + get("message");
    var subject = review
      ? "Studio review from " + (get("name") || "a client")
      : "New project: " + (get("business") || get("name") || "inquiry");
    window.location.href =
      "mailto:stephenfehon@gmail.com?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    var done = form.querySelector("[data-review-done],[data-contact-done]");
    if (done) done.hidden = false;
    if (review) form.reset();
  });
})();

/* studio layer: the real pointer, work-row previews, magnetic buttons
   (fine pointers, motion welcome). the arrow tracks the mouse exactly;
   only the preview card eases behind it. */
(function () {
  "use strict";
  var bindMagnetic = function () {
    var list = document.querySelectorAll(".btn");
    for (var m = 0; m < list.length; m++) {
      (function (b) {
        if (b.dataset.mag) return;
        b.dataset.mag = "1";
        b.addEventListener("mousemove", function (e) {
          var r = b.getBoundingClientRect();
          b.style.transform =
            "translate(" + (((e.clientX - r.left - r.width / 2) / r.width) * 6).toFixed(1) + "px," +
                           (((e.clientY - r.top - r.height / 2) / r.height) * 4).toFixed(1) + "px)";
        });
        b.addEventListener("mouseleave", function () { b.style.transform = ""; });
      })(list[m]);
    }
  };
  var start = function () {
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    var cur = document.getElementById("cursor");
    var prev = document.getElementById("preview");
    if (!cur) return;
    document.documentElement.classList.add("cur");
    var mx = -100, my = -100, px = -100, py = -100;
    document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    var tick = function () {
      cur.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      px += (mx - px) * 0.14; py += (my - py) * 0.14;
      if (prev) prev.style.transform = "translate3d(" + px + "px," + py + "px,0)";
      requestAnimationFrame(tick);
    };
    tick();
    document.addEventListener("mouseover", function (e) {
      if (!e.target || !e.target.closest) return;
      var row = e.target.closest(".workrow, .tile, .witem");
      var link = e.target.closest("a,button");
      cur.classList.toggle("row", !!row);
      cur.classList.toggle("link", !row && !!link);
      if (prev) {
        if (row) {
          var idx = parseInt(row.getAttribute("data-preview") || "0", 10);
          var imgs = prev.querySelectorAll("img");
          for (var i = 0; i < imgs.length; i++) imgs[i].classList.toggle("on", i === idx);
          prev.classList.add("show");
        } else {
          prev.classList.remove("show");
        }
      }
    });
    document.addEventListener("mousedown", function () { cur.classList.add("down"); });
    document.addEventListener("mouseup", function () { cur.classList.remove("down"); });
    document.documentElement.addEventListener("mouseleave", function () {
      cur.style.opacity = "0";
      if (prev) prev.classList.remove("show");
    });
    document.documentElement.addEventListener("mouseenter", function () { cur.style.opacity = ""; });
    bindMagnetic();
    document.addEventListener("page:swap", bindMagnetic);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

/* page transitions: the veil and the soft router.
   the inline head CSS paints every document covered by the veil from the
   very first frame. internal links never unload the document: the veil
   covers once, the next page is fetched underneath it, the document is
   swapped in place, and the veil lifts. no frame belongs to the browser
   between pages, so nothing can flash, and the mark animates once. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lift = function () {
    root.classList.add("reveal");
    root.classList.remove("boot");
    window.setTimeout(function () { root.classList.remove("reveal"); }, 950);
  };

  if (reduced) {
    root.classList.remove("boot");
  } else {
    var MIN = 1000;
    var t0 = Date.now();
    var fired = false;
    var go = function () {
      if (fired) return;
      fired = true;
      window.setTimeout(lift, Math.max(0, MIN - (Date.now() - t0)));
    };
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(go);
    } else {
      window.addEventListener("load", go);
    }
    window.setTimeout(go, 2600); /* the veil never holds the page hostage */
  }

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      root.classList.remove("boot", "reveal", "leaving");
      root.classList.add("bf");
    }
  });

  if (reduced) return;

  var COVER_MS = 480; /* matches the veil-cover animation */
  var run = 0;

  var fetchPage = function (url, my, ok, bad) {
    if (window.fetch && window.AbortController && window.DOMParser) {
      var ctl = new AbortController();
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        bad();
      }, 8000);
      fetch(url.href, { signal: ctl.signal, credentials: "same-origin" })
        .then(function (r) {
          if (!r.ok) throw new Error("http " + r.status);
          return r.text();
        })
        .then(function (t) {
          if (ctl.signal.aborted || settled) return;
          settled = true;
          window.clearTimeout(timer);
          ok(t);
        })
        .catch(function () {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          if (!ctl.signal.aborted) bad();
        });
      return ctl;
    }
    bad();
    return null;
  };

  var applyPage = function (text, url) {
    var doc = new DOMParser().parseFromString(text, "text/html");
    if (!doc || !doc.body) throw new Error("no body");

    /* hold our chrome back, swap the document, put the chrome back */
    var held = [];
    var veil = document.body.querySelector(".veil");
    if (veil) { held.push(veil); veil.parentNode.removeChild(veil); }
    var cur = document.getElementById("cursor");
    if (cur) { held.push(cur); cur.parentNode.removeChild(cur); }
    var prev = document.getElementById("preview");
    if (prev) { held.push(prev); prev.parentNode.removeChild(prev); }

    document.body.className = doc.body.className || "";
    document.body.innerHTML = "";
    var kids = Array.prototype.slice.call(doc.body.childNodes);
    for (var i = 0; i < kids.length; i++) {
      document.body.appendChild(document.importNode(kids[i], true));
    }
    for (var j = 0; j < held.length; j++) document.body.appendChild(held[j]);

    document.title = doc.title || document.title;
    var d = doc.querySelector('meta[name="description"]');
    var c = document.querySelector('meta[name="description"]');
    if (d && c) c.setAttribute("content", d.getAttribute("content"));
    var nj = doc.querySelector('script[type="application/ld+json"]');
    var cj = document.querySelector('script[type="application/ld+json"]');
    if (nj && cj) cj.textContent = nj.textContent;
    else if (nj && !cj) document.head.appendChild(document.importNode(nj, true));
    else if (cj && !nj) cj.parentNode.removeChild(cj);

    document.dispatchEvent(new CustomEvent("page:swap"));
  };

  var swap = function (text, url, push, my) {
    if (my !== run) return;
    /* class flip and DOM swap in one task, so the entrance animations
       key off the reveal state, never off leaving */
    root.classList.remove("leaving");
    root.classList.add("reveal");
    try {
      applyPage(text, url);
    } catch (err) {
      location.href = url.href; /* any surprise: a real navigation */
      return;
    }
    if (push) {
      try { history.pushState({ soft: 1 }, "", url.href); } catch (err2) {}
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.setTimeout(function () {
      if (my === run) root.classList.remove("reveal");
    }, 950);
  };

  var go = function (url, push) {
    var my = ++run;
    var t0 = Date.now();
    root.classList.remove("boot", "reveal");
    root.classList.add("leaving");
    fetchPage(url, my,
      function (text) {
        if (my !== run) return;
        var wait = Math.max(0, COVER_MS - (Date.now() - t0));
        window.setTimeout(function () { swap(text, url, push, my); }, wait);
      },
      function () {
        if (my !== run) return;
        location.href = url.href;
      });
  };

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) === "#" || /^(mailto|tel):/i.test(href)) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url;
    try { url = new URL(href, location.href); } catch (err) { return; }
    if (url.host !== location.host || url.protocol !== location.protocol) return;
    if (!/\.html?$/i.test(url.pathname) && url.pathname.charAt(url.pathname.length - 1) !== "/") return;
    e.preventDefault();
    go(url, true);
  });

  window.addEventListener("popstate", function () {
    var url;
    try { url = new URL(location.href); } catch (err) { return; }
    if (!/\.html?$/i.test(url.pathname) && url.pathname.charAt(url.pathname.length - 1) !== "/") return;
    go(url, false);
  });
})();
