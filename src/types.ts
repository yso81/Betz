export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  total_xp: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  duration_days: number;
  frequency: 'DAILY' | 'WEEKLY';
  start_date: string;
  created_at: string;
  // UI helpers
  creator_username?: string;
  participants_count?: number;
}

export interface UserChallenge {
  user_id: string;
  challenge_id: string;
  joined_at: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  current_streak: number;
  max_streak: number;
}

export interface CheckIn {
  id: string;
  user_id: string;
  challenge_id: string;
  media_url: string;
  text_proof: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'EXPIRED' | 'DISPUTED';
  timezone_offset: number;
  created_at: string;
  // JOIN helpers
  username?: string;
  challenge_title?: string;
}

export interface Verification {
  id: string;
  check_in_id: string;
  verifier_id: string;
  vote: 'APPROVE' | 'DISPUTED';
  created_at: string;
  // JOIN helpers
  verifier_username?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'API' | 'CRON' | 'SUCCESS' | 'ERROR';
  message: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    total_xp: number;
  };
}
