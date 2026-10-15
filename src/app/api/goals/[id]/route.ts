import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, isRecord, readJsonBody } from '@/lib/backend-api';
import { toBackendGoalInput, toFrontendGoal } from '@/lib/backend-mappers';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid goal data.' }, { status: 400 });
  }

  let backendBody: Record<string, unknown>;
  try {
    backendBody = toBackendGoalInput(body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid goal data.' }, { status: 400 });
  }

  const upstream = await backendRequest(`/goals/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(backendBody),
  });
  if (!upstream.ok) return upstream;
  const result: unknown = await upstream.json();
  if (!isRecord(result) || !('goal' in result)) {
    console.error('Backend goal update response has an invalid shape.');
    return NextResponse.json({ error: 'The backend returned invalid goal data.' }, { status: 502 });
  }
  return NextResponse.json({ goal: toFrontendGoal(result.goal) });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const upstream = await backendRequest(`/goals/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!upstream.ok) return upstream;
  return NextResponse.json({ deleted: true });
}
