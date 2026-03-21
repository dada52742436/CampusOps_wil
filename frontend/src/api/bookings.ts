import axios, { type AxiosError } from 'axios';

// Same axios setup as listings.ts:
// baseURL /api proxied by Vite to localhost:3001, Bearer token auto-attached.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → token expired: clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// -- Type Definitions ---------------------------------------------------------

// Must stay in sync with BookingStatus enum in backend/src/bookings/booking-status.enum.ts
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Shape returned by the backend — included relations vary per endpoint:
//   create / updateStatus → includes listing (id, title) + buyer (id, username)
//   findByBuyer           → includes listing (id, title, price, location)
//   findByListing         → includes buyer (id, username)
export interface Booking {
  id: number;
  listingId: number;
  buyerId: number;
  status: BookingStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: number;
    title: string;
    price?: number;
    location?: string | null;
  };
  buyer?: {
    id: number;
    username: string;
  };
}

// -- API Functions ------------------------------------------------------------

// POST /listings/:listingId/bookings — buyer creates a booking request
export async function createBooking(
  listingId: number,
  message?: string,
): Promise<Booking> {
  const { data } = await api.post<Booking>(`/listings/${listingId}/bookings`, {
    message,
  });
  return data;
}

// GET /bookings/mine — buyer views all bookings they have submitted
export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings/mine');
  return data;
}

// GET /listings/:listingId/bookings — seller views bookings on their listing
export async function getListingBookings(listingId: number): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>(`/listings/${listingId}/bookings`);
  return data;
}

// PATCH /bookings/:id/status — buyer cancels, or seller accepts/rejects
export async function updateBookingStatus(
  id: number,
  status: BookingStatus,
): Promise<Booking> {
  const { data } = await api.patch<Booking>(`/bookings/${id}/status`, {
    status,
  });
  return data;
}
