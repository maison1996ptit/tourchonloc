# Travel Agency App (Public & Admin)

A comprehensive travel agency management system built with Next.js (App Router), TypeScript, and Vanilla CSS.

## Features

### 1. Public Web App
- **Home Page**: Featured tours, site highlights, and dynamic content from site settings.
- **Dynamic Theme**: Supports multiple presets (Luxury Emerald, Ocean Blue, etc.) and custom color schemes.
- **Mobile First**: Fully responsive design.

### 2. Admin App (CMS)
- **Authentication**: Mock login with Admin/Editor roles.
- **Dashboard**: Overview of tours, blogs, leads, and recent activities.
- **Tour Management**: Full CRUD for tours with status management (Draft, Published, Archived).
- **Theme Management**: Live preview and customization of website colors, fonts, and styles.
- **Site Settings**: Manage website text (headlines, contact info, social links) without touching code.
- **Leads Management**: View and update customer inquiries.
- **Role-based Access**: Admin has full access, Editor is restricted to content.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).
- Public App: `/`
- Admin App: `/admin/dashboard`
- Admin Login: `/admin/login`

### Admin Credentials
- **Admin**: `ngocha@gmail.com` / `29022000@`

## Project Structure

- `src/app/(public)`: Routes for the public website.
- `src/app/admin`: Routes for the admin management system.
- `src/components`: Shared, Public, and Admin UI components.
- `src/data`: Mock data for tours, blogs, leads, etc.
- `src/services`: Service layer for data access (mocked, ready for API integration).
- `src/hooks`: Custom hooks for Auth and Theme management.
- `src/types`: TypeScript interfaces for the entire project.

## Technical Details

- **Next.js 16 (App Router)**
- **TypeScript**
- **Vanilla CSS (CSS Modules)**
- **Theme Context**: Uses CSS Variables for real-time theme updates.
- **Mock Service Layer**: Designed to be easily swapped with real REST or GraphQL APIs.

## How to...

### Add a new Tour
1. Log in as Admin or Editor.
2. Go to **Tours** section.
3. Click **Create New Tour** (Note: Create form is a placeholder, list and delete are functional).

### Change Website Theme
1. Log in as Admin.
2. Go to **Theme** section.
3. Select a preset or customize colors/fonts.
4. Click **Save Changes**. The Public app will immediately reflect these changes.

### Change Website Text
1. Log in as Admin.
2. Go to **Site Settings**.
3. Update the Website Name, Headline, or Contact info.
4. Click **Save Settings**.

## Integrating a Real Backend
To integrate a real backend, simply update the files in `src/services/*.ts` to call your API instead of using the mock data. The rest of the app will remain unchanged.
