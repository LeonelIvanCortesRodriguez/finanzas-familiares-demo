# Third-party notices

This MIT-licensed demonstration ships no third-party runtime source, icons, data, or images. It uses the browser platform, the Node.js standard library, and the Python standard library. The README images and demo recording depict only the generated fictional sample.

## Bundled fonts

The demo self-hosts two font files. Nothing is fetched from a font service at runtime.

| File | Family | License | Source |
| --- | --- | --- | --- |
| `assets/fonts/AtkinsonHyperlegibleNext.woff2` | Atkinson Hyperlegible Next, Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors | SIL Open Font License 1.1, [`assets/fonts/AtkinsonHyperlegibleNext-OFL.txt`](assets/fonts/AtkinsonHyperlegibleNext-OFL.txt) | Google Fonts Latin subset `atkinsonhyperlegiblenext/v7`, from the upstream [googlefonts/atkinson-hyperlegible-next](https://github.com/googlefonts/atkinson-hyperlegible-next) project |
| `assets/fonts/AtkinsonHyperlegibleMono.woff2` | Atkinson Hyperlegible Mono, Copyright 2020-2024 The Atkinson Hyperlegible Mono Project Authors | SIL Open Font License 1.1, [`assets/fonts/AtkinsonHyperlegibleMono-OFL.txt`](assets/fonts/AtkinsonHyperlegibleMono-OFL.txt) | Google Fonts Latin subset `atkinsonhyperlegiblemono/v8`, from the upstream [googlefonts/atkinson-hyperlegible-next-mono](https://github.com/googlefonts/atkinson-hyperlegible-next-mono) project |

Neither license declares a Reserved Font Name, so the unmodified Latin subsets may be redistributed under their original names. The files are bundled as published and not modified.

## Development tools

README images and the demo GIF and MP4 are rendered with a local Chrome browser driven by Playwright Core 1.62.1 (Apache-2.0, development dependency only) and encoded with FFmpeg. Neither is bundled or required to run the demo.
