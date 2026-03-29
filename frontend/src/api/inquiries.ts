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

export type InquiryStatus = 'open' | 'closed';

export interface Inquiry {
  id: number;
  listingId: number;
  requesterId: number;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  listing?: Partial<Listing> & {
    id: number;
    title: string;
    owner?: {
      id: number;
      username: string;
    };
  };
  requester?: {
    id: number;
    username: string;
  };
}

export async function createInquiry(listingId: number, message: string): Promise<Inquiry> {
  const { data } = await api.post<Inquiry>(`/listings/${listingId}/inquiries`, {
    message,
  });
  return data;
}

export async function getMyInquiries(): Promise<Inquiry[]> {
  const { data } = await api.get<Inquiry[]>('/inquiries/mine');
  return data;
}

export async function getListingInquiries(listingId: number): Promise<Inquiry[]> {
  const { data } = await api.get<Inquiry[]>(`/listings/${listingId}/inquiries`);
  return data;
}

export async function updateInquiryStatus(
  id: number,
  status: InquiryStatus,
): Promise<Inquiry> {
  const { data } = await api.patch<Inquiry>(`/inquiries/${id}/status`, {
    status,
  });
  return data;
}
