"use client";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
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
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
