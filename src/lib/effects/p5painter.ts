import type p5 from "p5";
import type { Prim } from "./primitives";
import { INK, PAPER } from "./types";

/** Paint a compiled primitive list through a p5 instance (live preview). */
export function paintWithP5(p: p5, prims: Prim[]) {
  p.push();
  p.background(PAPER);
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);

  for (const prim of prims) {
    switch (prim.kind) {
      case "circle": {
        p.noStroke();
        p.fill(INK);
        p.circle(prim.x, prim.y, prim.r * 2);
        break;
      }
      case "polyline": {
        p.noFill();
        p.stroke(INK);
        p.strokeWeight(prim.w);
        p.beginShape();
        for (let i = 0; i < prim.pts.length / 2; i++) {
          p.vertex(prim.pts[i * 2], prim.pts[i * 2 + 1]);
        }
        p.endShape(prim.close ? p.CLOSE : undefined);
        break;
      }
      case "varline": {
        p.noFill();
        p.stroke(INK);
        for (let i = 0; i < prim.pts.length / 2 - 1; i++) {
          p.strokeWeight(prim.ws[i + 1]);
          p.line(
            prim.pts[i * 2],
            prim.pts[i * 2 + 1],
            prim.pts[i * 2 + 2],
            prim.pts[i * 2 + 3]
          );
        }
        break;
      }
      case "band": {
        // Filled polygon erases whatever sits behind this row…
        p.noStroke();
        p.fill(PAPER);
        p.beginShape();
        for (let i = 0; i < prim.pts.length / 2; i++) {
          p.vertex(prim.pts[i * 2], prim.pts[i * 2 + 1]);
        }
        p.vertex(prim.pts[prim.pts.length - 2], prim.base);
        p.vertex(prim.pts[0], prim.base);
        p.endShape(p.CLOSE);
        // …then the ridgeline itself is stroked on top.
        p.noFill();
        p.stroke(INK);
        p.strokeWeight(prim.w);
        p.beginShape();
        for (let i = 0; i < prim.pts.length / 2; i++) {
          p.vertex(prim.pts[i * 2], prim.pts[i * 2 + 1]);
        }
        p.endShape();
        break;
      }
      case "text": {
        p.noStroke();
        p.fill(INK);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("Geist Mono, JetBrains Mono, ui-monospace, monospace");
        p.textSize(prim.px);
        p.text(prim.ch, prim.x, prim.y);
        break;
      }
    }
  }

  p.pop();
}
