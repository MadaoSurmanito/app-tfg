import { NextResponse } from "next/server";
import { pool } from "../../lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at FROM demo_items ORDER BY id ASC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}