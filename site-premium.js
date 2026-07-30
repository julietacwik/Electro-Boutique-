(() => {
  const body = document.body;
  if (!body) return;

  const navContainer = document.querySelector(".menu-dropdown > .container");
  if (navContainer && !navContainer.querySelector(".navbar-brand")) {
    const brand = document.createElement("a");
    brand.href = "index.html";
    brand.className = "navbar-brand";
    brand.setAttribute("aria-label", "Electro Boutique - Inicio");
    brand.innerHTML = '<img src="logo-electro-boutique-transparente.png" alt="Electro Boutique" class="navbar-logo">';
    navContainer.prepend(brand);
  }

  const icons = {
    telefono: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92z"/>
      </svg>`,
    mail: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path d="m3 7 9 6 9-6"/>
      </svg>`,
    instagram: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1"/>
      </svg>`,
    whatsapp: `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .16 5.35.16 11.91c0 2.1.55 4.15 1.6 5.95L0 24l6.31-1.65a11.88 11.88 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.35 11.9-11.91 0-3.18-1.24-6.16-3.46-8.43Zm-8.45 18.3h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.38a9.87 9.87 0 0 1-1.51-5.23C2.17 6.45 6.61 2 12.07 2c2.63 0 5.1 1.03 6.96 2.89a9.79 9.79 0 0 1 2.88 6.97c0 5.46-4.45 9.91-9.84 9.91Zm5.43-7.41c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.92 8.92 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.54.72.31 1.29.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>
      </svg>`
  };

  const iconFor = (text) => {
    const key = text.toLowerCase();
    if (key.includes("mail") || key.includes("email")) return icons.mail;
    if (key.includes("insta")) return icons.instagram;
    if (key.includes("whats")) return icons.whatsapp;
    return icons.telefono;
  };

  const contactChannels = [
    {
      label: "TELÉFONO",
      value: "+54 9 11 3130-3223",
      href: "tel:+5491131303223",
      ariaLabel: "Llamar al +54 9 11 3130-3223"
    },
    {
      label: "MAIL",
      value: "eboutiqueventas@gmail.com",
      href: "mailto:eboutiqueventas@gmail.com",
      ariaLabel: "Enviar un correo a eboutiqueventas@gmail.com"
    },
    {
      label: "INSTAGRAM",
      value: "Instagram",
      href: "https://www.instagram.com/electroboutique_ar?igsh=MTVucmZvcDMxMnpoNw==",
      ariaLabel: "Visitar Instagram de Electro Boutique",
      external: true
    }
  ];

  const renderContactChannels = () => contactChannels.map((channel) => `
    <div class="sector-contact-card">
      <span class="sector-contact-icon" aria-hidden="true">${iconFor(channel.label)}</span>
      <div class="sector-contact-body">
        <span class="sector-contact-label">${channel.label}</span>
        <a
          class="sector-contact-value"
          href="${channel.href}"
          aria-label="${channel.ariaLabel}"
          ${channel.external ? 'target="_blank" rel="noopener noreferrer"' : ""}
        >${channel.value}</a>
      </div>
    </div>
  `).join("");

  const page = window.location.pathname.split("/").pop() || "index.html";
  body.dataset.page = page;

  if (document.querySelector(".menu-dropdown")) {
    body.classList.add("site-page");
  }

  const isDetailPage = /-\d{2}\.html$/i.test(page);
  const isCategoryPage = Boolean(document.querySelector(".hero-shell")) &&
    !isDetailPage &&
    !["index.html", "contacto.html", "sobre-nosotros.html", "admin.html"].includes(page);

  if (isCategoryPage) {
    body.classList.add("category-page");
  }

  if (page.startsWith("cocina")) {
    body.dataset.section = "cocina";
  } else if (page.startsWith("climatizacion")) {
    body.dataset.section = "climatizacion";
  } else if (page.startsWith("pequenos-electrodomesticos")) {
    body.dataset.section = "pequenos-electrodomesticos";
  } else {
    body.dataset.section = "general";
  }

  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    if (menu.querySelector('a[href="pequenos-electrodomesticos.html"]')) return;
    const contactItem = Array.from(menu.querySelectorAll("li")).find((li) => {
      const anchor = li.querySelector('a[href="contacto.html"]');
      return Boolean(anchor);
    });
    const newItem = document.createElement("li");
    newItem.innerHTML = '<a href="pequenos-electrodomesticos.html">Pequeños electrodomésticos</a>';
    if (contactItem) {
      menu.insertBefore(newItem, contactItem);
    } else {
      menu.appendChild(newItem);
    }
  });

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
    ],
    "pequenos-electrodomesticos.html": [
      { href: "#productos", label: "Ver productos" },
      { href: "contacto.html", label: "Consultar por WhatsApp" }
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
    "cocina.html": { sectionSelector: ".section-card", id: "categorias" },
    "pequenos-electrodomesticos.html": { sectionSelector: ".section-card", id: "productos" }
  };

  const targetConfig = heroIdTargets[page];
  if (targetConfig) {
    const section = document.querySelector(targetConfig.sectionSelector);
    if (section && !section.id) {
      section.id = targetConfig.id;
    }
  }

  let contactStrip = document.querySelector(".sector-contact");
  if (!contactStrip && body.classList.contains("category-page")) {
    const contactHost = document.querySelector("main .section-card");
    if (contactHost) {
      contactStrip = document.createElement("div");
      contactStrip.className = "sector-contact";
      contactHost.appendChild(contactStrip);
    }
  }

  if (contactStrip) {
    contactStrip.classList.add("premium-contact-strip");
    contactStrip.innerHTML = renderContactChannels();
  }

  document.querySelectorAll(".footer-card").forEach((footer) => {
    if (footer.querySelector(".footer-address")) return;
    const address = document.createElement("span");
    address.className = "footer-address";
    address.textContent = "Beethoven 789, Gral. Pacheco";
    footer.appendChild(address);
  });
})();
