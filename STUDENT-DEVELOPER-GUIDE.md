# 5041 Training Site — Student Developer Guide

This site keeps the original Reveal-style `<section>` module structure, but it is displayed as vertically scrolling documentation instead of a slide deck.

## What each file type does

- **HTML** — module content and structure.
- **CSS** — module appearance and responsive layout.
- **JavaScript** — interactions, quizzes, calculators, activities, and certificate generation.
- **`shared/assets/`** — common images, PDFs, presentations, and audio used by more than one module.
- **`site-assets/js/site-manifest.js`** — the single module list used to build navigation.
- **`site-assets/js/docs-shell.js`** — builds the GitBook-style header, sidebar, breadcrumbs, table of contents, reading progress, and previous/next links.
- **`site-assets/js/reveal-compat.js`** — provides the limited Reveal API expected by older module interaction code.

## Recommended workflow for a new module

1. Copy an existing module with similar structure or interactions.
2. Rename the HTML/CSS/JS files and any module-specific classes or functions.
3. Keep the shared 5041 styles and documentation shell links intact.
4. Build content with `<section>` elements inside `.reveal > .slides`.
5. Add one interaction at a time and test it before adding the next.
6. Keep the quiz answer key and passing score easy to find in the module JavaScript.
7. Keep the final certificate section using `id="complete"` and the `locked` class until the quiz passes.
8. Add the module to `site-assets/js/site-manifest.js`.
9. Test the left navigation, right table of contents, reading progress, quiz, certificate unlock, and PDF download.
10. Open Developer Tools → Console if a click or interaction does nothing.

## Required page metadata

Every module page should identify its program and manifest slug on the `<body>` element:

```html
<body data-program="FRC" data-module-slug="motors">
```

FTC example:

```html
<body data-program="FTC" data-module-slug="ftc-drivetrain">
```

The slug must match the module object in `site-assets/js/site-manifest.js`.

## Required documentation-shell files

FRC and FTC modules currently live two folders below the site root, so they should load:

```html
<link rel="stylesheet" href="../../site-assets/css/docs-site.css">
<link rel="stylesheet" href="../../site-assets/css/docs-module.css">
<script src="../../site-assets/js/reveal-compat.js"></script>
```

Near the end of the page, after the module's own JavaScript, keep:

```html
<script src="../../site-assets/js/site-manifest.js"></script>
<script src="../../site-assets/js/docs-shell.js"></script>
```

## Basic module structure

```html
<div class="reveal">
  <div class="slides">
    <section>
      Module section
    </section>

    <section>
      <section>Nested section 1</section>
      <section>Nested section 2</section>
    </section>

    <section id="complete" class="certificate-slide locked">
      Certificate content
    </section>
  </div>
</div>
```

`docs-shell.js` converts the leaf sections into documentation cards and automatically creates IDs when a section does not already have one.

## Adding a module to the sidebar

Add an object to `site-assets/js/site-manifest.js`:

```js
{
  "program": "FRC",
  "slug": "example-module",
  "title": "Example Module",
  "description": "Short description shown at the top of the module.",
  "category": "Robot Design",
  "path": "FRC-trainings/modules/example-module.html"
}
```

The `category` value controls the GitBook-style subsection where the module appears in the sidebar.

## Common interaction pattern

```html
<section class="example-activity-slide">
  <button class="example-card" data-correct="true" onclick="checkExample(this)">
    Choice
  </button>

  <p class="example-feedback"></p>
</section>
```

```js
function checkExample(button) {
  const section = button.closest(".example-activity-slide");
  const isCorrect = button.dataset.correct === "true";

  button.classList.add(isCorrect ? "correct" : "incorrect");

  section.querySelector(".example-feedback").textContent =
    isCorrect ? "Correct." : "Try again.";
}

window.checkExample = checkExample;
```

```css
.example-card.correct {
  background: #e6f4ea;
}

.example-card.incorrect {
  background: #fdecea;
}
```

## Before committing changes

- No broken relative paths.
- No duplicate IDs on one page.
- The module appears in the correct sidebar category.
- The active module is highlighted in the sidebar.
- Interactive buttons work more than once where appropriate.
- Reset buttons fully reset activities.
- Quiz grading still uses the intended answer key and passing score.
- The certificate remains locked before passing and unlocks after passing.
- The certificate PDF downloads correctly.
- Images and activities fit smaller screens.
- No errors appear in the browser Console.
