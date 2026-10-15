import { NextRequest, NextResponse } from 'next/server';
import { backendRequest, isRecord, readJsonBody } from '@/lib/backend-api';
import { toBackendTaskInput, toFrontendTask } from '@/lib/backend-mappers';

export const runtime = 'nodejs';

export async function GET() {
  const upstream = await backendRequest('/tasks');
  if (!upstream.ok) return upstream;
  const result: unknown = await upstream.json();
  if (!isRecord(result) || !Array.isArray(result.tasks)) {
    console.error('Backend task list response has an invalid shape.');
    return NextResponse.json({ error: 'The backend returned invalid task data.' }, { status: 502 });
  }
  return NextResponse.json({ tasks: result.tasks.map(toFrontendTask) });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid task data.' }, { status: 400 });
  }

  let backendBody: Record<string, unknown>;
  try {
    backendBody = toBackendTaskInput(body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid task data.' }, { status: 400 });
  }

  const upstream = await backendRequest('/tasks', { method: 'POST', body: JSON.stringify(backendBody) });
  if (!upstream.ok) return upstream;
  const result: unknown = await upstream.json();
  if (!isRecord(result) || !('task' in result)) {
    console.error('Backend task creation response has an invalid shape.');
    return NextResponse.json({ error: 'The backend returned invalid task data.' }, { status: 502 });
  }
  return NextResponse.json({ task: toFrontendTask(result.task) }, { status: upstream.status });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid task data.' }, { status: 400 });
  }
  if (!isRecord(body) || !Array.isArray(body.ids) || body.ids.some((id) => typeof id !== 'string')) {
    return NextResponse.json({ error: 'Provide a list of task IDs.' }, { status: 400 });
  }

  let updates: Record<string, unknown>;
  try {
    updates = toBackendTaskInput({ status: body.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid task status.' }, { status: 400 });
  }

  const updatedTasks = [];
  for (const id of body.ids) {
    const upstream = await backendRequest(`/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!upstream.ok) return upstream;
    const result: unknown = await upstream.json();
    if (!isRecord(result) || !('task' in result)) {
      console.error('Backend task update response has an invalid shape.');
      return NextResponse.json({ error: 'The backend returned invalid task data.' }, { status: 502 });
    }
    updatedTasks.push(toFrontendTask(result.task));
  }
  return NextResponse.json({ tasks: updatedTasks });
}

export async function DELETE(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid task data.' }, { status: 400 });
  }
  return backendRequest('/tasks', { method: 'DELETE', body: JSON.stringify(body) });
}
