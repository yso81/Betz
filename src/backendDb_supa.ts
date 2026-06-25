import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from './types';

// Initialize the administrative Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export class SupabaseEngine {
  private supabase: SupabaseClient;

  constructor() {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment configuration.');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // System Log Writer (Supabase Appended Insert)
  public async writeLog(type: 'INFO' | 'API' | 'CRON' | 'SUCCESS' | 'ERROR', message: string): Promise<void> {
    const timestamp = new Date().toISOString();

    await this.supabase
      .from('logs')
      .insert([{ type, message, timestamp }]);

    // Optional: Log management (clipping logs past 150 entries) 
    // Is better handled via a Supabase Postgres Edge Function or Cron trigger!
  }

  // User Registration Example
  public async registerUser(username: string, email: string, passwordHash: string): Promise<User> {
    const formattedUsername = username.toLowerCase().trim();
    const formattedEmail = email.toLowerCase().trim();

    // Check Duplicate
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('*')
      .or(`username.eq.${formattedUsername},email.eq.${formattedEmail}`)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Username or email already registered');
    }

    // Insert User
    const { data: newUser, error } = await this.supabase
      .from('users')
      .insert([{
        username: formattedUsername,
        email: formattedEmail,
        password_hash: passwordHash,
        total_xp: 0
      }])
      .select()
      .single();

    if (error) throw error;

    await this.writeLog('SUCCESS', `User created: @${newUser.username} (${newUser.email})`);
    return newUser as User;
  }

  // Voting Loop Check-In Verification
  public async verifyCheckIn(checkInId: string, verifierId: string, voteType: 'APPROVE' | 'DISPUTED') {
    // 1. Fetch current Check-In status
    const { data: checkIn, error: ciError } = await this.supabase
      .from('check_ins')
      .select('*')
      .eq('id', checkInId)
      .single();

    if (ciError || !checkIn) throw new Error('Target Check-In not found');
    if (checkIn.user_id === verifierId) {
      throw new Error('Anti-Cheat Constraint: Forbidden from voting on your own check-ins!');
    }

    // 2. Cast Verification Vote
    const { error: voteError } = await this.supabase
      .from('verifications')
      .insert([{ check_in_id: checkInId, verifier_id: verifierId, vote: voteType }]);

    if (voteError && voteError.code === '23505') { // Postgres Unique Constraint violation code
      throw new Error('You have already casted a verification vote for this submission.');
    }

    // 3. Count Votes
    const { data: votes } = await this.supabase
      .from('verifications')
      .select('vote')
      .eq('check_in_id', checkInId);

    const approves = votes?.filter(v => v.vote === 'APPROVE').length || 0;
    const disputes = votes?.filter(v => v.vote === 'DISPUTED').length || 0;

    let targetStatus = checkIn.status;
    if (voteType === 'DISPUTED') {
      targetStatus = 'DISPUTED';
    } else if (approves > disputes) {
      targetStatus = 'VERIFIED';
    }

    // Update Check-In Status
    await this.supabase.from('check_ins').update({ status: targetStatus }).eq('id', checkInId);

    // 4. Streak & XP Evaluation (Atomic update increments using RPC or safe query chains)
    let streakIncremented = false;
    let xpAward = 0;

    if (checkIn.status !== 'VERIFIED' && targetStatus === 'VERIFIED' && !checkIn.streak_awarded) {
      // Use RPC (Postgres Function) to atomically increment metrics or use manual execution:
      await this.supabase.rpc('increment_user_streak_and_xp', { 
        p_user_id: checkIn.user_id, 
        p_challenge_id: checkIn.challenge_id,
        p_check_in_id: checkInId
      });
      streakIncremented = true;
      xpAward = 50;
    }

    // Award helper participating XP to the verifier (+10 XP)
    await this.supabase.rpc('increment_verifier_xp', { p_verifier_id: verifierId });

    return { success: true, status: targetStatus, streak_incremented: streakIncremented, awarded_xp: xpAward };
  }
}

export const dbEngine = new SupabaseEngine();
