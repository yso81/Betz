import path from 'path';
import Database from 'better-sqlite3';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from './types';

const DB_FILE = path.join(process.cwd(), 'db.sqlite');

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
      media_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=600',
      text_proof: 'Starting the morning off, already 1L deep! Hydro homies active.',
      status: 'VERIFIED',
      timezone_offset: -240,
      created_at: new Date(Date.now() - 1 * 86400000 - 4 * 3600000).toISOString(), // Yesterday morning
      streak_awarded: true
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
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_FILE);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        total_xp INTEGER,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        creator_id TEXT,
        title TEXT,
        description TEXT,
        duration_days INTEGER,
        frequency TEXT,
        start_date TEXT,
        created_at TEXT,
        FOREIGN KEY(creator_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS user_challenges (
        user_id TEXT,
        challenge_id TEXT,
        joined_at TEXT,
        status TEXT,
        current_streak INTEGER,
        max_streak INTEGER,
        PRIMARY KEY (user_id, challenge_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(challenge_id) REFERENCES challenges(id)
      );

      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        challenge_id TEXT,
        media_url TEXT,
        text_proof TEXT,
        status TEXT,
        timezone_offset INTEGER,
        created_at TEXT,
        streak_awarded INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(challenge_id) REFERENCES challenges(id)
      );

      CREATE TABLE IF NOT EXISTS verifications (
        id TEXT PRIMARY KEY,
        check_in_id TEXT,
        verifier_id TEXT,
        vote TEXT,
        created_at TEXT,
        FOREIGN KEY(check_in_id) REFERENCES check_ins(id),
        FOREIGN KEY(verifier_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        type TEXT,
        message TEXT
      );
    `);

    // If database is empty, seed it
    const rowCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (rowCount.count === 0) {
      this.seedDatabase(defaultSchema);
    }
  }

  private seedDatabase(schema: DatabaseSchema) {
    const insertUser = this.db.prepare(`
      INSERT INTO users (id, username, email, password_hash, total_xp, created_at)
      VALUES (@id, @username, @email, @password_hash, @total_xp, @created_at)
    `);
    const insertChallenge = this.db.prepare(`
      INSERT INTO challenges (id, creator_id, title, description, duration_days, frequency, start_date, created_at)
      VALUES (@id, @creator_id, @title, @description, @duration_days, @frequency, @start_date, @created_at)
    `);
    const insertUserChallenge = this.db.prepare(`
      INSERT INTO user_challenges (user_id, challenge_id, joined_at, status, current_streak, max_streak)
      VALUES (@user_id, @challenge_id, @joined_at, @status, @current_streak, @max_streak)
    `);
    const insertCheckIn = this.db.prepare(`
      INSERT INTO check_ins (id, user_id, challenge_id, media_url, text_proof, status, timezone_offset, created_at, streak_awarded)
      VALUES (@id, @user_id, @challenge_id, @media_url, @text_proof, @status, @timezone_offset, @created_at, @streak_awarded)
    `);
    const insertVerification = this.db.prepare(`
      INSERT INTO verifications (id, check_in_id, verifier_id, vote, created_at)
      VALUES (@id, @check_in_id, @verifier_id, @vote, @created_at)
    `);
    const insertLog = this.db.prepare(`
      INSERT INTO logs (id, timestamp, type, message)
      VALUES (@id, @timestamp, @type, @message)
    `);

    const transaction = this.db.transaction(() => {
      schema.users.forEach(u => insertUser.run(u));
      schema.challenges.forEach(c => insertChallenge.run(c));
      schema.user_challenges.forEach(uc => insertUserChallenge.run(uc));
      schema.check_ins.forEach(ci => insertCheckIn.run({
        ...ci,
        streak_awarded: ci.streak_awarded ? 1 : 0
      }));
      schema.verifications.forEach(v => insertVerification.run(v));
      schema.logs.forEach(l => insertLog.run(l));
    });

    transaction();
  }

  public getData(): DatabaseSchema {
    const users = this.db.prepare('SELECT * FROM users').all() as User[];
    const challenges = this.db.prepare('SELECT * FROM challenges').all() as Challenge[];
    const user_challenges = this.db.prepare('SELECT * FROM user_challenges').all() as UserChallenge[];
    
    const dbCheckIns = this.db.prepare('SELECT * FROM check_ins ORDER BY created_at DESC').all() as any[];
    const check_ins = dbCheckIns.map(ci => ({
      ...ci,
      streak_awarded: !!ci.streak_awarded
    })) as CheckIn[];

    const verifications = this.db.prepare('SELECT * FROM verifications').all() as Verification[];
    const logs = this.db.prepare('SELECT * FROM logs ORDER BY timestamp DESC').all() as SystemLog[];

    return {
      users,
      challenges,
      user_challenges,
      check_ins,
      verifications,
      logs
    };
  }

  public writeLog(type: 'INFO' | 'API' | 'CRON' | 'SUCCESS' | 'ERROR', message: string) {
    const id = `log-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO logs (id, timestamp, type, message)
      VALUES (?, ?, ?, ?)
    `).run(id, timestamp, type, message);

    // Keep last 150 logs
    const logCount = this.db.prepare('SELECT COUNT(*) as count FROM logs').get() as { count: number };
    if (logCount.count > 150) {
      // Find the cutoff timestamp
      const cutoff = this.db.prepare('SELECT timestamp FROM logs ORDER BY timestamp DESC LIMIT 1 OFFSET 149').get() as { timestamp: string };
      if (cutoff) {
        this.db.prepare('DELETE FROM logs WHERE timestamp < ?').run(cutoff.timestamp);
      }
    }
  }

  public clearLogs() {
    this.db.prepare('DELETE FROM logs').run();
  }

  // Auth Operations
  public registerUser(username: string, email: string, passwordHash: string): User {
    const formattedUsername = username.toLowerCase().trim();
    const formattedEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = this.db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(formattedUsername, formattedEmail) as User | undefined;
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

    this.db.prepare(`
      INSERT INTO users (id, username, email, password_hash, total_xp, created_at)
      VALUES (@id, @username, @email, @password_hash, @total_xp, @created_at)
    `).run(newUser);

    this.writeLog('SUCCESS', `User created: @${newUser.username} (${newUser.email})`);
    return newUser;
  }

  public loginUser(usernameOrEmail: string, passwordHash: string): User {
    const term = usernameOrEmail.toLowerCase().trim();
    const user = this.db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(term, term) as User | undefined;
    
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

    const creator = this.db.prepare('SELECT * FROM users WHERE id = ?').get(creatorId) as User | undefined;
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

    this.db.prepare(`
      INSERT INTO challenges (id, creator_id, title, description, duration_days, frequency, start_date, created_at)
      VALUES (@id, @creator_id, @title, @description, @duration_days, @frequency, @start_date, @created_at)
    `).run(newChallenge);

    this.writeLog('SUCCESS', `New Challenge: "${newChallenge.title}" was declared by @${creator.username}`);
    
    // Automatically make creator join the challenge!
    this.joinChallenge(creatorId, newChallenge.id);

    return newChallenge;
  }

  public joinChallenge(userId: string, challengeId: string): UserChallenge {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
    const challenge = this.db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId) as Challenge | undefined;

    if (!user || !challenge) {
      throw new Error('User or challenge not found');
    }

    // Check if duplicate enrolment
    const existing = this.db.prepare('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?').get(userId, challengeId) as UserChallenge | undefined;
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

    this.db.prepare(`
      INSERT INTO user_challenges (user_id, challenge_id, joined_at, status, current_streak, max_streak)
      VALUES (@user_id, @challenge_id, @joined_at, @status, @current_streak, @max_streak)
    `).run(newMembership);

    this.writeLog('INFO', `@${user.username} signed the pledge to join "${challenge.title}"`);
    return newMembership;
  }

  // Submissions Checkins
  public submitCheckIn(userId: string, challengeId: string, mediaUrl: string, textProof: string, timezoneOffset: number): CheckIn {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
    const challenge = this.db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId) as Challenge | undefined;
    const userChallenge = this.db.prepare('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?').get(userId, challengeId) as UserChallenge | undefined;

    if (!user || !challenge) {
      throw new Error('User or Challenge resource not found');
    }
    if (!userChallenge) {
      throw new Error('User must join the challenge before compiling verification check-ins');
    }

    // Simple constraint: Single check_in per user per challenge in a 18-hour window to avoid spamming
    const eighteenHoursAgo = new Date(Date.now() - 18 * 3600 * 1000).toISOString();
    const existingSpam = this.db.prepare(`
      SELECT * FROM check_ins 
      WHERE user_id = ? AND challenge_id = ? AND created_at > ?
      LIMIT 1
    `).get(userId, challengeId, eighteenHoursAgo) as CheckIn | undefined;

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
      created_at: new Date().toISOString(),
      streak_awarded: false
    };

    this.db.prepare(`
      INSERT INTO check_ins (id, user_id, challenge_id, media_url, text_proof, status, timezone_offset, created_at, streak_awarded)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      newCheckIn.id,
      newCheckIn.user_id,
      newCheckIn.challenge_id,
      newCheckIn.media_url,
      newCheckIn.text_proof,
      newCheckIn.status,
      newCheckIn.timezone_offset,
      newCheckIn.created_at
    );

    this.writeLog('SUCCESS', `@${user.username} uploaded physical proof for "${challenge.title}". Pending peer voting.`);
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
    const checkInRaw = this.db.prepare('SELECT * FROM check_ins WHERE id = ?').get(checkInId) as any;
    if (!checkInRaw) {
      throw new Error('Target Check-In not found');
    }
    const checkIn: CheckIn = {
      ...checkInRaw,
      streak_awarded: !!checkInRaw.streak_awarded
    };

    if (checkIn.user_id === verifierId) {
      throw new Error('Anti-Cheat Constraint: You are forbidden from voting on your own check-ins!');
    }

    const verifier = this.db.prepare('SELECT * FROM users WHERE id = ?').get(verifierId) as User | undefined;
    if (!verifier) {
      throw new Error('Verifier does not exist');
    }

    // Check existing vote
    const existingVote = this.db.prepare('SELECT * FROM verifications WHERE check_in_id = ? AND verifier_id = ?').get(checkInId, verifierId);
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
    this.db.prepare(`
      INSERT INTO verifications (id, check_in_id, verifier_id, vote, created_at)
      VALUES (@id, @check_in_id, @verifier_id, @vote, @created_at)
    `).run(newVerification);

    // Fetch all votes on this check-in
    const votesOnCheckIn = this.db.prepare('SELECT * FROM verifications WHERE check_in_id = ?').all() as Verification[];
    const approves = votesOnCheckIn.filter(v => v.vote === 'APPROVE').length;
    const disputes = votesOnCheckIn.filter(v => v.vote === 'DISPUTED').length;

    let statusUpdated: CheckIn['status'] = checkIn.status;
    let streakIncremented = false;
    let xpAward = 0;

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

    // Update check-in status in SQLite
    this.db.prepare('UPDATE check_ins SET status = ? WHERE id = ?').run(statusUpdated, checkInId);

    // If flipped to VERIFIED, increment active streaks and award user XP!
    if (oldStatus !== 'VERIFIED' && statusUpdated === 'VERIFIED' && !checkIn.streak_awarded) {
      const challenger = this.db.prepare('SELECT * FROM users WHERE id = ?').get(checkIn.user_id) as User | undefined;
      const userChallenge = this.db.prepare('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?').get(checkIn.user_id, checkIn.challenge_id) as UserChallenge | undefined;

      if (challenger && userChallenge) {
        userChallenge.current_streak += 1;
        if (userChallenge.current_streak > userChallenge.max_streak) {
          userChallenge.max_streak = userChallenge.current_streak;
        }
        
        xpAward = 50;
        challenger.total_xp += xpAward;
        streakIncremented = true;
        checkIn.streak_awarded = true;

        this.db.prepare('UPDATE user_challenges SET current_streak = ?, max_streak = ? WHERE user_id = ? AND challenge_id = ?')
          .run(userChallenge.current_streak, userChallenge.max_streak, checkIn.user_id, checkIn.challenge_id);
        this.db.prepare('UPDATE users SET total_xp = ? WHERE id = ?').run(challenger.total_xp, checkIn.user_id);
        this.db.prepare('UPDATE check_ins SET streak_awarded = 1 WHERE id = ?').run(checkInId);

        this.writeLog('SUCCESS', `Consensus reached! @${challenger.username}'s checked-in habit was VERIFIED! Incremented Streak to ${userChallenge.current_streak} 🔥. Awarded +50 XP!`);
      }
    }

    // Rollback logic: If flipped FROM VERIFIED to DISPUTED (or other non-verified status), revert streak and XP
    if (oldStatus === 'VERIFIED' && statusUpdated !== 'VERIFIED' && checkIn.streak_awarded) {
      const challenger = this.db.prepare('SELECT * FROM users WHERE id = ?').get(checkIn.user_id) as User | undefined;
      const userChallenge = this.db.prepare('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?').get(checkIn.user_id, checkIn.challenge_id) as UserChallenge | undefined;

      if (challenger && userChallenge) {
        userChallenge.current_streak = Math.max(0, userChallenge.current_streak - 1);
        challenger.total_xp = Math.max(0, challenger.total_xp - 50);
        checkIn.streak_awarded = false;

        this.db.prepare('UPDATE user_challenges SET current_streak = ? WHERE user_id = ? AND challenge_id = ?')
          .run(userChallenge.current_streak, checkIn.user_id, checkIn.challenge_id);
        this.db.prepare('UPDATE users SET total_xp = ? WHERE id = ?').run(challenger.total_xp, checkIn.user_id);
        this.db.prepare('UPDATE check_ins SET streak_awarded = 0 WHERE id = ?').run(checkInId);

        this.writeLog('ERROR', `@${verifier.username} disputed verification for @${challenger.username}'s check-in! Rolled back streak to ${userChallenge.current_streak} and deducted 50 XP.`);
      }
    }

    // Award helper participating XP to the verifier for maintaining the social network! (+10 XP)
    this.db.prepare('UPDATE users SET total_xp = total_xp + 10 WHERE id = ?').run(verifierId);
    this.writeLog('INFO', `@${verifier.username} earned +10 Verification XP for peer evaluation.`);

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

    const activeUserChallenges = this.db.prepare("SELECT * FROM user_challenges WHERE status = 'ACTIVE'").all() as UserChallenge[];

    // For every active user challenge:
    // A user must have submitted at least one status = 'VERIFIED' or 'PENDING_VERIFICATION' status check-in in the last 28 hours
    const cutoffTime = new Date(Date.now() - 28 * 3600 * 1000).toISOString();

    activeUserChallenges.forEach(uc => {
      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(uc.user_id) as User | undefined;
      const challenge = this.db.prepare('SELECT * FROM challenges WHERE id = ?').get(uc.challenge_id) as Challenge | undefined;
      if (!user || !challenge) return;

      // Find any check-ins in the valid recent window
      const checkinToday = this.db.prepare(`
        SELECT * FROM check_ins 
        WHERE user_id = ? AND challenge_id = ? AND created_at > ? AND (status = 'VERIFIED' OR status = 'PENDING_VERIFICATION')
        LIMIT 1
      `).get(uc.user_id, uc.challenge_id, cutoffTime) as CheckIn | undefined;

      if (!checkinToday) {
        // RESET STREAK!
        const oldStreak = uc.current_streak;
        if (oldStreak > 0) {
          this.db.prepare('UPDATE user_challenges SET current_streak = 0 WHERE user_id = ? AND challenge_id = ?')
            .run(uc.user_id, uc.challenge_id);
          resetsCount++;
          this.writeLog('ERROR', `RESET: @${user.username} failed check-in for "${challenge.title}" outside boundary. Streak has been reset from ${oldStreak} to 0 ❄️.`);
        }
      }
    });

    const msg = `Streak reset sequence terminated. Evaluated active pledging tables. Total users penalized: ${resetsCount}.`;
    this.writeLog('SUCCESS', msg);
    return {
      resetsCount,
      message: msg
    };
  }

  // Reset Sandbox Data to raw pristine state
  public resetSandboxToFactoryDefaults() {
    this.db.prepare('DELETE FROM verifications').run();
    this.db.prepare('DELETE FROM check_ins').run();
    this.db.prepare('DELETE FROM user_challenges').run();
    this.db.prepare('DELETE FROM challenges').run();
    this.db.prepare('DELETE FROM users').run();
    this.db.prepare('DELETE FROM logs').run();

    this.seedDatabase(defaultSchema);

    this.db.prepare(`
      INSERT INTO logs (id, timestamp, type, message)
      VALUES (?, ?, 'SUCCESS', 'Sandbox state restored to system design seed defaults (Yannick, Ryan, Nathanaël).')
    `).run(`log-${Date.now()}`, new Date().toISOString());

    return this.getData();
  }

  // Helper inside database
  private getUsername(userId: string): string {
    const u = this.db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as { username: string } | undefined;
    return u ? u.username : 'anonymous';
  }
}

export const dbEngine = new DatabaseEngine();
