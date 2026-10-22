import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  const tables = await db.run(sql`select name from sqlite_master where type='table'`);
  console.log("TABLES:", JSON.stringify(tables.rows.map((r: any) => r.name)));

  const cols = await db.run(sql`PRAGMA table_info(requests)`);
  console.log(
    "requests cols:",
    cols.rows.map((r: any) => r.name).join(", "),
  );

  const counties = await db.run(sql`select kind, count(*) as n from content_blocks group by kind`);
  console.log("BLOCKS:", JSON.stringify(counties.rows));

  const settings = await db.run(sql`select key from settings where key like '%referral%' or key like '%technician%' or key like '%Location%' or key like '%location%'`);
  console.log("NEW SETTINGS:", JSON.stringify(settings.rows.map((r: any) => r.key)));
  process.exit(0);
}

main();
