"use client";

import { useState } from "react";
import HeaderTitle from "../components/HeaderTitle";

// Página de inicio para el admin panel.
export default function AdminHome() {
	const [leaving, setLeaving] = useState(false);

	return <HeaderTitle title="Página de administración" />;
}
