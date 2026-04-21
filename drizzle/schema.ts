import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
});

export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  dateApplied: text('date_applied').notNull(),
  priorityScore: integer('priority_score').notNull(),
  categoryId: integer('category_id').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const applicationStatusLogs = sqliteTable('application_status_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull(),
  status: text('status').notNull(),
  statusDate: text('status_date').notNull(),
  notes: text('notes'),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  periodType: text('period_type').notNull(),
  targetCount: integer('target_count').notNull(),
  categoryId: integer('category_id'),
  startDate: text('start_date').notNull(),
});