-- ====================================
-- HABILITAR RLS EN TABLAS FALTANTES
-- ====================================
-- Este script habilita RLS en price_alerts y price_history

-- 1. Habilitar RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- ====================================
-- POLÍTICAS PARA price_alerts
-- ====================================

-- Los usuarios pueden ver sus propias alertas
CREATE POLICY "price_alerts_select_policy" ON public.price_alerts
  FOR SELECT
  USING (true); -- Será validado por tu backend (Clerk auth)

-- Los usuarios autenticados pueden crear alertas
CREATE POLICY "price_alerts_insert_policy" ON public.price_alerts
  FOR INSERT
  WITH CHECK (true); -- Será validado por tu backend

-- Los usuarios pueden actualizar sus propias alertas
CREATE POLICY "price_alerts_update_policy" ON public.price_alerts
  FOR UPDATE
  USING (true); -- Será validado por tu backend

-- Los usuarios pueden eliminar sus propias alertas
CREATE POLICY "price_alerts_delete_policy" ON public.price_alerts
  FOR DELETE
  USING (true); -- Será validado por tu backend

-- ====================================
-- POLÍTICAS PARA price_history
-- ====================================

-- Permitir lectura pública del historial de precios
CREATE POLICY "price_history_select_policy" ON public.price_history
  FOR SELECT
  USING (true);

-- Solo el backend puede crear registros de historial
CREATE POLICY "price_history_insert_policy" ON public.price_history
  FOR INSERT
  WITH CHECK (true); -- Será validado por tu backend

-- Solo el backend puede actualizar historial
CREATE POLICY "price_history_update_policy" ON public.price_history
  FOR UPDATE
  USING (true); -- Será validado por tu backend

-- Solo admins pueden eliminar historial
CREATE POLICY "price_history_delete_policy" ON public.price_history
  FOR DELETE
  USING (true); -- Será validado por tu backend

-- ====================================
-- VERIFICAR QUE RLS ESTÁ HABILITADO
-- ====================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('price_alerts', 'price_history');
