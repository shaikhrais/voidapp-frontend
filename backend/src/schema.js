import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').default('user'),
    organizationId: text('organization_id'),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpires: integer('reset_password_expires'),
    createdAt: integer('created_at').default(Date.now()),
    updatedAt: integer('updated_at').default(Date.now()),
});

export const organizations = sqliteTable('organizations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    credits: real('credits').default(0.0),
    createdAt: integer('created_at').default(Date.now()),
    updatedAt: integer('updated_at').default(Date.now()),
});

export const phoneNumbers = sqliteTable('phone_numbers', {
    id: text('id').primaryKey(),
    sid: text('sid').notNull().unique(),
    phoneNumber: text('phone_number').notNull(),
    friendlyName: text('friendly_name'),
    organizationId: text('organization_id').notNull(),
    createdAt: integer('created_at').default(Date.now()),
    updatedAt: integer('updated_at').default(Date.now()),
});

export const calls = sqliteTable('calls', {
    id: text('id').primaryKey(),
    sid: text('sid').notNull().unique(),
    fromNumber: text('from_number').notNull(),
    toNumber: text('to_number').notNull(),
    status: text('status'),
    direction: text('direction'),
    duration: integer('duration'),
    organizationId: text('organization_id').notNull(),
    createdAt: integer('created_at').default(Date.now()),
    updatedAt: integer('updated_at').default(Date.now()),
});

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    sid: text('sid').notNull().unique(),
    fromNumber: text('from_number').notNull(),
    toNumber: text('to_number').notNull(),
    body: text('body'),
    status: text('status'),
    direction: text('direction'),
    organizationId: text('organization_id').notNull(),
    createdAt: integer('created_at').default(Date.now()),
    updatedAt: integer('updated_at').default(Date.now()),
});

export const apiKeys = sqliteTable('api_keys', {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    name: text('name').notNull(),
    organizationId: text('organization_id').notNull(),
    lastUsedAt: integer('last_used_at'),
    createdAt: integer('created_at').default(Date.now()),
    updatedAt: integer('updated_at').default(Date.now()),
});
