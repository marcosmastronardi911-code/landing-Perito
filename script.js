/* =========================================================
   CONFIGURACIÓN
   Cambie este número por el suyo: código de país + código de área + número,
   todo junto y sin signos ni espacios. Ejemplo Argentina (celular): 5491112345678
   ========================================================= */
const WHATSAPP_NUMBER = "5491134950797";


(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Enlaces de WhatsApp ---------- */
  document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
    var message = link.getAttribute("data-msg") || "Hola, quisiera recibir asesoramiento.";
    link.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  /* ---------- Año del pie ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Título de portada palabra por palabra ---------- */
  var split = document.querySelector("[data-split]");
  if (split && !reduceMotion) {
    var words = split.textContent.trim().split(/\s+/);
    var accentFrom = words.length - 2; // "proceso judicial" en cursiva latón
    split.setAttribute("aria-label", words.join(" "));
    split.innerHTML = words.map(function (w, i) {
      var cls = "w" + (i >= accentFrom ? " w-accent" : "");
      return '<span class="' + cls + '" style="--i:' + i + '" aria-hidden="true">' + w + "</span>";
    }).join(" ");
  }

  /* ---------- Menú móvil ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });

    document.addEventListener("click", function (e) {
      if (!header.contains(e.target)) setMenu(false);
    });

    window.matchMedia("(min-width: 821px)").addEventListener("change", function () {
      setMenu(false);
    });
  }

  /* ---------- Desplazamiento: encabezado, progreso, botón flotante, parallax ---------- */
  var hero = document.querySelector(".hero");
  var bar = document.querySelector(".progress-bar");
  var floatBtn = document.querySelector(".wa-float");
  var parallax = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("is-scrolled", y > 8);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";

    if (floatBtn) {
      var limit = hero ? hero.offsetHeight * 0.6 : 300;
      floatBtn.classList.toggle("is-shown", y > limit);
    }

    var vh = window.innerHeight;
    parallax.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
      var offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- Aparición de contenido al desplazarse ---------- */
  var reveals = document.querySelectorAll(".reveal");

  function settle(el) {
    // cuando termina la entrada, se quita el retardo para que el hover responda al instante
    el.addEventListener("transitionend", function done(e) {
      if (e.target !== el || e.propertyName !== "opacity") return;
      el.classList.remove("reveal", "reveal-scale");
      el.removeEventListener("transitionend", done);
    });
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        settle(entry.target);
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Luz que sigue al cursor en las tarjetas ---------- */
  if (finePointer) {
    document.querySelectorAll("[data-spotlight]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Enlace activo según la sección visible ---------- */
  var links = document.querySelectorAll(".nav-link");
  var sections = [];
  links.forEach(function (link) {
    var target = document.querySelector(link.getAttribute("href"));
    if (target) sections.push({ link: link, el: target });
  });

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          sections.forEach(function (s) {
            s.link.classList.toggle("is-active", s.el === entry.target);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { observer.observe(s.el); });
  }
})();
