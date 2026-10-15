import { backendRequest } from '@/lib/backend-api';

export const runtime = 'nodejs';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return backendRequest(`/schedule/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
