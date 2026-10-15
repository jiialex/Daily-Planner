import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const authCookieName = 'planwise_session';

function getBackendBaseUrl() {
  const configuredUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
  return configuredUrl.replace(/\/+$/, '');
}

export async function backendRequest(
  path: string,
  init: RequestInit = {},
  requiresAuth = true,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = requiresAuth ? (await cookies()).get(authCookieName)?.value : undefined;

  if (requiresAuth && !token) {
    return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  try {
    return await fetch(`${getBackendBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`Backend request failed for ${path}:`, error);
    return NextResponse.json(
      { error: 'The backend API is unavailable. Make sure the backend server is running.' },
      { status: 503 },
    );
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error('Request body must contain valid JSON.');
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
