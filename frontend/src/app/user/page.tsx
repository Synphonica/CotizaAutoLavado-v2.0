"use client";
import { UserProfile } from "@clerk/nextjs";
import { ModernNavbar } from "@/components/Navbar";

export default function Page() {
  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        <div className="min-h-[70vh] flex items-center justify-center py-10">
          <UserProfile routing="path" path="/user" />
        </div>
      </div>
    </>
  );
}


