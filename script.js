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
    var desktop = (navigator.maxTouchPoints || 0) === 0;
    if (!fine && !desktop) return;
    var cur = document.getElementById("cursor");
    var prev = document.getElementById("preview");
    if (!cur) return;
    document.documentElement.classList.add("cur");
    var r = document.documentElement;
    /* rebuild the cursor chrome so every page carries the current design */
    cur.innerHTML = '<span class="c-arrow"><span class="c-nib"><svg viewBox="0 0 30 30" aria-hidden="true">' +
      '<path class="c-body" d="M5.81 5.81 L6.4 6.61 L6.96 7.4 L7.5 8.18 L8 8.95 L8.48 9.7 L8.92 10.45 L9.34 11.18 L9.73 11.9 L10.09 12.61 L10.43 13.31 L10.73 14 L11 14.67 L11.25 15.34 L11.46 15.99 L11.64 16.67 L11.81 17.32 L11.98 17.93 L12.16 18.51 L12.33 19.05 L12.51 19.56 L12.68 20.04 L12.86 20.48 L13.04 20.89 L13.22 21.26 L13.4 21.61 L13.58 21.91 L13.76 22.19 L13.94 22.42 L14.46 22.99 L15.01 23.49 L15.57 23.92 L16.16 24.29 L16.76 24.6 L17.38 24.84 L18.02 25.02 L18.68 25.14 L19.36 25.19 L20.07 25.17 L20.78 25.1 L21.52 24.95 L22.28 24.75 L23.06 24.48 L23.58 23.75 L24.02 23.01 L24.37 22.28 L24.63 21.54 L24.8 20.79 L24.88 20.05 L24.88 19.3 L24.79 18.54 L24.62 17.78 L24.35 17.02 L24 16.26 L23.56 15.49 L23.04 14.72 L22.42 13.94 L22.19 13.76 L21.91 13.58 L21.61 13.4 L21.26 13.22 L20.89 13.04 L20.48 12.86 L20.04 12.68 L19.56 12.51 L19.05 12.33 L18.51 12.16 L17.93 11.98 L17.32 11.81 L16.67 11.64 L15.99 11.46 L15.34 11.25 L14.67 11 L14 10.73 L13.31 10.43 L12.61 10.09 L11.9 9.73 L11.18 9.34 L10.45 8.92 L9.7 8.48 L8.95 8 L8.18 7.5 L7.4 6.96 L6.61 6.4 L5.81 5.81 Z"/>' +
      '<path class="c-slit" d="M7.65 7.65 L16.41 16.41"/>' +
      '<circle class="c-hole" cx="18.68" cy="18.68" r="1.5"/>' +
'</svg></span></span>' +
      '<span class="c-pill"></span>' +
      '<span class="c-beam"><svg viewBox="0 0 13 28" aria-hidden="true">' +
      '<path d="M2.5 4 Q6.5 7 10.5 4"/><path d="M2.5 24 Q6.5 21 10.5 24"/><path d="M6.5 4 L6.5 24"/></svg></span>';
    /* the soft layer: one amber bead lagging a step behind the nib */
    var soft = document.getElementById("cursor-soft");
    if (!soft) {
      soft = document.createElement("div");
      soft.id = "cursor-soft";
      soft.setAttribute("aria-hidden", "true");
      document.body.appendChild(soft);
    }
    soft.innerHTML = '<span class="c-dot"></span>';
    var nib = cur.querySelector(".c-nib");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var trail = null, ctx = null, cbrk = null, hovEl = null, dw = 0, dh = 0;
    var sizeTrail = function () {
      if (!trail) return;
      dw = window.innerWidth; dh = window.innerHeight;
      trail.width = dw; trail.height = dh;
    };
    if (fine && !reduce) {
      trail = document.createElement("canvas");
      trail.id = "inktrail";
      trail.setAttribute("aria-hidden", "true");
      document.body.appendChild(trail);
      ctx = trail.getContext("2d");
      cbrk = document.createElement("div");
      cbrk.id = "cbrk";
      cbrk.setAttribute("aria-hidden", "true");
      cbrk.innerHTML = '<i class="t1"></i><i class="t2"></i><i class="t3"></i><i class="t4"></i>';
      document.body.appendChild(cbrk);
      sizeTrail();
      window.addEventListener("resize", sizeTrail);
    }
    var mx = -100, my = -100, sx = -100, sy = -100, px = -100, py = -100;
    var pmx = -100, tilt = 0, vel = 0, lastMove = Date.now();
    var pts = [];
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; lastMove = Date.now();
      if (r.classList.contains("c-rest")) r.classList.remove("c-rest");
      if (ctx) {
        var l = pts[pts.length - 1];
        if (!l || Math.abs(l.x - mx) + Math.abs(l.y - my) > 3) {
          pts.push({ x: mx, y: my, l: 1, c: r.classList.contains("c-link") ? "c" : "i" });
          if (pts.length > 42) pts.shift();
        }
      }
    });
    var tick = function () {
      cur.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      sx += (mx - sx) * 0.12; sy += (my - sy) * 0.12;
      soft.style.transform = "translate3d(" + sx.toFixed(1) + "px," + sy.toFixed(1) + "px,0)";
      px += (mx - px) * 0.14; py += (my - py) * 0.14;
      if (prev) prev.style.transform = "translate3d(" + px + "px," + py + "px,0)";
      /* the nib carries like a pen: tilts into its own momentum, settles at rest */
      vel = vel * 0.72 + (mx - pmx) * 0.28; pmx = mx;
      var rest = Date.now() - lastMove > 2200;
      if (rest && !r.classList.contains("c-rest") && !r.classList.contains("c-down")) r.classList.add("c-rest");
      if (nib && !reduce) {
        var want = rest ? 38 : Math.max(-14, Math.min(14, vel * 1.05));
        tilt += (want - tilt) * 0.14;
        nib.style.transform = "rotate(" + tilt.toFixed(2) + "deg)";
      }
      /* the path it takes is drawn on, then dries away */
      if (ctx && pts.length) {
        ctx.clearRect(0, 0, dw, dh);
        ctx.lineWidth = 1.3; ctx.lineCap = "round";
        for (var i = 1; i < pts.length; i++) {
          var a = (pts[i].l + pts[i - 1].l) / 2;
          if (a <= 0.02) continue;
          ctx.globalAlpha = a * 0.8;
          ctx.strokeStyle = pts[i].c === "c" ? "#c4830e" : "#14130f";
          ctx.beginPath();
          ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
          ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (var j = 0; j < pts.length; j++) pts[j].l -= 0.05;
        while (pts.length && pts[0].l <= 0) pts.shift();
      }
      /* drafting corner-brackets draw on around whatever the nib is over */
      if (cbrk) {
        if (r.classList.contains("c-link") && hovEl && hovEl.isConnected) {
          var b = hovEl.getBoundingClientRect();
          cbrk.style.left = (b.left - 6) + "px";
          cbrk.style.top = (b.top - 6) + "px";
          cbrk.style.width = (b.width + 12) + "px";
          cbrk.style.height = (b.height + 12) + "px";
        } else {
          cbrk.style.left = "-999px";
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
    document.addEventListener("mouseover", function (e) {
      if (!e.target || !e.target.closest) return;
      var row = e.target.closest(".workrow, .tile, .witem");
      var field = e.target.closest("input, textarea, [contenteditable]");
      var link = e.target.closest("a, button");
      hovEl = (!row && !field && link) ? link : null;
      r.classList.toggle("c-row", !!row);
      r.classList.toggle("c-link", !row && !field && !!link);
      r.classList.toggle("c-beam", !!field);
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
    document.addEventListener("mousedown", function () {
      r.classList.add("c-down");
      if (ctx && mx > -50) {
        var rip = document.createElement("span");
        rip.className = "c-rip" + (r.classList.contains("c-link") ? " amber" : "");
        rip.style.left = mx + "px"; rip.style.top = my + "px";
        document.body.appendChild(rip);
        rip.addEventListener("animationend", function () { if (rip.parentNode) rip.parentNode.removeChild(rip); });
      }
    });
    document.addEventListener("mouseup", function () { r.classList.remove("c-down"); });
    document.documentElement.addEventListener("mouseleave", function () {
      cur.style.opacity = "0"; soft.style.opacity = "0";
      r.classList.remove("c-row", "c-link", "c-beam", "c-rest");
      hovEl = null;
      if (prev) prev.classList.remove("show");
    });
    document.documentElement.addEventListener("mouseenter", function () {
      cur.style.opacity = ""; soft.style.opacity = "";
    });
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
    var MIN = 1250;
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
      root.classList.remove("boot", "reveal", "leaving", "nav");
      root.classList.add("bf");
    }
  });

  if (reduced) return;

  var COVER_MS = 800; /* hold until the mark finishes its draw, then lift at once */
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

    /* the cursor, the soft layer and the veil are ours alone: never import a second copy */
    var chrome = doc.body.querySelectorAll("#cursor, #cursor-soft, #preview, .veil, #inktrail, #cbrk");
    for (var k = 0; k < chrome.length; k++) chrome[k].parentNode.removeChild(chrome[k]);

    /* hold our chrome back, swap the document, put the chrome back */
    var held = [];
    var veil = document.body.querySelector(".veil");
    if (veil) { held.push(veil); veil.parentNode.removeChild(veil); }
    var cur = document.getElementById("cursor");
    if (cur) { held.push(cur); cur.parentNode.removeChild(cur); }
    var prev = document.getElementById("preview");
    if (prev) { held.push(prev); prev.parentNode.removeChild(prev); }
    var soft = document.getElementById("cursor-soft");
    if (soft) { held.push(soft); soft.parentNode.removeChild(soft); }
    var ink = document.getElementById("inktrail");
    if (ink) { held.push(ink); ink.parentNode.removeChild(ink); }
    var cb = document.getElementById("cbrk");
    if (cb) { held.push(cb); cb.parentNode.removeChild(cb); }

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
    root.classList.add("nav");
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
      if (my === run) root.classList.remove("reveal", "nav");
    }, 950);
  };

  var go = function (url, push) {
    var my = ++run;
    var t0 = Date.now();
    root.classList.remove("c-row", "c-link", "c-beam", "c-down", "c-rest");
    var pv = document.getElementById("preview");
    if (pv) pv.classList.remove("show");
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
