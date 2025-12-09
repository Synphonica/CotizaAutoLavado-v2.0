"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AdminRoute } from "@/components/ProtectedRoute";
import { useApi } from "@/hooks/useApi";
import {
    Search,
    MoreHorizontal,
    UserCog,
    Shield,
    Ban,
    CheckCircle,
    XCircle,
    RefreshCw,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Users
} from "lucide-react";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "CUSTOMER" | "PROVIDER" | "ADMIN";
    status: string;
    clerkId: string | null;
    createdAt: string;
    avatar: string | null;
}

export default function AdminUsersPage() {
    const { get, patch, delete: del } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dialogType, setDialogType] = useState<"role" | "delete" | null>(null);
    const [newRole, setNewRole] = useState<string>("");

    useEffect(() => {
        loadUsers();
    }, [page, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (roleFilter && roleFilter !== "all") {
                params.append("role", roleFilter);
            }

            const response = await get<any>(`/users?${params.toString()}`);

            if (response) {
                setUsers(response.data || response.users || []);
                setTotal(response.total || 0);
                setTotalPages(response.totalPages || Math.ceil((response.total || 0) / 10));
            }
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            await patch(`/users/${selectedUser.id}`, { role: newRole });
            toast.success(`Rol actualizado a ${newRole}`);
            setDialogType(null);
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Error al actualizar el rol");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            await del(`/users/${selectedUser.id}`);
            toast.success("Usuario eliminado correctamente");
            setDialogType(null);
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Error al eliminar el usuario");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getRoleBadge = (role: string) => {
        const roleConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
            ADMIN: { variant: "default", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
            PROVIDER: { variant: "secondary", className: "bg-green-100 text-green-700 hover:bg-green-100" },
            CUSTOMER: { variant: "outline", className: "bg-blue-50 text-blue-700 hover:bg-blue-50" },
        };
        const config = roleConfig[role] || roleConfig.CUSTOMER;
        return <Badge variant={config.variant} className={config.className}>{role}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        if (status === "ACTIVE") {
            return <Badge variant="outline" className="bg-green-50 text-green-700">Activo</Badge>;
        }
        return <Badge variant="outline" className="bg-red-50 text-red-700">Inactivo</Badge>;
    };

    return (
        <AdminRoute>
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        <p className="text-gray-600 mt-1">Administra los usuarios de la plataforma</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={loadUsers}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Usuarios</p>
                                    <p className="text-2xl font-bold">{total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Clientes</p>
                                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'CUSTOMER').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <UserCog className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Usuarios Proveedor</p>
                                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'PROVIDER').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Admins</p>
                                    <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por email, nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
                                        <SelectValue placeholder="Filtrar por rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los roles</SelectItem>
                                        <SelectItem value="CUSTOMER">Cliente</SelectItem>
                                        <SelectItem value="PROVIDER">Proveedor</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Users Table */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile view - Cards */}
                                    <div className="block md:hidden space-y-3 p-4">
                                        {filteredUsers.length === 0 ? (
                                            <p className="text-center py-8 text-gray-500">No se encontraron usuarios</p>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <motion.div
                                                    key={user.id}
                                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewRole(user.role);
                                                        setDialogType("role");
                                                    }}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                {user.avatar ? (
                                                                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                                                                ) : (
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium truncate">
                                                                    {user.firstName || user.lastName
                                                                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                                        : 'Sin nombre'}
                                                                </p>
                                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        {getRoleBadge(user.role)}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Estado:</span>
                                                            {getStatusBadge(user.status || 'ACTIVE')}
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Registro:</span>
                                                            <span className="text-gray-900">
                                                                {new Date(user.createdAt).toLocaleDateString('es-CL')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop view - Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Usuario</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Rol</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead>Clerk ID</TableHead>
                                                    <TableHead>Fecha registro</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUsers.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                            No se encontraron usuarios
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredUsers.map((user) => (
                                                        <TableRow key={user.id}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                        {user.avatar ? (
                                                                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                                                                        ) : (
                                                                            <span className="text-sm font-medium text-gray-600">
                                                                                {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {user.firstName || user.lastName
                                                                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                                                : 'Sin nombre'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-gray-600">{user.email}</TableCell>
                                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                            <TableCell>{getStatusBadge(user.status || 'ACTIVE')}</TableCell>
                                                            <TableCell>
                                                                {user.clerkId ? (
                                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                        {user.clerkId.substring(0, 12)}...
                                                                    </code>
                                                                ) : (
                                                                    <span className="text-gray-400 text-sm">Sin Clerk</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-gray-600">
                                                                {new Date(user.createdAt).toLocaleDateString('es-CL')}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedUser(user);
                                                                                setNewRole(user.role);
                                                                                setDialogType("role");
                                                                            }}
                                                                        >
                                                                            <UserCog className="h-4 w-4 mr-2" />
                                                                            Cambiar rol
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                setSelectedUser(user);
                                                                                setDialogType("delete");
                                                                            }}
                                                                        >
                                                                            <Ban className="h-4 w-4 mr-2" />
                                                                            Eliminar usuario
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
                                        <p className="text-sm text-gray-600">
                                            Mostrando {filteredUsers.length} de {total} usuarios
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm text-gray-600">
                                                Página {page} de {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Change Role Dialog */}
                <Dialog open={dialogType === "role"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                            <DialogDescription>
                                Cambiar el rol de {selectedUser?.email}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar nuevo rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
                                    <SelectItem value="PROVIDER">Proveedor</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleChangeRole}>
                                Guardar cambios
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete User Dialog */}
                <Dialog open={dialogType === "delete"} onOpenChange={() => setDialogType(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar Usuario</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que deseas eliminar a {selectedUser?.email}? Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogType(null)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteUser}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminRoute>
    );
}
