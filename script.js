// stewiefeh studios — drafting sheet motion layer

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- boot: the sheet draws its frame ---------- */

  var boot = function () { document.body.classList.add("ready"); };
  if (document.readyState === "complete") { boot(); }
  else { window.addEventListener("load", boot); }
  // safety: never leave the page hidden behind un-fired transitions
  setTimeout(boot, 1600);

  /* ---------- reveals ---------- */

  var revealables = document.querySelectorAll("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -4% 0px" });
    revealables.forEach(function (t) { io.observe(t); });
  } else {
    revealables.forEach(function (t) { t.classList.add("is-in"); });
    var steps = document.querySelector(".steps");
    if (steps) steps.classList.add("is-in");
  }

  /* ---------- nav + scroll tick ---------- */

  var nav = document.getElementById("nav");
  var tick = document.getElementById("scrollTick");
  var rail = document.querySelector(".frame-scroll");

  var onScroll = function () {
    var h = document.documentElement;
    if (nav) nav.classList.toggle("scrolled", h.scrollTop > 40);
    if (tick && rail && !reduce) {
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      var travel = rail.offsetHeight - tick.offsetHeight;
      tick.style.transform = "translateY(" + (p * travel).toFixed(1) + "px)";
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- menu overlay ---------- */

  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  var setMenu = function (open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- the board: construction grid ---------- */

  var board = document.getElementById("board");
  var hero = document.querySelector(".hero");
  var coords = document.getElementById("coords");

  if (board && hero) {
    var ctx = board.getContext("2d");
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var draw = 0;               // 0..1 construction progress
    var px = -1, py = -1;       // pointer, in hero space
    var rafId = null, animating = false;

    var size = function () {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      board.width = Math.round(W * DPR);
      board.height = Math.round(H * DPR);
      board.style.width = W + "px";
      board.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    var paint = function () {
      ctx.clearRect(0, 0, W, H);
      var d = reduce ? 1 : draw;

      // fine grid, revealed left-to-right
      var step = 120;
      if (d > 0) {
        var cols = Math.ceil(W / step), rows = Math.ceil(H / step);
        var maxCol = Math.floor(cols * d);
        ctx.strokeStyle = "rgba(233,231,224,0.035)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var c = 0; c <= maxCol; c++) { var x = c * step + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        ctx.stroke();
        ctx.beginPath();
        for (var rw = 0; rw <= rows; rw++) { var y = rw * step + 0.5; var span = W * d; ctx.moveTo(0, y); ctx.lineTo(span, y); }
        ctx.stroke();
      }

      // construction circle + arc, drawn like a compass sweep
      if (d > 0) {
        var cx = W * 0.84, cy = H * 0.38, R = Math.min(W, H) * 0.26;
        ctx.strokeStyle = "rgba(217,154,43,0.11)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * d);
        ctx.stroke();
        ctx.strokeStyle = "rgba(233,231,224,0.10)";
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.62, Math.PI * 0.7, Math.PI * 0.7 + Math.PI * 1.3 * d);
        ctx.stroke();
      }

      // pointer crosshair
      if (!reduce && finePointer && px >= 0) {
        ctx.strokeStyle = "rgba(217,154,43,0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 0.5, 0); ctx.lineTo(px + 0.5, H);
        ctx.moveTo(0, py + 0.5); ctx.lineTo(W, py + 0.5);
        ctx.stroke();
        ctx.strokeStyle = "rgba(217,154,43,0.4)";
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 14, py); ctx.lineTo(px - 5, py);
        ctx.moveTo(px + 5, py); ctx.lineTo(px + 14, py);
        ctx.moveTo(px, py - 14); ctx.lineTo(px, py - 5);
        ctx.moveTo(px, py + 5); ctx.lineTo(px, py + 14);
        ctx.stroke();
      }
    };

    var loop = function () {
      draw += (1 - draw) * 0.045;
      if (draw > 0.995) { draw = 1; animating = false; }
      paint();
      if (animating) rafId = requestAnimationFrame(loop);
    };

    var pad = function (n) { return ("0000" + Math.max(0, Math.round(n))).slice(-4); };
    var start = function () {
      if (reduce) { draw = 1; paint(); return; }
      if (!animating) { animating = true; rafId = requestAnimationFrame(loop); }
    };

    size();
    start();
    window.addEventListener("resize", function () { size(); paint(); });

    if (finePointer && !reduce) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        px = e.clientX - r.left; py = e.clientY - r.top;
        if (coords) coords.textContent = "x " + pad(px) + "  y " + pad(py);
        if (!animating) paint();
      });
      hero.addEventListener("mouseleave", function () {
        px = -1; py = -1;
        if (coords) coords.textContent = "x 0000  y 0000";
        if (!animating) paint();
      });
    }
  }

  /* ---------- work reel: pinned horizontal scroll ---------- */

  var wrap = document.getElementById("reelWrap");
  var track = document.getElementById("reelTrack");
  var pinned = false, extra = 0;

  var layoutReel = function () {
    if (!wrap || !track) return;
    var small = window.matchMedia("(max-width: 900px)").matches;
    if (reduce || small) {
      pinned = false;
      wrap.style.height = "";
      track.style.transform = "";
      return;
    }
    pinned = true;
    extra = Math.max(0, track.scrollWidth - window.innerWidth);
    wrap.style.height = (window.innerHeight + extra) + "px";
    applyReel();
  };

  var applyReel = function () {
    if (!pinned || !wrap) return;
    var r = wrap.getBoundingClientRect();
    var total = wrap.offsetHeight - window.innerHeight;
    var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    track.style.transform = "translateX(" + (-extra * p).toFixed(1) + "px)";
  };

  if (wrap && track) {
    layoutReel();
    window.addEventListener("resize", layoutReel);
    document.addEventListener("scroll", function () { if (pinned) applyReel(); }, { passive: true });
  }

  /* ---------- animated FAQ ---------- */

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var summary = item.querySelector("summary");
    var body = item.querySelector("p");
    if (!summary || !body || reduce) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = item.hasAttribute("open");
      if (isOpen) {
        var h = body.offsetHeight;
        item.animate(
          [{ height: item.offsetHeight + "px" }, { height: item.offsetHeight - h + "px" }],
          { duration: 320, easing: "cubic-bezier(0.77, 0, 0.175, 1)" }
        ).onfinish = function () { item.removeAttribute("open"); };
      } else {
        item.setAttribute("open", "");
        var openH = body.offsetHeight;
        item.animate(
          [{ height: item.offsetHeight - openH + "px" }, { height: item.offsetHeight + "px" }],
          { duration: 360, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
        );
      }
    });
  });

  /* ---------- review form: opens the email app prefilled ---------- */

  var form = document.getElementById("reviewForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var rating = form.querySelector("input[name='rating']:checked");
      var name = document.getElementById("rvName");
      var site = document.getElementById("rvSite");
      var text = document.getElementById("rvText");
      var lines = [];
      lines.push("Rating: " + (rating ? rating.value : "") + "/5");
      lines.push("Name: " + (name ? name.value : ""));
      if (site && site.value) lines.push("Website: " + site.value);
      lines.push("");
      lines.push(text ? text.value : "");
      var href = "mailto:stephenfehon@gmail.com"
        + "?subject=" + encodeURIComponent("Review for stewiefeh studios")
        + "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = href;
      var done = form.querySelector(".review-done");
      if (done) done.hidden = false;
    });
  }
})();
