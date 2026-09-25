import type { Metadata } from "next";
import Editor from "@/components/editor/Editor";

export const metadata: Metadata = {
  title: "Portraitify — Algorithmic Profile Image Generator",
  description:
    "Turn any photo into generative profile art — spiral, lines, dots, halftone, waveform and ASCII. 100% client-side, installable, works offline.",
};

export default function HomePage() {
  return <Editor />;
}
