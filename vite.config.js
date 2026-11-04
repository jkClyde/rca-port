import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync } from "fs";

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

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        observatory: resolve(__dirname, "observatory.html"),
        expedition: resolve(__dirname, "expedition.html"),
        traces: resolve(__dirname, "traces.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
    copyPublicDir: true,
  },
});