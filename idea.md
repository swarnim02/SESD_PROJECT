# Project Idea: Lost and Found Management System with Reward Feature

## What We're Building
A web application where users can report lost items, post found items, and submit claims to recover belongings. Includes optional reward system to motivate finders.

## Scope
- User authentication (register/login)
- Report lost items with details
- Post found items
- Submit and manage claims
- Optional reward declaration
- Admin moderation panel
- Search and filter items

## Key Features
1. **User Authentication** - Secure login with JWT
2. **Lost Item Reporting** - Users report lost items with description, location, date, optional reward
3. **Found Item Posting** - Finders post items they found
4. **Claim Workflow** - Users submit claims → Owner reviews → Accept/Reject → Status updates
5. **Reward System** - Optional reward tracking (not_declared → pending → completed)
6. **Search & Filter** - Search by keyword, category, location, date, status
7. **Admin Panel** - View all items/users, delete posts, suspend users, resolve disputes
8. **Status Tracking** - Item lifecycle: lost → claimed → returned → closed

## Technology Stack
- **Backend:** Node.js + Express.js
- **Frontend:** React
- **Database:** MySQL/PostgreSQL
- **Auth:** JWT + Bcrypt

## Problem Solved
In colleges/offices, lost items are hard to recover due to poor visibility, miscommunication, and no tracking. This system provides centralized platform with verification workflows.
