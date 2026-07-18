import { supabase } from '@/lib/supabase';
import type { WordGroup, ReviewState } from '@/types';

export interface UserDataPayload {
  groups: WordGroup[];
  reviewState: ReviewState | null;
}

export async function loadUserData(userId: string): Promise<UserDataPayload | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('groups_json, review_state_json')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 没有记录
      return null;
    }
    throw error;
  }

  return {
    groups: (data.groups_json as WordGroup[]) ?? [],
    reviewState: (data.review_state_json as ReviewState | null) ?? null,
  };
}

export async function saveUserData(
  userId: string,
  groups: WordGroup[],
  reviewState: ReviewState | null
): Promise<void> {
  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      groups_json: groups as unknown as Record<string, unknown>[],
      review_state_json: reviewState as unknown as Record<string, unknown> | null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
}
