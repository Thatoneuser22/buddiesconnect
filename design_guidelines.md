# Design Guidelines: Real-Time Chat Application

## Design Approach
**Reference-Based**: Drawing inspiration from Discord's proven interface patterns while creating a unique implementation. Discord's three-panel layout (server/channel sidebar, chat area, members list) is the gold standard for group chat applications.

## Core Layout Architecture

### Three-Panel Structure
- **Left Sidebar (280px)**: Channel/server navigation with friend list
- **Main Chat Area (flex-1)**: Message feed with input at bottom
- **Right Sidebar (240px, collapsible)**: Member list with online status

### Spacing System
Use Tailwind units: **2, 3, 4, 6, 8** for consistent rhythm
- Component padding: `p-4`
- Section spacing: `gap-6` or `gap-8`
- Message spacing: `space-y-2`
- Input areas: `p-3`

## Typography Hierarchy

**Font Stack**: Inter (primary), system-ui fallback via Google Fonts CDN

- **Channel names**: `text-sm font-semibold`
- **Usernames in chat**: `text-sm font-medium`
- **Message text**: `text-sm leading-relaxed`
- **Timestamps**: `text-xs opacity-60`
- **Section headers**: `text-xs font-semibold uppercase tracking-wide`
- **Input text**: `text-base`

## Component Library

### Navigation Sidebar
- Channel list with `hover:bg-opacity-10` states
- Active channel: subtle left border (4px) + background
- Nested channel categories with expand/collapse
- Icons from **Heroicons** (via CDN): hash for text channels, volume for voice
- User profile bar at bottom with status indicator dot

### Message Components
- **Message Block**: Avatar (32px rounded-full) + content in horizontal flex
- **Message Header**: Username + timestamp in same line
- **Message Grouping**: Consecutive messages from same user within 5min merge (avatar hidden, reduced spacing)
- **System Messages**: Centered, italicized, reduced opacity

### Chat Input Area
- Rounded container (`rounded-lg`) with inner shadow
- Emoji picker button (left)
- Send button (right, only enabled when text present)
- File attachment button
- Height: `h-12` minimum, grows with content (`max-h-32`)

### Member List
- Section headers: "ONLINE — 5" and "OFFLINE — 3"
- Member items: Avatar (24px) + username + status dot
- Role badges below names when applicable
- Compact spacing: `py-1.5`

### Friend List & DMs
- Tab switching between "All Friends" and "Pending"
- Friend cards with Accept/Decline for pending
- DM list with unread badges (red dot or count)
- Last message preview in lighter text

### Modals & Overlays
- User profile modal: Larger avatar, bio, join date, mutual servers
- Create channel modal: Form with channel type selection (radio buttons)
- Settings panel: Slide-in from right (400px wide)

## Interaction Patterns

### Real-Time Indicators
- Typing indicator: "User is typing..." with animated ellipsis below last message
- Online status dots: 8px circle, positioned absolute on avatar bottom-right
- Unread indicators: Bold channel name + red badge with count

### Message Features
- Hover reveals timestamp + action buttons (reply, react, more)
- Right-click context menu for delete/edit
- @mentions highlighted with background
- Code blocks with monospace font + subtle background

### Responsive Behavior
- **Mobile (<768px)**: Single panel view, hamburger menu for sidebar
- **Tablet (768px-1024px)**: Two panels, members list hidden by default
- **Desktop (>1024px)**: Full three-panel layout

## Accessibility
- Focus indicators on all interactive elements (ring-2)
- Keyboard navigation: Arrow keys for channel switching, Tab for input focus
- Screen reader labels for icon-only buttons
- Sufficient contrast ratios throughout (maintain WCAG AA)
- Skip to main content link

## Animation Philosophy
**Minimal and purposeful only:**
- Sidebar panel transitions: `transition-transform duration-200`
- Message appearance: Subtle fade-in for new messages
- Status changes: Smooth dot color transition
- NO scroll animations, parallax, or decorative motion

## Images
**Profile Avatars**: Users upload custom avatars; default to initials in colored circles (use user ID hash for consistent colors)
**No hero images needed** - this is a utility application focused on function over marketing

## Key Differentiators from Generic Chat
- **Channel categories**: Collapsible sections organizing channels
- **Rich presence**: Detailed status (Online, Away, Do Not Disturb, Invisible)
- **Thread support**: Reply chains that branch from main messages
- **Message reactions**: Emoji reaction bar below messages
- **Voice channel indicators**: Show who's in voice with speaking animations

This design prioritizes **information density, rapid navigation, and real-time clarity** over visual flourishes, ensuring users can communicate efficiently while maintaining Discord's familiar, battle-tested UX patterns.