import { INK, PAPER } from "./types";

/**
 * Effects compile to a list of vector primitives. The same primitive list
 * drives three render targets:
 *   1. the p5.js live preview   (lib/effects/p5painter.ts)
 *   2. a Canvas 2D PNG exporter (paintCanvas, below)
 *   3. an SVG serializer        (buildSvg, below)
 * keeping pixels and vectors perfectly in sync.
 */

export interface CirclePrim {
  kind: "circle";
  x: number;
  y: number;
  r: number;
}
export interface PolylinePrim {
  kind: "polyline";
  pts: number[];
  w: number;
  close?: boolean;
}
/** Polyline with per-segment width — used by the spiral. Vector-unsafe. */
export interface VarlinePrim {
  kind: "varline";
  pts: number[];
  ws: number[];
}
/** Filled occlusion band used by the Joy Division lines effect. */
export interface BandPrim {
  kind: "band";
  pts: number[];
  w: number;
  base: number;
}
export interface TextPrim {
  kind: "text";
  x: number;
  y: number;
  ch: string;
  px: number;
}

export type Prim = CirclePrim | PolylinePrim | VarlinePrim | BandPrim | TextPrim;

const MONO_STACK = `"Geist Mono", "JetBrains Mono", ui-monospace, monospace`;

/* ------------------------------------------------------------------ */
/* Canvas 2D painter (PNG export + tests)                              */
/* ------------------------------------------------------------------ */

export function paintCanvas(
  ctx: CanvasRenderingContext2D,
  prims: Prim[],
  size: number
) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const prim of prims) {
    switch (prim.kind) {
      case "circle": {
        ctx.beginPath();
        ctx.fillStyle = INK;
        ctx.arc(prim.x, prim.y, prim.r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "polyline": {
        tracePolyline(ctx, prim.pts, prim.close);
        ctx.strokeStyle = INK;
        ctx.lineWidth = prim.w;
        ctx.stroke();
        break;
      }
      case "varline": {
        ctx.strokeStyle = INK;
        for (let i = 0; i < prim.pts.length / 2 - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(prim.pts[i * 2], prim.pts[i * 2 + 1]);
          ctx.lineTo(prim.pts[i * 2 + 2], prim.pts[i * 2 + 3]);
          ctx.lineWidth = prim.ws[i + 1];
          ctx.stroke();
        }
        break;
      }
      case "band": {
        ctx.beginPath();
        ctx.moveTo(prim.pts[0], prim.pts[1]);
        for (let i = 1; i < prim.pts.length / 2; i++) {
          ctx.lineTo(prim.pts[i * 2], prim.pts[i * 2 + 1]);
        }
        ctx.lineTo(prim.pts[prim.pts.length - 2], prim.base);
        ctx.lineTo(prim.pts[0], prim.base);
        ctx.closePath();
        ctx.fillStyle = PAPER;
        ctx.fill();
        tracePolyline(ctx, prim.pts, false);
        ctx.strokeStyle = INK;
        ctx.lineWidth = prim.w;
        ctx.stroke();
        break;
      }
      case "text": {
        ctx.fillStyle = INK;
        ctx.font = `${prim.px}px ${MONO_STACK}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(prim.ch, prim.x, prim.y);
        break;
      }
    }
  }
}

function tracePolyline(ctx: CanvasRenderingContext2D, pts: number[], close?: boolean) {
  if (pts.length < 4) return;
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 1; i < pts.length / 2; i++) ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
  if (close) ctx.closePath();
}

/* ------------------------------------------------------------------ */
/* SVG serializer (vector export)                                      */
/* ------------------------------------------------------------------ */

const f = (n: number) => Math.round(n * 10) / 10;

export function buildSvg(prims: Prim[], size: number): string {
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    `<rect width="${size}" height="${size}" fill="${PAPER}"/>`,
  ];

  for (const prim of prims) {
    switch (prim.kind) {
      case "circle":
        parts.push(
          `<circle cx="${f(prim.x)}" cy="${f(prim.y)}" r="${f(prim.r)}" fill="${INK}"/>`
        );
        break;
      case "polyline": {
        const points = pairPoints(prim.pts);
        parts.push(
          `<polyline points="${points}" fill="none" stroke="${INK}" stroke-width="${f(
            prim.w
          )}" stroke-linecap="round" stroke-linejoin="round"${
            prim.close ? ' data-closed="true"' : ""
          }/>`
        );
        break;
      }
      case "band": {
        const curve = pairPoints(prim.pts);
        const lastX = f(prim.pts[prim.pts.length - 2]);
        const firstX = f(prim.pts[0]);
        parts.push(
          `<polygon points="${curve} ${lastX},${f(prim.base)} ${firstX},${f(
            prim.base
          )}" fill="${PAPER}"/>`,
          `<polyline points="${curve}" fill="none" stroke="${INK}" stroke-width="${f(
            prim.w
          )}" stroke-linecap="round" stroke-linejoin="round"/>`
        );
        break;
      }
      case "text":
        if (prim.ch.trim().length) {
          parts.push(
            `<text x="${f(prim.x)}" y="${f(prim.y)}" font-family="${MONO_STACK.replace(
              /"/g,
              "'"
            )}" font-size="${f(prim.px)}" text-anchor="middle" dominant-baseline="central" fill="${INK}">${escapeXml(
              prim.ch
            )}</text>`
          );
        }
        break;
      case "varline":
        // Per-segment width is not representable as a single SVG stroke;
        // effects using varline opt out of SVG export entirely.
        break;
    }
  }

  parts.push("</svg>");
  return parts.join("\n");
}

function pairPoints(pts: number[]): string {
  const out: string[] = [];
  for (let i = 0; i < pts.length / 2; i++) out.push(`${f(pts[i * 2])},${f(pts[i * 2 + 1])}`);
  return out.join(" ");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
