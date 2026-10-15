import { NextResponse } from 'next/server';
import { authCookieName, backendRequest, isRecord, readJsonBody } from '@/lib/backend-api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request body.' }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: 'Login data must be an object.' }, { status: 400 });

  const upstream = await backendRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: body.email, password: body.password, remember: body.remember === true }),
  }, false);
  if (!upstream.ok) return upstream;

  const result: unknown = await upstream.json();
  if (!isRecord(result) || typeof result.token !== 'string' || !('user' in result)) {
    console.error('Backend login response did not contain a user and token.');
    return NextResponse.json({ error: 'The backend returned an invalid login response.' }, { status: 502 });
  }

  const response = NextResponse.json({ user: result.user }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(authCookieName, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(body.remember === true ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });
  return response;
}
