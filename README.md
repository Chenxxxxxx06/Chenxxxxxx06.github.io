# Chen Xi — Personal Homepage

Personal homepage of Chen Xi, Software Engineering at Northwestern Polytechnical University, with projects in VLM, VLA, autonomous agents, and inference optimization.

Live site: [chenxxxxxx06.github.io](https://chenxxxxxx06.github.io)

Built with Jekyll and a customized Minimal Mistakes layout. The design is adapted from [Wanghan Xu’s homepage](https://black-yt.github.io); all personal content belongs to Chen Xi.

## Features

- Four persistent colour themes and responsive navigation.
- Five-project responsive gallery with directly accessible repository links.
- Published GitHub/AI activity snapshots, with per-source recorded dates and a quiet fallback state.
- Ask Chen: a closed-set public-profile question service with visible submission, suggested questions, source links, and retryable errors.
- A time-aware mascot with an accessible email card.
- Search/share metadata, site icons, and legacy `/about/` and `/about.html` redirects.

Ask Chen works on GitHub Pages using approved public notes, without sending visitor questions to an external service. Its JSON is generated from the same catalog used by the optional Node API. After changing the catalog or policy, run `node scripts/export-public-knowledge.mjs`; `node scripts/export-public-knowledge.mjs --check` verifies it is current. See [api/README.md](api/README.md) for connecting a model-backed intent router.

## Local development

Install Ruby and Bundler, then run:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000`. `bash run_server.sh` runs the same command. Ruby and Bundler must be on PATH; the script does not assume a machine-specific installation directory.

For the Node-backed Ask Chen preview:

```sh
# Create .env.local from .env.example and set the server-only key locally.
npm run sync:preview
npm run preview
```

`sync:preview` performs a full Jekyll build and overrides only the local preview endpoint to `/api/ask`. It requires Ruby/Bundler as above. If Ruby is installed outside PATH, set `JEKYLL_RUBY` to its executable. This avoids serving stale HTML from an earlier `_site` build. The preview server listens only on `127.0.0.1:4000`.

## Validation

```sh
npm test
bundle exec jekyll build
```

If npm is unavailable, `node --test tests/*.test.mjs` runs the same tests. Tests cover Ask Chen API boundaries, frontend recovery/source links, activity refresh failures, and keyboard interactions. They use local mocks and do not call the external model.

## Content and configuration

| File | Purpose |
| --- | --- |
| `_config.yml` | Profile, public API URL, search/share description |
| `_data/navigation.yml` | Navigation links |
| `_pages/includes/` | Introduction, projects, activity, news, experience, honors |
| `_sass/_config.scss` | Type and size settings |
| `assets/css/custom-overrides.css` | Activity, experience, mascot styles |
| `assets/css/profile-refresh.css` | Project gallery, publication list, timeline and type hierarchy |
| `assets/js/custom-scripts.js` | Themes, navigation, portfolio, activity, mascot |
| `assets/placement-demo/` | Ask Chen interface |
| `api/_lib/catalog.mjs` | Approved public answers and source links |
| `scripts/export_activity.py` | Activity snapshot generation |
| `scripts/export-public-knowledge.mjs` | Generate the approved browser-side knowledge catalog |

The Peking University emblem is the original transparent PNG from the university's [official identity downloads](https://vim.pku.edu.cn/xzzq/). The NPU mark uses the existing circular emblem with a circular container. LabVLA links to [arXiv:2606.13578](https://arxiv.org/abs/2606.13578); Argus links to [arXiv:2608.05144](https://arxiv.org/abs/2608.05144).

Activity data is a published snapshot, not live access to personal tools. The browser periodically checks for a newer JSON snapshot; this does not guarantee the publisher has generated one. This repository currently contains no GitHub Actions workflow for Scholar or activity updates.

Use `bundle exec jekyll build` for a production site without the local API override. Never publish `.env.local` or server credentials. Drafts, temporary builds, and unrelated local assets should remain outside commits.
