import axios from 'axios';

// Reuse the same axios instance pattern as auth.ts:
// baseURL = /api, Vite proxies /api → localhost:3001
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

// ── Type Definitions ──────────────────────────────────────────────────────────

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

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
}

// Payload for creating a new listing — matches CreateListingDto on the backend
export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  brand?: string;
  condition: ListingCondition;
  location?: string;
}

// Payload for updating — all fields optional, matches UpdateListingDto
export interface UpdateListingPayload {
  title?: string;
  description?: string;
  price?: number;
  brand?: string;
  condition?: ListingCondition;
  location?: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

// GET /listings — public, no token needed (but interceptor sends it if present)
export async function getAllListings(): Promise<Listing[]> {
  const { data } = await api.get<Listing[]>('/listings');
  return data;
}

// GET /listings/mine — protected, requires valid JWT
export async function getMyListings(): Promise<Listing[]> {
  const { data } = await api.get<Listing[]>('/listings/mine');
  return data;
}

// GET /listings/:id — public
export async function getListingById(id: number): Promise<Listing> {
  const { data } = await api.get<Listing>(`/listings/${id}`);
  return data;
}

// POST /listings — protected
export async function createListing(payload: CreateListingPayload): Promise<Listing> {
  const { data } = await api.post<Listing>('/listings', payload);
  return data;
}

// PATCH /listings/:id — protected, only owner can call
export async function updateListing(id: number, payload: UpdateListingPayload): Promise<Listing> {
  const { data } = await api.patch<Listing>(`/listings/${id}`, payload);
  return data;
}

// DELETE /listings/:id — protected, only owner can call
export async function deleteListing(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/listings/${id}`);
  return data;
}
