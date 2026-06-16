import fs from 'fs';
import path from 'path';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from './types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface for our database layout
export interface DatabaseSchema {
  users: User[];
  challenges: Challenge[];
  user_challenges: UserChallenge[];
  check_ins: CheckIn[];
  verifications: Verification[];
  logs: SystemLog[];
}

const defaultSchema: DatabaseSchema = {
  users: [
    {
      id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
      username: 'yannick',
      email: 'yannick@gmail.com',
      password_hash: '123456', // Easy testing
      total_xp: 450,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'rc745fbf-4076-4767-8919-48227e7ca4b2',
      username: 'ryan',
      email: 'ryan@gmail.com',
      password_hash: '123456',
      total_xp: 320,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'nc745fbf-4076-4767-8919-48227e7ca4b3',
      username: 'nathanael',
      email: 'nathanael@gmail.com',
      password_hash: '123456',
      total_xp: 510,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ],
  challenges: [
    {
      id: 'ch1-daily-water',
      creator_id: 'nc745fbf-4076-4767-8919-48227e7ca4b3', // Nathanaël
      title: 'Daily Hydration Master',
      description: 'Drink 3 liters of fresh water daily and post physical proof of your filled flask.',
      duration_days: 14,
      frequency: 'DAILY',
      start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 6 * 86400000).toISOString()
    },
    {
      id: 'ch2-morning-run',
      creator_id: 'rc745fbf-4076-4767-8919-48227e7ca4b2', // Ryan
      title: 'Early Sunrise Run 5K',
      description: 'Get moving before 8 AM. Post your fitness app workout summary or trail photo.',
      duration_days: 30,
      frequency: 'DAILY',
      start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'ch3-code-master',
      creator_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1', // Yannick
      title: 'Git Commit Streak',
      description: 'Write code and push commits every day. Post snapshot showing GitHub contribution square green!',
      duration_days: 21,
      frequency: 'DAILY',
      start_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  user_challenges: [
    {
      user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
      challenge_id: 'ch1-daily-water',
      joined_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'ACTIVE',
      current_streak: 4,
      max_streak: 4
    },
    {
      user_id: 'rc745fbf-4076-4767-8919-48227e7ca4b2',
      challenge_id: 'ch1-daily-water',
      joined_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'ACTIVE',
      current_streak: 2,
      max_streak: 3
    },
    {
      user_id: 'nc745fbf-4076-4767-8919-48227e7ca4b3',
      challenge_id: 'ch1-daily-water',
      joined_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'ACTIVE',
      current_streak: 5,
      max_streak: 5
    },
    {
      user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
      challenge_id: 'ch2-morning-run',
      joined_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: 'ACTIVE',
      current_streak: 3,
      max_streak: 3
    },
    {
      user_id: 'nc745fbf-4076-4767-8919-48227e7ca4b3',
      challenge_id: 'ch3-code-master',
      joined_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      status: 'ACTIVE',
      current_streak: 1,
      max_streak: 1
    }
  ],
  check_ins: [
    {
      id: 'chk-1',
      user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1', // Yannick
      challenge_id: 'ch1-daily-water',
      media_url: 'https://images.unsplash.com/photo-1548839133-9ac084fa0a0a?auto=format&fit=crop&q=80&w=600',
      text_proof: 'Starting the morning off, already 1L deep! Hydro homies active.',
      status: 'VERIFIED',
      timezone_offset: -240,
      created_at: new Date(Date.now() - 1 * 86400000 - 4 * 3600000).toISOString() // Yesterday morning
    },
    {
      id: 'chk-2',
      user_id: 'rc745fbf-4076-4767-8919-48227e7ca4b2', // Ryan
      challenge_id: 'ch1-daily-water',
      media_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600',
      text_proof: 'Water bottle filled, adding key vitamins today!',
      status: 'PENDING_VERIFICATION',
      timezone_offset: -240,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
    },
    {
      id: 'chk-3',
      user_id: 'yc745fbf-4076-4767-8919-48227e7ca4b1', // Yannick
      challenge_id: 'ch2-morning-run',
      media_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600',
      text_proof: '5K trail run finished! Beautiful mist at sunrise.',
      status: 'PENDING_VERIFICATION',
      timezone_offset: -240,
      created_at: new Date(Date.now() - 1 * 3600000).toISOString() // 1 hour ago
    }
  ],
  verifications: [
    {
      id: 'v-1',
      check_in_id: 'chk-1',
      verifier_id: 'nc745fbf-4076-4767-8919-48227e7ca4b3', // Nathanaël
      vote: 'APPROVE',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString()
    }
  ],
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      type: 'INFO',
      message: 'System initialization: seeded database successfully.'
    }
  ]
};

export class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Error loading database file, fallback to in-memory', e);
    }
    this.save(defaultSchema);
    return JSON.parse(JSON.stringify(defaultSchema));
  }

  private save(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing database to disk', e);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public writeLog(type: 'INFO' | 'API' | 'CRON' | 'SUCCESS' | 'ERROR', message: string) {
    const newLog: SystemLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.data.logs.unshift(newLog);
    // Keep last 150 logs
    if (this.data.logs.length > 150) {
      this.data.logs = this.data.logs.slice(0, 150);
    }
    this.save(this.data);
  }

  public clearLogs() {
    this.data.logs = [];
    this.save(this.data);
  }

  // Auth Operations
  public registerUser(username: string, email: string, passwordHash: string): User {
    const formattedUsername = username.toLowerCase().trim();
    const formattedEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = this.data.users.find(u => u.username === formattedUsername || u.email === formattedEmail);
    if (existing) {
      throw new Error('Username or email already registered');
    }

    const newUser: User = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      username: formattedUsername,
      email: formattedEmail,
      password_hash: passwordHash,
      total_xp: 0,
      created_at: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.writeLog('SUCCESS', `User created: @${newUser.username} (${newUser.email})`);
    this.save(this.data);
    return newUser;
  }

  public loginUser(usernameOrEmail: string, passwordHash: string): User {
    const term = usernameOrEmail.toLowerCase().trim();
    const user = this.data.users.find(u => u.username === term || u.email === term);
    
    if (!user) {
      throw new Error('User not found');
    }
    if (user.password_hash !== passwordHash) {
      throw new Error('Incorrect password');
    }
    
    this.writeLog('API', `User @${user.username} authenticated successfully.`);
    return user;
  }

  // Challenge Operations
  public createChallenge(creatorId: string, title: string, description: string, durationDays: number, frequency: 'DAILY' | 'WEEKLY', startDateStr?: string): Challenge {
    if (durationDays <= 0) {
      throw new Error('Duration must be greater than 0');
    }

    const creator = this.data.users.find(u => u.id === creatorId);
    if (!creator) {
      throw new Error('Creator user not found');
    }

    const newChallenge: Challenge = {
      id: `ch-${Math.random().toString(36).substr(2, 9)}`,
      creator_id: creatorId,
      title: title.trim(),
      description: description.trim(),
      duration_days: durationDays,
      frequency,
      start_date: startDateStr ? new Date(startDateStr).toISOString() : new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    this.data.challenges.push(newChallenge);
    this.writeLog('SUCCESS', `New Challenge: "${newChallenge.title}" was declared by @${creator.username}`);
    
    // Automatically make creator join the challenge!
    this.joinChallenge(creatorId, newChallenge.id);

    this.save(this.data);
    return newChallenge;
  }

  public joinChallenge(userId: string, challengeId: string): UserChallenge {
    const user = this.data.users.find(u => u.id === userId);
    const challenge = this.data.challenges.find(c => c.id === challengeId);

    if (!user || !challenge) {
      throw new Error('User or challenge not found');
    }

    // Check if duplicate enrolment
    const existing = this.data.user_challenges.find(uc => uc.user_id === userId && uc.challenge_id === challengeId);
    if (existing) {
      return existing;
    }

    const newMembership: UserChallenge = {
      user_id: userId,
      challenge_id: challengeId,
      joined_at: new Date().toISOString(),
      status: 'ACTIVE',
      current_streak: 0,
      max_streak: 0
    };

    this.data.user_challenges.push(newMembership);
    this.writeLog('INFO', `@${user.username} signed the pledge to join "${challenge.title}"`);
    this.save(this.data);
    return newMembership;
  }

  // Submissions Checkins
  public submitCheckIn(userId: string, challengeId: string, mediaUrl: string, textProof: string, timezoneOffset: number): CheckIn {
    const user = this.data.users.find(u => u.id === userId);
    const challenge = this.data.challenges.find(c => c.id === challengeId);
    const userChallenge = this.data.user_challenges.find(uc => uc.user_id === userId && uc.challenge_id === challengeId);

    if (!user || !challenge) {
      throw new Error('User or Challenge resource not found');
    }
    if (!userChallenge) {
      throw new Error('User must join the challenge before compiling verification check-ins');
    }

    // Simple constraint: Single check_in per user per challenge in a 18-hour window to avoid spamming
    const eighteenHoursAgo = Date.now() - 18 * 3600 * 1000;
    const existingSpam = this.data.check_ins.find(
      c => c.user_id === userId && 
           c.challenge_id === challengeId && 
           new Date(c.created_at).getTime() > eighteenHoursAgo
    );
    if (existingSpam) {
      throw new Error('You have already submitted a proof for this challenge recently. Try again in the next cycle.');
    }

    const newCheckIn: CheckIn = {
      id: `chk-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      challenge_id: challengeId,
      media_url: mediaUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
      text_proof: textProof,
      status: 'PENDING_VERIFICATION',
      timezone_offset: timezoneOffset,
      created_at: new Date().toISOString()
    };

    this.data.check_ins.unshift(newCheckIn);
    this.writeLog('SUCCESS', `@${user.username} uploaded physical proof for "${challenge.title}". Pending peer voting.`);
    this.save(this.data);
    return newCheckIn;
  }

  // Voting Loop
  public verifyCheckIn(checkInId: string, verifierId: string, voteType: 'APPROVE' | 'DISPUTED'): {
    success: boolean;
    checkIn: CheckIn;
    status: CheckIn['status'];
    votes_count: number;
    streak_incremented: boolean;
    awarded_xp: number;
  } {
    const checkIn = this.data.check_ins.find(c => c.id === checkInId);
    if (!checkIn) {
      throw new Error('Target Check-In not found');
    }

    if (checkIn.user_id === verifierId) {
      throw new Error('Anti-Cheat Constraint: You are forbidden from voting on your own check-ins!');
    }

    const verifier = this.data.users.find(u => u.id === verifierId);
    if (!verifier) {
      throw new Error('Verifier does not exist');
    }

    // Check existing vote
    const existingVote = this.data.verifications.find(
      v => v.check_in_id === checkInId && v.verifier_id === verifierId
    );
    if (existingVote) {
      throw new Error('You have already casted a verification vote for this submission.');
    }

    // Record vote
    const newVerification: Verification = {
      id: `v-${Math.random().toString(36).substr(2, 9)}`,
      check_in_id: checkInId,
      verifier_id: verifierId,
      vote: voteType,
      created_at: new Date().toISOString()
    };
    this.data.verifications.push(newVerification);

    // Fetch all votes on this check-in
    const votesOnCheckIn = this.data.verifications.filter(v => v.check_in_id === checkInId);
    const approves = votesOnCheckIn.filter(v => v.vote === 'APPROVE').length;
    const disputes = votesOnCheckIn.filter(v => v.vote === 'DISPUTED').length;

    let statusUpdated: CheckIn['status'] = checkIn.status;
    let streakIncremented = false;
    let xpAward = 0;

    // Consensus Resolution Logic:
    // When a checking receives a vote, if there are some votes, we determine status.
    // For a highly dynamic user playground:
    // If disputes outnumber approvals, status becomes DISPUTED.
    // If approvals outnumber or match disputes, and we have votes, status becomes VERIFIED.
    // Let's decide: If vote content is 'DISPUTED', it immediately flips to DISPUTED (re-verifiable if approves comes).
    // Or simpler: Let the vote decide the status directly.
    // If the verifier votes DISPUTED, the post status becomes 'DISPUTED'.
    // If they vote APPROVE:
    //   If it was PENDING or DISPUTED, and now has positive votes consensus:
    //     Status becomes VERIFIED.
    // When status flips from (PENDING_VERIFICATION or DISPUTED) to VERIFIED:
    //   Reward the author +50 XP and increment their streak!
    // Let's implement this cleanly:
    const oldStatus = checkIn.status;
    
    if (voteType === 'DISPUTED') {
      checkIn.status = 'DISPUTED';
      this.writeLog('ERROR', `@${verifier.username} contested @${this.getUsername(checkIn.user_id)}'s proof! Flagged as DISPUTED.`);
    } else {
      // Approve vote
      if (approves > disputes) {
        checkIn.status = 'VERIFIED';
      }
    }

    statusUpdated = checkIn.status;

    // If flipped to VERIFIED, increment active streaks and award user XP!
    if (oldStatus !== 'VERIFIED' && statusUpdated === 'VERIFIED') {
      const challenger = this.data.users.find(u => u.id === checkIn.user_id);
      const userChallenge = this.data.user_challenges.find(
        uc => uc.user_id === checkIn.user_id && uc.challenge_id === checkIn.challenge_id
      );

      if (challenger && userChallenge) {
        userChallenge.current_streak += 1;
        if (userChallenge.current_streak > userChallenge.max_streak) {
          userChallenge.max_streak = userChallenge.current_streak;
        }
        
        xpAward = 50;
        challenger.total_xp += xpAward;
        streakIncremented = true;

        this.writeLog('SUCCESS', `Consensus reached! @${challenger.username}'s checked-in habit was VERIFIED! Incremented Streak to ${userChallenge.current_streak} 🔥. Awarded +50 XP!`);
      }
    }

    // Award helper participating XP to the verifier for maintaining the social network! (+10 XP)
    verifier.total_xp += 10;
    this.writeLog('INFO', `@${verifier.username} earned +10 Verification XP for peer evaluation.`);

    this.save(this.data);
    return {
      success: true,
      checkIn,
      status: statusUpdated,
      votes_count: votesOnCheckIn.length,
      streak_incremented: streakIncremented,
      awarded_xp: xpAward
    };
  }

  // Sequence B Reset
  public runStreakValidationEngine(): { resetsCount: number; message: string } {
    this.writeLog('CRON', 'Streaks Validation Engine: Commencing midnight verification sweep across all regions...');
    let resetsCount = 0;

    // For every active user challenge:
    // A user must have submitted at least one status = 'VERIFIED' status check-in in the last 28 hours (accounting for some timezone buffer)
    const cutoffTime = Date.now() - 28 * 3600 * 1000;

    this.data.user_challenges.forEach(uc => {
      if (uc.status !== 'ACTIVE') return;

      const user = this.data.users.find(u => u.id === uc.user_id);
      const challenge = this.data.challenges.find(c => c.id === uc.challenge_id);
      if (!user || !challenge) return;

      // Find any check-ins in the valid recent window
      const checkinToday = this.data.check_ins.find(
        c => c.user_id === uc.user_id &&
             c.challenge_id === uc.challenge_id &&
             new Date(c.created_at).getTime() > cutoffTime &&
             (c.status === 'VERIFIED' || c.status === 'PENDING_VERIFICATION')
      );

      if (!checkinToday) {
        // RESET STREAK!
        const oldStreak = uc.current_streak;
        if (oldStreak > 0) {
          uc.current_streak = 0;
          resetsCount++;
          this.writeLog('ERROR', `RESET: @${user.username} failed check-in for "${challenge.title}" outside boundary. Streak has been reset from ${oldStreak} to 0 ❄️.`);
        }
      }
    });

    const msg = `Streak reset sequence terminated. Evaluated active pledging tables. Total users penalized: ${resetsCount}.`;
    this.writeLog('SUCCESS', msg);
    this.save(this.data);
    return {
      resetsCount,
      message: msg
    };
  }

  // Reset Sandbox Data to raw pristine state
  public resetSandboxToFactoryDefaults() {
    this.data = JSON.parse(JSON.stringify(defaultSchema));
    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'SUCCESS',
      message: 'Sandbox state restored to system design seed defaults (Yannick, Ryan, Nathanaël).'
    });
    this.save(this.data);
    return this.data;
  }

  // Helper inside database
  private getUsername(userId: string): string {
    const u = this.data.users.find(x => x.id === userId);
    return u ? u.username : 'anonymous';
  }
}

export const dbEngine = new DatabaseEngine();
