import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { config } from "./config.mjs";

mkdirSync(dirname(config.databasePath), { recursive: true });

export const db = new DatabaseSync(config.databasePath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  );
`);

export function createContactMessage({ name, email, phone, message }) {
  const statement = db.prepare(`
    INSERT INTO contact_messages (name, email, phone, message)
    VALUES (?, ?, ?, ?)
  `);
  const result = statement.run(name, email, phone || "", message);
  return Number(result.lastInsertRowid);
}

export function listContactMessages() {
  return db
    .prepare(`
      SELECT id, name, email, phone, message, created_at AS createdAt, status
      FROM contact_messages
      ORDER BY datetime(created_at) DESC, id DESC
    `)
    .all();
}

export function updateContactMessageStatus(id, status) {
  const result = db
    .prepare(`
      UPDATE contact_messages
      SET status = ?
      WHERE id = ?
    `)
    .run(status, id);

  return result.changes > 0;
}

export function deleteContactMessage(id) {
  const result = db
    .prepare(`
      DELETE FROM contact_messages
      WHERE id = ?
    `)
    .run(id);

  return result.changes > 0;
}

export function findAdminByIdentifier(identifier) {
  return db
    .prepare(`
      SELECT id, email, username, password_hash AS passwordHash, created_at AS createdAt
      FROM admin_users
      WHERE lower(email) = lower(?)
         OR lower(COALESCE(username, '')) = lower(?)
      LIMIT 1
    `)
    .get(identifier, identifier);
}

export function findAdminById(id) {
  return db
    .prepare(`
      SELECT id, email, username, created_at AS createdAt
      FROM admin_users
      WHERE id = ?
      LIMIT 1
    `)
    .get(id);
}

export function createAdminUser({ email, username, passwordHash }) {
  const result = db
    .prepare(`
      INSERT INTO admin_users (email, username, password_hash)
      VALUES (?, ?, ?)
    `)
    .run(email, username || null, passwordHash);

  return Number(result.lastInsertRowid);
}

export function createAdminSession({ userId, tokenHash, expiresAt }) {
  db.prepare(`
    INSERT INTO admin_sessions (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `).run(userId, tokenHash, expiresAt);
}

export function findAdminSession(tokenHash) {
  return db
    .prepare(`
      SELECT
        admin_sessions.id,
        admin_sessions.user_id AS userId,
        admin_sessions.expires_at AS expiresAt,
        admin_users.email,
        admin_users.username
      FROM admin_sessions
      JOIN admin_users ON admin_users.id = admin_sessions.user_id
      WHERE admin_sessions.token_hash = ?
      LIMIT 1
    `)
    .get(tokenHash);
}

export function deleteAdminSession(tokenHash) {
  db.prepare(`
    DELETE FROM admin_sessions
    WHERE token_hash = ?
  `).run(tokenHash);
}

export function deleteExpiredAdminSessions() {
  db.prepare(`
    DELETE FROM admin_sessions
    WHERE datetime(expires_at) <= datetime('now')
  `).run();
}
