(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- 导航 ---------- */
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");

  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "点击收起菜单" : "点击展开菜单");
    });
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mobileMenu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "点击展开菜单");
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1000 && mobileMenu.classList.contains("open")) {
        mobileMenu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "点击展开菜单");
      }
    });
  }

  /* ---------- 滚动显现 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- 界面图册（手动切换） ---------- */
  var gallery = document.getElementById("gallery");
  if (gallery) {
    var slides = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-slide"));
    var dots = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-dots button"));
    var galleryCaption = gallery.querySelector(".gallery-caption");
    var galleryCount = gallery.querySelector(".gallery-count b");
    var current = 0;

    function paintGallery() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
        slide.setAttribute("aria-hidden", i === current ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-current", i === current ? "true" : "false");
      });
      if (galleryCaption) galleryCaption.textContent = slides[current].getAttribute("data-caption") || "";
      if (galleryCount) galleryCount.textContent = ("0" + (current + 1)).slice(-2);
    }

    function stepGallery(step) {
      current = (current + step + slides.length) % slides.length;
      paintGallery();
    }

    var galleryPrev = gallery.querySelector(".gallery-prev");
    var galleryNext = gallery.querySelector(".gallery-next");
    if (galleryPrev) galleryPrev.addEventListener("click", function () { stepGallery(-1); });
    if (galleryNext) galleryNext.addEventListener("click", function () { stepGallery(1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        current = i;
        paintGallery();
      });
    });
    gallery.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepGallery(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepGallery(1);
      }
    });
    paintGallery();
  }

  /* ---------- 打赏弹窗 ---------- */
  var donateBtn = document.getElementById("donateBtn");
  var donateModal = document.getElementById("donateModal");
  if (donateBtn && donateModal) {
    var donateClose = donateModal.querySelector(".donate-close");
    var donateTimer = null;

    function openDonate() {
      if (donateTimer) {
        clearTimeout(donateTimer);
        donateTimer = null;
      }
      donateModal.hidden = false;
      // 强制一次重排，保证过渡动画从初始态开始
      donateModal.getBoundingClientRect();
      donateModal.classList.add("is-open");
      document.body.classList.add("donate-lock");
      if (donateClose) donateClose.focus();
    }

    function closeDonate() {
      donateModal.classList.remove("is-open");
      document.body.classList.remove("donate-lock");
      donateTimer = setTimeout(function () {
        donateModal.hidden = true;
        donateTimer = null;
      }, 260);
      donateBtn.focus();
    }

    donateBtn.addEventListener("click", openDonate);

    Array.prototype.forEach.call(
      donateModal.querySelectorAll("[data-donate-close]"),
      function (el) {
        el.addEventListener("click", closeDonate);
      }
    );

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !donateModal.hidden) closeDonate();
    });

    /* 支付方式切换：胶囊 tab + 左右滑动 */
    var donateSlider = document.getElementById("donateSlider");
    var donateTrack = document.getElementById("donateTrack");
    var donateTabs = document.getElementById("donateTabs");
    var donateFoot = document.getElementById("donateFoot");
    var donateSlides = donateTrack ? donateTrack.querySelectorAll(".donate-slide") : [];
    var donateTabBtns = donateTabs ? donateTabs.querySelectorAll(".donate-tab") : [];
    var donateFootText = ["支付宝扫码 · 金额随意", "微信扫码 · 金额随意"];
    var payIndex = 0;
    var payCount = donateSlides.length;

    function setPay(index, animate) {
      if (!donateTrack || !payCount) return;
      if (index < 0) index = 0;
      if (index > payCount - 1) index = payCount - 1;
      payIndex = index;
      if (!animate) {
        donateTrack.style.transition = "none";
        donateTrack.style.transform = "translateX(" + (-index * 100) + "%)";
        donateTrack.getBoundingClientRect();
        donateTrack.style.transition = "";
      } else {
        donateTrack.style.transform = "translateX(" + (-index * 100) + "%)";
      }
      Array.prototype.forEach.call(donateTabBtns, function (btn, i) {
        btn.classList.toggle("is-active", i === index);
        btn.setAttribute("aria-selected", i === index ? "true" : "false");
      });
      Array.prototype.forEach.call(donateSlides, function (slide, i) {
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      if (donateTabs) donateTabs.setAttribute("data-index", String(index));
      if (donateFoot) donateFoot.textContent = donateFootText[index];
    }

    Array.prototype.forEach.call(donateTabBtns, function (btn, i) {
      btn.addEventListener("click", function () { setPay(i, true); });
    });

    if (donateTabs) {
      donateTabs.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        setPay(payIndex + (e.key === "ArrowRight" ? 1 : -1), true);
        if (donateTabBtns[payIndex]) donateTabBtns[payIndex].focus();
      });
    }

    if (donateSlider && donateTrack && payCount > 1) {
      var startX = 0;
      var startY = 0;
      var startTime = 0;
      var axis = "";
      var dragging = false;

      donateSlider.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragging = true;
        axis = "";
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        donateTrack.style.transition = "none";
        if (donateSlider.setPointerCapture) donateSlider.setPointerCapture(e.pointerId);
      });

      donateSlider.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (!axis) {
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        }
        if (axis !== "x") return;
        // 首屏右滑 / 末屏左滑时加阻尼，避免拖出空白
        var atEdge = (payIndex === 0 && dx > 0) || (payIndex === payCount - 1 && dx < 0);
        var offset = atEdge ? dx * 0.3 : dx;
        donateTrack.style.transform =
          "translateX(calc(" + (-payIndex * 100) + "% + " + offset + "px))";
        if (e.cancelable) e.preventDefault();
      });

      function endDonateDrag(e) {
        if (!dragging) return;
        dragging = false;
        donateTrack.style.transition = "";
        var dx = e.clientX - startX;
        var elapsed = Date.now() - startTime;
        var isQuick = elapsed < 260 && Math.abs(dx) > 22;
        var isFar = Math.abs(dx) > 56;
        var target = payIndex;
        if (axis === "x" && (isQuick || isFar)) {
          target = dx < 0 ? payIndex + 1 : payIndex - 1;
        }
        axis = "";
        setPay(target, true);
      }

      donateSlider.addEventListener("pointerup", endDonateDrag);
      donateSlider.addEventListener("pointercancel", endDonateDrag);
      donateSlider.addEventListener("lostpointercapture", function () {
        if (!dragging) return;
        dragging = false;
        donateTrack.style.transition = "";
        setPay(payIndex, true);
      });
    }
  }

  /* ---------- FAQ 单开折叠（带缓动动画） ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-list details"));
  if (faqItems.length) {
    var faqReduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var FAQ_DURATION = faqReduceMotion ? 0 : 360;

    function faqBody(item) {
      return item.querySelector(".faq-body");
    }

    function faqClearTimer(item) {
      if (item._faqTimer) {
        clearTimeout(item._faqTimer);
        item._faqTimer = null;
      }
    }

    function faqExpand(item) {
      var body = faqBody(item);
      if (!body || item._faqState === "open") return;
      faqClearTimer(item);
      item.open = true;
      item.classList.add("is-open");
      body.style.height = "0px";
      if (faqReduceMotion) {
        body.style.height = "auto";
        item._faqState = "open";
        return;
      }
      var target = body.scrollHeight;
      void body.offsetHeight;
      body.style.height = target + "px";
      item._faqState = "open";
      item._faqTimer = setTimeout(function () {
        item._faqTimer = null;
        if (item._faqState === "open") body.style.height = "auto";
      }, FAQ_DURATION);
    }

    function faqCollapse(item) {
      var body = faqBody(item);
      if (!body || !item.open || item._faqState === "closed") return;
      faqClearTimer(item);
      item.classList.remove("is-open");
      if (faqReduceMotion) {
        item.open = false;
        item._faqState = "closed";
        body.style.height = "0px";
        return;
      }
      body.style.height = body.scrollHeight + "px";
      void body.offsetHeight;
      body.style.height = "0px";
      item._faqState = "closed";
      item._faqTimer = setTimeout(function () {
        item._faqTimer = null;
        if (item._faqState === "closed") item.open = false;
      }, FAQ_DURATION);
    }

    faqItems.forEach(function (item) {
      item._faqState = item.open ? "open" : "closed";
      // 默认展开的项（HTML 上的 open）需要同步 is-open，标题才是展开态配色
      if (item.open) item.classList.add("is-open");
      var body = faqBody(item);
      if (body) body.style.height = item.open ? "auto" : "0px";

      var summary = item.querySelector("summary");
      if (!summary) return;
      summary.addEventListener("click", function (e) {
        // 交给我们自己控制展开/收起，避免原生 details 无动画瞬开
        e.preventDefault();
        if (item._faqState === "open") {
          faqCollapse(item);
          return;
        }
        faqItems.forEach(function (other) {
          if (other !== item) faqCollapse(other);
        });
        faqExpand(item);
      });
    });

    // 收起答案会让文档变矮。页面若已滚到底部，浏览器会把 scrollY 往回夹，
    // 视口整体下移，正好抵消收起方向，表现为「第一条往下沉、整块 FAQ 不动」。
    // 这里用 min-height 把加载时的高度兜住，收起时文档不再变矮，就没有夹紧位移。
    var faqList = document.querySelector(".faq-list");
    function reserveFaqHeight() {
      if (!faqList) return;
      faqList.style.minHeight = "";
      faqList.style.minHeight = faqList.getBoundingClientRect().height + "px";
    }
    reserveFaqHeight();
    window.addEventListener("resize", function () {
      setTimeout(reserveFaqHeight, 120);
    });
  }

  /* ---------- 版本信息（自动读取 apk/release.json） ---------- */
  function formatSize(bytes) {
    if (typeof bytes !== "number" || bytes <= 0) return "";
    var mb = bytes / 1048576;
    if (mb >= 1) return mb.toFixed(1) + " MB";
    return Math.round(bytes / 1024) + " KB";
  }

  function setAll(key, value) {
    if (!value) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-rel="' + key + '"]'), function (el) {
      el.textContent = value;
    });
  }

  function downloadLinks(file) {
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="apk/modelkey-latest.apk"]'), function (a) {
      a.setAttribute("href", "apk/" + file);
      if (a.hasAttribute("download")) a.setAttribute("download", file);
    });
  }

  function renderRelease(data) {
    var latest = data && data.latest ? data.latest : null;
    if (!latest) return;
    setAll("version", /^[vV]?\d/.test(latest.version) ? "v" + String(latest.version).replace(/^[vV]/, "") : latest.version);
    setAll("date", latest.releaseDate);
    setAll("size", formatSize(latest.sizeBytes));
    setAll("platform", latest.platform || "Android 8.1+ / WearOS");
    var file = latest.file || latest.fileName;
    if (file) downloadLinks(file);
  }

  if (window.fetch) {
    fetch("apk/release.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(renderRelease)
      .catch(function (err) {
        // 本地 file:// 打开或接口不可用时，保留 HTML 内置的默认版本信息
        console.info("[Model Key] 未能读取版本配置，使用内置默认值：", err.message);
      });
  }

  /* ---------- 年份 ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
