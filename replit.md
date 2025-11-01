# SocialSync Cloud - AI-Powered Social Media Scheduler

## Project Overview
SocialSync Cloud is a full-stack, cloud-based social media content scheduler with AI-powered insights. The application helps users plan, analyze, and optimize their social media posts using AI sentiment analysis and hashtag generation.

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Routing**: Wouter
- **Styling**: Tailwind CSS with custom design system (purple/pink/blue gradient palette)
- **UI Components**: Shadcn UI with custom enhancements
- **State Management**: TanStack React Query v5
- **Animations**: Framer Motion
- **Charts**: Recharts for analytics visualization
- **Authentication**: Firebase Auth (Email/Password + Google Sign-In)

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: Google Firestore (Firebase)
- **AI**: Hugging Face Inference API (distilbert-base-uncased-finetuned-sst-2-english)
- **Authentication**: Firebase Admin SDK for token verification
- **Validation**: Zod schemas

## Features

### 1. Authentication
- Email/Password registration and login
- Google Sign-In integration
- Protected routes with automatic redirects
- Firebase-based user profile storage
- Tabbed login/register interface

### 2. AI Content Assistant
- Real-time sentiment analysis (positive/neutral/negative)
- Automated hashtag generation based on content
- Confidence scores for sentiment predictions
- Custom hashtag addition and removal
- Animated result display with colored badges

### 3. Post Scheduler
- Date and time picker for scheduling
- Post storage in Firestore with user filtering
- Status tracking (draft/scheduled/posted)
- Complete post metadata (content, hashtags, sentiment, timestamps)

### 4. My Posts Management
- List view of all scheduled posts
- Real-time countdown timers (updates every minute)
- Sentiment indicators with color coding
- Delete functionality with confirmation dialog
- Sorting by scheduled date

### 5. Analytics Dashboard
- Total posts count
- Positive rate percentage
- Top hashtags (frequency-based)
- Posts per week (line chart, 8 weeks)
- Sentiment distribution (pie chart)
- Best posting times by hour (bar chart)
- Top 10 hashtags (horizontal bar chart)

### 6. Settings & Preferences
- User profile display
- Dark/light theme toggle with persistence
- Application information

## Architecture

### Data Model
```typescript
// User Profile (Firestore)
{
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: number
}

// Post (Firestore)
{
  id: string
  userId: string
  content: string
  hashtags: string[]
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  scheduledFor: number
  status: "draft" | "scheduled" | "posted"
  createdAt: number
  updatedAt: number
}
```

### API Endpoints
- `POST /api/analyze` - AI sentiment analysis and hashtag generation
- `GET /api/posts` - Fetch all posts for authenticated user
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post (with ownership verification)
- `GET /api/analytics` - Compute analytics for authenticated user

### Security
- Firebase ID token verification on all protected endpoints
- Development fallback to x-user-id header for testing
- User-scoped data access (posts filtered by userId)
- Firestore security through Firebase Admin SDK

## Design System

### Colors
- **Primary**: Purple (#8b5cf6 - hsl(270 75% 60%))
- **Secondary**: Cyan blue (#3b82f6 - hsl(200 85% 55%))
- **Accent**: Pink (#ec4899 - hsl(330 80% 60%))
- **Charts**: 5-color vibrant palette for data visualization
- **Sentiments**:
  - Positive: Green (#10b981)
  - Neutral: Blue (#3b82f6)
  - Negative: Red (#ef4444)

### Typography
- **Font**: Inter (primary), DM Sans (secondary)
- **Weights**: 300-800 for various hierarchy levels

### Layout
- Sidebar navigation (20rem width on desktop)
- Responsive design (mobile-first approach)
- Consistent spacing scale (4, 6, 8, 12, 16, 20, 24)
- Card-based content organization

### Animations
- Framer Motion for page transitions
- Staggered list animations
- Smooth hover and active states
- Loading skeletons for async content

## Environment Variables
```
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_API_KEY
VITE_HUGGING_FACE_API_KEY
NODE_ENV=development
```

## Development Workflow
1. Install dependencies: `npm install`
2. Set environment variables in Replit Secrets
3. Run development server: `npm run dev`
4. Access app at the Replit webview URL

## Deployment
- Frontend: Firebase Hosting or Vercel
- Backend: Cloud deployment with Firestore connection
- Required: Firebase project setup with Auth and Firestore enabled
- Security: Ensure proper Firebase security rules in production

## Recent Changes (November 2024)
- Implemented complete authentication system with Firebase
- Created vibrant UI with purple/pink/blue gradient design
- Integrated Hugging Face AI for sentiment analysis
- Built analytics dashboard with Recharts visualizations
- Added real-time countdown timers in My Posts
- Implemented secure token-based authentication
- Set up Firestore for persistent data storage
- Created responsive sidebar navigation
- Added dark/light theme toggle

## User Preferences
- Default theme: Light mode (with dark mode available)
- Animated transitions throughout the app
- Toast notifications for all user actions
- Accessible UI with proper ARIA labels and focus states

## Known Limitations
- Firestore requires proper security rules configuration in production
- Hugging Face API has rate limits on free tier
- Analytics computed on-demand (not cached)
- Posts are not automatically published (scheduling is for organization only)
