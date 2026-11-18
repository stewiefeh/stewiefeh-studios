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
