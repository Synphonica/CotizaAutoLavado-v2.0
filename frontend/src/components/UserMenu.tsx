"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Calendar,
    Heart,
    Bell,
    History,
    Settings,
    LogOut,
    ChevronDown,
    DollarSign,
    Star,
    Shield,
    HelpCircle,
    Building2,
    LayoutDashboard,
} from "lucide-react";

export function UserMenu() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    if (!user) return null;

    const userInitials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
    const userRole = ((user.publicMetadata?.role as string) || "CUSTOMER").toUpperCase();

    const getRoleBadge = () => {
        switch (userRole) {
            case "ADMIN":
                return { label: "Admin", color: "bg-red-500" };
            case "PROVIDER":
                return { label: "Proveedor", color: "bg-blue-500" };
            default:
                return { label: "Cliente", color: "bg-green-500" };
        }
    };

    const isAdmin = userRole === "ADMIN";
    const isProvider = userRole === "PROVIDER";

    const roleBadge = getRoleBadge();

    // Construir los items del menú dinámicamente según el rol
    const menuItems = [
        // Panel de Administración (solo para admins)
        ...(isAdmin ? [{
            group: "Administración",
            items: [
                {
                    label: "Panel de Admin",
                    icon: LayoutDashboard,
                    href: "/admin",
                    description: "Gestionar la plataforma",
                },
            ],
        }] : []),
        // Panel de Proveedor (solo para proveedores)
        ...(isProvider ? [{
            group: "Mi Negocio",
            items: [
                {
                    label: "Panel de Proveedor",
                    icon: Building2,
                    href: "/provider/dashboard",
                    description: "Gestionar mi autolavado",
                },
            ],
        }] : []),
        {
            group: "Mi Cuenta",
            items: [
                {
                    label: "Mi Perfil",
                    icon: User,
                    href: "/user/profile",
                    description: "Edita tu información personal",
                },
            ],
        },
        {
            group: "Ajustes",
            items: [
                {
                    label: "Configuración",
                    icon: Settings,
                    href: "/user/settings",
                    description: "Preferencias y privacidad",
                },
                {
                    label: "Notificaciones",
                    icon: Bell,
                    href: "/user/notifications",
                    description: "Administrar notificaciones",
                },
                {
                    label: "Ayuda",
                    icon: HelpCircle,
                    href: "/help",
                    description: "Centro de ayuda",
                },
            ],
        },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                    <Avatar className="h-10 w-10 rounded-xl border-2 border-blue-500">
                        <AvatarImage src={user.imageUrl} alt={user.fullName || "Usuario"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-xl">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.firstName || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3 p-2">
                        <Avatar className="h-14 w-14 rounded-xl border-2 border-blue-500">
                            <AvatarImage src={user.imageUrl} alt={user.fullName || "Usuario"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {user.fullName || "Usuario"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                            <Badge
                                variant="secondary"
                                className={`${roleBadge.color} text-white w-fit text-xs`}
                            >
                                {roleBadge.label}
                            </Badge>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {menuItems.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold px-3 py-2">
                                {group.group}
                            </DropdownMenuLabel>
                            {group.items.map((item, itemIndex) => {
                                const Icon = item.icon;
                                return (
                                    <DropdownMenuItem
                                        key={itemIndex}
                                        className="cursor-pointer px-3 py-3 focus:bg-blue-50 dark:focus:bg-blue-950"
                                        onClick={() => router.push(item.href)}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                                <Icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.label}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                        {groupIndex < menuItems.length - 1 && <DropdownMenuSeparator />}
                    </div>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer px-3 py-3 focus:bg-red-50 dark:focus:bg-red-950 text-red-600 dark:text-red-400"
                    onClick={() => signOut(() => router.push("/"))}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                            <LogOut className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Cerrar Sesión</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Salir de tu cuenta
                            </p>
                        </div>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
