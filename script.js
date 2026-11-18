/* stewiefeh studios */
(function () {
  "use strict";

  /* header hairline once scrolled */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* dropdown nav: open, close, esc, click-out, one focusable control on every device */
  var btn = document.querySelector(".menu-btn");
  var panel = document.querySelector(".nav-panel");
  if (btn && panel) {
    var setOpen = function (open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("open", open);
    };
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (
        panel.classList.contains("open") &&
        !panel.contains(e.target) &&
        !btn.contains(e.target)
      ) {
        setOpen(false);
      }
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  /* review form: opens the visitor's email app with the review drafted (unchanged behavior) */
  var form = document.querySelector("[data-review-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (n) {
        var el = form.querySelector('[name="' + n + '"]');
        return el ? el.value.trim() : "";
      };
      var rating = get("rating") || "5";
      var body =
        "Review of stewiefeh studios\n\nName: " + get("name") +
        "\nSite built for me: " + get("site") +
        "\nRating: " + rating + " / 5\n\n" + get("opinion");
      var url =
        "mailto:stephenfehon@gmail.com?subject=" +
        encodeURIComponent("Studio review from " + (get("name") || "a client")) +
        "&body=" + encodeURIComponent(body);
      window.location.href = url;
      var done = form.querySelector("[data-review-done]");
      if (done) done.hidden = false;
      form.reset();
    });
  }

  /* contact form: same mailto handoff, no server needed */
  var contact = document.querySelector("[data-contact-form]");
  if (contact) {
    contact.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (n) {
        var el = contact.querySelector('[name="' + n + '"]');
        return el ? el.value.trim() : "";
      };
      var body =
        "Business: " + get("business") +
        "\nName: " + get("name") +
        "\n\nWhat I'd want the site to do:\n" + get("message");
      var url =
        "mailto:stephenfehon@gmail.com?subject=" +
        encodeURIComponent("New project: " + (get("business") || get("name") || "inquiry")) +
        "&body=" + encodeURIComponent(body);
      window.location.href = url;
      var done = contact.querySelector("[data-contact-done]");
      if (done) done.hidden = false;
    });
  }
})();

/* studio layer: cursor, work-row previews, magnetic buttons (fine pointers, motion welcome) */
(function () {
  "use strict";
  var start = function () {
    "use strict";
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fxTest = window.location.search.indexOf("fxtest=1") > -1;
    if (fxTest && !fine) document.documentElement.classList.add("fx-test");
    if ((!fine || !motion) && !fxTest) return;
    var cur = document.getElementById("cursor");
    var prev = document.getElementById("preview");
    if (!cur) return;
    var mx = -100, my = -100, cx = -100, cy = -100, px = -100, py = -100;
    document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    var tick = function () {
      cx += (mx - cx) * 0.25; cy += (my - cy) * 0.25;
      px += (mx - px) * 0.14; py += (my - py) * 0.14;
      cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      if (prev) prev.style.transform = "translate3d(" + px + "px," + py + "px,0)";
      requestAnimationFrame(tick);
    };
    tick();
    document.addEventListener("mouseover", function (e) {
      if (!e.target || !e.target.closest) return;
      var row = e.target.closest(".workrow");
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
    document.documentElement.addEventListener("mouseleave", function () {
      cur.style.opacity = "0";
      if (prev) prev.classList.remove("show");
    });
    document.documentElement.addEventListener("mouseenter", function () { cur.style.opacity = ""; });
    var magnetic = document.querySelectorAll(".btn");
    for (var m = 0; m < magnetic.length; m++) {
      (function (b) {
        b.addEventListener("mousemove", function (e) {
          var r = b.getBoundingClientRect();
          b.style.transform =
            "translate(" + (((e.clientX - r.left - r.width / 2) / r.width) * 12).toFixed(1) + "px," +
                           (((e.clientY - r.top - r.height / 2) / r.height) * 9).toFixed(1) + "px)";
        });
        b.addEventListener("mouseleave", function () { b.style.transform = "";
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
