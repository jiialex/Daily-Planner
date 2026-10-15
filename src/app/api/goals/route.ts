import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, isRecord, readJsonBody } from '@/lib/backend-api';
import { toBackendGoalInput, toFrontendGoal } from '@/lib/backend-mappers';

export const runtime = 'nodejs';

export async function GET() {
  const upstream = await backendRequest('/goals');
  if (!upstream.ok) return upstream;
  const result: unknown = await upstream.json();
  if (!isRecord(result) || !Array.isArray(result.goals)) {
    console.error('Backend goal list response has an invalid shape.');
    return NextResponse.json({ error: 'The backend returned invalid goal data.' }, { status: 502 });
  }
  return NextResponse.json({ goals: result.goals.map(toFrontendGoal) });
}

export async function POST(request: NextRequest) {
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

  const upstream = await backendRequest('/goals', { method: 'POST', body: JSON.stringify(backendBody) });
  if (!upstream.ok) return upstream;
  const result: unknown = await upstream.json();
  if (!isRecord(result) || !('goal' in result)) {
    console.error('Backend goal creation response has an invalid shape.');
    return NextResponse.json({ error: 'The backend returned invalid goal data.' }, { status: 502 });
  }
  return NextResponse.json({ goal: toFrontendGoal(result.goal) }, { status: upstream.status });
}
