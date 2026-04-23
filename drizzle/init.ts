import { db, sqlite } from './db';
import {
  applications,
  applicationStatusLogs,
  categories,
  targets,
  users,
} from './schema';

export async function initDb() {
  try {
    sqlite.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        date_applied TEXT NOT NULL,
        priority_score INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS application_status_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        status_date TEXT NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        period_type TEXT NOT NULL,
        target_count INTEGER NOT NULL,
        category_id INTEGER,
        start_date TEXT NOT NULL
      );
    `);

    const existingUsers = await db.select().from(users);

    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    await db.insert(users).values({
      username: 'ben',
      password: 'password123',
      createdAt: new Date().toISOString(),
    });

    await db.insert(categories).values([
      {
        userId: 1,
        name: 'Software',
        color: '#3b82f6',
      },
      {
        userId: 1,
        name: 'Finance',
        color: '#10b981',
      },
    ]);

    await db.insert(applications).values([
      {
        userId: 1,
        company: 'Google',
        role: 'Software Engineer',
        dateApplied: new Date().toISOString(),
        priorityScore: 5,
        categoryId: 1,
        notes: 'Strong role',
        createdAt: new Date().toISOString(),
      },
      {
        userId: 1,
        company: 'Deloitte',
        role: 'Consulting Analyst',
        dateApplied: new Date().toISOString(),
        priorityScore: 3,
        categoryId: 2,
        notes: '',
        createdAt: new Date().toISOString(),
      },
    ]);

    await db.insert(applicationStatusLogs).values([
      {
        applicationId: 1,
        status: 'Applied',
        statusDate: new Date().toISOString(),
        notes: 'Application submitted',
      },
      {
        applicationId: 2,
        status: 'Applied',
        statusDate: new Date().toISOString(),
        notes: 'Application submitted',
      },
    ]);

await db.insert(targets).values([
  {
    userId: 1,
    periodType: 'weekly',
    targetCount: 5,
    startDate: new Date().toISOString(),
  },
  {
    userId: 1,
    periodType: 'monthly',
    targetCount: 20,
    startDate: new Date().toISOString(),
  },
]);

    console.log('Database seeded successfully');
  } catch (error) {
    console.log('Error seeding database:', error);
  }
}