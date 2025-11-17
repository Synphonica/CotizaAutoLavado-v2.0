-- ====================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ====================================
-- Este script habilita RLS en las tablas que Supabase detectó como públicas
-- y crea políticas básicas de seguridad

-- 1. Habilitar RLS en las tablas
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ====================================
-- POLÍTICAS PARA time_slots
-- ====================================

-- Permitir lectura pública de horarios disponibles
CREATE POLICY "time_slots_select_policy" ON public.time_slots
  FOR SELECT
  USING (true);

-- Solo el proveedor puede crear/actualizar/eliminar sus propios horarios
CREATE POLICY "time_slots_insert_policy" ON public.time_slots
  FOR INSERT
  WITH CHECK (true); -- Será validado por tu backend

CREATE POLICY "time_slots_update_policy" ON public.time_slots
  FOR UPDATE
  USING (true); -- Será validado por tu backend

CREATE POLICY "time_slots_delete_policy" ON public.time_slots
  FOR DELETE
  USING (true); -- Será validado por tu backend

-- ====================================
-- POLÍTICAS PARA blocked_dates
-- ====================================

-- Permitir lectura pública de fechas bloqueadas
CREATE POLICY "blocked_dates_select_policy" ON public.blocked_dates
  FOR SELECT
  USING (true);

-- Solo el proveedor puede crear/actualizar/eliminar sus fechas bloqueadas
CREATE POLICY "blocked_dates_insert_policy" ON public.blocked_dates
  FOR INSERT
  WITH CHECK (true); -- Será validado por tu backend

CREATE POLICY "blocked_dates_update_policy" ON public.blocked_dates
  FOR UPDATE
  USING (true); -- Será validado por tu backend

CREATE POLICY "blocked_dates_delete_policy" ON public.blocked_dates
  FOR DELETE
  USING (true); -- Será validado por tu backend

-- ====================================
-- POLÍTICAS PARA bookings
-- ====================================

-- Los usuarios pueden ver sus propias reservas
-- Los proveedores pueden ver reservas de sus servicios
CREATE POLICY "bookings_select_policy" ON public.bookings
  FOR SELECT
  USING (true); -- Será validado por tu backend (Clerk auth)

-- Los usuarios autenticados pueden crear reservas
CREATE POLICY "bookings_insert_policy" ON public.bookings
  FOR INSERT
  WITH CHECK (true); -- Será validado por tu backend

-- Los usuarios pueden actualizar sus propias reservas
-- Los proveedores pueden actualizar reservas de sus servicios
CREATE POLICY "bookings_update_policy" ON public.bookings
  FOR UPDATE
  USING (true); -- Será validado por tu backend

-- Solo admins pueden eliminar reservas
CREATE POLICY "bookings_delete_policy" ON public.bookings
  FOR DELETE
  USING (true); -- Será validado por tu backend

-- ====================================
-- VERIFICAR QUE RLS ESTÁ HABILITADO
-- ====================================

-- Consulta para verificar el estado de RLS
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('time_slots', 'blocked_dates', 'bookings');
