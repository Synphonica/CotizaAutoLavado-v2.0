# 📅 Sistema de Agendamiento - Alto Carwash

## 🎯 Descripción

Sistema completo de agendamiento (bookings) para reservas de servicios de lavado de autos. Permite a los clientes agendar citas con proveedores de servicios y a los proveedores gestionar sus horarios disponibles.

---

## 📋 Características

### ✅ Funcionalidades Principales

1. **Gestión de Reservas**
   - Crear reservas con detalles completos
   - Actualizar estado de reservas
   - Cancelar reservas con razón
   - Reagendar reservas a nuevos horarios
   - Historial completo de reservas

2. **Verificación de Disponibilidad**
   - Verificar horarios disponibles por fecha
   - Generación automática de slots de 30 minutos
   - Prevención de reservas conflictivas
   - Soporte para capacidad múltiple

3. **Franjas Horarias (TimeSlots)**
   - Configurar horarios de trabajo por día de la semana
   - Bloquear fechas específicas (vacaciones, mantenimiento)
   - Capacidad configurable por franja horaria

4. **Estados de Reserva**
   - `PENDING`: Pendiente de confirmación
   - `CONFIRMED`: Confirmada por el proveedor
   - `IN_PROGRESS`: Servicio en progreso
   - `COMPLETED`: Servicio completado
   - `CANCELLED`: Cancelada
   - `REJECTED`: Rechazada por el proveedor
   - `NO_SHOW`: Cliente no apareció
   - `RESCHEDULED`: Reagendada

5. **Gestión de Pagos**
   - Estados: PENDING, PAID, PARTIALLY_PAID, REFUNDED, FAILED
   - Métodos: CASH, CREDIT_CARD, DEBIT_CARD, TRANSFER, ONLINE_PAYMENT
   - Tracking de transacciones

6. **Estadísticas**
   - Dashboard de reservas por proveedor
   - Contadores por estado
   - Filtros por rango de fechas

---

## 🔗 Endpoints API

### 📌 Reservas (Bookings)

#### **POST** `/bookings`
Crear una nueva reserva

**Body:**
```json
{
  "userId": "user_123",
  "providerId": "provider_456",
  "serviceId": "service_789",
  "bookingDate": "2025-10-15",
  "startTime": "2025-10-15T09:00:00Z",
  "endTime": "2025-10-15T10:30:00Z",
  "customerName": "Juan Pérez",
  "customerPhone": "+56912345678",
  "customerEmail": "juan@example.com",
  "vehicleInfo": {
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "plate": "AB1234",
    "color": "Blanco",
    "type": "sedan"
  },
  "serviceName": "Lavado Premium",
  "serviceDuration": 90,
  "totalPrice": 25000,
  "currency": "CLP",
  "paymentMethod": "CREDIT_CARD",
  "customerNotes": "Favor lavar motor también"
}
```

**Response:** `201 Created`
```json
{
  "id": "booking_001",
  "userId": "user_123",
  "providerId": "provider_456",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "bookingDate": "2025-10-15T00:00:00.000Z",
  "startTime": "2025-10-15T09:00:00.000Z",
  "endTime": "2025-10-15T10:30:00.000Z",
  ...
}
```

---

#### **GET** `/bookings`
Obtener todas las reservas (con filtros opcionales)

**Query Params:**
- `userId`: Filtrar por usuario
- `providerId`: Filtrar por proveedor
- `serviceId`: Filtrar por servicio
- `status`: Filtrar por estado (PENDING, CONFIRMED, etc.)
- `paymentStatus`: Filtrar por estado de pago
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)

**Ejemplo:**
```
GET /bookings?providerId=provider_456&status=CONFIRMED&startDate=2025-10-01&endDate=2025-10-31
```

**Response:** `200 OK`
```json
[
  {
    "id": "booking_001",
    "customerName": "Juan Pérez",
    "status": "CONFIRMED",
    "bookingDate": "2025-10-15T00:00:00.000Z",
    ...
  }
]
```

---

#### **GET** `/bookings/:id`
Obtener una reserva específica

**Response:** `200 OK` | `404 Not Found`

---

#### **PATCH** `/bookings/:id`
Actualizar una reserva

**Body:**
```json
{
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TRX123456",
  "providerNotes": "Cliente llegó a tiempo"
}
```

**Response:** `200 OK`

---

#### **POST** `/bookings/:id/cancel`
Cancelar una reserva

**Body:**
```json
{
  "reason": "Cliente canceló por cambio de planes"
}
```

**Response:** `200 OK`

---

#### **POST** `/bookings/:id/reschedule`
Reagendar una reserva

**Body:**
```json
{
  "newBookingDate": "2025-10-20",
  "newStartTime": "2025-10-20T10:00:00Z",
  "newEndTime": "2025-10-20T11:30:00Z",
  "reason": "Cliente solicitó cambio de fecha"
}
```

**Response:** `200 OK` | `409 Conflict` (si el horario no está disponible)

---

#### **POST** `/bookings/check-availability`
Verificar disponibilidad de horarios

**Body:**
```json
{
  "providerId": "provider_456",
  "date": "2025-10-15",
  "serviceId": "service_789"
}
```

**Response:** `200 OK`
```json
{
  "available": true,
  "slots": [
    {
      "startTime": "2025-10-15T09:00:00.000Z",
      "endTime": "2025-10-15T09:30:00.000Z",
      "available": true
    },
    {
      "startTime": "2025-10-15T09:30:00.000Z",
      "endTime": "2025-10-15T10:00:00.000Z",
      "available": true
    },
    ...
  ],
  "message": "Horarios disponibles"
}
```

---

#### **GET** `/bookings/stats/:providerId`
Obtener estadísticas de reservas

**Query Params (opcionales):**
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin

**Response:** `200 OK`
```json
{
  "total": 150,
  "confirmed": 100,
  "pending": 20,
  "completed": 120,
  "cancelled": 25,
  "noShow": 5
}
```

---

#### **DELETE** `/bookings/:id`
Eliminar (cancelar) una reserva

**Response:** `200 OK`

---

## 🗄️ Modelos de Base de Datos

### Booking
```prisma
model Booking {
  id                String        @id @default(cuid())
  userId            String
  providerId        String
  serviceId         String
  bookingDate       DateTime
  startTime         DateTime
  endTime           DateTime
  status            BookingStatus @default(PENDING)
  totalPrice        Decimal
  currency          String        @default("CLP")
  
  // Información del cliente
  customerName      String
  customerPhone     String
  customerEmail     String
  vehicleInfo       Json?
  
  // Detalles del servicio
  serviceName       String
  serviceDuration   Int
  
  // Pago
  paymentStatus     PaymentStatus @default(PENDING)
  paymentMethod     PaymentMethod?
  paidAmount        Decimal?
  transactionId     String?
  
  // Notas
  customerNotes     String?
  providerNotes     String?
  cancellationReason String?
  
  // Timestamps
  confirmedAt       DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  // Recordatorios
  reminderSent      Boolean       @default(false)
  reminderSentAt    DateTime?
}
```

### TimeSlot
```prisma
model TimeSlot {
  id            String    @id @default(cuid())
  providerId    String
  dayOfWeek     Int       // 0=Domingo, 6=Sábado
  startTime     String    // "09:00"
  endTime       String    // "18:00"
  isAvailable   Boolean   @default(true)
  maxCapacity   Int       @default(1)
  specificDate  DateTime? // Para días específicos
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### BlockedDate
```prisma
model BlockedDate {
  id          String   @id @default(cuid())
  providerId  String
  date        DateTime
  reason      String?
  isAllDay    Boolean  @default(true)
  startTime   String?
  endTime     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🚀 Ejemplo de Flujo Completo

### 1️⃣ Cliente consulta disponibilidad
```bash
POST /bookings/check-availability
{
  "providerId": "provider_456",
  "date": "2025-10-15"
}
```

### 2️⃣ Cliente crea reserva
```bash
POST /bookings
{
  "userId": "user_123",
  "providerId": "provider_456",
  "serviceId": "service_789",
  "bookingDate": "2025-10-15",
  "startTime": "2025-10-15T09:00:00Z",
  "endTime": "2025-10-15T10:30:00Z",
  ...
}
```

### 3️⃣ Proveedor confirma reserva
```bash
PATCH /bookings/booking_001
{
  "status": "CONFIRMED"
}
```

### 4️⃣ Cliente realiza pago
```bash
PATCH /bookings/booking_001
{
  "paymentStatus": "PAID",
  "paymentMethod": "CREDIT_CARD",
  "transactionId": "TRX123456"
}
```

### 5️⃣ Proveedor completa servicio
```bash
PATCH /bookings/booking_001
{
  "status": "COMPLETED"
}
```

---

## 📱 Integración con Frontend

### Componentes Sugeridos

1. **BookingCalendar**: Calendario mensual con disponibilidad
2. **TimeSlotPicker**: Selector de horarios disponibles
3. **BookingForm**: Formulario de creación de reserva
4. **BookingCard**: Tarjeta con detalles de reserva
5. **BookingList**: Lista de reservas con filtros
6. **BookingStats**: Dashboard de estadísticas

### Hooks Útiles

```typescript
// hooks/useBookings.ts
export const useBookings = (filters) => {
  const { data, isLoading } = useQuery(['bookings', filters], () =>
    fetch(`/api/bookings?${new URLSearchParams(filters)}`).then(r => r.json())
  );
  return { bookings: data, isLoading };
};

// hooks/useAvailability.ts
export const useAvailability = (providerId, date) => {
  return useQuery(['availability', providerId, date], () =>
    fetch('/api/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify({ providerId, date })
    }).then(r => r.json())
  );
};
```

---

## 🔔 Notificaciones Sugeridas

- ✅ Nueva reserva creada (al proveedor)
- ✅ Reserva confirmada (al cliente)
- ✅ Recordatorio 24h antes (al cliente)
- ✅ Recordatorio 1h antes (al cliente)
- ✅ Reserva completada (al cliente - solicitar review)
- ✅ Reserva cancelada (a ambos)
- ✅ Reserva reagendada (a ambos)

---

## 💡 Mejoras Futuras

- [ ] Sistema de recordatorios automáticos (cron jobs)
- [ ] Integración con calendarios externos (Google Calendar, Outlook)
- [ ] Sistema de lista de espera
- [ ] Reservas recurrentes
- [ ] Códigos de descuento para reservas
- [ ] Sistema de penalización por no-show
- [ ] Chat en tiempo real con el proveedor
- [ ] Geolocalización en tiempo real del proveedor
- [ ] Fotos antes/después del servicio

---

## 🎓 Documentación para tu Profesor

### Valor Agregado del Sistema

1. **Experiencia del Usuario**: Simplifica el proceso de agendamiento
2. **Gestión Eficiente**: Los proveedores pueden organizar mejor su tiempo
3. **Prevención de Conflictos**: Sistema inteligente de validación de horarios
4. **Flexibilidad**: Permite reagendar, cancelar y gestionar múltiples estados
5. **Escalabilidad**: Preparado para crecer con el negocio

### Tecnologías Utilizadas

- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Validaciones**: class-validator + class-transformer
- **API**: RESTful con Swagger documentation
- **Arquitectura**: Modular, SOLID principles

---

¡Sistema de agendamiento completamente funcional y listo para usar! 🎉
