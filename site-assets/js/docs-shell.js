(function () {
  "use strict";

  /* =========================================================
     Resolve Site Root
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


  /* =========================================================
     Site Data
     ========================================================= */

  const root = getSiteRoot();

  const manifest =
    (window.TRAINING_SITE_MANIFEST || {}).modules || [];

  const resourceManifest =
    (window.TRAINING_SITE_MANIFEST || {}).resources || [];

  const isHomePage =
    document.body.dataset.page === "home";

  const isResourcePage =
    document.body.dataset.page === "resource";

  const program =
    document.body.dataset.program || "FRC";

  const slug =
    document.body.dataset.moduleSlug || "";


  /* =========================================================
     Find Current Module
     ========================================================= */

  const meta =
    manifest.find(
      (module) =>
        module.program === program &&
        module.slug === slug
    ) ||

    manifest.find(
      (module) =>
        new URL(module.path, root).pathname ===
        location.pathname
    ) ||

    {};

  const resourceMeta =
    resourceManifest.find(
      (resource) =>
        new URL(resource.path, root).pathname ===
        location.pathname
    ) ||

    {};

  const isComingSoonModule =
    Boolean(meta.comingSoon);


  /* =========================================================
     Storage Keys
     ========================================================= */

  const sidebarScrollKey =
    "5041-training-sidebar-scroll";


  /* =========================================================
     Completion Tracking
     ========================================================= */

  function completionKey(module) {
    return (
      "5041-training-complete:" +
      module.path
    );
  }


  function isDone(module) {
    return (
      localStorage.getItem(
        completionKey(module)
      ) === "1"
    );
  }


  function markCurrentModuleDone() {
    if (!meta.path) {
      return;
    }

    localStorage.setItem(
      completionKey(meta),
      "1"
    );

    updateDoneStates();
  }


  function updateDoneStates() {
    document
      .querySelectorAll("[data-module-path]")
      .forEach((element) => {

        const module = manifest.find(
          (item) =>
            item.path ===
            element.dataset.modulePath
        );

        if (module) {
          element.classList.toggle(
            "done",
            isDone(module)
          );
        }

      });
  }


  /* =========================================================
     Sidebar Scroll Position
     ========================================================= */

  function saveSidebarScroll(sidebar) {
    if (!sidebar) {
      return;
    }

    sessionStorage.setItem(
      sidebarScrollKey,
      String(sidebar.scrollTop)
    );
  }


  function restoreSidebarScroll(sidebar) {
    if (!sidebar) {
      return false;
    }

    const savedPosition =
      sessionStorage.getItem(
        sidebarScrollKey
      );

    if (savedPosition === null) {
      return false;
    }

    requestAnimationFrame(() => {
      sidebar.scrollTop =
        Number(savedPosition) || 0;
    });

    return true;
  }


  function showActiveModuleIfNeeded(sidebar) {
    if (!sidebar) {
      return;
    }

    const activeLink =
      sidebar.querySelector(
        ".docs-nav-link.active"
      );

    if (!activeLink) {
      return;
    }

    requestAnimationFrame(() => {
      activeLink.scrollIntoView({
        block: "nearest"
      });
    });
  }


  /* =========================================================
     Small DOM Helpers
     ========================================================= */

  function make(tag, className = "", text = null) {
    const element =
      document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== null) {
      element.textContent = text;
    }

    return element;
  }


  function makeLink(href, className = "", text = "") {
    const anchor =
      make("a", className, text);

    anchor.href = href;

    return anchor;
  }


  function buildComingSoonBadge(inline = false) {
    return make(
      "span",
      inline
        ? "docs-coming-soon-badge docs-coming-soon-badge-inline"
        : "docs-coming-soon-badge",
      "Coming Soon"
    );
  }


  function decorateComingSoonLink(link) {
    link.classList.add("coming-soon");
    link.append(buildComingSoonBadge());
    return link;
  }


  function buildModulePageTitle() {
    const title =
      make(
        "h1",
        "docs-page-title",
        meta.title || document.title
      );

    if (isComingSoonModule) {
      title.append(
        document.createTextNode(" "),
        buildComingSoonBadge(true)
      );
    }

    return title;
  }


  function applyComingSoonState(main, article, toc) {
    document.body.classList.add(
      "docs-coming-soon-module"
    );

    main.classList.add(
      "docs-coming-soon-main"
    );

    article.classList.add(
      "docs-coming-soon-article"
    );

    const progress =
      main.querySelector(
        ".docs-progress"
      );

    if (progress) {
      progress.remove();
    }

    if (toc) {
      toc.hidden = true;
    }

    const notice =
      make(
        "div",
        "docs-coming-soon-notice"
      );

    notice.append(
      make(
        "div",
        "docs-coming-soon-notice-title",
        "Coming Soon"
      ),
      make(
        "p",
        "docs-coming-soon-notice-text",
        "This training module is still being finalized. The content is temporarily blurred while the full version is completed."
      )
    );

    const lead =
      main.querySelector(
        ".docs-lead"
      );

    if (lead) {
      lead.insertAdjacentElement(
        "afterend",
        notice
      );
    }
    else {
      main.append(notice);
    }

    const overlay =
      make(
        "div",
        "docs-coming-soon-overlay"
      );

    overlay.append(
      make(
        "div",
        "docs-coming-soon-overlay-title",
        "Coming Soon"
      ),
      make(
        "p",
        "docs-coming-soon-overlay-text",
        "This module is under development."
      )
    );

    article.append(overlay);
  }


  /* =========================================================
     Header
     ========================================================= */

  function buildHeader() {
    const header =
      make(
        "header",
        "docs-site-header"
      );

    const inner =
      make(
        "div",
        "docs-header-inner"
      );


    /* -------------------------------------------------------
       Mobile Menu Button
       ------------------------------------------------------- */

    const menuButton =
      make(
        "button",
        "docs-menu-button",
        "Menu"
      );

    menuButton.type = "button";

    menuButton.setAttribute(
      "aria-label",
      "Open training navigation"
    );

    menuButton.addEventListener(
      "click",
      () => {
        document.body.classList.toggle(
          "docs-nav-open"
        );
      }
    );


    /* -------------------------------------------------------
       Brand and Logo
       ------------------------------------------------------- */

    const brand =
      makeLink(
        new URL("index.html", root),
        "docs-brand"
      );

    const logo =
      document.createElement("img");

    /*
     * The cleaned site stores the shared 5041 logo here.
     * Keeping this relative to the site root makes it work
     * from both the landing page and nested module pages.
     */
    logo.src =
      new URL(
        "shared/assets/5041teamlogo.png",
        root
      );

    logo.alt =
      "5041 CyBears";


    const brandCopy =
      make(
        "span",
        "docs-brand-copy"
      );

    brandCopy.append(
      make(
        "span",
        "docs-brand-title",
        "5041 FIRST Programs"
      ),

      make(
        "span",
        "docs-brand-subtitle",
        "Training and Resources"
      )
    );

    brand.append(
      logo,
      brandCopy
    );


    /* -------------------------------------------------------
       Header Status Pill
       ------------------------------------------------------- */

    const pillText =
      isHomePage
        ? "Training Home"
        : isResourcePage
          ? program + " Resources"
          : program + " Training";


    /* -------------------------------------------------------
       Assemble Header
       ------------------------------------------------------- */

    inner.append(
      menuButton,
      brand,
      make(
        "span",
        "docs-header-spacer"
      ),
      make(
        "span",
        "docs-program-pill",
        pillText
      )
    );

    header.append(inner);

    return header;
  }


  /* =========================================================
     Sidebar Navigation
     ========================================================= */

  function buildSidebar() {
    const sidebar =
      make(
        "aside",
        "docs-sidebar"
      );


    /* -------------------------------------------------------
       Navigation Configuration
       ------------------------------------------------------- */

    const categoryOrder = {
      FRC: [
        "Foundations",
        "Robot Design",
        "Programming",
        "Team Operations"
      ],

      FTC: [
        "Foundations",
        "Robot Design"
      ]
    };


    function collapseStorageKey(
      programName,
      categoryName
    ) {
      return (
        "5041-training-nav-collapsed:" +
        programName +
        ":" +
        categoryName
      );
    }


    function setCategoryExpanded(
      category,
      expanded,
      persist = false
    ) {
      const toggle =
        category.querySelector(
          ".docs-nav-category-toggle"
        );

      const content =
        category.querySelector(
          ".docs-nav-category-content"
        );

      if (!toggle || !content) {
        return;
      }

      category.classList.toggle(
        "collapsed",
        !expanded
      );

      toggle.setAttribute(
        "aria-expanded",
        String(expanded)
      );

      content.hidden =
        !expanded;


      if (persist) {
        localStorage.setItem(
          collapseStorageKey(
            category.dataset.program || "",
            category.dataset.category || ""
          ),
          expanded ? "0" : "1"
        );
      }
    }


    function restoreCategoryExpandedState(
      category
    ) {
      const hasActiveModule =
        Boolean(
          category.querySelector(
            ".docs-nav-link.active"
          )
        );

      const savedState =
        localStorage.getItem(
          collapseStorageKey(
            category.dataset.program || "",
            category.dataset.category || ""
          )
        );

      /*
       * Categories are collapsed by default. If the user has
       * explicitly expanded or collapsed a category before,
       * preserve that choice. The category containing the active
       * module opens automatically so the current page remains
       * visible in the navigation.
       */
      const expandedByUser =
        savedState === "0";

      const shouldExpand =
        hasActiveModule || expandedByUser;

      setCategoryExpanded(
        category,
        shouldExpand,
        false
      );
    }


    /* -------------------------------------------------------
       Search
       ------------------------------------------------------- */

    const search =
      document.createElement("input");

    search.className =
      "docs-search";

    search.type =
      "search";

    search.placeholder =
      "Filter training & resources…";

    search.setAttribute(
      "aria-label",
      "Filter training and resources"
    );

    sidebar.append(search);


    /* -------------------------------------------------------
       Getting Started
       ------------------------------------------------------- */

    const homeGroup =
      make(
        "nav",
        "docs-nav-group docs-nav-home-group"
      );

    homeGroup.append(
      make(
        "div",
        "docs-nav-heading",
        "Getting Started"
      )
    );

    const homeLink =
      makeLink(
        new URL("index.html", root),
        "docs-nav-link",
        "Training Overview"
      );

    if (isHomePage) {
      homeLink.classList.add(
        "active"
      );
    }

    homeGroup.append(homeLink);
    sidebar.append(homeGroup);


    /* -------------------------------------------------------
       Resources
       Exact order: 5041 program materials, FTC, then FRC.
       These links stay permanently visible and are not
       collapsible.
       ------------------------------------------------------- */

    if (resourceManifest.length) {
      const resourcesGroup =
        make(
          "nav",
          "docs-nav-group docs-nav-resource-group"
        );

      resourcesGroup.append(
        make(
          "div",
          "docs-nav-heading",
          "Resources"
        )
      );

      ["5041", "FTC", "FRC"].forEach(
        (resourceProgram) => {
          const resource =
            resourceManifest.find(
              (item) =>
                item.program ===
                resourceProgram
            );

          if (!resource) {
            return;
          }

          const resourceLink =
            makeLink(
              new URL(
                resource.path,
                root
              ),
              "docs-nav-link docs-nav-resource-link",
              resource.title
            );

          resourceLink.dataset.resourcePath =
            resource.path;

          if (
            isResourcePage &&
            resource.path ===
              resourceMeta.path
          ) {
            resourceLink.classList.add(
              "active"
            );
          }

          resourcesGroup.append(
            resourceLink
          );
        }
      );

      sidebar.append(
        resourcesGroup
      );
    }


    /* -------------------------------------------------------
       FRC and FTC Training
       ------------------------------------------------------- */

    ["FRC", "FTC"].forEach(
      (programName) => {

        const programModules =
          manifest.filter(
            (module) =>
              module.program ===
              programName
          );

        if (!programModules.length) {
          return;
        }


        const programGroup =
          make(
            "nav",
            "docs-nav-group docs-nav-program-group"
          );

        programGroup.dataset.program =
          programName;

        programGroup.append(
          make(
            "div",
            "docs-nav-heading",
            programName + " Training"
          )
        );


        /* ---------------------------------------------------
           Group Modules by Category
           --------------------------------------------------- */

        const categories =
          new Map();

        programModules.forEach(
          (module) => {
            const categoryName =
              module.category || "Other";

            if (!categories.has(categoryName)) {
              categories.set(
                categoryName,
                []
              );
            }

            categories
              .get(categoryName)
              .push(module);
          }
        );


        const configuredOrder =
          categoryOrder[programName] || [];

        const remainingCategories =
          [...categories.keys()].filter(
            (categoryName) =>
              !configuredOrder.includes(
                categoryName
              )
          );

        const orderedCategories = [
          ...configuredOrder.filter(
            (categoryName) =>
              categories.has(categoryName)
          ),
          ...remainingCategories
        ];


        /* ---------------------------------------------------
           Build Collapsible Category Groups
           --------------------------------------------------- */

        orderedCategories.forEach(
          (categoryName) => {
            const modules =
              categories.get(categoryName) || [];

            const category =
              make(
                "div",
                "docs-nav-category"
              );

            category.dataset.program =
              programName;

            category.dataset.category =
              categoryName;


            const categoryToggle =
              make(
                "button",
                "docs-nav-category-toggle"
              );

            categoryToggle.type =
              "button";

            categoryToggle.append(
              make(
                "span",
                "docs-nav-category-label",
                categoryName
              ),

              make(
                "span",
                "docs-nav-category-chevron",
                "›"
              )
            );

            categoryToggle
              .querySelector(
                ".docs-nav-category-chevron"
              )
              .setAttribute(
                "aria-hidden",
                "true"
              );


            const categoryContent =
              make(
                "div",
                "docs-nav-category-content"
              );


            modules.forEach(
              (module) => {
                const moduleLink =
                  makeLink(
                    new URL(
                      module.path,
                      root
                    ),
                    "docs-nav-link docs-nav-module-link",
                    module.title
                  );

                moduleLink.dataset.modulePath =
                  module.path;


                if (
                  !isHomePage &&
                  !isResourcePage &&
                  module.path === meta.path
                ) {
                  moduleLink.classList.add(
                    "active"
                  );
                }


                if (isDone(module)) {
                  moduleLink.classList.add(
                    "done"
                  );
                }

                if (module.comingSoon) {
                  decorateComingSoonLink(
                    moduleLink
                  );
                }

                categoryContent.append(
                  moduleLink
                );
              }
            );


            category.append(
              categoryToggle,
              categoryContent
            );


            categoryToggle.addEventListener(
              "click",
              () => {
                const expanded =
                  categoryToggle.getAttribute(
                    "aria-expanded"
                  ) === "true";

                setCategoryExpanded(
                  category,
                  !expanded,
                  true
                );
              }
            );


            restoreCategoryExpandedState(
              category
            );

            programGroup.append(
              category
            );
          }
        );


        sidebar.append(
          programGroup
        );
      }
    );


    /* -------------------------------------------------------
       Search Filtering
       Matching categories are automatically opened while the
       user searches. Clearing the search restores the saved
       collapsed/expanded state.
       ------------------------------------------------------- */

    search.addEventListener(
      "input",
      () => {
        const query =
          search.value
            .trim()
            .toLowerCase();

        const searching =
          Boolean(query);


        /* Getting Started */

        const homeMatches =
          (
            "getting started training overview"
          ).includes(query);

        homeGroup.hidden =
          searching && !homeMatches;


        /* Resources */

        const resourcesGroup =
          sidebar.querySelector(
            ".docs-nav-resource-group"
          );

        if (resourcesGroup) {
          const resourcesHeadingMatches =
            "resources".includes(query);

          let visibleResources = 0;

          resourcesGroup
            .querySelectorAll(
              ".docs-nav-resource-link"
            )
            .forEach((resourceLink) => {
              const matches =
                !searching ||
                resourcesHeadingMatches ||
                resourceLink.textContent
                  .toLowerCase()
                  .includes(query);

              resourceLink.hidden =
                !matches;

              if (matches) {
                visibleResources += 1;
              }
            });

          resourcesGroup.hidden =
            searching &&
            visibleResources === 0;
        }


        /* Program Categories */

        sidebar
          .querySelectorAll(
            ".docs-nav-program-group"
          )
          .forEach((group) => {
            const programName =
              (group.dataset.program || "")
                .toLowerCase();

            const programMatches =
              searching &&
              (
                programName.includes(query) ||
                (programName + " training")
                  .includes(query)
              );

            let visibleCategories = 0;


            group
              .querySelectorAll(
                ".docs-nav-category"
              )
              .forEach((category) => {
                const categoryName =
                  (category.dataset.category || "")
                    .toLowerCase();

                const categoryMatches =
                  searching &&
                  categoryName.includes(query);

                let visibleLinks = 0;


                category
                  .querySelectorAll(
                    ".docs-nav-module-link"
                  )
                  .forEach((moduleLink) => {
                    const moduleMatches =
                      moduleLink.textContent
                        .toLowerCase()
                        .includes(query);

                    const show =
                      !searching ||
                      programMatches ||
                      categoryMatches ||
                      moduleMatches;

                    moduleLink.hidden =
                      !show;

                    if (show) {
                      visibleLinks += 1;
                    }
                  });


                category.hidden =
                  searching &&
                  visibleLinks === 0;


                if (!category.hidden) {
                  visibleCategories += 1;
                }


                if (
                  searching &&
                  visibleLinks > 0
                ) {
                  setCategoryExpanded(
                    category,
                    true,
                    false
                  );
                }
                else if (!searching) {
                  restoreCategoryExpandedState(
                    category
                  );
                }
              });


            group.hidden =
              searching &&
              visibleCategories === 0;
          });
      }
    );


    /* -------------------------------------------------------
       Preserve Sidebar Scroll Position
       ------------------------------------------------------- */

    sidebar.addEventListener(
      "scroll",
      () => {
        saveSidebarScroll(sidebar);
      },
      {
        passive: true
      }
    );


    /* -------------------------------------------------------
       Save Position Before Navigation and Close Mobile Drawer
       ------------------------------------------------------- */

    sidebar.addEventListener(
      "click",
      (event) => {
        const clickedLink =
          event.target.closest("a");

        if (!clickedLink) {
          return;
        }

        saveSidebarScroll(sidebar);

        document.body.classList.remove(
          "docs-nav-open"
        );
      }
    );


    /* -------------------------------------------------------
       Restore Previous Sidebar Position
       ------------------------------------------------------- */

    const restored =
      restoreSidebarScroll(sidebar);

    if (!restored) {
      showActiveModuleIfNeeded(sidebar);
    }


    return sidebar;
  }


  /* =========================================================
     Module Section Preparation
     ========================================================= */

  function prepareRevealSections() {
    const sections = [
      ...document.querySelectorAll(
        ".reveal .slides section"
      )
    ];

    let generatedId = 0;


    sections.forEach(
      (section) => {

        const hasChildSection =
          Boolean(
            section.querySelector(
              ":scope > section"
            )
          );

        section.classList.add(
          hasChildSection
            ? "docs-section-group"
            : "docs-page-section"
        );


        if (
          !hasChildSection &&
          !section.id
        ) {
          generatedId += 1;

          section.id =
            "section-" + generatedId;
        }

      }
    );


    return sections.filter(
      (section) =>
        section.classList.contains(
          "docs-page-section"
        )
    );
  }


  function prepareHomeSections() {
    return [
      ...document.querySelectorAll(
        "#docs-home-content > section"
      )
    ];
  }


  function prepareResourceSections() {
    return [
      ...document.querySelectorAll(
        "#docs-resource-content > section"
      )
    ];
  }


  function prepareNativeModuleSections() {
    const sections = [
      ...document.querySelectorAll(
        "#docs-native-module-content > section"
      )
    ];

    let generatedId = 0;

    sections.forEach((section) => {
      section.classList.add("docs-page-section");

      if (!section.id) {
        generatedId += 1;
        section.id = "section-" + generatedId;
      }
    });

    return sections;
  }


  /* =========================================================
     Section Labels
     ========================================================= */

  function sectionLabel(section) {
    const tag =
      section.querySelector(
        ":scope > .tag"
      );

    const heading =
      section.querySelector(
        ":scope > h1, :scope > h2, :scope > h3"
      ) ||
      (
        isResourcePage
          ? section.querySelector(
              ".resource-section-heading h2, .resource-section-heading h3"
            )
          : null
      );


    let title =
      (
        tag &&
        tag.textContent.trim()
      ) ||
      (
        heading &&
        heading.textContent.trim()
      ) ||
      "";


    if (
      !title &&
      section.id === "complete"
    ) {
      title =
        "Completion Certificate";
    }


    if (
      !title &&
      section.id &&
      /^quiz-q\d+$/i.test(section.id)
    ) {
      title =
        "Quiz";
    }


    return title
      .replace(/\s+/g, " ")
      .trim();
  }


  /* =========================================================
     Right-Side Table of Contents
     ========================================================= */

  function buildToc(sections) {
    const toc =
      make(
        "aside",
        "docs-toc"
      );

    toc.append(
      make(
        "div",
        "docs-toc-title",
        "On this page"
      )
    );

    const seen =
      new Set();


    sections.forEach(
      (section) => {

        if (
          section.id &&
          /^quiz-q\d+$/i.test(section.id)
        ) {
          return;
        }


        const label =
          sectionLabel(section);


        if (
          !section.id ||
          !label ||
          seen.has(label)
        ) {
          return;
        }


        seen.add(label);

        toc.append(
          makeLink(
            "#" + section.id,
            "",
            label
          )
        );

      }
    );


    return toc;
  }


  /* =========================================================
     Certificate Lock and Completion State
     ========================================================= */

  function addLockBanner() {
    const completeSection =
      document.getElementById(
        "complete"
      );

    if (!completeSection) {
      return;
    }


    let banner =
      completeSection.querySelector(
        ".docs-lock-banner"
      );


    if (!banner) {
      banner =
        make(
          "div",
          "docs-lock-banner",
          "Certificate locked — complete the quiz and earn the required passing score to unlock it."
        );

      completeSection.insertBefore(
        banner,
        completeSection.firstChild
      );
    }


    const syncCompletion = () => {
      if (
        !completeSection.classList.contains(
          "locked"
        )
      ) {
        markCurrentModuleDone();
      }
    };


    new MutationObserver(
      syncCompletion
    ).observe(
      completeSection,
      {
        attributes: true,
        attributeFilter: ["class"]
      }
    );


    syncCompletion();
  }


  /* =========================================================
     Reading Progress
     ========================================================= */

  function buildReadingProgress() {
    const progressBox =
      make(
        "div",
        "docs-progress"
      );

    const label =
      make(
        "span",
        "",
        "Reading progress"
      );

    const track =
      make(
        "span",
        "docs-progress-bar"
      );

    const fill =
      make("span");

    const percentage =
      make(
        "span",
        "",
        "0%"
      );


    track.append(fill);

    progressBox.append(
      label,
      track,
      percentage
    );


    const update = () => {
      const article =
        document.querySelector(
          ".docs-article"
        );

      if (!article) {
        return;
      }


      const rect =
        article.getBoundingClientRect();

      const total =
        Math.max(
          1,
          article.scrollHeight -
          innerHeight * 0.45
        );

      const scrolled =
        Math.min(
          total,
          Math.max(
            0,
            -rect.top + 100
          )
        );

      const progress =
        Math.round(
          (scrolled / total) * 100
        );


      fill.style.width =
        progress + "%";

      percentage.textContent =
        progress + "%";
    };


    addEventListener(
      "scroll",
      update,
      {
        passive: true
      }
    );

    addEventListener(
      "resize",
      update
    );

    setTimeout(
      update,
      50
    );


    return progressBox;
  }


  /* =========================================================
     Previous / Next Module Links
     ========================================================= */

  function buildNextPrev() {
    const programModules =
      manifest.filter(
        (module) =>
          module.program === program
      );

    const currentIndex =
      programModules.findIndex(
        (module) =>
          module.path === meta.path
      );

    const wrapper =
      make(
        "nav",
        "docs-nextprev"
      );

    const previous =
      currentIndex > 0
        ? programModules[currentIndex - 1]
        : null;

    const next =
      currentIndex >= 0 &&
      currentIndex < programModules.length - 1
        ? programModules[currentIndex + 1]
        : null;


    function navigationLink(module, direction) {
      if (!module) {
        return make("span");
      }


      const anchor =
        makeLink(
          new URL(
            module.path,
            root
          ),
          "",
          module.title
        );

      anchor.prepend(
        make(
          "small",
          "",
          direction
        )
      );

      if (module.comingSoon) {
        decorateComingSoonLink(
          anchor
        );
      }

      anchor.addEventListener(
        "click",
        () => {
          saveSidebarScroll(
            document.querySelector(
              ".docs-sidebar"
            )
          );
        }
      );


      return anchor;
    }


    wrapper.append(
      navigationLink(
        previous,
        "Previous module"
      ),
      navigationLink(
        next,
        "Next module"
      )
    );


    return wrapper;
  }


  /* =========================================================
     Breadcrumbs
     ========================================================= */

  function buildBreadcrumbs() {
    const breadcrumbs =
      make(
        "div",
        "docs-breadcrumbs"
      );


    if (isHomePage) {
      breadcrumbs.textContent =
        "5041 CyBears / Training";

      return breadcrumbs;
    }


    if (isResourcePage) {
      breadcrumbs.append(
        makeLink(
          new URL("index.html", root),
          "",
          "Training & Resources"
        ),

        document.createTextNode(
          " / "
        ),

        makeLink(
          new URL(
            "index.html#" +
            program.toLowerCase(),
            root
          ),
          "",
          program
        ),

        document.createTextNode(
          " / " +
          (resourceMeta.title || document.title)
        )
      );

      return breadcrumbs;
    }


    breadcrumbs.append(
      makeLink(
        new URL("index.html", root),
        "",
        "Training"
      ),

      document.createTextNode(
        " / "
      ),

      makeLink(
        new URL(
          "index.html#" +
          program.toLowerCase(),
          root
        ),
        "",
        program
      ),

      document.createTextNode(
        " / " +
        (meta.title || document.title)
      )
    );


    return breadcrumbs;
  }


  /* =========================================================
     Active Table-of-Contents Tracking
     ========================================================= */

  function watchActiveSection(sections) {
    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }


    const anchors = [
      ...document.querySelectorAll(
        ".docs-toc a"
      )
    ];


    const observer =
      new IntersectionObserver(
        (entries) => {

          const visibleEntry =
            entries.find(
              (entry) =>
                entry.isIntersecting
            );

          if (!visibleEntry) {
            return;
          }


          anchors.forEach(
            (anchor) => {

              anchor.classList.toggle(
                "active",
                anchor.getAttribute("href") ===
                "#" + visibleEntry.target.id
              );

            }
          );

        },
        {
          rootMargin:
            "-20% 0px -70% 0px",
          threshold: 0
        }
      );


    sections.forEach(
      (section) =>
        observer.observe(section)
    );
  }


  /* =========================================================
     Build the Shared GitBook-Style Shell
     ========================================================= */

  function run() {
    if (
      document.body.dataset.docsShellReady ===
      "true"
    ) {
      return;
    }


    document.body.dataset.docsShellReady =
      "building";

    document.body.classList.add(
      "docs-module"
    );


    const reveal =
      document.querySelector(
        ".reveal"
      );

    const homeContent =
      document.getElementById(
        "docs-home-content"
      );

    const resourceContent =
      document.getElementById(
        "docs-resource-content"
      );


    const nativeModuleContent =
      document.getElementById(
        "docs-native-module-content"
      );

    const isNativeModule =
      Boolean(nativeModuleContent);


    if (
      !isHomePage &&
      !isResourcePage &&
      !isNativeModule &&
      !reveal
    ) {
      console.warn(
        "5041 training shell: no module content was found."
      );

      document.body.dataset.docsShellReady =
        "error";

      return;
    }


    if (
      isHomePage &&
      !homeContent
    ) {
      console.warn(
        "5041 training shell: no landing-page content was found."
      );

      document.body.dataset.docsShellReady =
        "error";

      return;
    }


    if (
      isResourcePage &&
      !resourceContent
    ) {
      console.warn(
        "5041 training shell: no resource-page content was found."
      );

      document.body.dataset.docsShellReady =
        "error";

      return;
    }


    const sections =
      isHomePage
        ? prepareHomeSections()
        : isResourcePage
          ? prepareResourceSections()
          : isNativeModule
            ? prepareNativeModuleSections()
            : prepareRevealSections();


    const header =
      buildHeader();

    const sidebar =
      buildSidebar();

    const toc =
      buildToc(sections);

    const layout =
      make(
        "div",
        "docs-layout"
      );

    const main =
      make(
        "main",
        "docs-main"
      );

    const article =
      make(
        "article",
        isHomePage
          ? "docs-article docs-home-article"
          : isResourcePage
            ? "docs-article docs-resource-article"
            : isNativeModule
              ? "docs-article docs-native-article"
              : "docs-article"
      );


    /* -------------------------------------------------------
       Breadcrumbs
       ------------------------------------------------------- */

    main.append(
      buildBreadcrumbs()
    );


    /* -------------------------------------------------------
       Landing Page
       ------------------------------------------------------- */

    if (isHomePage) {
      article.append(
        ...homeContent.children
      );

      homeContent.remove();

      main.append(
        article
      );
    }


    /* -------------------------------------------------------
       Resource Library Page
       ------------------------------------------------------- */

    else if (isResourcePage) {
      article.append(
        ...resourceContent.children
      );

      resourceContent.remove();

      main.append(
        article
      );
    }


    /* -------------------------------------------------------
       Training Module
       ------------------------------------------------------- */

    else {
      main.append(
        buildModulePageTitle()
      );


      if (meta.description) {
        main.append(
          make(
            "p",
            "docs-lead",
            meta.description
          )
        );
      }


      if (!isComingSoonModule) {
        main.append(
          buildReadingProgress()
        );
      }

      if (isNativeModule) {
        article.append(
          ...nativeModuleContent.children
        );

        nativeModuleContent.remove();
      }
      else {
        article.append(
          reveal
        );
      }

      if (isComingSoonModule) {
        applyComingSoonState(
          main,
          article,
          toc
        );
      }

      main.append(
        article,
        buildNextPrev()
      );
    }


    /* -------------------------------------------------------
       Assemble Shared Layout
       ------------------------------------------------------- */

    layout.append(
      sidebar,
      main,
      toc
    );

    document.body.prepend(
      header
    );

    document.body.insertBefore(
      layout,
      header.nextSibling
    );


    /* -------------------------------------------------------
       Module Completion Logic
       ------------------------------------------------------- */

    if (
      !isHomePage &&
      !isResourcePage
    ) {
      addLockBanner();
    }


    updateDoneStates();
    watchActiveSection(sections);


    /* -------------------------------------------------------
       Shell Finished
       ------------------------------------------------------- */

    document.body.dataset.docsShellReady =
      "true";
  }


  /* =========================================================
     Initialize
     ========================================================= */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      run,
      {
        once: true
      }
    );
  }

  else {
    run();
  }

})();
