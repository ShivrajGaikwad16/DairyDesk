import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   build: {
      rollupOptions: {
         // Externalize Node.js core modules (if accidentally bundled)
         external: ["fs", "path", "os", "stream", "crypto", "util", "buffer"],
         output: {
            manualChunks(id) {
               if (id.includes("node_modules")) {
                  return id
                     .toString()
                     .split("node_modules/")[1]
                     .split("/")[0]
                     .toString();
               }
            },
         },
      },
      chunkSizeWarningLimit: 1000, // Optional: increase default limit from 500kB
   },
});
