import { auth } from '@clerk/nextjs';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

// Función para obtener el token de Clerk
async function getClerkToken(): Promise<string | null> {
  try {
    const { getToken } = await import('@clerk/nextjs');
    return await getToken();
  } catch (error) {
    console.error('Error obteniendo token de Clerk:', error);
    return null;
  }
}

// Función base para hacer requests con autenticación
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getClerkToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Función GET con autenticación
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'GET' });
}

// Función POST con autenticación
export async function apiPost<T>(path: string, data?: any, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// Función PUT con autenticación
export async function apiPut<T>(path: string, data?: any, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// Función DELETE con autenticación
export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, method: 'DELETE' });
}


