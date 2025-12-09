"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIInsightsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir al dashboard con el hash de la pestaña AI
        router.replace("/provider/dashboard#ai-insights");
    }, [router]);

    return null;
}
