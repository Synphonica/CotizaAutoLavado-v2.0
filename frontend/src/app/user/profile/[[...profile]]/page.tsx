"use client";

import { UserProfile } from "@clerk/nextjs";
import { ModernNavbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ModernNavbar />
            <div className="min-h-screen bg-gray-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center">
                        <UserProfile
                            routing="path"
                            path="/user/profile"
                            appearance={{
                                elements: {
                                    rootBox: "mx-auto",
                                    card: "shadow-xl"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
