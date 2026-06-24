import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbEngine } from './src/backendDb';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body Parsing Middlewares
  app.use(express.json());

  // Log in-coming API requests
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') && req.path !== '/api/system/logs') {
      dbEngine.writeLog('API', `↳ Received request: ${req.method} ${req.path}`);
    }
    next();
  });

  // ====== RESTful API GATEWAY ======

  // 6.1 Authentication - Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: 'Username, email and password are required' });
      }

      const user = dbEngine.registerUser(username, email, password); // Using password as plain mock bcrypt
      
      // Return 201 Created as per API spec
      return res.status(201).json({
        success: true,
        token: `mock-jwt-token-for-${user.id}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          total_xp: user.total_xp
        }
      });
    } catch (error: any) {
      dbEngine.writeLog('ERROR', `Registration failure: ${error.message}`);
      return res.status(400).json({ success: false, error: error.message });
    }
  });

  // Auth - Login / Switch Accounts
  app.post('/api/auth/login', (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ success: false, error: 'Credentials are required' });
      }

      const user = dbEngine.loginUser(usernameOrEmail, password);
      return res.status(200).json({
        success: true,
        token: `mock-jwt-token-for-${user.id}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          total_xp: user.total_xp
        }
      });
    } catch (error: any) {
      dbEngine.writeLog('ERROR', `Authentication failure: ${error.message}`);
      return res.status(401).json({ success: false, error: error.message });
    }
  });

  // 6.2 Challenge Creation
  app.post('/api/challenges', (req, res) => {
    try {
      // For standard simplified dev routing we grab requester ID from custom custom headers or body
      // In production JWT authorization parses `Bearer <token>` config
      const authHeader = req.headers.authorization || '';
      let requesterId = req.body.creator_id;

      if (authHeader.startsWith('Bearer mock-jwt-token-for-')) {
        requesterId = authHeader.replace('Bearer mock-jwt-token-for-', '');
      }

      if (!requesterId) {
        return res.status(401).json({ success: false, error: 'Missing requester authorization credentials' });
      }

      const { title, description, duration_days, frequency, start_date } = req.body;
      if (!title || !duration_days || !frequency) {
        return res.status(400).json({ success: false, error: 'Missing required challenge parameters' });
      }

      const challenge = dbEngine.createChallenge(
        requesterId,
        title,
        description || '',
        Number(duration_days),
        frequency,
        start_date
      );

      // Return 201 Created as per spec
      return res.status(201).json({
        success: true,
        challenge_id: challenge.id,
        status: 'ACTIVE'
      });
    } catch (error: any) {
      dbEngine.writeLog('ERROR', `Failed to initialize challenge frame: ${error.message}`);
      return res.status(400).json({ success: false, error: error.message });
    }
  });

  // Join challenge auxiliary endpoint
  app.post('/api/challenges/:challenge_id/join', (req, res) => {
    try {
      const { challenge_id } = req.params;
      const authHeader = req.headers.authorization || '';
      let userId = req.body.user_id;

      if (authHeader.startsWith('Bearer mock-jwt-token-for-')) {
        userId = authHeader.replace('Bearer mock-jwt-token-for-', '');
      }

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized payload' });
      }

      const membership = dbEngine.joinChallenge(userId, challenge_id);
      return res.status(200).json({ success: true, membership });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  });

  // Get challenges listing with join metrics
  app.get('/api/challenges', (req, res) => {
    try {
      const db = dbEngine.getData();
      const payload = db.challenges.map(ch => {
        const creator = db.users.find(u => u.id === ch.creator_id);
        const enrolment = db.user_challenges.filter(uc => uc.challenge_id === ch.id);
        return {
          ...ch,
          creator_username: creator ? creator.username : 'unknown',
          participants_count: enrolment.length
        };
      });
      return res.json(payload);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // 6.3 Submission of Daily Proof
  app.post('/api/challenges/:challenge_id/checkin', (req, res) => {
    try {
      const { challenge_id } = req.params;
      const authHeader = req.headers.authorization || '';
      let userId = req.body.user_id;

      if (authHeader.startsWith('Bearer mock-jwt-token-for-')) {
        userId = authHeader.replace('Bearer mock-jwt-token-for-', '');
      }

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized check-in payload' });
      }

      const { media_url, text_proof, timezone_offset } = req.body;
      if (!media_url) {
        return res.status(400).json({ success: false, error: 'Physical check-in proof media is core requirement' });
      }

      const checkIn = dbEngine.submitCheckIn(
        userId,
        challenge_id,
        media_url,
        text_proof || '',
        timezone_offset !== undefined ? Number(timezone_offset) : -240
      );

      return res.status(200).json({
        success: true,
        check_in_id: checkIn.id,
        status: checkIn.status
      });
    } catch (error: any) {
      dbEngine.writeLog('ERROR', `Check-in rejected: ${error.message}`);
      return res.status(400).json({ success: false, error: error.message });
    }
  });

  // 6.4 Record Peer Verification Vote
  app.post('/api/checkins/:check_in_id/verify', (req, res) => {
    try {
      const { check_in_id } = req.params;
      const authHeader = req.headers.authorization || '';
      let verifierId = req.body.verifier_id;

      if (authHeader.startsWith('Bearer mock-jwt-token-for-')) {
        verifierId = authHeader.replace('Bearer mock-jwt-token-for-', '');
      }

      if (!verifierId) {
        return res.status(401).json({ success: false, error: 'Verification credentials unknown. Sign-in required.' });
      }

      const { vote } = req.body;
      if (!vote || (vote !== 'APPROVE' && vote !== 'DISPUTED')) {
        return res.status(400).json({ success: false, error: 'Valid vote ENUM check failed: APPROVE or DISPUTED required' });
      }

      const resolution = dbEngine.verifyCheckIn(check_in_id, verifierId, vote);
      return res.status(200).json(resolution);
    } catch (error: any) {
      dbEngine.writeLog('ERROR', `Verification cast rejected: ${error.message}`);
      return res.status(400).json({ success: false, error: error.message });
    }
  });

  // Social Feed aggregation
  app.get('/api/feed', (req, res) => {
    try {
      const db = dbEngine.getData();
      const response = db.check_ins.map(chk => {
        const user = db.users.find(u => u.id === chk.user_id);
        const challenge = db.challenges.find(c => c.id === chk.challenge_id);
        const vots = db.verifications.filter(v => v.check_in_id === chk.id).map(v => {
          const voter = db.users.find(u => u.id === v.verifier_id);
          return {
            ...v,
            verifier_username: voter ? voter.username : 'peer'
          };
        });

        return {
          ...chk,
          username: user ? user.username : 'anonymous',
          challenge_title: challenge ? challenge.title : 'Deleted Challenge',
          votes: vots
        };
      });
      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Leaderboards sorted ranking
  app.get('/api/leaderboard', (req, res) => {
    try {
      const db = dbEngine.getData();
      
      const leaderboard = db.users.map(u => {
        // Compute active and max streaks from joined tables
        const participations = db.user_challenges.filter(uc => uc.user_id === u.id);
        const activeStreakMergedSum = Math.max(...participations.map(p => p.current_streak), 0);
        const maxStreakSum = Math.max(...participations.map(p => p.max_streak), 0);

        return {
          id: u.id,
          username: u.username,
          total_xp: u.total_xp,
          active_streak: activeStreakMergedSum,
          max_streak: maxStreakSum,
          joined_challenges: participations.length
        };
      }).sort((a, b) => b.total_xp - a.total_xp); // Primary score index sorting

      return res.json(leaderboard);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Retrieve enrollment status of a specific user
  app.get('/api/users/:user_id/challenges', (req, res) => {
    try {
      const { user_id } = req.params;
      const db = dbEngine.getData();
      const enrollments = db.user_challenges
        .filter(uc => uc.user_id === user_id)
        .map(uc => {
          const challenge = db.challenges.find(c => c.id === uc.challenge_id);
          return {
            ...uc,
            challenge_title: challenge ? challenge.title : 'Deleted Challenge',
            challenge_duration: challenge ? challenge.duration_days : 0,
            challenge_frequency: challenge ? challenge.frequency : 'DAILY'
          };
        });
      return res.json(enrollments);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // ====== SYSTEM & SANDBOX SIMULATION SYSTEM ======

  // Sequence B Clock Simulator for Midnight reset
  app.post('/api/system/reset-engine', (req, res) => {
    try {
      const result = dbEngine.runStreakValidationEngine();
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Factory reset Sandbox state
  app.post('/api/system/reset-sandbox', (req, res) => {
    try {
      dbEngine.resetSandboxToFactoryDefaults();
      return res.json({ success: true, message: 'Database reset to default seed characters.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Retrieve raw logs
  app.get('/api/system/logs', (req, res) => {
    return res.json(dbEngine.getData().logs);
  });

  // Clear server logs
  app.post('/api/system/clear-logs', (req, res) => {
    dbEngine.clearLogs();
    return res.json({ success: true });
  });

  // Expose total schema values for sandbox explorer
  app.get('/api/system/state', (req, res) => {
    return res.json(dbEngine.getData());
  });


  // ====== VITE CLIENT PACK INTERFACE ======

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BETZ Engine] Full-stack hub established. Ingress live on port http://localhost:${PORT}`);
  });
}

// Kickstart server framework
startServer();
