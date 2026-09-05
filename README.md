# 5041 CyBears Training Documentation Site

This is a static GitHub Pages training site for 5041 CyBears FRC and FTC modules. 

## Main structure

- `index.html` — documentation-style training home page
- `site-assets/` — shared site shell, navigation manifest, compatibility layer, and documentation CSS
- `FRC-trainings/modules/` — FRC module HTML and module-specific CSS/JS
- `FTC-training/modules/` — FTC module HTML and module-specific CSS/JS
- `shared/` — assets and shared code actually used by the retained modules

## Navigation

`site-assets/js/site-manifest.js` is the single source of truth for module order, program, category, title, description, slug, and path.

`site-assets/js/docs-shell.js` reads that manifest and builds the same:

- top header
- searchable left navigation
- program/category groups
- completion check marks
- breadcrumbs
- right-side "On this page" navigation
- previous/next module links

for every module. The landing page uses this same shell, so module lists do not need to be duplicated in `index.html`.

## Editing or adding a module

Edit the module HTML/CSS/JS in its existing module folder. To add a new module, add one object to `site-assets/js/site-manifest.js` and make sure the module page loads:

```html
<script src="../../site-assets/js/site-manifest.js"></script>
<script src="../../site-assets/js/docs-shell.js"></script>
```

and has the correct body metadata:

```html
<body data-program="FRC" data-module-slug="your-slug">
```

Use `FTC` instead of `FRC` for FTC modules.

## Certificates

The original module JavaScript still controls quiz grading and certificate unlocking. The documentation shell observes the existing `#complete.locked` state and records passed modules in browser local storage so completed modules receive a green check mark in the sidebar.
