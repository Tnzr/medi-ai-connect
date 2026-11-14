'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { run, get } from '@/lib/db';
import { seed } from '@/lib/seed';

export type Role = 'clinician' | 'official' | 'chw';

const VALID_ROLES: Role[] = ['clinician', 'official', 'chw'];

export async function signIn(formData: FormData): Promise<void> {
  const role = String(formData.get('role') ?? '');
  if (VALID_ROLES.includes(role as Role)) {
    cookies().set('medi_role', role, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
  }
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  cookies().delete('medi_role');
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signOffEncounter(id: string | number): Promise<void> {
  seed();
  run(`UPDATE encounters SET status = 'signed_off' WHERE id = ?`, String(id));
  revalidatePath('/dashboard');
  revalidatePath('/encounters');
}

export async function syncPackets(): Promise<number> {
  seed();
  run(`UPDATE sync_packets SET status = 'synced', synced_at = ? WHERE status = 'pending'`, new Date().toISOString());
  const row = get<{ n: number | bigint }>(`SELECT COUNT(*) AS n FROM sync_packets WHERE status = 'pending'`);
  revalidatePath('/dashboard');
  revalidatePath('/sync');
  return row ? Number(row.n) : 0;
}
