import { NextResponse } from 'next/server';
import { authCookieName } from '@/lib/backend-api';

export async function POST() {
  const response = NextResponse.json({ loggedOut: true });
  response.cookies.set(authCookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
