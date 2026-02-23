import { pool } from "../lib/db";

type DemoItem = {
  id: number;
  name: string;
  created_at: string; // viene como string/Date según pg config; lo tratamos como string
};

export const dynamic = "force-dynamic"; // para que no cachee en dev/probar rápido

export default async function DemoItemsPage() {
  const { rows } = await pool.query<DemoItem>(
    "SELECT id, name, created_at FROM demo_items ORDER BY id ASC"
  );

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>Demo items</h1>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Listado cargado desde PostgreSQL
          </p>
        </div>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: 12,
            opacity: 0.8,
          }}
        >
          {rows.length} registros
        </span>
      </header>

      <section style={{ marginTop: 24 }}>
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 240px",
              gap: 12,
              padding: "12px 16px",
              fontWeight: 600,
              background: "rgba(0,0,0,0.03)",
            }}
          >
            <div>ID</div>
            <div>Nombre</div>
            <div>Fecha</div>
          </div>

          {rows.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 240px",
                gap: 12,
                padding: "12px 16px",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                alignItems: "center",
              }}
            >
              <div style={{ fontFamily: "monospace" }}>#{item.id}</div>
              <div style={{ fontWeight: 500 }}>{item.name}</div>
              <div style={{ opacity: 0.75 }}>
                {new Date(item.created_at).toLocaleString("es-ES")}
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div style={{ padding: 16, opacity: 0.7 }}>
              No hay registros en la tabla <code>demo_items</code>.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}