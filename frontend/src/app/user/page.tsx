"use client";
import { UserProfile } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <UserProfile routing="path" path="/user" />
    </div>
  );
}


