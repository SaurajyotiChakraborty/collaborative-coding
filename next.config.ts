import type { NextConfig } from "next";
import { withLingo } from "@lingo.dev/compiler/next";

const nextConfig: NextConfig = {};

export default async function (): Promise<NextConfig> {
  return await withLingo(nextConfig, {
    sourceRoot: "./app",
    sourceLocale: "en",
    targetLocales: ["es", "de", "fr"],
    models: "lingo.dev",
    dev: {
      usePseudotranslator: false, // Show real translations or source text
    },
    // models: {
    //   "*:*": "google:gemini-1.5-flash"
    // },
  });
}