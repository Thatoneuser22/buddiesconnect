# ChatterBox - Real-time Chat Application

## Overview
ChatterBox is a Discord-like real-time chat application where users can communicate with friends through channels and direct messages. Built with React, Express, and WebSockets for instant message delivery.

## Project Structure

### Frontend (`client/src/`)
- `App.tsx` - Main application with routing and providers
- `pages/login.tsx` - Login page with username entry
- `pages/chat.tsx` - Main chat layout with sidebar, message feed, and member list
- `components/` - Reusable UI components
  - `ChannelSidebar.tsx` - Channel and DM navigation
  - `MessageFeed.tsx` - Message display with grouping
  - `MessageInput.tsx` - Message composition
  - `MemberList.tsx` - Online/offline member list
  - `FriendsPanel.tsx` - Friend management with requests
  - `ChatHeader.tsx` - Channel header with search
  - `UserAvatar.tsx` - Avatar with status indicator
  - `ThemeToggle.tsx` - Dark/light mode toggle
- `lib/chatContext.tsx` - Global chat state management
- `lib/queryClient.ts` - API request utilities

### Backend (`server/`)
- `routes.ts` - API endpoints and WebSocket server
- `storage.ts` - In-memory data storage

### Shared (`shared/`)
- `schema.ts` - TypeScript types and Zod schemas

## Features
- Real-time messaging via WebSockets
- Multiple text channels
- Direct messaging between friends
- Friend system with requests
- Online/offline status indicators
- Typing indicators
- Message grouping for consecutive messages
- Dark/light theme support
- Responsive design

## API Endpoints

### Users
- `POST /api/users` - Create/login user

### Channels
- `GET /api/channels` - List all channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/:id/messages` - Get channel messages

### Friends
- `GET /api/friends` - List friends
- `GET /api/friends/requests` - Get pending requests
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept request
- `POST /api/friends/decline/:id` - Decline request

### Direct Messages
- `GET /api/dm/:userId/messages` - Get DM history

## WebSocket Events
- `auth` - Authenticate user connection
- `message` - Send/receive channel message
- `dm_message` - Send/receive direct message
- `typing_start/stop` - Typing indicators
- `user_status` - Online status updates
- `friend_request/accepted` - Friend system events

## Running the Application
The app runs on port 5000 with the `npm run dev` command.
