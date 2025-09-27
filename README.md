# Agent Chat Frontend

A NextJS-based chat interface for interacting with AI agents, featuring document management and secure authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running (see backend README)

### Configure Environment Variables

```bash
cp .env.example .env
```
 Open .env and adjust the values according to the backend setup.

### Installation

1. **Install dependencies**
```bash
npm install
```
### ⚠️ Troubleshooting Network Issues

If `npm install` fails due to company network restrictions, try running:

```bash
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
```

2. **Start development server**
```bash
npm run dev
```

3. **Open your browser**
- **Frontend**: http://localhost:3000
- **Login**: Use the dummy user credentials from your backend setup


## Project Structure
```
📁 .next/                     # Next.js build output
📁 node_modules/              # NPM dependencies
📁 public/                    # Static assets (images, fonts)
📁src/                        # Main source code
├── 📁 app/                   # Next.js App Router pages
│   ├── 📁 (auth)/            # Authentication pages (login, signup)
│   ├── 📁 (main)/            # Main application pages
│   │   ├── 📁 _chatbot/      # Chatbot feature pages & components
│   │   ├── 📁 _document-management/  # Document feature pages & components
│   │   ├── 📁 c/             # Chat-related routes
│   │   └── 📁 d/             # Document-related routes
│   ├── 📄 layout.tsx         # Root layout component
│   └── 📄 page.tsx           # Home page
├── 📁 components/            # Reusable UI components
│   ├── 📁 Header/            # Application header components
│   ├── 📁 mobile/            # Mobile-specific components
│   ├── 📁 PDFViewer/         # PDF viewing functionality
│   ├── 📁 Sidebar/           # Navigation sidebar components
│   ├── 📁 ui/                # Base UI components (shadcn/ui style)
│   ├── 📄 LoadingScreen.tsx  # Global loading component
│   ├── 📄 Portal.tsx         # Modal portal component
│   ├── 📄 SearchModal.tsx    # Global search functionality
│   └── 📄 UserAccount.tsx    # User account dropdown/menu
├── 📁 context/               # React Context providers
├── 📁 lib/                   # Utility functions and configurations
├── 📁 services/              # API service functions
├── 📁 types/                 # TypeScript type definitions
│
📄 .env                   # Configure environment vairables
📄 next.config.ts         # Next.js configuration
📄 tailwind.config.mjs    # Tailwind CSS setup
📄 package.json           # Project dependencie
```

## Usage

### First Time Setup
1. Start the backend services first
2. Configure .env variables
3. Run the frontend
4. Login with your dummy user credentials
5. You should see Chatbot and Documents Management Dashboard

### Daily Development
```bash
npm run dev    # Starts development server
npm run build  # Builds for production  
npm run preview # Previews production build
```

### How to deploy

https://nextjs.org/docs/pages/getting-started/deploying
