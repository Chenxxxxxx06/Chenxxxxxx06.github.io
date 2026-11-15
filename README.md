# Chen Xi — Personal Homepage

Personal homepage of Chen Xi, Software Engineering at Northwestern Polytechnical University, with projects in VLM, VLA, autonomous agents, and inference optimization.

Live site: [chenxxxxxx06.github.io](https://chenxxxxxx06.github.io)

Built with Jekyll and a customized Minimal Mistakes layout. The design is adapted from [Wanghan Xu’s homepage](https://black-yt.github.io); all personal content belongs to Chen Xi.

## Features

- Four persistent colour themes and responsive navigation.
- Five-project horizontal carousel with directly accessible repository links.
- Published GitHub/AI activity snapshots, with per-source recorded dates and a quiet fallback state.
- A time-aware mascot with an accessible email card.
- Search/share metadata, site icons, and legacy `/about/` and `/about.html` redirects.

## Local development

Install Ruby and Bundler, then run:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000`. `bash run_server.sh` runs the same command. Ruby and Bundler must be on PATH; the script does not assume a machine-specific installation directory.

For a static Node preview:

```sh
npm run sync:preview
npm run preview
```

`sync:preview` performs a full Jekyll build. It requires Ruby/Bundler as above. If Ruby is installed outside PATH, set `JEKYLL_RUBY` to its executable. The static preview server listens only on `127.0.0.1:4000` and does not load API credentials.

## Validation

```sh
npm test
bundle exec jekyll build
```

If npm is unavailable, `node --test tests/*.test.mjs` runs the same tests. Tests cover homepage cleanup, activity refresh failures, background rendering, and keyboard interactions. Run `python -m unittest discover -s tests -p "test_*.py"` for activity exporter tests.

## Content and configuration

| File | Purpose |
| --- | --- |
| `_config.yml` | Profile and search/share description |
| `_data/navigation.yml` | Navigation links |
| `_pages/includes/` | Introduction, projects, activity, news, experience, honors |
| `_sass/_config.scss` | Type and size settings |
| `assets/css/custom-overrides.css` | Activity, experience, mascot styles |
| `assets/css/profile-refresh.css` | Scoped circular emblem and generated-cover additions; original theme retained |
| `assets/js/custom-scripts.js` | Themes, navigation, portfolio, activity, mascot |
| `scripts/export_activity.py` | Activity snapshot generation |

The Peking University emblem is the original transparent PNG from the university's [official identity downloads](https://vim.pku.edu.cn/xzzq/). The NPU mark uses the existing circular emblem with a circular container. Zhejiang and Tsinghua emblems come from their [official ZJU identity page](https://www.zju.edu.cn/514/listm.htm) and [official Tsinghua identity page](https://vi.tsinghua.edu.cn/gk/xxbz/xh.htm). LabVLA links to [arXiv:2606.13578](https://arxiv.org/abs/2606.13578); Argus links to [arXiv:2608.05144](https://arxiv.org/abs/2608.05144).

The original horizontal portfolio carousel, typography, experience timeline, and honors list are retained. The current pixel-art covers were generated using the built-in image generation tool; prompts are in `assets/portfolio/generated/prompts-pixel.json`. Original Argus and LabVLA logos and the IronRock mascot are layered separately to preserve their identity. WebP copies are served on the site; full-size PNG originals remain local. The portrait button cycles through the original photo and two additional photos without changing its rectangular layout.

Activity heatmaps use HTML/CSS calendar cells with keyboard navigation, retaining the published daily data and original color scales.

Activity data is a published snapshot, not live access to personal tools. The browser periodically checks for a newer JSON snapshot; this does not guarantee the publisher has generated one. This repository currently contains no GitHub Actions workflow for Scholar or activity updates.

Use `bundle exec jekyll build` for a production site. Never publish credentials. Drafts, temporary builds, and unrelated local assets should remain outside commits.
