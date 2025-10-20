# 🚗 HISTORIAS DE USUARIO - ALTO CARWASH

## Proyecto de Título - Ingeniería en Informática
**Plataforma de Comparación y Reserva de Servicios de Autolavado**

---

## 📋 ÍNDICE

1. [Historias de Usuario Detalladas](#historias-de-usuario-detalladas)
2. [Épicas del Proyecto](#épicas-del-proyecto)
3. [Resumen de Puntos](#resumen-de-puntos)
4. [Planificación de Sprints](#planificación-de-sprints)

---

## HISTORIAS DE USUARIO DETALLADAS

### 1. Historia de Usuario: Registro de Usuario

**Como** visitante del sitio web/app móvil,  
**quiero** registrarme en la plataforma  
**para que** pueda acceder a funcionalidades personalizadas como favoritos, historial y reservas.

#### Criterios de Aceptación:
1. El formulario de registro incluye campos para email, contraseña, nombre, apellido y número de teléfono.
2. Integración con Clerk para autenticación OAuth (Google, Facebook) como alternativa al registro tradicional.
3. Se valida que el email sea único y tenga formato válido.
4. La contraseña debe cumplir requisitos mínimos: 8 caracteres, mayúsculas, minúsculas y números.
5. Se envía email de verificación automáticamente tras el registro.
6. Se muestra mensaje de error claro si algún campo es inválido o el email ya existe.
7. Tras registro exitoso, se redirige al usuario al dashboard con tutorial de bienvenida.
8. Se crea automáticamente un perfil con preferencias por defecto.

#### Puntos de Historia: **5**

---

### 2. Historia de Usuario: Inicio de Sesión

**Como** usuario registrado,  
**quiero** iniciar sesión en la plataforma  
**para que** pueda acceder a mi perfil, favoritos y realizar reservas.

#### Criterios de Aceptación:
1. Soporte para login con email/contraseña y OAuth (Google, Facebook) mediante Clerk.
2. Opción "Recordarme" para mantener sesión activa.
3. Funcionalidad "Olvidé mi contraseña" con envío de link de recuperación por email.
4. Integración con autenticación biométrica en móvil (huella dactilar o reconocimiento facial).
5. Se muestra mensaje de error específico para credenciales inválidas o cuenta no verificada.
6. Tras login exitoso, se carga el dashboard con datos personalizados del usuario.
7. Sistema de tokens JWT con refresh tokens para seguridad.
8. Registro de último acceso en base de datos.

#### Puntos de Historia: **3**

---

### 3. Historia de Usuario: Búsqueda Inteligente de Servicios

**Como** usuario (registrado o no),  
**quiero** buscar servicios de autolavado mediante texto, ubicación y filtros  
**para que** pueda encontrar opciones que se ajusten a mis necesidades y presupuesto.

#### Criterios de Aceptación:
1. Barra de búsqueda con autocompletado inteligente que sugiere servicios populares.
2. Búsqueda por ubicación usando geolocalización GPS automática o ingreso manual de dirección.
3. Filtros disponibles: tipo de servicio (lavado básico, premium, detailing), rango de precio, calificación mínima, distancia máxima, disponibilidad de agenda.
4. Los resultados se muestran en vista lista y vista mapa simultáneamente.
5. Cada resultado muestra: nombre del proveedor, precio, distancia, rating, disponibilidad.
6. Ordenamiento por: relevancia, precio (menor a mayor), distancia, mejor calificado, descuentos.
7. Actualización de resultados en tiempo real al cambiar filtros (sin recargar página).
8. Guardado automático de búsqueda en historial para usuarios registrados.
9. Sistema de caché para mejorar rendimiento en búsquedas repetidas.

#### Puntos de Historia: **13**

---

### 4. Historia de Usuario: Visualización en Mapa Interactivo

**Como** usuario buscando servicios,  
**quiero** ver los resultados en un mapa interactivo  
**para que** pueda visualizar fácilmente la ubicación de proveedores cercanos.

#### Criterios de Aceptación:
1. Integración con Google Maps API mostrando marcadores de todos los proveedores.
2. Marcadores diferenciados por color según rating (verde: 4.5+, amarillo: 3-4.4, rojo: <3).
3. Al hacer clic en un marcador, se muestra card con información básica del proveedor.
4. Función para obtener direcciones desde ubicación actual hasta el proveedor seleccionado.
5. Cálculo de tiempo estimado de llegada y distancia en km.
6. Opción para abrir en Google Maps/Waze nativos desde móvil.
7. Agrupación de marcadores (clusters) cuando hay muchos proveedores en una zona.
8. Sincronización entre vista de mapa y vista de lista al seleccionar elementos.
9. Modo Street View para visualizar fachada del establecimiento.

#### Puntos de Historia: **8**

---

### 5. Historia de Usuario: Comparación de Precios

**Como** usuario evaluando opciones,  
**quiero** comparar hasta 3 servicios lado a lado  
**para que** pueda tomar una decisión informada sobre qué servicio contratar.

#### Criterios de Aceptación:
1. Desde los resultados de búsqueda, opción para "Agregar a comparación" (máximo 3 servicios).
2. Vista de comparación en tabla que muestra: precio, descuento, precio final, duración, servicios incluidos, rating, distancia.
3. Cálculo automático de "score de valor" considerando precio, distancia y calificación.
4. Destacado visual del "mejor en precio", "mejor calificado" y "más cercano".
5. Indicador de ahorro potencial comparado con la opción más cara.
6. Enlaces directos a reservar cada servicio desde la vista de comparación.
7. Opción para exportar comparación como PDF o compartir link.
8. Actualización de precios en tiempo real si hay cambios en promociones.

#### Puntos de Historia: **8**

---

### 6. Historia de Usuario: Crear Reserva

**Como** usuario que encontró un servicio,  
**quiero** reservar una cita específica  
**para que** pueda asegurar mi atención en el día y hora que me convenga.

#### Criterios de Aceptación:
1. Calendario interactivo mostrando disponibilidad del proveedor con horarios bloqueados/disponibles.
2. Solo se permiten reservas para fechas futuras respetando tiempo mínimo de anticipación del proveedor.
3. Formulario de reserva incluye: fecha, hora, tipo de vehículo (auto/camioneta/SUV), patente, observaciones.
4. Validación en tiempo real de disponibilidad antes de confirmar.
5. Cálculo automático del precio total según tipo de vehículo y servicios adicionales.
6. Opción de pago online (pendiente integración pasarela) o pago presencial.
7. Confirmación inmediata con número de reserva único.
8. Envío de email de confirmación con detalles: fecha, hora, dirección, contacto del proveedor.
9. Notificación push al proveedor con nueva reserva.
10. Agregado automático al calendario del usuario (Google Calendar/Apple Calendar).

#### Puntos de Historia: **8**

---

### 7. Historia de Usuario: Gestión de Reservas

**Como** usuario con reservas activas,  
**quiero** ver, modificar o cancelar mis reservas  
**para que** pueda gestionar mis citas según cambios en mi disponibilidad.

#### Criterios de Aceptación:
1. Sección "Mis Reservas" mostrando reservas pendientes, completadas y canceladas.
2. Filtros por estado: todas, próximas, pasadas, canceladas.
3. Para cada reserva se muestra: servicio, proveedor, fecha/hora, estado, precio, botones de acción.
4. Opción de cancelar hasta X horas antes (definido por proveedor, típicamente 2-4 horas).
5. Opción de reprogramar (sujeto a disponibilidad) sin penalización si se hace con anticipación.
6. Al cancelar, se solicita motivo opcional para estadísticas del proveedor.
7. Notificaciones automáticas: recordatorio 24h antes, recordatorio 2h antes, confirmación de cancelación.
8. Código QR en detalle de reserva para validación presencial.
9. Opción para agregar reseña tras completar servicio.

#### Puntos de Historia: **5**

---

### 8. Historia de Usuario: Sistema de Reseñas y Calificaciones

**Como** usuario que utilizó un servicio,  
**quiero** dejar una reseña y calificación  
**para que** pueda compartir mi experiencia con otros usuarios.

#### Criterios de Aceptación:
1. Solo usuarios que completaron una reserva pueden dejar reseña del servicio usado.
2. Sistema de calificación por estrellas (1-5) en categorías: calidad del servicio, limpieza, relación calidad-precio, atención del personal.
3. Campo de comentario opcional (min 20 caracteres, max 500 caracteres).
4. Opción para subir fotos del resultado (máximo 3 imágenes, 5MB cada una).
5. Las reseñas pasan por moderación automática (filtro de palabras ofensivas) antes de publicarse.
6. Notificación al proveedor cuando se publica nueva reseña.
7. Cálculo automático del rating promedio del proveedor al agregar nueva reseña.
8. Las reseñas se muestran ordenadas por: más recientes, mejor calificadas, más útiles (likes de otros usuarios).
9. Usuarios pueden marcar reseñas como "útil" o "reportar" si es inapropiada.

#### Puntos de Historia: **5**

---

### 9. Historia de Usuario: Gestión de Favoritos

**Como** usuario registrado,  
**quiero** guardar proveedores en mi lista de favoritos  
**para que** pueda acceder rápidamente a mis autolavados preferidos.

#### Criterios de Aceptación:
1. Ícono de corazón en cada tarjeta de servicio/proveedor para marcar/desmarcar favorito.
2. Indicador visual claro de servicios ya marcados como favoritos.
3. Sección "Mis Favoritos" en el perfil del usuario con todos los proveedores guardados.
4. Actualización instantánea sin recargar página al agregar/quitar favoritos.
5. Notificaciones opcionales cuando un favorito tiene promociones nuevas.
6. Opción para ordenar favoritos por: fecha agregada, distancia, rating, última visita.
7. Sincronización entre web y móvil en tiempo real.
8. Límite razonable de favoritos (ej. 50) para prevenir abuso.

#### Puntos de Historia: **3**

---

### 10. Historia de Usuario: Perfil de Usuario

**Como** usuario registrado,  
**quiero** ver y editar mi información personal  
**para que** pueda mantener mis datos actualizados y personalizar mi experiencia.

#### Criterios de Aceptación:
1. Vista de perfil muestra: foto, nombre, email, teléfono, dirección predeterminada, estadísticas (reservas totales, reseñas escritas).
2. Campos editables: nombre, apellido, teléfono, foto de perfil, dirección predeterminada.
3. Opción para cambiar contraseña con verificación de contraseña actual.
4. Configuración de preferencias: tipo de vehículo por defecto, radio de búsqueda preferido, notificaciones activadas/desactivadas.
5. Historial de búsquedas recientes (últimas 10).
6. Validación de cambios (ej. formato de teléfono chileno, email válido).
7. Guardado automático de cambios con indicador de "guardado exitoso".
8. Opción para desactivar o eliminar cuenta (con confirmación y periodo de gracia de 30 días).

#### Puntos de Historia: **3**

---

### 11. Historia de Usuario: Notificaciones Push

**Como** usuario de la app móvil,  
**quiero** recibir notificaciones relevantes  
**para que** no me pierda recordatorios de reservas, promociones y actualizaciones importantes.

#### Criterios de Aceptación:
1. Tipos de notificaciones: recordatorio de reserva (24h y 2h antes), confirmación de reserva, cancelación, promociones de favoritos, respuesta a reseña.
2. Configuración granular en el perfil para activar/desactivar cada tipo de notificación.
3. Notificaciones push nativas en iOS y Android.
4. Badge en ícono de la app indicando notificaciones no leídas.
5. Centro de notificaciones in-app mostrando historial de notificaciones.
6. Deep links en notificaciones que llevan directamente a la pantalla relevante.
7. Horario configurable: no enviar notificaciones promocionales en horario nocturno (22:00-08:00).
8. Cumplimiento con políticas de frecuencia: máximo 3 notificaciones promocionales por semana.

#### Puntos de Historia: **5**

---

### 12. Historia de Usuario: Registro de Proveedor

**Como** dueño de un autolavado,  
**quiero** registrarme como proveedor en la plataforma  
**para que** pueda ofrecer mis servicios a potenciales clientes.

#### Criterios de Aceptación:
1. Formulario de registro incluye: nombre del negocio, RUT empresa, dirección completa, teléfono, email, sitio web.
2. Upload de documentos de verificación: patente comercial, certificado SII, fotos del local.
3. Configuración inicial de horarios de atención (lunes a domingo, horarios por día).
4. Definición de servicios ofrecidos con precios base.
5. Sistema de aprobación por administrador antes de activar cuenta.
6. Estado de cuenta: "Pendiente aprobación", "Activo", "Suspendido".
7. Email de bienvenida con instrucciones tras aprobación.
8. Panel de proveedor disponible solo tras aprobación.

#### Puntos de Historia: **8**

---

### 13. Historia de Usuario: Dashboard de Proveedor

**Como** proveedor registrado y aprobado,  
**quiero** acceder a un panel de control  
**para que** pueda gestionar mis servicios, ver reservas y analizar mi desempeño.

#### Criterios de Aceptación:
1. Dashboard muestra KPIs: reservas del mes, ingresos estimados, rating promedio, total de reseñas.
2. Calendario con vista de reservas diarias/semanales/mensuales.
3. Lista de reservas pendientes con opciones: confirmar, rechazar, contactar cliente.
4. Sección para gestionar servicios: crear, editar, desactivar, actualizar precios.
5. Vista de reseñas recibidas con opción de responder públicamente.
6. Gráficos de desempeño: reservas por día, servicios más solicitados, horarios de mayor demanda.
7. Herramienta para crear promociones temporales (descuentos, ofertas por tiempo limitado).
8. Notificaciones en tiempo real de nuevas reservas.

#### Puntos de Historia: **13**

---

### 14. Historia de Usuario: Gestión de Servicios (Proveedor)

**Como** proveedor,  
**quiero** crear y gestionar los servicios que ofrezco  
**para que** los usuarios puedan verlos, compararlos y reservarlos.

#### Criterios de Aceptación:
1. Formulario para crear servicio incluye: nombre, descripción, tipo (básico/premium/detailing), precio, duración estimada, servicios incluidos.
2. Opción para agregar múltiples fotos del servicio (mínimo 1, máximo 5).
3. Configuración de disponibilidad: días de la semana, horarios, capacidad máxima simultánea.
4. Campos opcionales: requisitos especiales, restricciones de vehículo, advertencias.
5. Preview de cómo se verá el servicio para los usuarios antes de publicar.
6. Opción para duplicar servicio existente para facilitar creación de variantes.
7. Estado del servicio: Borrador, Activo, Pausado, Archivado.
8. Versionado de precios con historial de cambios.

#### Puntos de Historia: **5**

---

### 15. Historia de Usuario: Análisis y Reportes (Proveedor)

**Como** proveedor,  
**quiero** generar reportes de mi desempeño  
**para que** pueda tomar decisiones basadas en datos sobre mi negocio.

#### Criterios de Aceptación:
1. Reportes disponibles: ingresos por periodo, reservas completadas/canceladas, servicios más populares, horarios de mayor demanda.
2. Filtros por rango de fechas personalizado o predefinidos (última semana, mes, trimestre, año).
3. Gráficos interactivos: barras, líneas, torta según tipo de métrica.
4. Comparación periodo actual vs periodo anterior (ej. este mes vs mes pasado).
5. Métricas de satisfacción: rating promedio por servicio, distribución de calificaciones.
6. Tasa de conversión: vistas del perfil vs reservas realizadas.
7. Exportación de reportes a PDF, CSV o Excel.
8. Resumen ejecutivo con insights automáticos (ej. "tus reservas aumentaron 15% este mes").

#### Puntos de Historia: **8**

---

### 16. Historia de Usuario: Panel de Administrador

**Como** administrador de la plataforma,  
**quiero** acceder a un panel de control global  
**para que** pueda gestionar usuarios, proveedores y monitorear la plataforma.

#### Criterios de Aceptación:
1. Dashboard con métricas globales: usuarios totales, proveedores activos, reservas del día, ingresos totales estimados.
2. Lista de proveedores pendientes de aprobación con opción de aprobar/rechazar con comentario.
3. Gestión de usuarios: búsqueda, suspensión, eliminación, reseteo de contraseña.
4. Gestión de proveedores: cambio de estado (activo/suspendido), edición de información.
5. Sistema de moderación de reseñas reportadas por usuarios.
6. Logs de actividad crítica: cambios en permisos, suspensiones, eliminaciones.
7. Configuración global de la plataforma: tarifas, políticas de cancelación, tiempos de anticipación.
8. Herramienta de comunicación masiva: envío de emails a usuarios o proveedores segmentados.

#### Puntos de Historia: **13**

---

### 17. Historia de Usuario: Scraping de Datos

**Como** administrador técnico,  
**quiero** ejecutar el scraper para recopilar datos de autolavados  
**para que** pueda poblar la base de datos con información real de proveedores.

#### Criterios de Aceptación:
1. Script configurable para scrapear Yapo.cl y Google Maps (con API o Puppeteer).
2. Parámetros configurables: región, comuna, radio de búsqueda, máximo de resultados.
3. Datos extraídos: nombre, dirección, teléfono, email, rating, horarios, coordenadas GPS.
4. Generación de archivos de salida en múltiples formatos: JSON, CSV, SQL.
5. Validación y normalización de datos antes de exportar.
6. Reporte de ejecución: total encontrado, duplicados omitidos, errores.
7. Modo preview para revisar datos antes de importar a BD.
8. Log detallado de ejecución para debugging.

#### Puntos de Historia: **8**

---

### 18. Historia de Usuario: Recomendaciones con IA

**Como** usuario buscando servicios,  
**quiero** recibir recomendaciones personalizadas basadas en IA  
**para que** pueda descubrir opciones relevantes sin tener que buscar manualmente.

#### Criterios de Aceptación:
1. Integración con OpenAI API para análisis de preferencias del usuario.
2. Input del modelo: historial de búsquedas, servicios reservados previamente, favoritos, ubicación frecuente, presupuesto promedio.
3. Sección "Recomendado para ti" en el dashboard mostrando 3-5 servicios.
4. Explicación breve del por qué se recomienda cada servicio (ej. "Basado en tus búsquedas de lavados premium").
5. Actualización semanal de recomendaciones basadas en nuevos datos.
6. Opción para que usuario indique si la recomendación fue útil (feedback loop).
7. Chatbot asistente que responde preguntas sobre servicios en lenguaje natural.
8. Fallback a recomendaciones basadas en reglas si el usuario es nuevo (sin historial).

#### Puntos de Historia: **13**

---

### 19. Historia de Usuario: Sistema de Promociones

**Como** proveedor,  
**quiero** crear promociones temporales  
**para que** pueda atraer más clientes en períodos de baja demanda.

#### Criterios de Aceptación:
1. Formulario de creación de promoción: título, descripción, tipo de descuento (porcentaje o monto fijo), valor del descuento.
2. Configuración de vigencia: fecha de inicio y fin, horarios aplicables.
3. Condiciones: monto mínimo de compra, servicios aplicables, límite de usos totales.
4. Código de promoción opcional para compartir en redes sociales.
5. Badge visual "OFERTA" en tarjeta del servicio durante vigencia de promoción.
6. Cálculo automático de precio con descuento en vista de servicio y comparación.
7. Estadísticas de promoción: veces utilizada, ingresos generados, tasa de conversión.
8. Notificación automática a usuarios que tienen el proveedor en favoritos.

#### Puntos de Historia: **5**

---

### 20. Historia de Usuario: Historial de Búsquedas

**Como** usuario registrado,  
**quiero** ver mi historial de búsquedas  
**para que** pueda repetir búsquedas anteriores rápidamente.

#### Criterios de Aceptación:
1. Sección "Historial" mostrando últimas 20 búsquedas con fecha y hora.
2. Para cada búsqueda se guarda: términos de búsqueda, ubicación, filtros aplicados, cantidad de resultados.
3. Opción de hacer clic en búsqueda pasada para repetirla exactamente.
4. Opción para eliminar búsquedas individuales o limpiar todo el historial.
5. Búsquedas se guardan solo si el usuario está autenticado.
6. Protección de privacidad: historial no es visible para otros usuarios ni proveedores.
7. Sugerencias inteligentes basadas en historial al usar la barra de búsqueda.

#### Puntos de Historia: **3**

---

## ÉPICAS DEL PROYECTO

### **ÉPICA 1: Gestión de Usuarios y Autenticación**

**Descripción:**  
Esta épica abarca todas las funcionalidades relacionadas con el ciclo de vida del usuario en la plataforma, desde el registro inicial hasta la gestión completa de su perfil. Incluye sistema de autenticación robusto, manejo de sesiones, recuperación de contraseñas y personalización de la experiencia del usuario.

**Objetivos:**
- Proporcionar múltiples opciones de autenticación (tradicional y OAuth)
- Permitir a los usuarios gestionar su información personal de manera segura
- Facilitar la personalización de preferencias y configuraciones
- Mejorar la retención mediante notificaciones y favoritos

**Historias de Usuario Incluidas:**
1. Registro de Usuario (5 puntos)
2. Inicio de Sesión (3 puntos)
3. Perfil de Usuario (3 puntos)
4. Gestión de Favoritos (3 puntos)
5. Notificaciones Push (5 puntos)
6. Historial de Búsquedas (3 puntos)

**Justificación:**  
Estas historias fueron agrupadas porque todas se centran en la experiencia del usuario desde la perspectiva de identidad, acceso y personalización. Compartirán componentes comunes como gestión de sesiones, servicios de autenticación y almacenamiento de preferencias.

**Puntos de Historia Totales:** **22**

**Prioridad:** **ALTA** (Funcionalidad core sin la cual la plataforma no puede operar)

---

### **ÉPICA 2: Búsqueda y Comparación de Servicios**

**Descripción:**  
Esta épica cubre el motor principal de la plataforma: permitir a los usuarios encontrar, filtrar, visualizar y comparar servicios de autolavado de manera eficiente. Incluye búsqueda avanzada, integración con mapas, comparación lado a lado y recomendaciones inteligentes.

**Objetivos:**
- Implementar búsqueda robusta con múltiples criterios y filtros
- Proporcionar visualización geográfica mediante mapas interactivos
- Facilitar comparación objetiva de precios y características
- Ofrecer recomendaciones personalizadas mediante IA

**Historias de Usuario Incluidas:**
3. Búsqueda Inteligente de Servicios (13 puntos)
4. Visualización en Mapa Interactivo (8 puntos)
5. Comparación de Precios (8 puntos)
18. Recomendaciones con IA (13 puntos)

**Justificación:**  
Estas historias representan el valor principal de la plataforma como agregador y comparador de servicios. La búsqueda, visualización geográfica y comparación trabajan en conjunto para ayudar al usuario a tomar decisiones informadas. Las recomendaciones con IA elevan la experiencia al siguiente nivel.

**Puntos de Historia Totales:** **42**

**Prioridad:** **ALTA** (Propuesta de valor principal de la plataforma)

---

### **ÉPICA 3: Sistema de Reservas y Gestión**

**Descripción:**  
Esta épica engloba todo el flujo de reservas desde la perspectiva del cliente, incluyendo la creación, visualización, modificación y cancelación de citas. También incluye el sistema de reseñas post-servicio que genera valor para otros usuarios.

**Objetivos:**
- Permitir a usuarios reservar servicios de manera sencilla y confiable
- Proporcionar gestión completa del ciclo de vida de las reservas
- Implementar sistema de recordatorios automáticos
- Facilitar feedback mediante reseñas y calificaciones

**Historias de Usuario Incluidas:**
6. Crear Reserva (8 puntos)
7. Gestión de Reservas (5 puntos)
8. Sistema de Reseñas y Calificaciones (5 puntos)

**Justificación:**  
Estas historias están relacionadas con el proceso transaccional completo que un usuario experimenta al contratar un servicio. Desde la reserva inicial hasta dejar su opinión, forman un flujo coherente que genera valor tanto para usuarios como para proveedores.

**Puntos de Historia Totales:** **18**

**Prioridad:** **ALTA** (Funcionalidad core que monetiza la plataforma)

---

### **ÉPICA 4: Panel y Herramientas de Proveedores**

**Descripción:**  
Esta épica cubre todas las funcionalidades destinadas a los proveedores de servicios (autolavados). Incluye registro, gestión de perfil, creación de servicios, manejo de reservas, análisis de desempeño y herramientas de marketing como promociones.

**Objetivos:**
- Facilitar el onboarding de nuevos proveedores a la plataforma
- Proporcionar herramientas completas de gestión operativa
- Ofrecer insights mediante reportes y análisis
- Permitir estrategias de marketing con sistema de promociones

**Historias de Usuario Incluidas:**
12. Registro de Proveedor (8 puntos)
13. Dashboard de Proveedor (13 puntos)
14. Gestión de Servicios (5 puntos)
15. Análisis y Reportes (8 puntos)
19. Sistema de Promociones (5 puntos)

**Justificación:**  
Estas historias forman el ecosistema completo para los proveedores de servicios, que son el otro lado fundamental del marketplace. Sin proveedores activos y satisfechos, la plataforma no tiene inventario que ofrecer. Estas herramientas aseguran que los proveedores puedan operar eficientemente.

**Puntos de Historia Totales:** **39**

**Prioridad:** **ALTA** (Sin proveedores no hay servicios que ofrecer)

---

### **ÉPICA 5: Administración y Operaciones de Plataforma**

**Descripción:**  
Esta épica abarca las herramientas de administración y mantenimiento de la plataforma, incluyendo el panel de administrador, scraping de datos para poblamiento inicial de la base de datos, y herramientas de moderación.

**Objetivos:**
- Proporcionar control total sobre usuarios y proveedores de la plataforma
- Facilitar el proceso de verificación y aprobación de proveedores
- Automatizar la recopilación de datos de fuentes externas
- Monitorear salud y métricas de la plataforma

**Historias de Usuario Incluidas:**
16. Panel de Administrador (13 puntos)
17. Scraping de Datos (8 puntos)

**Justificación:**  
Estas historias están relacionadas con la gestión operativa de la plataforma desde la perspectiva del equipo interno. El panel de administrador es crítico para mantenimiento y moderación, mientras que el scraper es fundamental para el arranque inicial de la plataforma con datos reales.

**Puntos de Historia Totales:** **21**

**Prioridad:** **MEDIA** (Importante pero no bloqueante para MVP)

---

## RESUMEN DE PUNTOS

### Por Historia de Usuario

| ID | Historia de Usuario | Puntos | Complejidad |
|----|---------------------|--------|-------------|
| 1 | Registro de Usuario | 5 | Media |
| 2 | Inicio de Sesión | 3 | Baja |
| 3 | Búsqueda Inteligente | 13 | Muy Alta |
| 4 | Visualización en Mapa | 8 | Alta |
| 5 | Comparación de Precios | 8 | Alta |
| 6 | Crear Reserva | 8 | Alta |
| 7 | Gestión de Reservas | 5 | Media |
| 8 | Sistema de Reseñas | 5 | Media |
| 9 | Gestión de Favoritos | 3 | Baja |
| 10 | Perfil de Usuario | 3 | Baja |
| 11 | Notificaciones Push | 5 | Media |
| 12 | Registro de Proveedor | 8 | Alta |
| 13 | Dashboard de Proveedor | 13 | Muy Alta |
| 14 | Gestión de Servicios | 5 | Media |
| 15 | Análisis y Reportes | 8 | Alta |
| 16 | Panel de Administrador | 13 | Muy Alta |
| 17 | Scraping de Datos | 8 | Alta |
| 18 | Recomendaciones con IA | 13 | Muy Alta |
| 19 | Sistema de Promociones | 5 | Media |
| 20 | Historial de Búsquedas | 3 | Baja |
| **TOTAL** | | **142** | |

### Por Épica

| Épica | Puntos | Prioridad | Sprints Estimados |
|-------|--------|-----------|-------------------|
| 1. Gestión de Usuarios y Autenticación | 22 | ALTA | 2 |
| 2. Búsqueda y Comparación de Servicios | 42 | ALTA | 3-4 |
| 3. Sistema de Reservas y Gestión | 18 | ALTA | 2 |
| 4. Panel y Herramientas de Proveedores | 39 | ALTA | 3 |
| 5. Administración y Operaciones | 21 | MEDIA | 2 |
| **TOTAL** | **142** | | **12-13** |

### Distribución por Complejidad

| Complejidad | Cantidad | Puntos Totales | % del Total |
|-------------|----------|----------------|-------------|
| Baja (1-3) | 5 | 17 | 12% |
| Media (5) | 7 | 35 | 25% |
| Alta (8) | 6 | 48 | 34% |
| Muy Alta (13) | 4 | 42 | 30% |

---

## PLANIFICACIÓN DE SPRINTS

### **Sprint 0: Setup Inicial** (1 semana)
**Objetivo:** Configurar infraestructura del proyecto

- Configuración de repositorios Git
- Setup de entornos de desarrollo
- Configuración de base de datos
- CI/CD básico
- Documentación técnica inicial

**Puntos:** 0 (tareas técnicas de setup)

---

### **Sprint 1: Fundamentos de Autenticación** (2 semanas)
**Épica:** Gestión de Usuarios y Autenticación

**Historias incluidas:**
- HU-1: Registro de Usuario (5 puntos)
- HU-2: Inicio de Sesión (3 puntos)
- HU-10: Perfil de Usuario (3 puntos)

**Puntos totales:** 11  
**Objetivo:** Usuarios pueden registrarse, iniciar sesión y gestionar su perfil básico.

---

### **Sprint 2: Búsqueda Básica** (2 semanas)
**Épica:** Búsqueda y Comparación de Servicios

**Historias incluidas:**
- HU-3: Búsqueda Inteligente de Servicios (13 puntos)
- HU-20: Historial de Búsquedas (3 puntos)

**Puntos totales:** 16  
**Objetivo:** Sistema de búsqueda funcional con filtros y resultados.

---

### **Sprint 3: Visualización Geográfica** (2 semanas)
**Épica:** Búsqueda y Comparación de Servicios

**Historias incluidas:**
- HU-4: Visualización en Mapa Interactivo (8 puntos)
- HU-5: Comparación de Precios (8 puntos)

**Puntos totales:** 16  
**Objetivo:** Usuarios pueden ver servicios en mapa y compararlos.

---

### **Sprint 4: Sistema de Reservas** (2 semanas)
**Épica:** Sistema de Reservas y Gestión

**Historias incluidas:**
- HU-6: Crear Reserva (8 puntos)
- HU-7: Gestión de Reservas (5 puntos)

**Puntos totales:** 13  
**Objetivo:** Flujo completo de reservas funcional.

---

### **Sprint 5: Engagement de Usuarios** (2 semanas)
**Épicas:** Gestión de Usuarios + Sistema de Reservas

**Historias incluidas:**
- HU-8: Sistema de Reseñas y Calificaciones (5 puntos)
- HU-9: Gestión de Favoritos (3 puntos)
- HU-11: Notificaciones Push (5 puntos)

**Puntos totales:** 13  
**Objetivo:** Funcionalidades que mejoran retención y engagement.

---

### **Sprint 6: Onboarding de Proveedores** (2 semanas)
**Épica:** Panel y Herramientas de Proveedores

**Historias incluidas:**
- HU-12: Registro de Proveedor (8 puntos)
- HU-14: Gestión de Servicios (5 puntos)

**Puntos totales:** 13  
**Objetivo:** Proveedores pueden registrarse y publicar servicios.

---

### **Sprint 7: Dashboard de Proveedores** (2 semanas)
**Épica:** Panel y Herramientas de Proveedores

**Historias incluidas:**
- HU-13: Dashboard de Proveedor (13 puntos)

**Puntos totales:** 13  
**Objetivo:** Panel completo para gestión operativa de proveedores.

---

### **Sprint 8: Análisis y Promociones** (2 semanas)
**Épica:** Panel y Herramientas de Proveedores

**Historias incluidas:**
- HU-15: Análisis y Reportes (8 puntos)
- HU-19: Sistema de Promociones (5 puntos)

**Puntos totales:** 13  
**Objetivo:** Herramientas de business intelligence y marketing para proveedores.

---

### **Sprint 9: Herramientas de Administración** (2 semanas)
**Épica:** Administración y Operaciones de Plataforma

**Historias incluidas:**
- HU-16: Panel de Administrador (13 puntos)
- HU-17: Scraping de Datos (8 puntos)

**Puntos totales:** 21  
**Objetivo:** Panel de admin y herramientas de scraping operativas.

---

### **Sprint 10: Inteligencia Artificial** (2 semanas)
**Épica:** Búsqueda y Comparación de Servicios

**Historias incluidas:**
- HU-18: Recomendaciones con IA (13 puntos)

**Puntos totales:** 13  
**Objetivo:** Sistema de recomendaciones inteligente con OpenAI.

---

### **Sprint 11-12: Refinamiento y Testing** (3-4 semanas)
**Objetivo:** Pulir detalles, testing exhaustivo, optimización

- Testing end-to-end completo
- Corrección de bugs críticos
- Optimización de rendimiento
- Mejoras de UX/UI
- Documentación de usuario final
- Preparación para deployment a producción

**Puntos:** Variable (deuda técnica y refinamientos)

---

## NOTAS ADICIONALES

### Estimación de Esfuerzo
- **Velocidad estimada del equipo:** 13-16 puntos por sprint (2 semanas)
- **Duración total del proyecto:** 24-26 semanas (~6 meses)
- **Tiempo para MVP:** 12-14 semanas (Sprints 1-6)

### Dependencias Críticas
- **Sprint 1** es bloqueante para todos los demás (autenticación necesaria)
- **Sprint 2-3** son bloqueantes para Sprint 4 (búsqueda necesaria antes de reservar)
- **Sprint 6** es independiente y puede paralelizarse con Sprints 4-5
- **Sprint 9** puede ejecutarse en paralelo con Sprints anteriores

### Riesgos Identificados
1. **Integración con Google Maps API:** Puede requerir más tiempo del estimado
2. **Sistema de Pagos:** No incluido en estas historias, debe agregarse
3. **Scraping:** Sitios web pueden cambiar estructura (mantenimiento continuo)
4. **OpenAI API:** Costos pueden escalar con volumen de usuarios

### MVP (Producto Mínimo Viable)
Para un lanzamiento inicial rápido, el MVP incluiría:
- **Sprints 1-4:** Autenticación + Búsqueda + Mapa + Reservas
- **Épicas prioritarias:** 1, 2 (parcial), 3
- **Puntos totales del MVP:** ~56 puntos
- **Tiempo estimado:** 12-14 semanas

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs por Épica

**Épica 1 - Usuarios:**
- Tasa de conversión registro: >60%
- Usuarios activos mensuales: >1000 en 3 meses
- Retención 30 días: >40%

**Épica 2 - Búsqueda:**
- Tiempo promedio de búsqueda: <30 segundos
- Tasa de éxito de búsqueda (resultados relevantes): >80%
- Clics a perfiles desde resultados: >50%

**Épica 3 - Reservas:**
- Tasa de conversión búsqueda→reserva: >15%
- Tasa de cancelación: <10%
- NPS (Net Promoter Score): >50

**Épica 4 - Proveedores:**
- Proveedores activos: >50 en 6 meses
- Tiempo de onboarding: <48 horas
- Satisfacción proveedores: >4.0/5.0

**Épica 5 - Admin:**
- Tiempo de aprobación proveedores: <24 horas
- Tickets de soporte resueltos: >90% en 48h

---

## 🎯 CONCLUSIÓN

Este documento define **20 historias de usuario** agrupadas en **5 épicas estratégicas** que suman un total de **142 puntos de historia**. El proyecto está planificado para ejecutarse en **10-12 sprints** (24-26 semanas) con posibilidad de MVP en **12-14 semanas**.

La planificación prioriza:
1. **Funcionalidad core** (autenticación y búsqueda) primero
2. **Valor para usuarios** (reservas y reseñas) segundo
3. **Herramientas para proveedores** en paralelo
4. **Features avanzadas** (IA, analytics) al final

---

**Documento generado para:** Proyecto de Título - Alto Carwash  
**Autor:** Benjamin (Estudiante Ingeniería Informática)  
**Fecha:** Octubre 2025  
**Versión:** 1.0
