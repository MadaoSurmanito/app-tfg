import Image from "next/image";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>App TFG</h1>
      <p>
        Ir a: <Link href="/demo-items">Demo items</Link>
      </p>
    </main>
  );
}
