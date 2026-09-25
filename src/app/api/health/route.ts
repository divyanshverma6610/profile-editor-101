import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // The app itself is fully client-side; the database check is optional
  // infrastructure. Report healthy even when no database is configured.
  if (!process.env.DATABASE_URL) {
    return Response.json({ ok: true, db: "skipped" });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, db: "ok" });
  } catch {
    return Response.json({ ok: false, db: "error" }, { status: 500 });
  }
}
