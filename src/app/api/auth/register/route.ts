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
  if (!isRecord(body)) return NextResponse.json({ error: 'Registration data must be an object.' }, { status: 400 });

  const upstream = await backendRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: body.fullName,
      email: body.email,
      password: body.password,
      planningMode: body.planningMode,
      calendarPref: body.calendarPref,
    }),
  }, false);
  if (!upstream.ok) return upstream;

  const result: unknown = await upstream.json();
  if (!isRecord(result) || typeof result.token !== 'string' || !('user' in result)) {
    console.error('Backend registration response did not contain a user and token.');
    return NextResponse.json({ error: 'The backend returned an invalid registration response.' }, { status: 502 });
  }

  const response = NextResponse.json({ user: result.user }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(authCookieName, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}
