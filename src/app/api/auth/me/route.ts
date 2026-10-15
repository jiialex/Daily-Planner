import { backendRequest } from '@/lib/backend-api';

export const runtime = 'nodejs';

export async function GET() {
  return backendRequest('/auth/me');
}
