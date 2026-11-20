// The shared config below already includes: TanStack devtools (dev-only), tanstackStart, viteReact,
// tailwindcss, tsConfigPaths, nitro (build-only, cloudflare target by default), VITE_* env injection,
// the @ path alias and React/TanStack dedupe. Do NOT add them again or the app will break with
// duplicate plugins.
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so the
// build fails. Never add compression: hosting already compresses at the edge.
// Extra options can be passed via defineConfig({ vite: { ... } }).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
