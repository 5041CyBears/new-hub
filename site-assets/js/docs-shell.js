(function () {
  "use strict";

  /* =========================================================
     Site Root and Manifest
     ========================================================= */

  function getSiteRoot() {
    const scripts = [...document.scripts];
    const shellScript = scripts.find((script) =>
      /docs-shell\.js(?:\?|$)/.test(script.src)
    );

    return shellScript
      ? new URL("../../", shellScript.src)
      : new URL("./", location.href);
  }

  const root = getSiteRoot();
  const manifest = (window.TRAINING_SITE_MANIFEST || {}).modules || [];
  const isHomePage = document.body.dataset.page === "home";
  const program = document.body.dataset.program || "FRC";
  const slug = document.body.dataset.moduleSlug || "";

  const meta =
    manifest.find(
      (module) => module.program === program && module.slug === slug
    ) ||
    manifest.find(
      (module) => new URL(module.path, root).pathname === location.pathname
    ) ||
    {};


  /* =========================================================
     Completion Tracking
     ========================================================= */

  function completionKey(module) {
    return "5041-training-complete:" + module.path;
  }

  function isDone(module) {
    return localStorage.getItem(completionKey(module)) === "1";
  }

  function markCurrentModuleDone() {
    if (!meta.path) {
      return;
    }

    localStorage.setItem(completionKey(meta), "1");
    updateDoneStates();
  }

  function updateDoneStates() {
    document.querySelectorAll("[data-module-path]").forEach((element) => {
      const module = manifest.find(
        (item) => item.path === element.dataset.modulePath
      );

      if (module) {
        element.classList.toggle("done", isDone(module));
      }
    });
  }


  /* =========================================================
     Small DOM Helpers
     ========================================================= */

  function make(tag, className = "", text = null) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== null) {
      element.textContent = text;
    }

    return element;
  }

  function makeLink(href, className = "", text = "") {
    const anchor = make("a", className, text);
    anchor.href = href;
    return anchor;
  }


  /* =========================================================
     Header
     ========================================================= */

  function buildHeader() {
    const header = make("header", "docs-site-header");
    const inner = make("div", "docs-header-inner");

    const menuButton = make("button", "docs-menu-button", "Menu");
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", "Open training navigation");
    menuButton.addEventListener("click", () => {
      document.body.classList.toggle("docs-nav-open");
    });

    const brand = makeLink(new URL("index.html", root), "docs-brand");
    const logo = document.createElement("img");
    logo.src = new URL("shared/assets/5041teamlogo.png", root);
    logo.alt = "5041 CyBears";

    const brandCopy = make("span", "docs-brand-copy");
    brandCopy.append(
      make("span", "docs-brand-title", "5041 CyBears Training"),
      make(
        "span",
        "docs-brand-subtitle",
        "Documentation & Certification"
      )
    );

    brand.append(logo, brandCopy);

    const pillText = isHomePage ? "Training Home" : program + " Training";

    inner.append(
      menuButton,
      brand,
      make("span", "docs-header-spacer"),
      make("span", "docs-program-pill", pillText)
    );

    header.append(inner);
    return header;
  }


  /* =========================================================
     Sidebar Navigation
     ========================================================= */

  function buildSidebar() {
    const sidebar = make("aside", "docs-sidebar");

    const search = document.createElement("input");
    search.className = "docs-search";
    search.type = "search";
    search.placeholder = "Filter modules…";
    search.setAttribute("aria-label", "Filter training modules");
    sidebar.append(search);

    /* Training home */
    const homeGroup = make("nav", "docs-nav-group docs-nav-home-group");
    homeGroup.append(make("div", "docs-nav-heading", "Getting Started"));

    const homeLink = makeLink(
      new URL("index.html", root),
      "docs-nav-link",
      "Training Overview"
    );

    if (isHomePage) {
      homeLink.classList.add("active");
    }

    homeGroup.append(homeLink);
    sidebar.append(homeGroup);

    /* FRC and FTC module groups */
    ["FRC", "FTC"].forEach((programName) => {
      const programModules = manifest.filter(
        (module) => module.program === programName
      );

      if (!programModules.length) {
        return;
      }

      const programGroup = make("nav", "docs-nav-group");
      programGroup.dataset.program = programName;
      programGroup.append(
        make("div", "docs-nav-heading", programName + " Training")
      );

      const categories = new Map();

      programModules.forEach((module) => {
        const category = module.category || "Other";

        if (!categories.has(category)) {
          categories.set(category, []);
        }

        categories.get(category).push(module);
      });

      categories.forEach((modules, categoryName) => {
        const category = make("div", "docs-nav-category");
        category.dataset.category = categoryName;
        category.append(
          make("div", "docs-nav-category-heading", categoryName)
        );

        modules.forEach((module) => {
          const moduleLink = makeLink(
            new URL(module.path, root),
            "docs-nav-link docs-nav-module-link",
            module.title
          );

          moduleLink.dataset.modulePath = module.path;

          if (module.path === meta.path) {
            moduleLink.classList.add("active");
          }

          if (isDone(module)) {
            moduleLink.classList.add("done");
          }

          category.append(moduleLink);
        });

        programGroup.append(category);
      });

      sidebar.append(programGroup);
    });

    /* Filter the sidebar while keeping category/program headings useful. */
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();

      sidebar.querySelectorAll(".docs-nav-group").forEach((group) => {
        if (group.classList.contains("docs-nav-home-group")) {
          group.hidden = Boolean(query) && !"training overview".includes(query);
          return;
        }

        const programName = (group.dataset.program || "").toLowerCase();
        const programMatches = Boolean(query) && programName.includes(query);
        let visibleCategories = 0;

        group.querySelectorAll(".docs-nav-category").forEach((category) => {
          const categoryName = (category.dataset.category || "").toLowerCase();
          const categoryMatches =
            Boolean(query) && categoryName.includes(query);
          let visibleLinks = 0;

          category.querySelectorAll(".docs-nav-link").forEach((moduleLink) => {
            const moduleMatches = moduleLink.textContent
              .toLowerCase()
              .includes(query);

            const show =
              !query || programMatches || categoryMatches || moduleMatches;

            moduleLink.hidden = !show;

            if (show) {
              visibleLinks += 1;
            }
          });

          category.hidden = visibleLinks === 0;

          if (!category.hidden) {
            visibleCategories += 1;
          }
        });

        group.hidden = visibleCategories === 0;
      });
    });

    /* Close the mobile drawer after choosing a link. */
    sidebar.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        document.body.classList.remove("docs-nav-open");
      }
    });

    return sidebar;
  }


  /* =========================================================
     Module Section Preparation
     ========================================================= */

  function prepareRevealSections() {
    const sections = [...document.querySelectorAll(".reveal .slides section")];
    let generatedId = 0;

    sections.forEach((section) => {
      const hasChildSection = Boolean(
        section.querySelector(":scope > section")
      );

      section.classList.add(
        hasChildSection ? "docs-section-group" : "docs-page-section"
      );

      if (!hasChildSection && !section.id) {
        generatedId += 1;
        section.id = "section-" + generatedId;
      }
    });

    return sections.filter((section) =>
      section.classList.contains("docs-page-section")
    );
  }

  function prepareHomeSections() {
    return [...document.querySelectorAll("#docs-home-content > section")];
  }

  function sectionLabel(section) {
    const tag = section.querySelector(":scope > .tag");
    const heading = section.querySelector(
      ":scope > h1, :scope > h2, :scope > h3"
    );

    let title =
      (tag && tag.textContent.trim()) ||
      (heading && heading.textContent.trim()) ||
      "";

    if (!title && section.id === "complete") {
      title = "Completion Certificate";
    }

    if (!title && section.id && /^quiz-q\d+$/i.test(section.id)) {
      title = "Quiz";
    }

    return title.replace(/\s+/g, " ").trim();
  }


  /* =========================================================
     Right-Side Table of Contents
     ========================================================= */

  function buildToc(sections) {
    const toc = make("aside", "docs-toc");
    toc.append(make("div", "docs-toc-title", "On this page"));

    const seen = new Set();

    sections.forEach((section) => {
      if (section.id && /^quiz-q\d+$/i.test(section.id)) {
        return;
      }

      const label = sectionLabel(section);

      if (!section.id || !label || seen.has(label)) {
        return;
      }

      seen.add(label);
      toc.append(makeLink("#" + section.id, "", label));
    });

    return toc;
  }


  /* =========================================================
     Certificate Lock and Completion State
     ========================================================= */

  function addLockBanner() {
    const completeSection = document.getElementById("complete");

    if (!completeSection) {
      return;
    }

    let banner = completeSection.querySelector(".docs-lock-banner");

    if (!banner) {
      banner = make(
        "div",
        "docs-lock-banner",
        "Certificate locked — complete the quiz and earn the required passing score to unlock it."
      );

      completeSection.insertBefore(banner, completeSection.firstChild);
    }

    const syncCompletion = () => {
      if (!completeSection.classList.contains("locked")) {
        markCurrentModuleDone();
      }
    };

    new MutationObserver(syncCompletion).observe(completeSection, {
      attributes: true,
      attributeFilter: ["class"]
    });

    syncCompletion();
  }


  /* =========================================================
     Reading Progress
     ========================================================= */

  function buildReadingProgress() {
    const progressBox = make("div", "docs-progress");
    const label = make("span", "", "Reading progress");
    const track = make("span", "docs-progress-bar");
    const fill = make("span");
    const percentage = make("span", "", "0%");

    track.append(fill);
    progressBox.append(label, track, percentage);

    const update = () => {
      const article = document.querySelector(".docs-article");

      if (!article) {
        return;
      }

      const rect = article.getBoundingClientRect();
      const total = Math.max(1, article.scrollHeight - innerHeight * 0.45);
      const scrolled = Math.min(total, Math.max(0, -rect.top + 100));
      const progress = Math.round((scrolled / total) * 100);

      fill.style.width = progress + "%";
      percentage.textContent = progress + "%";
    };

    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    setTimeout(update, 50);

    return progressBox;
  }


  /* =========================================================
     Previous / Next Module Links
     ========================================================= */

  function buildNextPrev() {
    const programModules = manifest.filter(
      (module) => module.program === program
    );

    const currentIndex = programModules.findIndex(
      (module) => module.path === meta.path
    );

    const wrapper = make("nav", "docs-nextprev");
    const previous = currentIndex > 0 ? programModules[currentIndex - 1] : null;
    const next =
      currentIndex >= 0 && currentIndex < programModules.length - 1
        ? programModules[currentIndex + 1]
        : null;

    function navigationLink(module, direction) {
      if (!module) {
        return make("span");
      }

      const anchor = makeLink(new URL(module.path, root), "", module.title);
      anchor.prepend(make("small", "", direction));
      return anchor;
    }

    wrapper.append(
      navigationLink(previous, "Previous module"),
      navigationLink(next, "Next module")
    );

    return wrapper;
  }


  /* =========================================================
     Breadcrumbs
     ========================================================= */

  function buildBreadcrumbs() {
    const breadcrumbs = make("div", "docs-breadcrumbs");

    if (isHomePage) {
      breadcrumbs.textContent = "5041 CyBears / Training";
      return breadcrumbs;
    }

    breadcrumbs.append(
      makeLink(new URL("index.html", root), "", "Training"),
      document.createTextNode(" / "),
      makeLink(
        new URL("index.html#" + program.toLowerCase(), root),
        "",
        program
      ),
      document.createTextNode(" / " + (meta.title || document.title))
    );

    return breadcrumbs;
  }


  /* =========================================================
     Active Table-of-Contents Tracking
     ========================================================= */

  function watchActiveSection(sections) {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const anchors = [...document.querySelectorAll(".docs-toc a")];

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);

        if (!visibleEntry) {
          return;
        }

        anchors.forEach((anchor) => {
          anchor.classList.toggle(
            "active",
            anchor.getAttribute("href") === "#" + visibleEntry.target.id
          );
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  }


  /* =========================================================
     Build the Shared GitBook-Style Shell
     ========================================================= */

  function run() {
    if (document.body.dataset.docsShellReady === "true") {
      return;
    }

    document.body.dataset.docsShellReady = "true";
    document.body.classList.add("docs-module");

    const reveal = document.querySelector(".reveal");
    const homeContent = document.getElementById("docs-home-content");

    if (!isHomePage && !reveal) {
      console.warn("5041 training shell: no Reveal module content was found.");
      return;
    }

    if (isHomePage && !homeContent) {
      console.warn("5041 training shell: no landing-page content was found.");
      return;
    }

    const sections = isHomePage
      ? prepareHomeSections()
      : prepareRevealSections();

    const header = buildHeader();
    const sidebar = buildSidebar();
    const toc = buildToc(sections);
    const layout = make("div", "docs-layout");
    const main = make("main", "docs-main");
    const article = make(
      "article",
      isHomePage ? "docs-article docs-home-article" : "docs-article"
    );

    main.append(buildBreadcrumbs());

    if (isHomePage) {
      article.append(...homeContent.children);
      homeContent.remove();
      main.append(article);
    } else {
      main.append(
        make("h1", "docs-page-title", meta.title || document.title)
      );

      if (meta.description) {
        main.append(make("p", "docs-lead", meta.description));
      }

      main.append(buildReadingProgress());
      article.append(reveal);
      main.append(article, buildNextPrev());
    }

    layout.append(sidebar, main, toc);
    document.body.prepend(header);
    document.body.insertBefore(layout, header.nextSibling);

    if (!isHomePage) {
      addLockBanner();
    }

    updateDoneStates();
    watchActiveSection(sections);
  }


  /* =========================================================
     Initialize
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
