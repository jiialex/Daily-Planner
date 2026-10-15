import { backendRequest } from '@/lib/backend-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return backendRequest(`/schedule${search}`);
}

export async function POST(request: Request) {
  return backendRequest('/schedule', {
    method: 'POST',
    body: await request.text(),
  });
}
