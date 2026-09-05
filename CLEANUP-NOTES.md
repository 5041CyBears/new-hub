# 5041 Training Site Cleanup Notes

## Main problem fixed

`site-assets/js/docs-shell.js` ended with a literal Markdown code fence (` ``` `). That made the browser throw `SyntaxError: Unexpected end of input`, so the documentation shell never ran on module pages. The module HTML loaded, but without the GitBook-style header, sidebar, breadcrumbs, table of contents, or reading-progress wrapper.

The replacement `docs-shell.js` is valid JavaScript and now builds the same shell for both `index.html` and every FRC/FTC module.

## Navigation changes

- `index.html` now uses `docs-shell.js` instead of maintaining a second hard-coded sidebar.
- `site-manifest.js` remains the single source of truth for all FRC/FTC module links.
- The sidebar groups modules by `program` and then `category`.
- The landing page has an active **Training Overview** entry in the same sidebar used by modules.
- Breadcrumbs link back to `index.html` and the appropriate `#frc` or `#ftc` landing-page section.
- The old FRC and FTC catalog pages are no longer needed.

## Files/directories removed

The following were removed because they were duplicates, obsolete catalog/resource pages, embedded Git metadata, or unused by any retained training entry point.

### Embedded repository metadata

- `.git/` — entire directory. Git metadata belongs in the local repository itself and should not be packaged as website content.
- `COMMENTING-MANIFEST.json`

### Obsolete catalog pages

- `FRC-trainings/frc-trainings.html`
- `FTC-training/ftc-trainings.html`

### Duplicate asset trees

The retained modules already reference the canonical `shared/assets/` tree, so these full duplicate trees were removed:

- `assets/`
- `FRC-trainings/assets/`
- `FRC-trainings/modules/assets/`
- `FTC-training/assets/`
- `FTC-training/modules/assets/`

The duplicate FRC inclusion audio directory was also removed after its two used tracks were pointed at `shared/assets/audio/`:

- `FRC-trainings/modules/audio/`

### Root-level legacy resource/ROAR files

- `frc-resources.html`
- `ftc-resources.html`
- `ftc-interactions.js`
- `ftc-training.css`
- `report.js`
- `roar-admin.html`
- `roar-report-form.html`
- `roar-styles.css`
- `scripts.js`
- `styles.css`
- `google-apps-script/`

### Duplicate legacy FRC files

- `FRC-trainings/app.js`
- `FRC-trainings/config.js`
- `FRC-trainings/report.js`
- `FRC-trainings/roar-admin.html`
- `FRC-trainings/roar-report-form.html`
- `FRC-trainings/roar-styles.css`
- `FRC-trainings/scripts.js`
- `FRC-trainings/styles.css`

### Duplicate/unused files inside FRC modules

- `FRC-trainings/modules/app.js`
- `FRC-trainings/modules/config.js`
- `FRC-trainings/modules/report.js`
- `FRC-trainings/modules/roar-admin.html`
- `FRC-trainings/modules/roar-report-form.html`
- `FRC-trainings/modules/roar-styles.css`
- `FRC-trainings/modules/safety-additions.css`
- `FRC-trainings/modules/safety.js`
- `FRC-trainings/modules/scripts.js`
- `FRC-trainings/modules/styles.css`

The FRC safety page already loads the retained canonical files:

- `shared/css/safety-additions.css`
- `shared/js/safety.js`
- `shared/css/styles.css`

### Duplicate/unused FTC files

- `FTC-training/README.md`
- `FTC-training/ftc-interactions.js`
- `FTC-training/ftc-resources.html`
- `FTC-training/ftc-training.css`
- `FTC-training/styles.css`
- `FTC-training/modules/safety-additions.css`
- `FTC-training/modules/safety.js`

The FTC safety page also uses the canonical shared safety files.

### Unused shared CSS/JavaScript

- `shared/css/ftc-training.css`
- `shared/css/roar-styles.css`
- `shared/js/app.js`
- `shared/js/config.js`
- `shared/js/ftc-interactions.js`
- `shared/js/report.js`

### Unused shared assets

- `shared/assets/BEARY.png`
- `shared/assets/Components/PCMs.png`
- `shared/assets/Components/drag-and-drop/Drag-and-drop-activity-answers.png`
- `shared/assets/Components/drag-and-drop/Drag-and-drop-activity.png`
- `shared/assets/Components/pneumatic-hub.png`
- `shared/assets/PWM.png`
- `shared/assets/audio/culture-1.mp3`
- `shared/assets/frc-wiring-overview-old.jpg`
- `shared/assets/frc-wiring-overview-rev.png`
- `shared/assets/gearing/dual-speed-gb.jpeg`
- `shared/assets/gearing/worm-gear.png`
- `shared/assets/inclusion/about-us-2026.png`
- `shared/assets/inclusion/team-culture-handbook.png`
- `shared/assets/pdfs/Gear-Trains.pdf`
- `shared/assets/pdfs/Gears-and-gearboxes.pdf`
- `shared/assets/safety/5041-rules.png`
- `shared/assets/safety/first-culture-responsibilities.png`
- `shared/assets/safety/first-ppe-eye.png`
- `shared/assets/truss-bridge.JPG`

### Final duplicate removed

The team logo existed in both `site-assets/img/` and `shared/assets/`. `docs-shell.js` now uses the shared copy, so the duplicate site-assets copy was removed.

## Files intentionally retained even though they are not web entry points

- `.nojekyll` — needed/recommended for a plain static GitHub Pages deployment.
- `README.md` — repository/deployment instructions.
- `STUDENT-DEVELOPER-GUIDE.md` — updated developer guidance for adding and maintaining modules.
- `CLEANUP-NOTES.md` — this cleanup record.

## Validation performed

- All retained JavaScript files pass `node --check` syntax validation.
- All 15 manifest modules exist.
- Every module's `data-program` and `data-module-slug` matches its manifest entry.
- Every module loads `docs-site.css`, `docs-module.css`, `site-manifest.js`, and `docs-shell.js`.
- Static reference crawling from `index.html` plus all 15 module entry points found no broken local file references.
- Visible text in all 15 training module HTML files matches the uploaded version; module content was not rewritten or removed.
- No exact duplicate files remain in the cleaned package.
