import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './database';
import { initSchema } from './schema';

/**
 * Seeds initial categories and a default admin account.
 * Run with: npm run seed
 */
export function seed(): void {
  initSchema();
  const conn = db.getConnection();

  const categories: [string, string][] = [
    ['Electronics', 'Phones, laptops, chargers, headphones'],
    ['Documents', 'ID cards, passports, certificates'],
    ['Accessories', 'Wallets, watches, jewelry, bags'],
    ['Keys', 'House, car, office keys'],
    ['Clothing', 'Jackets, shoes, hats, scarves'],
    ['Books', 'Textbooks, notebooks, novels'],
    ['Other', 'Anything not covered above']
  ];

  const insertCat = conn.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
  for (const [name, desc] of categories) insertCat.run(name, desc);

  const adminEmail = 'admin@lostfound.local';
  const existing = conn.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', Number(process.env.BCRYPT_ROUNDS || 10));
    conn.prepare(
      `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'admin')`
    ).run('Administrator', adminEmail, hash, '0000000000');
    console.log(`Admin seeded → ${adminEmail} / admin123`);
  }

  console.log('Seed complete.');
}

if (require.main === module) {
  seed();
  process.exit(0);
}
