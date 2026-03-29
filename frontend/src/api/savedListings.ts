import axios, { type AxiosError } from 'axios';
import type { Listing } from './listings';

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

export interface SavedListingRecord {
  id: number;
  userId: number;
  listingId: number;
  createdAt: string;
  listing: Listing;
}

export async function saveListing(listingId: number): Promise<SavedListingRecord> {
  const { data } = await api.post<SavedListingRecord>(`/saved-listings/${listingId}`);
  return data;
}

export async function getMySavedListings(): Promise<SavedListingRecord[]> {
  const { data } = await api.get<SavedListingRecord[]>('/saved-listings/mine');
  return data;
}

export async function removeSavedListing(listingId: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/saved-listings/${listingId}`);
  return data;
}
