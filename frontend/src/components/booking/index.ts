// Componentes de Reservas
export { default as BookingCalendar } from './BookingCalendar';
export { default as TimeSlotPicker } from './TimeSlotPicker';
export { default as BookingForm } from './BookingForm';
export { default as BookingCard } from './BookingCard';
export { default as BookingList } from './BookingList';
export { default as BookingDashboard } from './BookingDashboard';

// Tipos y Enums
export type {
    Booking,
    CreateBookingData,
    TimeSlot,
    AvailabilityResponse,
    BookingStats,
    BookingFilters,
    RescheduleData,
    VehicleInfo,
} from '@/types/booking';

export {
    BookingStatus,
    PaymentStatus,
    PaymentMethod,
    BookingStatusLabels,
    PaymentStatusLabels,
    PaymentMethodLabels,
    BookingStatusColors,
} from '@/types/booking';

// Hooks
export {
    useBookings,
    useBooking,
    useAvailability,
    useBookingStats,
} from '@/hooks/booking/useBookings';
