# 5041 CyBears Training Documentation Site

This folder is a static GitHub Pages site converted from the uploaded Reveal.js training modules. It uses a documentation-style navigation layout inspired by FTC Docs while preserving the module content, images, interactive activities, quizzes, passing scores, and PDF certificate generation.

## Publish on GitHub Pages

1. Copy the contents of this folder into the repository/branch you want to publish.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch and `/ (root)` folder containing `index.html`, then save.
5. Open the Pages URL after deployment.

All site links are relative, so the site works as either a user/organization Pages site or a project Pages site. No build system is required.

## Structure

- `index.html` — training home page
- `FRC-trainings/frc-trainings.html` — FRC module catalog
- `FTC-training/ftc-trainings.html` — FTC module catalog
- `FRC-trainings/modules/` — converted FRC module pages and original module assets/scripts
- `FTC-training/modules/` — converted FTC module pages and original module assets/scripts
- `shared/` — original shared 5041 CSS/JS/assets used by the modules
- `site-assets/` — new documentation shell, Reveal compatibility shim, navigation, and site styling

## How the conversion works

The original `<section>` slide content remains in each module. Reveal.js presentation CSS/runtime is replaced with `site-assets/js/reveal-compat.js`, which provides the limited Reveal API used by the existing interaction scripts. `site-assets/js/docs-shell.js` then presents the same sections as a vertical documentation page with a left module navigation and on-page table of contents.

Quiz grading and certificate PDF generation remain in the original module JavaScript. The documentation shell observes the existing `#complete.locked` state to keep certificates blocked until the quiz passes and records completion in browser local storage for the green completion check mark.

## Editing a module

Edit the module HTML/CSS/JS in its existing module folder. Keep the `site-assets` references at the bottom of each converted page. If you add a new module, add it to `site-assets/js/site-manifest.js` and the desired program catalog.
