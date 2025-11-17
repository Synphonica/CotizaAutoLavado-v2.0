# 🚗 Historias de Usuario - Alto Carwash

## Descripción del Proyecto

**Alto Carwash** es una plataforma digital agregadora de servicios de lavado automotriz que conecta a propietarios de vehículos con autolavados en Chile. La plataforma centraliza información de precios de múltiples proveedores, permite comparación transparente de servicios en tiempo real, búsqueda por geolocalización, gestión de reservas, y ofrece recomendaciones personalizadas mediante inteligencia artificial. El sistema actúa como intermediario neutral entre usuarios y proveedores de servicios de autolavado.

---

## 📋 Tabla de Contenidos

- [Tabla Resumen de Historias](#tabla-resumen-de-historias)
- [Historias de Usuario Detalladas](#historias-de-usuario-detalladas)
- [Épicas](#épicas)
- [Notas de Planificación](#notas-de-planificación)

---

## Tabla Resumen de Historias

| ID | Título | Rol | Puntos | Epic |
|---|---|---|---|---|
| HU-001 | Registro de usuario en la plataforma | Usuario/Cliente | 5 | EPI-01 |
| HU-002 | Inicio de sesión en la plataforma | Usuario/Cliente | 3 | EPI-01 |
| HU-003 | Recuperación de contraseña | Usuario/Cliente | 3 | EPI-01 |
| HU-004 | Gestión de perfil de usuario | Usuario/Cliente | 3 | EPI-01 |
| HU-005 | Búsqueda de autolavados por ubicación | Usuario/Cliente | 8 | EPI-02 |
| HU-006 | Búsqueda avanzada con filtros | Usuario/Cliente | 5 | EPI-02 |
| HU-007 | Visualización de mapa interactivo | Usuario/Cliente | 8 | EPI-02 |
| HU-008 | Comparación de precios entre proveedores | Usuario/Cliente | 8 | EPI-03 |
| HU-009 | Visualización de detalles del proveedor | Usuario/Cliente | 5 | EPI-03 |
| HU-010 | Gestión de lista de favoritos | Usuario/Cliente | 5 | EPI-01 |
| HU-011 | Visualización de historial de búsquedas | Usuario/Cliente | 3 | EPI-01 |
| HU-012 | Sistema de reseñas y calificaciones | Usuario/Cliente | 8 | EPI-04 |
| HU-013 | Reserva de servicio de lavado | Usuario/Cliente | 8 | EPI-05 |
| HU-014 | Cancelación de reserva | Usuario/Cliente | 3 | EPI-05 |
| HU-015 | Visualización de historial de reservas | Usuario/Cliente | 3 | EPI-05 |
| HU-016 | Notificaciones push de recordatorios | Usuario/Cliente | 5 | EPI-01 |
| HU-017 | Recomendaciones personalizadas con IA | Usuario/Cliente | 13 | EPI-06 |
| HU-018 | Registro de proveedor | Proveedor | 8 | EPI-07 |
| HU-019 | Gestión de perfil de negocio | Proveedor | 5 | EPI-07 |
| HU-020 | Gestión de catálogo de servicios | Proveedor | 8 | EPI-07 |
| HU-021 | Configuración de horarios disponibles | Proveedor | 5 | EPI-07 |
| HU-022 | Gestión de reservas recibidas | Proveedor | 8 | EPI-05 |
| HU-023 | Dashboard de estadísticas del proveedor | Proveedor | 13 | EPI-07 |
| HU-024 | Gestión de promociones y descuentos | Proveedor | 8 | EPI-07 |
| HU-025 | Respuesta a reseñas de clientes | Proveedor | 5 | EPI-04 |
| HU-026 | Sistema de verificación de proveedores | Admin | 8 | EPI-08 |
| HU-027 | Dashboard administrativo completo | Admin | 13 | EPI-08 |
| HU-028 | Gestión de usuarios y moderación | Admin | 8 | EPI-08 |
| HU-029 | Configuración de parámetros del sistema | Admin | 5 | EPI-08 |
| HU-030 | Scraping y agregación de datos | Sistema | 13 | EPI-06 |

**Total Puntos de Historia:** 210

---

## Historias de Usuario Detalladas

### HU-001: Registro de usuario en la plataforma

**Título:** Como usuario potencial, quiero registrarme en la plataforma para acceder a los servicios personalizados de búsqueda y reserva de autolavados.

**Descripción:**  
El sistema debe permitir el registro de nuevos usuarios mediante un formulario que capture información básica y valide los datos ingresados. Se utiliza Clerk para la autenticación.

**Criterios de Aceptación:**
1. El formulario de registro incluye campos para email, contraseña, nombre, apellido, y opcionalmente teléfono y fecha de nacimiento.
2. Se valida que el email sea único en el sistema y tenga formato válido.
3. La contraseña debe cumplir requisitos mínimos de seguridad (mínimo 8 caracteres, al menos una mayúscula, un número).
4. Se envía un correo de verificación al email registrado.
5. Se muestra un mensaje de error descriptivo si los campos son inválidos o el email ya existe.
6. Tras el registro exitoso, se redirige al usuario a completar su perfil o al dashboard principal.
7. Opción de registro mediante redes sociales (Google, Facebook) usando Clerk.

**Puntos de Historia:** 5  
**Prioridad:** Must  
**Dependencias:** Ninguna

---

### HU-002: Inicio de sesión en la plataforma

**Título:** Como usuario registrado, quiero iniciar sesión en la plataforma para acceder a mi perfil y funcionalidades personalizadas.

**Descripción:**  
Sistema de autenticación que permite a los usuarios acceder a sus cuentas de forma segura mediante credenciales o métodos biométricos.

**Criterios de Aceptación:**
1. Soporte para login con email/contraseña a través de Clerk.
2. Opción de "olvidé mi contraseña" que envía enlace de recuperación.
3. Integración con autenticación biométrica (huella o facial) si el dispositivo móvil lo permite.
4. Se muestra mensaje de error claro para credenciales inválidas o cuenta no verificada.
5. Tras login exitoso, se carga el dashboard principal con datos personalizados del usuario.
6. Soporte para "recordar sesión" con tokens JWT seguros.
7. Límite de intentos fallidos (3) antes de bloqueo temporal de 15 minutos.

**Puntos de Historia:** 3  
**Prioridad:** Must  
**Dependencias:** HU-001

---

### HU-003: Recuperación de contraseña

**Título:** Como usuario, quiero recuperar mi contraseña para poder acceder a mi cuenta si la olvidé.

**Descripción:**  
Flujo de recuperación de contraseña mediante envío de enlace único al email registrado.

**Criterios de Aceptación:**
1. Enlace "Olvidé mi contraseña" visible en la pantalla de login.
2. Formulario solicita el email del usuario registrado.
3. Se envía un enlace único de restablecimiento con expiración de 1 hora.
4. El enlace redirige a formulario para ingresar nueva contraseña.
5. Nueva contraseña debe cumplir los mismos requisitos de seguridad del registro.
6. Confirmación visual de que la contraseña fue cambiada exitosamente.
7. Notificación por email al usuario informando del cambio de contraseña.

**Puntos de Historia:** 3  
**Prioridad:** Must  
**Dependencias:** HU-001, HU-002

---

### HU-004: Gestión de perfil de usuario

**Título:** Como usuario registrado, quiero editar mi perfil personal para mantener mis datos actualizados y personalizar mi experiencia.

**Descripción:**  
Panel de configuración de perfil que permite al usuario actualizar sus datos personales y preferencias.

**Criterios de Aceptación:**
1. Campos editables: foto de perfil, nombre, apellido, teléfono, fecha de nacimiento.
2. Opción para configurar ubicación predeterminada para búsquedas.
3. Validación de formato para teléfono y otros campos.
4. Opción para cambiar contraseña con verificación de contraseña actual.
5. Los cambios se guardan en la base de datos y se reflejan inmediatamente en la interfaz.
6. Confirmación visual tras guardar cambios exitosamente.
7. Opción para eliminar cuenta con doble confirmación.

**Puntos de Historia:** 3  
**Prioridad:** Should  
**Dependencias:** HU-002

---

### HU-005: Búsqueda de autolavados por ubicación

**Título:** Como usuario, quiero buscar autolavados cercanos a mi ubicación para encontrar opciones convenientes.

**Descripción:**  
Motor de búsqueda geolocalizado que permite encontrar proveedores de autolavado según la ubicación del usuario o una dirección específica.

**Criterios de Aceptación:**
1. Campo de búsqueda principal acepta dirección, comuna, o ciudad.
2. Detección automática de ubicación GPS del usuario (con permiso).
3. Resultados se muestran ordenados por distancia (más cercano primero).
4. Cada resultado muestra: nombre, distancia, rating, precio desde, imagen principal.
5. Configuración de radio de búsqueda (1, 5, 10, 20 km).
6. Actualización en tiempo real de resultados al cambiar ubicación o radio.
7. Manejo de casos cuando no hay resultados (sugerencias de ampliar búsqueda).
8. Integración con Google Maps API para geocodificación.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** Ninguna  
**Nota técnica:** Complejidad alta debido a integración de geolocalización en tiempo real y optimización de consultas espaciales en PostgreSQL.

---

### HU-006: Búsqueda avanzada con filtros

**Título:** Como usuario, quiero aplicar filtros avanzados a mi búsqueda para encontrar autolavados que cumplan con mis necesidades específicas.

**Descripción:**  
Sistema de filtros múltiples que permite refinar búsquedas según diferentes criterios.

**Criterios de Aceptación:**
1. Filtros disponibles: tipo de servicio, rango de precio, rating mínimo, horario de atención, acepta reservas.
2. Filtros se aplican de forma dinámica sin recargar página.
3. Indicador visual del número de filtros activos.
4. Opción para limpiar todos los filtros con un clic.
5. Los filtros se mantienen al navegar entre resultados.
6. Combinación lógica de múltiples filtros (AND).
7. Contador de resultados encontrados actualizado en tiempo real.

**Puntos de Historia:** 5  
**Prioridad:** Should  
**Dependencias:** HU-005

---

### HU-007: Visualización de mapa interactivo

**Título:** Como usuario, quiero ver los autolavados en un mapa interactivo para visualizar su ubicación y seleccionar opciones cercanas.

**Descripción:**  
Mapa interactivo con marcadores de proveedores que permite exploración visual de opciones.

**Criterios de Aceptación:**
1. Mapa integrado con Google Maps muestra todos los resultados como marcadores.
2. Marcadores diferenciados por color según rating o tipo de servicio.
3. Click en marcador muestra card con información resumida del proveedor.
4. Botón para centrar mapa en ubicación actual del usuario.
5. Zoom y navegación fluida del mapa.
6. Actualización de resultados al mover/hacer zoom en el mapa.
7. Opción para alternar entre vista de lista y vista de mapa.
8. Cálculo y visualización de rutas desde ubicación actual al proveedor seleccionado.

**Puntos de Historia:** 8  
**Prioridad:** Should  
**Dependencias:** HU-005  
**Nota técnica:** Complejidad alta por integración profunda con Google Maps API y sincronización estado lista-mapa.

---

### HU-008: Comparación de precios entre proveedores

**Título:** Como usuario, quiero comparar precios y servicios entre diferentes autolavados para tomar la mejor decisión.

**Descripción:**  
Herramienta de comparación lado a lado que facilita la evaluación de múltiples proveedores.

**Criterios de Aceptación:**
1. Opción para agregar proveedores a una lista de comparación (máximo 4).
2. Tabla comparativa muestra: nombre, precios por servicio, rating, distancia, horarios, servicios incluidos.
3. Destacado visual de mejor precio para cada servicio.
4. Opción para eliminar proveedores de la comparación.
5. Botón de acción rápida para reservar desde la tabla comparativa.
6. Comparación persiste al navegar (guardada en sesión).
7. Exportar comparación como PDF o imagen para compartir.
8. Indicadores visuales de diferencia de precio porcentual.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-005  
**Nota técnica:** Funcionalidad core del sistema como agregador, requiere diseño UX cuidadoso.

---

### HU-009: Visualización de detalles del proveedor

**Título:** Como usuario, quiero ver información detallada de un autolavado para conocer todos sus servicios, precios y características.

**Descripción:**  
Página de perfil completo del proveedor con toda la información relevante.

**Criterios de Aceptación:**
1. Información mostrada: nombre, descripción, dirección completa, teléfono, email, sitio web.
2. Galería de imágenes del local y servicios.
3. Listado completo de servicios con precios, descripciones y duración.
4. Horarios de atención por día de la semana.
5. Mapa embebido mostrando ubicación exacta.
6. Sección de reseñas y calificaciones de otros usuarios.
7. Rating promedio y cantidad de reseñas.
8. Botón destacado para reservar servicio.
9. Información sobre promociones activas.

**Puntos de Historia:** 5  
**Prioridad:** Must  
**Dependencias:** HU-005

---

### HU-010: Gestión de lista de favoritos

**Título:** Como usuario registrado, quiero guardar mis autolavados favoritos para acceder rápidamente a ellos en futuras búsquedas.

**Descripción:**  
Sistema de marcadores que permite al usuario crear y gestionar una lista de proveedores favoritos.

**Criterios de Aceptación:**
1. Botón de "favorito" (corazón) visible en cada card de proveedor.
2. Toggle para agregar/quitar de favoritos con feedback visual inmediato.
3. Página dedicada "Mis Favoritos" accesible desde menú principal.
4. Favoritos se sincronizan entre dispositivos (guardados en BD).
5. Opción para organizar favoritos (ordenar, categorizar).
6. Notificaciones opcionales cuando favoritos tienen nuevas promociones.
7. Contador de favoritos en el menú de usuario.

**Puntos de Historia:** 5  
**Prioridad:** Should  
**Dependencias:** HU-002, HU-005

---

### HU-011: Visualización de historial de búsquedas

**Título:** Como usuario registrado, quiero ver mi historial de búsquedas para repetir búsquedas frecuentes rápidamente.

**Descripción:**  
Registro automático de búsquedas realizadas con opción de reutilización.

**Criterios de Aceptación:**
1. Sección "Historial" accesible desde el perfil de usuario.
2. Listado de últimas 20 búsquedas con fecha y filtros aplicados.
3. Click en una búsqueda histórica la ejecuta nuevamente.
4. Opción para eliminar búsquedas individuales del historial.
5. Opción para limpiar todo el historial.
6. Búsquedas se guardan con: ubicación, filtros, fecha.
7. Privacidad: historial visible solo para el usuario propietario.

**Puntos de Historia:** 3  
**Prioridad:** Could  
**Dependencias:** HU-002, HU-005

---

### HU-012: Sistema de reseñas y calificaciones

**Título:** Como usuario, quiero dejar reseñas y calificaciones sobre autolavados para compartir mi experiencia y ayudar a otros usuarios.

**Descripción:**  
Sistema completo de reviews que permite a los usuarios evaluar servicios utilizados.

**Criterios de Aceptación:**
1. Formulario de reseña incluye: calificación general (1-5 estrellas), título, comentario.
2. Criterios específicos de evaluación: calidad del servicio, limpieza, relación precio-calidad, amabilidad del personal.
3. Validación: solo usuarios con reservas completadas pueden dejar reseñas.
4. Opción para subir hasta 3 fotos con la reseña.
5. Sistema de moderación: reseñas pasan por aprobación antes de publicarse.
6. Usuarios pueden editar sus reseñas dentro de 7 días.
7. Proveedores pueden responder a reseñas.
8. Reseñas se ordenan por más recientes o más útiles (likes).
9. Detección de lenguaje inapropiado automática.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-013  
**Nota técnica:** Requiere sistema de moderación y algoritmo de detección de contenido inapropiado.

---

### HU-013: Reserva de servicio de lavado

**Título:** Como usuario, quiero reservar un servicio de autolavado para asegurar mi turno en el horario deseado.

**Descripción:**  
Sistema de reservas online que permite al usuario agendar servicios con los proveedores.

**Criterios de Aceptación:**
1. Desde el perfil del proveedor, acceso a calendario de disponibilidad.
2. Selección de servicio, fecha y hora disponible.
3. Formulario para ingresar datos del vehículo (marca, modelo, patente).
4. Campo opcional para notas especiales al proveedor.
5. Resumen de reserva con: servicio, precio, fecha/hora, duración estimada.
6. Confirmación requiere usuario autenticado.
7. Se envía email de confirmación con detalles de la reserva.
8. Notificación push al proveedor de nueva reserva.
9. Generación de código QR o ID único de reserva.
10. Opción de agregar reserva al calendario del dispositivo.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-002, HU-009  
**Nota técnica:** Complejidad alta por integración con sistema de disponibilidad de proveedores y notificaciones.

---

### HU-014: Cancelación de reserva

**Título:** Como usuario, quiero cancelar una reserva para liberar el turno si no puedo asistir.

**Descripción:**  
Gestión de cancelaciones con políticas definidas y comunicación automática.

**Criterios de Aceptación:**
1. En "Mis Reservas", botón de cancelar visible para reservas futuras.
2. Política de cancelación visible: permitida hasta 2 horas antes.
3. Confirmación doble antes de cancelar (evitar cancelaciones accidentales).
4. Campo opcional para indicar motivo de cancelación.
5. Se envía notificación al proveedor de la cancelación.
6. Email de confirmación de cancelación al usuario.
7. La disponibilidad se actualiza inmediatamente para otros usuarios.
8. Reservas pasadas no pueden cancelarse.

**Puntos de Historia:** 3  
**Prioridad:** Must  
**Dependencias:** HU-013

---

### HU-015: Visualización de historial de reservas

**Título:** Como usuario, quiero ver mi historial de reservas para llevar control de los servicios que he utilizado.

**Descripción:**  
Registro histórico completo de todas las reservas del usuario.

**Criterios de Aceptación:**
1. Sección "Mis Reservas" accesible desde el perfil de usuario.
2. Pestañas para: "Próximas", "Pasadas", "Canceladas".
3. Cada reserva muestra: proveedor, servicio, fecha/hora, estado, precio.
4. Opción para ver detalles completos de cada reserva.
5. Desde reservas pasadas, acceso directo para dejar reseña.
6. Opción para repetir una reserva pasada (pre-llenado de datos).
7. Exportar historial completo a PDF.

**Puntos de Historia:** 3  
**Prioridad:** Should  
**Dependencias:** HU-013

---

### HU-016: Notificaciones push de recordatorios

**Título:** Como usuario, quiero recibir notificaciones sobre mis reservas y actualizaciones relevantes para no perder información importante.

**Descripción:**  
Sistema de notificaciones push configurable que mantiene al usuario informado.

**Criterios de Aceptación:**
1. Notificación de confirmación al realizar una reserva.
2. Recordatorio 24 horas antes de la cita.
3. Recordatorio 1 hora antes de la cita.
4. Alerta si el proveedor cancela o modifica la reserva.
5. Notificaciones de nuevas promociones en favoritos (opcional).
6. Alerta cuando bajan precios en búsquedas guardadas.
7. Configuración granular en perfil: activar/desactivar por tipo de notificación.
8. Soporte para iOS y Android (usando Firebase Cloud Messaging).
9. Notificaciones in-app además de push.

**Puntos de Historia:** 5  
**Prioridad:** Should  
**Dependencias:** HU-002, HU-013

---

### HU-017: Recomendaciones personalizadas con IA

**Título:** Como usuario, quiero recibir recomendaciones personalizadas de autolavados para descubrir opciones que se ajusten a mis preferencias.

**Descripción:**  
Motor de recomendaciones basado en IA (OpenAI) que analiza el historial y preferencias del usuario.

**Criterios de Aceptación:**
1. Sección "Recomendado para ti" en el dashboard del usuario.
2. Algoritmo considera: ubicaciones frecuentes, servicios utilizados, rango de precios, ratings preferidos.
3. Recomendaciones se actualizan semanalmente o tras nuevas interacciones.
4. Explicación breve de por qué se recomienda cada proveedor.
5. Opción para "no volver a recomendar" un proveedor específico.
6. Métricas de precisión: tracking de conversión de recomendaciones.
7. Integración con OpenAI API para análisis de patrones.
8. Fallback a recomendaciones basadas en popularidad si no hay suficiente historial.

**Puntos de Historia:** 13  
**Prioridad:** Could  
**Dependencias:** HU-002, HU-005, HU-013  
**Nota técnica:** Complejidad muy alta debido a integración de IA, entrenamiento de modelos y optimización de algoritmos de recomendación.

---

### HU-018: Registro de proveedor

**Título:** Como proveedor de servicios de autolavado, quiero registrarme en la plataforma para ofrecer mis servicios y captar nuevos clientes.

**Descripción:**  
Proceso de onboarding para proveedores con validación de identidad de negocio.

**Criterios de Aceptación:**
1. Formulario de registro específico para proveedores con campos: nombre del negocio, tipo de negocio, RUT, dirección, teléfono, email, sitio web.
2. Validación de RUT único en el sistema.
3. Carga de documentos: patente comercial, certificado tributario.
4. Selección en mapa de ubicación exacta del negocio.
5. Creación de cuenta de usuario asociada (email/contraseña).
6. Estado inicial: "Pendiente de Aprobación".
7. Notificación a administradores de nuevo registro pendiente.
8. Email de confirmación al proveedor indicando proceso de revisión.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** Ninguna  
**Nota técnica:** Requiere flujo de verificación administrativa y validación de documentos.

---

### HU-019: Gestión de perfil de negocio

**Título:** Como proveedor, quiero editar el perfil de mi negocio para mantener la información actualizada y atractiva para potenciales clientes.

**Descripción:**  
Panel de administración del perfil público del proveedor.

**Criterios de Aceptación:**
1. Campos editables: descripción del negocio, teléfono, email, sitio web, redes sociales.
2. Gestión de galería de imágenes: subir, ordenar, eliminar (máximo 10 imágenes).
3. Actualización de horarios de atención por día de la semana.
4. Indicación de días bloqueados (vacaciones, mantenimiento).
5. Configuración de políticas de cancelación.
6. Todos los cambios requieren re-aprobación administrativa si son sustanciales.
7. Preview de cómo se ve el perfil para los clientes.
8. Validación de formatos (URLs, teléfonos).

**Puntos de Historia:** 5  
**Prioridad:** Must  
**Dependencias:** HU-018

---

### HU-020: Gestión de catálogo de servicios

**Título:** Como proveedor, quiero gestionar mi catálogo de servicios para ofrecer información clara de precios y características a los clientes.

**Descripción:**  
CRUD completo de servicios ofrecidos por el proveedor.

**Criterios de Aceptación:**
1. Crear nuevo servicio con: nombre, descripción, tipo, precio, duración, servicios incluidos.
2. Editar servicios existentes.
3. Activar/desactivar servicios temporalmente.
4. Eliminar servicios (soft delete).
5. Configurar servicios destacados.
6. Agregar imágenes específicas por servicio.
7. Definir requisitos especiales (ej: "solo para vehículos pequeños").
8. Configurar descuentos o precio promocional.
9. Orden de visualización personalizable (drag & drop).

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-018

---

### HU-021: Configuración de horarios disponibles

**Título:** Como proveedor, quiero configurar mis horarios de disponibilidad para que los clientes solo puedan reservar en momentos en que puedo atenderlos.

**Descripción:**  
Sistema de gestión de disponibilidad y slots de tiempo para reservas.

**Criterios de Aceptación:**
1. Configuración de horario base semanal (ej: Lun-Vie 9:00-18:00).
2. Definición de duración de slots (15, 30, 60 minutos).
3. Capacidad máxima de reservas simultáneas por slot.
4. Bloqueo de fechas específicas (feriados, vacaciones).
5. Bloqueo de horarios específicos dentro de un día.
6. Vista de calendario mostrando disponibilidad actual.
7. Ajuste de antelación mínima y máxima para reservas.
8. Sincronización automática con sistema de reservas.

**Puntos de Historia:** 5  
**Prioridad:** Must  
**Dependencias:** HU-018

---

### HU-022: Gestión de reservas recibidas

**Título:** Como proveedor, quiero gestionar las reservas que recibo para confirmar, modificar o rechazar citas según mi disponibilidad real.

**Descripción:**  
Panel de administración de reservas con acciones y notificaciones.

**Criterios de Aceptación:**
1. Dashboard de reservas con pestañas: Pendientes, Confirmadas, En Progreso, Completadas, Canceladas.
2. Cada reserva muestra: cliente, servicio, fecha/hora, detalles del vehículo, notas especiales.
3. Acciones disponibles: Confirmar, Rechazar, Reprogramar, Marcar como completada.
4. Notificación automática al cliente de cada cambio de estado.
5. Filtros por fecha, servicio, estado.
6. Vista de calendario con todas las reservas.
7. Opción para contactar al cliente directamente (llamada/email).
8. Exportar listado de reservas a Excel/PDF.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-018, HU-021

---

### HU-023: Dashboard de estadísticas del proveedor

**Título:** Como proveedor, quiero ver estadísticas de mi negocio para analizar el rendimiento y tomar decisiones informadas.

**Descripción:**  
Panel analítico completo con métricas clave del negocio.

**Criterios de Aceptación:**
1. Métricas principales: total de reservas, tasa de conversión, ingresos estimados, rating promedio.
2. Gráficos de evolución temporal (reservas por semana/mes).
3. Servicios más populares y menos solicitados.
4. Horarios de mayor demanda (heatmap).
5. Análisis de reviews: promedio por criterio, palabras más mencionadas.
6. Comparación con periodo anterior (% de crecimiento).
7. Filtros por rango de fechas personalizado.
8. Exportar reportes a PDF.
9. Visualizaciones con gráficos interactivos (Chart.js o similar).

**Puntos de Historia:** 13  
**Prioridad:** Should  
**Dependencias:** HU-018, HU-022  
**Nota técnica:** Complejidad alta por agregación de datos, generación de gráficos y optimización de consultas analíticas.

---

### HU-024: Gestión de promociones y descuentos

**Título:** Como proveedor, quiero crear promociones y descuentos para atraer más clientes y aumentar reservas.

**Descripción:**  
Sistema de creación y administración de ofertas especiales.

**Criterios de Aceptación:**
1. Crear promoción con: título, descripción, tipo de descuento (%, monto fijo), valor.
2. Definir servicios aplicables o si aplica a todos.
3. Configurar vigencia (fecha inicio y fin).
4. Establecer límite de usos (opcional).
5. Mínimo de compra requerido (opcional).
6. Promociones aparecen destacadas en el perfil del proveedor.
7. Usuarios reciben notificación si tienen al proveedor en favoritos.
8. Tracking de uso de cada promoción.
9. Activar/desactivar promociones manualmente.

**Puntos de Historia:** 8  
**Prioridad:** Should  
**Dependencias:** HU-018, HU-020

---

### HU-025: Respuesta a reseñas de clientes

**Título:** Como proveedor, quiero responder a las reseñas de mis clientes para mostrar atención al feedback y mejorar mi reputación.

**Descripción:**  
Herramienta de interacción con reviews recibidos.

**Criterios de Aceptación:**
1. Visualización de todas las reseñas recibidas con estado (respondida/sin responder).
2. Campo de texto para redactar respuesta pública.
3. Respuestas tienen límite de caracteres (500).
4. Notificación al cliente cuando el proveedor responde su reseña.
5. Editar respuesta dentro de 24 horas de publicada.
6. Las respuestas aparecen debajo de cada reseña en el perfil público.
7. Filtro para ver solo reseñas negativas (≤3 estrellas) para atención prioritaria.

**Puntos de Historia:** 5  
**Prioridad:** Should  
**Dependencias:** HU-018, HU-012

---

### HU-026: Sistema de verificación de proveedores

**Título:** Como administrador, quiero verificar y aprobar proveedores nuevos para asegurar la calidad de la plataforma.

**Descripción:**  
Flujo de verificación administrativa de nuevos proveedores.

**Criterios de Aceptación:**
1. Lista de proveedores pendientes de aprobación.
2. Vista detallada de solicitud con todos los datos y documentos subidos.
3. Validación de RUT mediante servicio del SII (API externa).
4. Verificación de documentos comerciales.
5. Acciones: Aprobar, Rechazar, Solicitar más información.
6. Campo para notas internas visibles solo para admins.
7. Notificación automática al proveedor del resultado.
8. Si se aprueba, cambio de estado a "Activo" y perfil visible públicamente.
9. Si se rechaza, especificar motivo que se comunica al proveedor.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-018

---

### HU-027: Dashboard administrativo completo

**Título:** Como administrador, quiero tener un dashboard general para monitorear todas las métricas clave de la plataforma.

**Descripción:**  
Panel administrativo centralizado con KPIs y herramientas de gestión.

**Criterios de Aceptación:**
1. Métricas principales: total usuarios activos, total proveedores, reservas del mes, ingresos (si aplica comisión).
2. Gráficos de crecimiento (usuarios, proveedores, reservas).
3. Listado de actividad reciente (nuevos registros, reservas, reseñas).
4. Alertas de acciones pendientes (proveedores por aprobar, reseñas por moderar).
5. Estadísticas de uso: búsquedas, conversión a reserva, tasa de cancelación.
6. Proveedores top por rating y por cantidad de reservas.
7. Mapa de calor de actividad por zona geográfica.
8. Acceso rápido a todas las funciones administrativas.
9. Filtros temporales para todas las métricas.

**Puntos de Historia:** 13  
**Prioridad:** Must  
**Dependencias:** Todas las HU previas  
**Nota técnica:** Complejidad muy alta por agregación masiva de datos y múltiples visualizaciones.

---

### HU-028: Gestión de usuarios y moderación

**Título:** Como administrador, quiero gestionar usuarios y contenido para mantener la calidad y seguridad de la plataforma.

**Descripción:**  
Herramientas de administración de usuarios y moderación de contenido.

**Criterios de Aceptación:**
1. Búsqueda y listado de todos los usuarios (clientes y proveedores).
2. Vista detallada de perfil de usuario con toda su actividad.
3. Acciones: Suspender, Reactivar, Eliminar cuenta.
4. Moderación de reseñas reportadas por contenido inapropiado.
5. Aprobación/rechazo de reseñas pendientes.
6. Editar o eliminar contenido que viole políticas.
7. Sistema de reportes de usuarios problemáticos.
8. Log de todas las acciones administrativas realizadas.

**Puntos de Historia:** 8  
**Prioridad:** Must  
**Dependencias:** HU-001, HU-012

---

### HU-029: Configuración de parámetros del sistema

**Título:** Como administrador, quiero configurar parámetros generales del sistema para personalizar el comportamiento de la plataforma.

**Descripción:**  
Panel de configuración global de la aplicación.

**Criterios de Aceptación:**
1. Configuraciones de reservas: tiempo mínimo de antelación, política de cancelación por defecto.
2. Parámetros de búsqueda: radio máximo, límite de resultados.
3. Configuración de notificaciones: tiempos de recordatorio, tipos activos.
4. Políticas de moderación: palabras prohibidas, umbral de reportes.
5. Configuración de comisiones (si aplica modelo de negocio).
6. Textos legales: términos y condiciones, política de privacidad.
7. Configuración de emails: templates, remitente.
8. Todos los cambios quedan registrados en log de auditoría.

**Puntos de Historia:** 5  
**Prioridad:** Should  
**Dependencies:** Ninguna

---

### HU-030: Scraping y agregación de datos

**Título:** Como sistema, quiero scrapear y agregar datos de múltiples fuentes para mantener un catálogo actualizado de proveedores.

**Descripción:**  
Motor automatizado de scraping que recopila información de autolavados de diferentes fuentes (Google Maps, Yapo, redes sociales).

**Criterios de Aceptación:**
1. Scrapers configurables para: Google Maps API, Yapo.cl, páginas web públicas.
2. Extracción automática de: nombre, dirección, teléfono, servicios, precios, horarios, coordenadas.
3. Validación y normalización de datos extraídos.
4. Detección de duplicados mediante comparación de nombre y ubicación.
5. Almacenamiento en base de datos con marca de fuente de origen.
6. Sistema de importación masiva con revisión administrativa previa.
7. Actualización automática programada (semanal).
8. Log de errores y estadísticas de scraping.
9. Exportación de datos a múltiples formatos (JSON, CSV, SQL).
10. Respeto de políticas de scraping y rate limits.

**Puntos de Historia:** 13  
**Prioridad:** Must  
**Dependencias:** Ninguna  
**Nota técnica:** Complejidad muy alta debido a integración con múltiples APIs, manejo de cambios en estructuras de datos externas, y algoritmos de deduplicación.

---

## Épicas

### EPI-01: Gestión de Usuarios y Personalización

**Descripción:**  
Esta épica abarca todas las funcionalidades relacionadas con la experiencia del usuario como cliente de la plataforma, desde el registro inicial hasta la personalización completa de su experiencia. Incluye autenticación, gestión de perfil, favoritos, historial, y notificaciones. El objetivo es proporcionar una experiencia de usuario fluida, segura y personalizada que facilite el descubrimiento y uso de servicios de autolavado.

**Objetivos:**
- Permitir a los usuarios registrarse, autenticarse y gestionar sus datos de forma segura mediante Clerk.
- Facilitar la personalización de la experiencia mediante favoritos e historial.
- Mantener a los usuarios informados mediante notificaciones relevantes y oportunas.
- Construir engagement y retención de usuarios a través de funcionalidades útiles.

**Historias Incluidas:**  
HU-001, HU-002, HU-003, HU-004, HU-010, HU-011, HU-016

**Puntos de Historia Totales:** 27

**Justificación:**  
Estas historias se agrupan porque comparten el objetivo de gestionar el ciclo de vida completo del usuario como cliente, desde onboarding hasta retención. Todas se centran en la identidad, preferencias y comunicación con el usuario.

---

### EPI-02: Búsqueda y Descubrimiento

**Descripción:**  
Esta épica engloba el motor de búsqueda y descubrimiento de proveedores, que es la funcionalidad core de la plataforma agregadora. Incluye búsqueda geolocalizada, filtros avanzados y visualización en mapa interactivo. El objetivo es permitir que los usuarios encuentren rápida y eficientemente autolavados que se ajusten a sus necesidades y ubicación.

**Objetivos:**
- Proporcionar un motor de búsqueda potente basado en geolocalización.
- Permitir refinamiento de búsquedas mediante filtros múltiples.
- Ofrecer visualización intuitiva de resultados en mapa interactivo.
- Optimizar experiencia de descubrimiento para maximizar conversión a reserva.

**Historias Incluidas:**  
HU-005, HU-006, HU-007

**Puntos de Historia Totales:** 21

**Justificación:**  
Estas historias conforman el núcleo funcional de búsqueda y descubrimiento, todas trabajando juntas para que el usuario encuentre el proveedor ideal. Tienen alta interdependencia técnica (geolocalización, filtrado, mapas).

---

### EPI-03: Comparación y Evaluación de Proveedores

**Descripción:**  
Esta épica se centra en la propuesta de valor diferencial de Alto Carwash como agregador: la comparación transparente de precios y servicios. Incluye herramientas para comparar múltiples proveedores lado a lado y visualizar información detallada de cada uno. El objetivo es empoderar al usuario con información completa para tomar decisiones informadas.

**Objetivos:**
- Facilitar la comparación directa de precios y servicios entre proveedores.
- Mostrar información completa y transparente de cada proveedor.
- Ayudar al usuario a identificar la mejor opción según sus criterios.
- Diferenciarse como plataforma que prioriza transparencia y valor al cliente.

**Historias Incluidas:**  
HU-008, HU-009

**Puntos de Historia Totales:** 13

**Justificación:**  
Estas historias implementan la funcionalidad core de comparación que define a Alto Carwash como agregador de servicios, similar a como SoloTodo compara precios de tecnología.

---

### EPI-04: Sistema de Reseñas y Reputación

**Descripción:**  
Esta épica cubre el sistema completo de reviews y calificaciones que permite a los usuarios compartir experiencias y a los proveedores gestionar su reputación. Incluye creación de reseñas, moderación, y respuestas de proveedores. El objetivo es construir confianza en la plataforma mediante feedback genuino de usuarios.

**Objetivos:**
- Permitir que usuarios compartan experiencias reales y detalladas.
- Proporcionar mecanismos de moderación para garantizar calidad y autenticidad.
- Dar a los proveedores herramientas para gestionar su reputación activamente.
- Construir un ecosistema de confianza basado en transparencia.

**Historias Incluidas:**  
HU-012, HU-025

**Puntos de Historia Totales:** 13

**Justificación:**  
Estas historias trabajan en conjunto para crear un sistema bidireccional de feedback entre usuarios y proveedores, fundamental para la confianza en la plataforma.

---

### EPI-05: Gestión de Reservas

**Descripción:**  
Esta épica abarca todo el flujo de reservas desde la perspectiva del cliente y del proveedor. Incluye creación, confirmación, cancelación y seguimiento de reservas. El objetivo es proporcionar un sistema de agendamiento robusto que conecte eficientemente clientes con proveedores.

**Objetivos:**
- Permitir a usuarios reservar servicios de forma simple y confiable.
- Dar a proveedores control total sobre sus reservas y disponibilidad.
- Garantizar comunicación clara y oportuna entre ambas partes.
- Minimizar no-shows mediante recordatorios y políticas de cancelación.

**Historias Incluidas:**  
HU-013, HU-014, HU-015, HU-022

**Puntos de Historia Totales:** 22

**Justificación:**  
Estas historias conforman el sistema de reservas end-to-end, cubriendo tanto la experiencia del cliente como la gestión del proveedor. Es un flujo transaccional crítico que requiere coordinación entre múltiples actores.

---

### EPI-06: Inteligencia Artificial y Agregación de Datos

**Descripción:**  
Esta épica se enfoca en las capacidades de IA y automatización de la plataforma. Incluye recomendaciones personalizadas mediante OpenAI y el sistema de scraping/agregación automática de datos. El objetivo es diferenciarse mediante tecnología avanzada que mejore la experiencia del usuario y escale el catálogo de proveedores.

**Objetivos:**
- Proporcionar recomendaciones personalizadas que aumenten conversión.
- Automatizar la agregación de datos de múltiples fuentes públicas.
- Mantener el catálogo actualizado y completo sin intervención manual constante.
- Usar IA para análisis predictivo y mejora continua de la plataforma.

**Historias Incluidas:**  
HU-017, HU-030

**Puntos de Historia Totales:** 26

**Justificación:**  
Estas historias representan las capacidades tecnológicas más avanzadas de la plataforma, diferenciadores clave que requieren expertise en IA y scraping. Tienen complejidad técnica muy alta.

---

### EPI-07: Portal de Proveedores

**Descripción:**  
Esta épica engloba todas las funcionalidades del panel de administración para proveedores. Incluye registro, gestión de perfil, servicios, horarios, promociones y analytics. El objetivo es proporcionar a los proveedores herramientas completas para gestionar su presencia en la plataforma y atraer clientes.

**Objetivos:**
- Facilitar el onboarding de nuevos proveedores a la plataforma.
- Dar autonomía a proveedores para actualizar su información.
- Proporcionar insights mediante analytics para mejorar su negocio.
- Permitir estrategias de marketing mediante promociones.

**Historias Incluidas:**  
HU-018, HU-019, HU-020, HU-021, HU-023, HU-024

**Puntos de Historia Totales:** 47

**Justificación:**  
Estas historias construyen el ecosistema completo de herramientas para proveedores, desde su ingreso a la plataforma hasta la optimización de su desempeño. Es crítico para el modelo de negocio de dos lados (marketplace).

---

### EPI-08: Administración y Gobernanza

**Descripción:**  
Esta épica cubre todas las herramientas administrativas necesarias para gestionar la plataforma, moderar contenido, y configurar el sistema. Incluye verificación de proveedores, dashboard administrativo, moderación de usuarios y configuración global. El objetivo es mantener la calidad, seguridad y buen funcionamiento de la plataforma.

**Objetivos:**
- Asegurar calidad mediante verificación rigurosa de proveedores.
- Monitorear la salud general de la plataforma con métricas clave.
- Moderar contenido para mantener un ambiente seguro y respetuoso.
- Configurar parámetros del sistema de forma centralizada.

**Historias Incluidas:**  
HU-026, HU-027, HU-028, HU-029

**Puntos de Historia Totales:** 34

**Justificación:**  
Estas historias son las herramientas de gobierno y operación de la plataforma, necesarias para administradores. Comparten el objetivo de mantener control, calidad y seguridad del ecosistema.

---

## Notas de Planificación

### Priorización para Sprints

**Sprint 1-2 (MVP Básico - 50 puntos):**
- Épica EPI-01: Gestión de Usuarios (sin HU-011, HU-016) → 19 puntos
- Épica EPI-02: Búsqueda y Descubrimiento (sin HU-007) → 13 puntos  
- HU-009: Visualización de detalles del proveedor → 5 puntos
- HU-018: Registro de proveedor → 8 puntos
- HU-019: Gestión de perfil de negocio → 5 puntos

**Sprint 3-4 (Funcionalidad Core - 55 puntos):**
- HU-008: Comparación de precios → 8 puntos
- HU-013: Reserva de servicio → 8 puntos
- HU-014: Cancelación de reserva → 3 puntos
- HU-020: Gestión de catálogo de servicios → 8 puntos
- HU-021: Configuración de horarios → 5 puntos
- HU-022: Gestión de reservas (proveedor) → 8 puntos
- HU-026: Verificación de proveedores → 8 puntos
- HU-007: Visualización de mapa → 8 puntos

**Sprint 5-6 (Engagement y Calidad - 45 puntos):**
- HU-012: Sistema de reseñas → 8 puntos
- HU-025: Respuesta a reseñas → 5 puntos
- HU-010: Favoritos → 5 puntos
- HU-015: Historial de reservas → 3 puntos
- HU-016: Notificaciones push → 5 puntos
- HU-024: Promociones → 8 puntos
- HU-027: Dashboard administrativo → 13 puntos

**Sprint 7-8 (Diferenciadores y Escala - 60 puntos):**
- HU-030: Scraping y agregación → 13 puntos
- HU-017: Recomendaciones con IA → 13 puntos
- HU-023: Dashboard de proveedor → 13 puntos
- HU-028: Moderación → 8 puntos
- HU-011: Historial de búsquedas → 3 puntos
- HU-029: Configuración del sistema → 5 puntos
- HU-006: Filtros avanzados → 5 puntos

### Criterios de Aceptación que Requieren Discusión

1. **HU-013 (Reservas):** Definir política de cancelación estándar (actualmente 2 horas, podría ser 24h).
2. **HU-017 (IA):** Evaluar costos de OpenAI API vs desarrollo de modelo propio.
3. **HU-030 (Scraping):** Revisar aspectos legales de scraping de competidores.
4. **HU-023, HU-027:** Definir si se implementa modelo de comisiones y cómo afecta los dashboards.
5. **HU-026:** Establecer SLA para verificación de proveedores (recomendado: 24-48h).

### Consideraciones Técnicas Importantes

- **Geolocalización (HU-005, HU-007):** Requiere optimización de consultas espaciales en PostgreSQL con índices GiST.
- **Notificaciones (HU-016):** Implementar con Firebase Cloud Messaging para cross-platform.
- **Scraping (HU-030):** Considerar uso de proxies rotatorios y respeto de rate limits.
- **IA (HU-017):** Evaluar fine-tuning de modelos vs uso directo de API OpenAI.
- **Mapas (HU-007):** Google Maps API tiene costos, evaluar alternativas como Mapbox para reducir costos.

### Riesgos Identificados

1. **Dependencia de Google Maps API:** Alto costo a escala, considerar plan de migración.
2. **Complejidad del sistema de reservas:** Requiere manejo robusto de concurrencia y race conditions.
3. **Calidad de datos scrapeados:** Puede requerir validación manual intensiva inicialmente.
4. **Adopción de proveedores:** Estrategia de acquisition crítica para el éxito del marketplace.

### Definición de "Done"

Para que una historia se considere completa, debe cumplir:
- ✅ Todos los criterios de aceptación implementados y verificados
- ✅ Tests unitarios con cobertura mínima 80%
- ✅ Tests de integración para flujos críticos
- ✅ Documentación técnica actualizada (README, JSDoc)
- ✅ Code review aprobado por al menos un desarrollador senior
- ✅ Deploy exitoso en ambiente de staging
- ✅ QA manual completado
- ✅ Performance verificado (tiempos de respuesta < 2s)
- ✅ Accesibilidad validada (WCAG 2.1 nivel AA mínimo)

---

**Documento generado por:** GitHub Copilot  
**Fecha:** 20 de octubre de 2025  
**Proyecto:** Alto Carwash - Plataforma Agregadora de Servicios de Autolavado  
**Total de Historias:** 30  
**Total de Épicas:** 8  
**Total de Puntos:** 210
