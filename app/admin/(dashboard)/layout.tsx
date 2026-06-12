import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const isAuthorized = await verifyAdminSession();

    // If session is not active/valid, redirect to passcode authentication page
    if (!isAuthorized) {
        redirect("/admin/login");
    }

    // Admin is authorized, render sidebar and page content
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-neon-bg)]">
            <AdminSidebar user={{
                name: "Administrator",
                email: "Console Active",
                image: null,
            }} />
            <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-10 relative">
                {/* Decorative radial glows */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-neon-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-neon-secondary)]/3 blur-[120px] rounded-full pointer-events-none" />
                {children}
            </main>
        </div>
    );
}
