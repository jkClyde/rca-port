import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, existsSync, mkdirSync, renameSync } from "fs";

// Shared HTML pieces (nav, footer). In any page, write
//   <!-- @include nav -->
// and it is replaced with the contents of partials/nav.html, in dev and in the build.
function htmlPartials() {
  const dir = resolve(__dirname, "partials");

  return {
    name: "html-partials",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
          readFileSync(resolve(dir, `${name}.html`), "utf-8")
        );
      },
    },
    // reload the page when a partial is edited while `npm run dev` is running
    handleHotUpdate({ file, server }) {
      if (file.replace(/\\/g, "/").includes("/partials/")) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

// After the build, turns dist/projects.html into dist/projects/index.html,
// so the URL /projects works on any host (Hostinger included) with no
// server rewrite rules. Add a page name here whenever you add a new page.
function cleanUrls(pages) {
  let outDir = resolve(__dirname, "dist");

  return {
    name: "clean-urls",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const page of pages) {
        const from = resolve(outDir, `${page}.html`);
        if (!existsSync(from)) continue;
        mkdirSync(resolve(outDir, page), { recursive: true });
        renameSync(from, resolve(outDir, page, "index.html"));
      }
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials(), cleanUrls(["projects", "contact"])],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        projects: resolve(__dirname, "projects.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
    copyPublicDir: true,
  },
});