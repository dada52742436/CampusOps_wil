import axios, { type AxiosError } from 'axios';
import { type ListingCondition } from '../constants/conditions';

// Re-export so pages can import the type directly from the api module if needed
export type { ListingCondition };

// baseURL = /api, Vite proxies /api -> localhost:3001
// Request interceptor automatically attaches the Bearer token from localStorage
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request that goes through this instance
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: a 401 means the token has expired or been tampered with.
// Clear stored credentials and force a redirect to /login so the user re-authenticates.
// Note: this interceptor is NOT on the auth.ts instance - a 401 from /auth/login
// means wrong credentials (not expired session), and should not trigger a redirect.
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

export interface ListingImage {
  id: number;
  listingId: number;
  url: string;
  order: number;
  createdAt: string;
}

// Shape of a Listing returned by the backend (includes owner's public info)
export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  brand: string | null;
  condition: string;
  location: string | null;
  ownerId: number;
  owner: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
}

// Payload for creating a new listing -- matches CreateListingDto on the backend
export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  brand?: string;
  condition: ListingCondition;
  location?: string;
}

// Payload for updating -- all fields optional, matches UpdateListingDto
export interface UpdateListingPayload {
  title?: string;
  description?: string;
  price?: number;
  brand?: string;
  condition?: ListingCondition;
  location?: string;
}

// Optional query params for GET /listings
export interface GetListingsParams {
  search?: string;
  condition?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Paginated envelope returned by GET /listings
export interface PaginatedListings {
  data: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// -- API Functions -------------------------------------------------------------

// GET /listings -- public, no token needed (but interceptor sends it if present)
// Returns a paginated envelope; pass params to filter/search/paginate.
export async function getAllListings(params?: GetListingsParams): Promise<PaginatedListings> {
  const { data } = await api.get<PaginatedListings>('/listings', { params });
  return data;
}

// GET /listings/mine -- protected, requires valid JWT
export async function getMyListings(): Promise<Listing[]> {
  const { data } = await api.get<Listing[]>('/listings/mine');
  return data;
}

// GET /listings/:id -- public
export async function getListingById(id: number): Promise<Listing> {
  const { data } = await api.get<Listing>(`/listings/${id}`);
  return data;
}

// POST /listings -- protected
export async function createListing(payload: CreateListingPayload): Promise<Listing> {
  const { data } = await api.post<Listing>('/listings', payload);
  return data;
}

// PATCH /listings/:id -- protected, only owner can call
export async function updateListing(id: number, payload: UpdateListingPayload): Promise<Listing> {
  const { data } = await api.patch<Listing>(`/listings/${id}`, payload);
  return data;
}

// DELETE /listings/:id -- protected, only owner can call
export async function deleteListing(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/listings/${id}`);
  return data;
}

// POST /listings/:id/images -- protected, owner only, multipart/form-data, field name "file"
export async function uploadListingImage(listingId: number, file: File): Promise<ListingImage> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ListingImage>(
    `/listings/${listingId}/images`,
    formData,
    { headers: { 'Content-Type': undefined } },
  );
  return data;
}

// DELETE /listings/:id/images/:imageId -- protected, owner only
export async function deleteListingImage(
  listingId: number,
  imageId: number,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/listings/${listingId}/images/${imageId}`,
  );
  return data;
}
