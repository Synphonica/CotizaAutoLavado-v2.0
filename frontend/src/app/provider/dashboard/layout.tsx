import { ModernNavbar } from "@/components/Navbar";

export default function ProviderDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <ModernNavbar />
            <main className="flex-1">{children}</main>
        </div>
    );
}
