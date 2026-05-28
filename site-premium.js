(() => {
  const body = document.body;
  if (!body) return;

  const page = window.location.pathname.split("/").pop() || "index.html";
  body.dataset.page = page;

  if (page.startsWith("cocina")) {
    body.dataset.section = "cocina";
  } else if (page.startsWith("climatizacion")) {
    body.dataset.section = "climatizacion";
  } else {
    body.dataset.section = "general";
  }

  const hero = document.querySelector(".hero-shell");
  if (hero) {
    hero.classList.add("premium-hero-shell");
  }

  const heroCtas = {
    "cocina.html": [
      { href: "#categorias", label: "Ver categorias" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "climatizacion.html": [
      { href: "#destacados-clima", label: "Ver equipos" },
      { href: "contacto.html", label: "Solicitar asesoramiento" }
    ],
    "cocina-bosch.html": [
      { href: "#lineas-bosch", label: "Ver linea Bosch" },
      { href: "contacto.html", label: "Consultar disponibilidad" }
    ],
    "cocina-samsung.html": [
      { href: "contacto.html", label: "Consultar linea Samsung" },
      { href: "cocina.html", label: "Volver a cocina" }
    ],
    "cocina-bosch-anafes.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "cocina-bosch-campana.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "cocina-bosch-heladeras.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "cocina-bosch-hornos.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "cocina-bosch-lavavajillas.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "cocina-bosch-microondas.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
    ],
    "climatizacion-multisplit.html": [
      { href: "#productos", label: "Ver equipos" },
      { href: "contacto.html", label: "Solicitar asesoramiento" }
    ],
    "climatizacion-piso-techo.html": [
      { href: "#productos", label: "Ver equipos" },
      { href: "contacto.html", label: "Solicitar asesoramiento" }
    ],
    "climatizacion-baja-silueta.html": [
      { href: "#productos", label: "Ver equipo" },
      { href: "contacto.html", label: "Solicitar asesoramiento" }
    ]
  };

  const heroCopyAnchor =
    hero?.querySelector(".lead") ||
    hero?.querySelector("p") ||
    hero?.querySelector("h1");

  if (hero && heroCopyAnchor && heroCtas[page] && !hero.querySelector(".premium-hero-actions")) {
    const actions = document.createElement("div");
    actions.className = "premium-hero-actions";

    heroCtas[page].forEach((cta) => {
      const link = document.createElement("a");
      link.href = cta.href;
      link.textContent = cta.label;
      actions.appendChild(link);
    });

    heroCopyAnchor.insertAdjacentElement("afterend", actions);
  }

  const heroIdTargets = {
    "cocina-bosch.html": { sectionSelector: ".section-card", id: "lineas-bosch" },
    "climatizacion.html": { sectionSelector: ".section-card", id: "destacados-clima" },
    "cocina-bosch-anafes.html": { sectionSelector: ".section-card", id: "productos" },
    "cocina-bosch-campana.html": { sectionSelector: ".section-card", id: "productos" },
    "cocina-bosch-heladeras.html": { sectionSelector: ".section-card", id: "productos" },
    "cocina-bosch-hornos.html": { sectionSelector: ".section-card", id: "productos" },
    "cocina-bosch-lavavajillas.html": { sectionSelector: ".section-card", id: "productos" },
    "cocina-bosch-microondas.html": { sectionSelector: ".section-card", id: "productos" },
    "climatizacion-multisplit.html": { sectionSelector: ".section-card", id: "productos" },
    "climatizacion-piso-techo.html": { sectionSelector: ".section-card", id: "productos" },
    "climatizacion-baja-silueta.html": { sectionSelector: ".section-card", id: "productos" },
    "cocina.html": { sectionSelector: ".section-card", id: "categorias" }
  };

  const targetConfig = heroIdTargets[page];
  if (targetConfig) {
    const section = document.querySelector(targetConfig.sectionSelector);
    if (section && !section.id) {
      section.id = targetConfig.id;
    }
  }
})();
