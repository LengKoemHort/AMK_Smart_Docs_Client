# Frontend Application Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Routing System](#routing-system)
- [Getting Started](#getting-started)
- [Reusable Components](#reusable-components)
- [Core Features](#core-features)
- [Code Architecture](#code-architecture)
- [Common Development Tasks](#common-development-tasks)
- [Troubleshooting](#troubleshooting)

---

## Project Overview
Brief description of what this application does, its main purpose, and key functionalities.
### Main Features:

+ User Authentication
+ Document Management (PDF viewing/handling)
+ AI Chatbot Integration
+ Responsive Design (Mobile & Desktop)

## Technology Stack
+ **Framework**: Next.js 14+ (App Router)
+ **Language**: TypeScript
+ **Styling**: Tailwind CSS
+ **UI Components**: Custom components with shadcn/ui
+ **State Management**: React Context API
+ **HTTP Client**: Axios
+ **Build Tool**: Next.js with TypeScript

## Project Structure
```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── (main)/           # Main application pages
│   │   ├── _chatbot/     # Chatbot feature pages & components
│   │   ├── _document-management/ # Document feature pages & components
│   │   ├── c/            # Chat-related routes
│   │   └── d/            # Document-related routes
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Home page
├── components/           # Reusable UI components
│   ├── Header/           # Application header components
│   ├── mobile/           # Mobile-specific components
│   ├── PDFViewer/        # PDF viewing functionality
│   ├── Sidebar/          # Navigation sidebar components
│   ├── ui/               # Base UI components (shadcn/ui style)
│   ├── LoadingScreen.tsx # Global loading component
│   ├── Portal.tsx        # Modal portal component
│   ├── SearchModal.tsx   # Global search functionality
│   └── UserAccount.tsx   # User account dropdown/menu
├── context/              # React Context providers
├── lib/                  # Utility functions and configurations
├── services/             # API service functions
└── types/                # TypeScript type definitions

```

## Routing System
This application uses **Next.js App Router**(not Pages Router). Understanding the routing system is crucial for navigation and adding new pages.  

### Route Groups and Layouts
#### Authentication Routes ```(auth)```

+ **Purpose**: Login and authentication-related pages
+ **Layout**: Uses its own layout ```((auth)/layout.tsx)```
+ **Routes**:
```bash
/login ->  (auth)/login/page.tsx
```

#### Chat Routes ```(c/ directory)```

Dynamic routes for chat functionality:  

```bash
/c                       → c/page.tsx (New chat)
/c/[sessionId]           → c/[sessionId]/page.tsx (Specific chat)
```

#### Document Routes ```(d/ directory)```

Dynamic routes for document functionality:  
```bash
/d                          → d/page.tsx
/d/upload                   → d/upload/page.tsx
/d/update/[documentId]      → d/update/page.tsx
/d/achive                   → d/achive/page.tsx
```


## Getting Started
Please refer to `Readme.md` for getting start and set up the application


## Reusable Components
### Global Components `(src/components/)`
#### 1. Header Components `(components/Header/)`

+ Purpose: Application header with navigation, user menu, search
+ Usage: Used in main layout
+ Key Files: Main header component and sub-components

#### 2. Sidebar Components `(components/Sidebar/)`

+ Purpose: Navigation sidebar for main application
+ Usage: Desktop navigation, collapsible menu
+ Key Files: Sidebar container and navigation items

#### 3. Mobile Components `(components/mobile/)`

+ Purpose: Mobile-specific UI components
+ Usage: Responsive design for mobile devices
+ Context: Works with IsMobileContext

#### 4. PDF Viewer `(components/PDFViewer/)`

+ Purpose: PDF document viewing and interaction
+ Usage: Document management feature
+ Key Files: PDF renderer, controls, annotations

#### 5. Base UI Components `(components/ui/)`

+ Purpose: Low-level reusable components (shadcn/ui style)
+ Components:

`button.tsx` - Button variants and styles  
`input.tsx` - Form input components  
`label.tsx` - Form labels  
`pagination.tsx` - Pagination controls  
`select.tsx` - Dropdown select components  


#### Usage: 6. Building blocks for all other components

+ Utility Components  

`LoadingScreen.tsx`: Global loading states  
`Portal.tsx`: Modal and overlay rendering  
`SearchModal.tsx`: Global search functionality  
`UserAccount.tsx`: User profile dropdown and menu  

## Core Features
**1. Authentication System**

+ Location: `src/app/(auth)/`
+ Pages: Login
+ Components: Authentication forms and layouts
+ Context: `src/context/UserContext.tsx`
+ Services: `src/services/users/`

**Feature Structure:**  
```bash
(auth)/
├── login/
│   └── page.tsx          # Login page
├── layout.tsx            # Auth layout wrapper
```

**2. Document Management**

+ Location: `src/app/(main)/_document-management/`
+ Main Page: Document dashboard and file browser
+ Components: File upload,update,achive, document list, PDF viewer integration
+ Services: `src/services/documents/`
+ Types:` src/types/document-type.tsx`, `src/types/pdf-type.tsx`

**Feature Structure:** 
```bash
_document-management/
├── page.tsx              # Main document dashboard
├── upload/
│   └── page.tsx          # Document upload page
├── update/
|   ├── [documentId]/
│        └── page.tsx     # Document update page
├── archive/
│   └── page.tsx          # Archived document dashboard
└── components/           # Document-specific components
    ├── action-menu.tsx
    ├── confirm-delete.tsx
    ├── document-card.tsx
    ├── drop-down.tsx
    ├── form-input.tsx
    ├── loading.tsx
    ├── pdf-modal.tsx
    ├── search-modal-wrapper.tsx
    ├── table-grid.tsx
    └── table-header.tsx
```

**3. Chatbot Integration**

+ Location: `src/app/(main)/_chatbot/`
+ Main Page: Chat interface and session management
+ Components: Chat messages, input forms, session sidebar
+ Context: `src/context/ChatContext.tsx`
+ Services: `src/services/chats/`
+ Types: `src/types/chat-session-type.tsx`, `src/types/message-type.tsx`

**Feature Structure:**
```bash
_chatbot/
├── page.tsx              # Main chat interface
├── [sessionId]/
│   └── page.tsx          # Specific chat session
├── new/
│   └── page.tsx          # New chat session
└── components/           # Chat-specific components
    ├── bot-multi-message-card.tsx
    ├── ChatInput.tsx
    ├── full-response-box.tsx
    ├── message-actions.tsx
    ├── message-card.tsx
    ├── NewChatButton.tsx
    ├── Pignation.tsx
    ├── response-card.tsx
    └── SessionSidebar.tsx
```

## Code Architecture
### 1. Context Providers
The application uses React Context for state management:

+ **UserContext:** Manages user authentication state
+ **ChatContext:** Handles chat sessions and messages
+ **IsMobileContext:** Detects mobile/desktop view

### 2. Service Layer
API calls are organized in the services/ directory:

+ **services/users/** - User authentication
+ **services/documents/** - Document upload, retrieval, and management
+ **services/chats/** - Chat functionality and message handling

### 3. Type Definitions
All TypeScript interfaces are centralized in types/:

+ `user-type.tsx` - User-related interfaces
+ `document-type.tsx` - Document structure definitions
+ `message-type.tsx` - Chat message interfaces
+ `chat-session-type.tsx` - Chat session structure
+ `pdf-type.tsx` - PDF-specific types

## Common Development Tasks
### 1. Adding a New Component to Existing Feature

+ Navigate to feature's component directory (e.g., _chatbot/components/)
+ Create component following naming conventions
+ Export from feature's main page or component index
+ Import and use within the feature

### 2. Adding a New Reusable Component

+ Create component in `components/ directory`
+ If it's a base UI component, add to `components/ui/`
+ Export from component file
+ Import and use across the application

### 3. Adding a New Page to Feature

+ Create page in appropriate feature directory
+ Follow Next.js App Router conventions (page.tsx)
+ Use feature-specific components and services
+ Add navigation links if needed

### 4. Modifying Existing Features
#### 1. Authentication Changes

+ Forms: Update components in (auth) directory and main page (`auth\page.tsx`)
+ User State: `Modify UserContext.tsx`
+ API Calls: `Update services/users/`

#### 2. Document Management Changes

+ File Handling: Update `_document-management/ components`
+ PDF Viewer: Modify `components/PDFViewer/`
+ Document Types: Update `types/document-type.tsx`

#### 3. Chatbot Changes

+ Chat UI: Update `_chatbot/ components`
+ Message Types: Modify `types/message-type.tsx`
+ Chat Logic: Update `ChatContext.tsx`

#### 4. Styling Guidelines

+ Use Tailwind CSS classes
+ Follow mobile-first responsive design
+ Reuse UI components from components/ui/

#### 5. State Management

+ Use React Context for global state
+ Local state with useState for component-specific state
+ Update context providers in context/ directory

## Important Notes

+ This is a Next.js App Router application (not Pages Router)
+ TypeScript is used throughout the application
+ Each feature has its own pages, components, and logic
+ Reusable components are centralized in components/ directory
+ Mobile responsiveness is handled via context and specific components
+ Authentication state is managed globally via UserContext
+ All API calls go through the services layer

## Support
For technical issues or questions about the codebase, refer to:

+ Next.js Documentation: https://nextjs.org/docs
+ React Documentation: https://react.dev
+ Tailwind CSS Documentation: https://tailwindcss.com/docs

---




