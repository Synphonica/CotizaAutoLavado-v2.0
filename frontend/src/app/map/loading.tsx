import { ModernNavbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-6" />
            
            {/* Buttons */}
            <div className="flex gap-3 mb-6">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Skeleton */}
            <div className="lg:col-span-2">
              <div className="h-[600px] bg-gray-200 rounded-lg animate-pulse relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400 text-lg">Cargando mapa...</div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-48 bg-gray-200 rounded animate-pulse" />
              </div>
              
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-3">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
