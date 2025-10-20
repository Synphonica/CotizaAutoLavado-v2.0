import { auth } from '@clerk/nextjs/server';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

// Función para obtener el token de Clerk (server-side)
async function getClerkToken(): Promise<string | null> {
  try {
    // En el servidor, usamos auth() de @clerk/nextjs/server
    if (typeof window === 'undefined') {
      const { getToken } = await auth();
      return await getToken();
    }
    // En el cliente, retornamos null (el token se debe pasar desde el componente)
    return null;
  } catch (error) {
    console.error('Error obteniendo token de Clerk:', error);
    return null;
  }
}

// Función base para hacer requests con autenticación
async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  customToken?: string | null
): Promise<T> {
  const token = customToken ?? await getClerkToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Agregar headers personalizados
  if (init?.headers) {
    const customHeaders = new Headers(init.headers);
    customHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Agregar token de autenticación
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

// Opciones para requests con token personalizado
interface ApiOptions extends RequestInit {
  token?: string | null;
}

// Función GET con autenticación
export async function apiGet<T>(path: string, options?: ApiOptions): Promise<T> {
  const { token, ...init } = options || {};
  return apiRequest<T>(path, { ...init, method: 'GET' }, token);
}

// Función POST con autenticación
export async function apiPost<T>(path: string, data?: any, options?: ApiOptions): Promise<T> {
  const { token, ...init } = options || {};
  return apiRequest<T>(path, {
    ...init,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }, token);
}

// Función PUT con autenticación
export async function apiPut<T>(path: string, data?: any, options?: ApiOptions): Promise<T> {
  const { token, ...init } = options || {};
  return apiRequest<T>(path, {
    ...init,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }, token);
}

// Función DELETE con autenticación
export async function apiDelete<T>(path: string, options?: ApiOptions): Promise<T> {
  const { token, ...init } = options || {};
  return apiRequest<T>(path, { ...init, method: 'DELETE' }, token);
}


