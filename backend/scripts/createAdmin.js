/**
 * scripts/createAdmin.js
 *
 * One-off CLI utility to provision an admin account.
 *
 * Run manually:
 *   npm run create-admin
 *
 * Design decisions:
 *  - Never runs automatically. Not reachable over HTTP. There is no
 *    public registration endpoint anywhere in the application.
 *  - Credentials come from environment variables (ADMIN_NAME, ADMIN_EMAIL,
 *    ADMIN_PASSWORD) or, when absent, from an interactive prompt with the
 *    password hidden from the terminal.
 *  - Nothing is hard-coded. There is no default email and no default
 *    password, so no fake/known account can ever be seeded by accident.
 *  - The password is hashed with bcryptjs before it touches the database.
 *  - Existing emails are detected; duplicates are never created.
 *  - The password is never logged, echoed, or included in output.
 *
 * Usage:
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js --reset-password   (update an existing admin)
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Load backend/.env regardless of the directory the script is invoked from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = await import('../config/db.js');
const { default: Admin } = await import('../models/Admin.js');
const { hashPassword, isBcryptHash, PASSWORD_MIN_LENGTH } = await import(
  '../services/authService.js'
);

const RESET_PASSWORD = process.argv.includes('--reset-password');

// ── Interactive prompt helpers ────────────────────────────────

const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });

/**
 * Prompt without echoing keystrokes, so the password never appears
 * in the terminal or in shell scrollback.
 */
const askHidden = (question) =>
  new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error(
          'No TTY available for a hidden password prompt. Set ADMIN_PASSWORD in backend/.env instead.'
        )
      );
      return;
    }

    process.stdout.write(question);

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let value = '';

    const cleanup = () => {
      stdin.setRawMode(wasRaw);
      stdin.pause();
      stdin.removeListener('data', onData);
    };

    const onData = (char) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          process.stdout.write('\n');
          cleanup();
          resolve(value);
          break;
        case '\u0003': // Ctrl-C
          process.stdout.write('\n');
          cleanup();
          reject(new Error('Cancelled by user.'));
          break;
        case '\u007f': // Backspace
        case '\b':
          value = value.slice(0, -1);
          break;
        default:
          // Ignore other control characters
          if (char >= ' ') value += char;
          break;
      }
    };

    stdin.on('data', onData);
  });

// ── Validation ────────────────────────────────────────────────

const EMAIL_PATTERN = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

// Refuse well-known throwaway/demo credentials so a predictable account
// can never end up in the database.
const FORBIDDEN_EMAILS = new Set([
  'admin@example.com',
  'test@example.com',
  'user@example.com',
]);

const FORBIDDEN_PASSWORDS = new Set([
  'admin123',
  'password',
  'password123',
  '12345678',
  '123456789',
  'changeme',
  'admin1234',
  'qwerty123',
]);

const resolveValue = async (envValue, prompt, { hidden = false } = {}) => {
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return hidden ? envValue : envValue.trim();
  }
  return hidden ? askHidden(prompt) : (await ask(prompt)).trim();
};

// ── Main ──────────────────────────────────────────────────────

const run = async () => {
  await connectDB();

  const name = await resolveValue(process.env.ADMIN_NAME, 'Admin name: ');
  const emailInput = await resolveValue(process.env.ADMIN_EMAIL, 'Admin email: ');
  const email = emailInput.toLowerCase();

  if (!name || name.length < 2) {
    throw new Error('Admin name must be at least 2 characters long.');
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('A valid admin email address is required.');
  }

  if (FORBIDDEN_EMAILS.has(email)) {
    throw new Error(
      `Refusing to create a well-known placeholder account (${email}). Use a real address.`
    );
  }

  const existing = await Admin.findOne({ email }).select('+password');

  if (existing && !RESET_PASSWORD) {
    console.log(`\nAn admin with this email already exists (id: ${existing._id}).`);
    console.log('No duplicate was created.');
    console.log('To change its password, re-run with: node scripts/createAdmin.js --reset-password');
    return;
  }

  const password = await resolveValue(
    process.env.ADMIN_PASSWORD,
    existing ? 'New admin password (hidden): ' : 'Admin password (hidden): ',
    { hidden: true }
  );

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
  }

  if (FORBIDDEN_PASSWORDS.has(password.toLowerCase())) {
    throw new Error('Refusing to use a commonly-guessed password. Choose a stronger one.');
  }

  // Hash before persisting — plaintext never reaches MongoDB
  const hashed = await hashPassword(password);

  if (!isBcryptHash(hashed)) {
    throw new Error('Password hashing failed sanity check. Aborting.');
  }

  if (existing) {
    existing.password = hashed;
    existing.name = name;
    await existing.save();
    console.log(`\nPassword updated for admin: ${existing.email} (id: ${existing._id})`);
  } else {
    const admin = await Admin.create({
      name,
      email,
      password: hashed,
      role: 'admin',
      isActive: true,
    });
    console.log(`\nAdmin created successfully.`);
    console.log(`  id:    ${admin._id}`);
    console.log(`  name:  ${admin.name}`);
    console.log(`  email: ${admin.email}`);
    console.log(`  role:  ${admin.role}`);
  }

  console.log('\nStored credential is a bcrypt hash. The password was not logged.');
  console.log('Remove ADMIN_PASSWORD from backend/.env now if you set it there.');
};

run()
  .catch((error) => {
    // Only the message — never the password, hash, or connection string
    console.error(`\ncreateAdmin failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
    process.exit(process.exitCode ?? 0);
  });
