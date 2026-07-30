import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nextbuild-super-secret-access-key-2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "nextbuild-super-secret-refresh-key-2026";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
}

export interface StudentProfileRecord {
  userId: string;
  parsedResumeJson: any | null;
  githubUsername: string | null;
  deletedAt: Date | null;
}

// In-Memory MVP Data Store (Structured for easy Postgres/SQLite migration)
export const db = {
  users: new Map<string, UserRecord>(),
  refreshTokens: new Map<string, RefreshTokenRecord>(),
  studentProfiles: new Map<string, StudentProfileRecord>(),
};

// Seed initial demo user
const demoUserEmail = "student@university.edu";
const demoUserId = "user-demo-123";
const demoHash = bcrypt.hashSync("student123", 10);

db.users.set(demoUserId, {
  id: demoUserId,
  email: demoUserEmail,
  passwordHash: demoHash,
  createdAt: new Date(),
  deletedAt: null,
});

db.studentProfiles.set(demoUserId, {
  userId: demoUserId,
  parsedResumeJson: {
    candidateName: "Alex Chen",
    degree: "B.S. Computer Science",
    topSkills: ["Python", "FastAPI", "React", "TypeScript", "Docker", "PostgreSQL"],
  },
  githubUsername: "alexdev-builds",
  deletedAt: null,
});

// Helper: Hash refresh token for storage
function hashToken(token: string): string {
  return bcrypt.hashSync(token, 4);
}

// 1. Register User with password rules (8+ length)
export async function registerUser(email: string, password: string) {
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address.");
  }
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  // Check existing active user
  for (const u of db.users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt) {
      throw new Error("An account with this email already exists.");
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const user: UserRecord = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date(),
    deletedAt: null,
  };

  db.users.set(userId, user);
  db.studentProfiles.set(userId, {
    userId,
    parsedResumeJson: null,
    githubUsername: null,
    deletedAt: null,
  });

  return issueTokenPair(userId, email);
}

// 2. Login User
export async function loginUser(email: string, password: string) {
  let matchedUser: UserRecord | null = null;
  for (const u of db.users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    throw new Error("Invalid email or password.");
  }

  const isValidPassword = await bcrypt.compare(password, matchedUser.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password.");
  }

  return issueTokenPair(matchedUser.id, matchedUser.email);
}

// Helper: Issue short-lived access token + long-lived refresh token
function issueTokenPair(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email, type: "access" },
    JWT_SECRET,
    { expiresIn: "30m" } // 30 minute expiry
  );

  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: "14d" } // 14 day expiry
  );

  const tokenId = `rt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  db.refreshTokens.set(tokenId, {
    id: tokenId,
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    revoked: false,
  });

  return {
    accessToken,
    refreshToken,
    user: { id: userId, email },
  };
}

// 3. Refresh Access Token
export async function refreshAccessToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; type: string };
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type.");
    }

    const user = db.users.get(decoded.userId);
    if (!user || user.deletedAt) {
      throw new Error("User account not found or deleted.");
    }

    // Check if token exists in store and isn't revoked
    let validTokenFound = false;
    for (const record of db.refreshTokens.values()) {
      if (record.userId === decoded.userId && !record.revoked && record.expiresAt > new Date()) {
        validTokenFound = true;
        break;
      }
    }

    if (!validTokenFound) {
      throw new Error("Refresh token has been revoked or expired.");
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, type: "access" },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    return { accessToken: newAccessToken };
  } catch (err: any) {
    throw new Error(`Token refresh failed: ${err.message}`);
  }
}

// 4. Logout User (Revoke refresh tokens)
export async function logoutUser(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    for (const [id, record] of db.refreshTokens.entries()) {
      if (record.userId === decoded.userId) {
        db.refreshTokens.set(id, { ...record, revoked: true });
      }
    }
    return { success: true, message: "Logged out successfully." };
  } catch (err) {
    // Silent success on logout even if token expired
    return { success: true, message: "Logged out successfully." };
  }
}

// 5. Account Deletion (Soft Delete & Cascade PII Purge)
export async function deleteUserProfile(userId: string) {
  const user = db.users.get(userId);
  if (!user || user.deletedAt) {
    throw new Error("User profile not found or already deleted.");
  }

  const now = new Date();

  // Soft-delete user
  db.users.set(userId, {
    ...user,
    deletedAt: now,
  });

  // Cascade soft-delete & purge personal profile data (resume JSON & GitHub username)
  const profile = db.studentProfiles.get(userId);
  if (profile) {
    db.studentProfiles.set(userId, {
      userId,
      parsedResumeJson: null,
      githubUsername: null,
      deletedAt: now,
    });
  }

  // Revoke all refresh tokens
  for (const [id, record] of db.refreshTokens.entries()) {
    if (record.userId === userId) {
      db.refreshTokens.set(id, { ...record, revoked: true });
    }
  }

  return {
    success: true,
    message: "User account and all associated personal data have been permanently removed.",
  };
}

// Middleware: Verify Access Token
export function verifyAccessTokenMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing access token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = db.users.get(decoded.userId);
    if (!user || user.deletedAt) {
      return res.status(401).json({ error: "Unauthorized: User account suspended or deleted." });
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired access token." });
  }
}

// Middleware: Optional Access Token (Allows guest access while populating req.user if token exists)
export function optionalAuthMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = db.users.get(decoded.userId);
    if (user && !user.deletedAt) {
      req.user = decoded;
    } else {
      req.user = null;
    }
  } catch (err: any) {
    req.user = null;
  }
  next();
}
