import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/regulated-digital-access-tokens/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
