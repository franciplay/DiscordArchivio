# Discord Bot Dashboard Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Discord's official design language and modern dashboard applications like Linear and Notion, emphasizing dark themes, clean typography, and intuitive data organization.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary (Discord-inspired)**
- Background: 220 13% 18% (Dark slate)
- Surface: 220 13% 22% (Slightly lighter slate)
- Primary: 235 86% 65% (Discord blurple)
- Success: 139 47% 47% (Muted green)
- Warning: 38 92% 50% (Amber)
- Text Primary: 210 20% 98% (Near white)
- Text Secondary: 215 20% 65% (Muted gray)

### B. Typography
**Primary Font**: Inter (Google Fonts)
- Headers: 600-700 weight, 24-32px
- Body: 400-500 weight, 14-16px
- Code/Data: JetBrains Mono, 400 weight, 14px

### C. Layout System
**Tailwind Spacing**: Consistent use of units 2, 4, 6, and 8
- Component padding: p-4, p-6
- Margins: m-2, m-4, m-8
- Grid gaps: gap-4, gap-6

### D. Component Library

**Navigation**
- Sidebar navigation with Discord-style server list aesthetic
- Command shortcuts prominently displayed
- Active states with subtle left border accent

**Data Displays**
- Card-based information layout with rounded corners
- Subtle shadows and borders for depth
- Expandable/collapsible information sections
- Search and filter capabilities for stored reports

**Forms**
- Discord-style input fields with subtle focus states
- Slash command preview/simulator
- Real-time validation feedback

**Bot Status**
- Connection status indicator (online/offline)
- Server count and activity metrics
- Command usage statistics in clean, minimal cards

### E. Key Sections

**Dashboard Overview**
- Bot status and basic metrics
- Recent activity feed
- Quick access to common commands

**Reports Management**
- Searchable list of all stored person records
- Expandable cards showing all facts per person
- Bulk actions and moderation tools

**Command Center**
- Slash command testing interface
- Command usage analytics
- Configuration settings

**Visual Treatment**
- Subtle gradients from primary color (235 86% 65%) to darker variants
- Minimal use of accent colors - rely on primary palette
- Clean, data-focused design with generous whitespace
- Discord-inspired iconography and visual language

This design emphasizes functionality while maintaining visual consistency with Discord's familiar interface patterns, ensuring bot administrators feel comfortable and efficient when managing stored information.