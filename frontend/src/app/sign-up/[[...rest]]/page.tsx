"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const role = searchParams?.get('role');

  // Guardar el rol seleccionado en localStorage
  useEffect(() => {
    if (role && typeof window !== 'undefined') {
      localStorage.setItem('selectedRole', role);
    }
  }, [role]);

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Auth deshabilitado</h1>
          <p>Configura NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY para habilitar Clerk.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="mb-6 text-center">
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
