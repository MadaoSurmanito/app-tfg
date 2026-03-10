"use client";

import { useState } from "react";
import HeaderTitle from "../components/HeaderTitle";

// Página de inicio para comerciales
export default function ComercialsHome() {
	const [leaving, setLeaving] = useState(false);

	return <HeaderTitle title="Página de comerciales" />;
}
