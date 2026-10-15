import { backendRequest } from '@/lib/backend-api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  return backendRequest('/planner/day/save', {
    method: 'POST',
    body: await request.text(),
  });
}
