import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  boolean, 
  text, 
  primaryKey, 
  pgEnum, 
  jsonb,
  inet
} from 'drizzle-orm/pg-core';

//Enum for users table
export const roleEnum = pgEnum('role', ['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']);
export const statusEnum = pgEnum('status', ['active', 'inactive', 'suspended', 'pending']);
export const mfaTypeEnum = pgEnum('mfa_type', ['totp', 'sms', 'email']);

// --- 1. USERS TABLE ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').default('USER').notNull(),
  status: statusEnum('status').default('pending').notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- 2. USER PROFILES (Thông tin bổ sung) ---
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  dob: timestamp('dob'),
});

// --- 3. REFRESH TOKENS (Quản lý Session/Thiết bị) ---
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  deviceId: varchar('device_id', { length: 255 }), // Để quản lý thiết bị cụ thể
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 4. MULTI-FACTOR AUTH (MFA) ---
export const mfaSettings = pgTable('mfa_settings', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  mfaType: mfaTypeEnum('mfa_type').default('totp').notNull(),
  secretKey: text('secret_key').notNull(), // Khóa bí mật đã mã hóa
  backupCodes: jsonb('backup_codes').notNull().default([]), // Mảng các mã dự phòng
  isEnabled: boolean('is_enabled').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- 5. SOCIAL ACCOUNTS (OAuth2) ---
export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'google', 'facebook', 'github'
  providerUserId: varchar('provider_user_id', { length: 255 }).notNull(), // ID từ phía Google/FB
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- 6. PERMISSIONS & ROLE-BASED ACCESS CONTROL (RBAC) ---
// Bảng lưu các quyền cụ thể: 'post:create', 'user:delete', v.v.
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).unique().notNull(), // e.g., 'manage_users'
  description: text('description'),
});

// Bảng trung gian Role - Permission (Một Role có nhiều quyền)
export const rolePermissions = pgTable('role_permissions', {
  role: roleEnum('role').notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.role, t.permissionId] }),
}));

// --- 7. AUDIT LOGS (Nhật ký hoạt động bảo mật) ---
export const authAuditLogs = pgTable('auth_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(), // 'login_success', 'login_failed', 'pwd_change'
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'), // Lưu thêm thông tin như địa điểm, lý do fail
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;