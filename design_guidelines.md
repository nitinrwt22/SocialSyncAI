# SocialSync Cloud - Design Guidelines

## Design Approach
**Selected Approach**: Reference-Based (Modern SaaS Dashboard)

Drawing inspiration from **Linear** (clean typography, modern layouts), **Notion** (intuitive organization), and **Buffer/Hootsuite** (social media management UI patterns). The design emphasizes vibrant energy, AI-powered intelligence, and professional polish suitable for a cloud-based SaaS platform.

## Core Design Principles
1. **Vibrant & Energetic**: Multiple gradient treatments, bold typography, and dynamic visual elements that convey innovation
2. **Data-Forward**: Clear information hierarchy with prominent analytics and metrics
3. **AI-Enhanced**: Visual indicators of AI processing with animated feedback and smart suggestions
4. **Cloud-Native**: Modern, lightweight aesthetic with floating cards and depth

---

## Typography System

**Primary Font**: Inter or DM Sans (Google Fonts)
- Headings: 700 (Bold)
- Subheadings: 600 (Semi-Bold)
- Body: 400 (Regular)
- Labels/Captions: 500 (Medium)

**Font Scale**:
- Hero/Display: text-5xl to text-6xl (48-60px)
- Page Titles: text-3xl to text-4xl (30-36px)
- Section Headers: text-2xl (24px)
- Card Titles: text-xl (20px)
- Body Text: text-base (16px)
- Small Text/Labels: text-sm (14px)
- Micro Text: text-xs (12px)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-6, gap-8
- Element margins: m-2, m-4, m-6

**Container Widths**:
- Sidebar: fixed w-64 (256px) on desktop, full-width drawer on mobile
- Main Content: flex-1 with max-w-7xl and px-6 to px-8
- Cards/Components: Full width within containers
- Modals: max-w-2xl (672px) for forms, max-w-4xl for analytics

**Grid Systems**:
- Dashboard Stats: 3-4 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Post Cards: 2-3 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Analytics Charts: 2 columns (grid-cols-1 lg:grid-cols-2)

---

## Component Library

### Navigation Structure

**Sidebar Navigation** (Desktop):
- Fixed left sidebar, 256px wide, full height
- Logo at top (h-16 with p-6)
- Navigation items with icons (left-aligned, px-6 py-3)
- Active state: Subtle background treatment with border-l-4 accent
- Bottom section for user profile (mt-auto)
- Icons: 20px × 20px with mr-3 spacing

**Mobile Navigation**:
- Top bar with hamburger menu (h-16)
- Slide-in drawer overlay for menu
- Logo centered in top bar

**Navigation Items**:
- 🏠 Dashboard
- 🧠 AI Post Assistant
- 📅 My Posts
- 📊 Analytics
- ⚙️ Settings

### Authentication Pages

**Login/Register Page**:
- Split layout option: 50/50 left panel (branding) / right panel (form)
- OR: Centered card approach (max-w-md, mx-auto, pt-20)
- Tabbed interface or toggle button for Login/Register switching
- Form inputs: h-12, px-4, rounded-lg, border-2
- Social login buttons: Full width with icon + text, h-12
- Form spacing: space-y-4 between inputs
- CTA button: w-full, h-12, rounded-lg, font-semibold
- Link to switch auth mode: text-sm, mt-4, text-center

### Dashboard (Home)

**Hero Section**:
- Greeting header: "Welcome back, [Name]" (text-3xl, font-bold, mb-2)
- Subtitle with tagline (text-lg, mb-8)
- Quick action buttons: 2-3 prominent CTAs (inline-flex, gap-4)
- Background: Subtle gradient mesh or abstract pattern
- Height: min-h-[300px] to min-h-[400px]

**Quick Stats Cards**:
- 4-column grid on desktop (grid-cols-4)
- Each card: p-6, rounded-xl, shadow-lg
- Icon at top left (w-12, h-12, rounded-lg, p-2.5)
- Metric number: text-3xl, font-bold, mt-4
- Label: text-sm, mt-1
- Small trend indicator: text-xs with arrow icon

**Recent Activity Section**:
- Card container: rounded-xl, p-6, shadow-md
- Header with "Recent Posts" + "View All" link
- List of 3-5 recent items
- Each item: flex layout, py-4, border-b last:border-0
- Timestamp on right side (text-sm)

### AI Post Assistant

**Content Input Area**:
- Large textarea: min-h-[200px], p-4, rounded-lg, border-2
- Character counter: text-sm, text-right, mt-2
- "✨ Analyze & Generate Hashtags" button: Prominent, w-full md:w-auto

**AI Results Display**:
- Animated reveal on load (fade + slide up)
- Sentiment badge: Inline-flex, px-4, py-2, rounded-full, font-semibold, text-sm
- Hashtag chips: Inline-flex, flex-wrap, gap-2
- Each hashtag: px-3, py-1.5, rounded-full, text-sm, font-medium
- Loading state: Skeleton shimmer effect with pulse animation

**Post Preview Card**:
- Border-2, rounded-xl, p-6
- Mock social media post layout
- Profile image placeholder (w-10, h-10, rounded-full)
- Post text preview with hashtags styled
- Engagement metrics preview (likes/comments as placeholders)

### Post Scheduler

**Calendar/Date Picker**:
- Large date selector: Full width on mobile, max-w-sm on desktop
- Time selector: Grid of time slots or dropdown
- Selected date/time: Prominent display (text-lg, font-semibold)

**Scheduled Posts List**:
- Timeline view OR card grid
- Each post card: p-4 to p-6, rounded-lg, border-2
- Status badge (top-right): "Scheduled", "Posted", "Draft"
- Countdown timer: text-sm, font-medium (e.g., "Posts in 2h 34m")
- Quick actions: Edit/Delete icon buttons (w-8, h-8, rounded)
- Post content: Truncated with "Read more" expansion

### Analytics Dashboard

**Page Layout**:
- Full-width header: py-6, border-b-2
- Date range selector: Inline-flex, gap-2, pills for "7D", "30D", "90D"

**Metric Cards Row**:
- 4 cards (grid-cols-4)
- Each card: p-6, rounded-xl, shadow-md
- Large number: text-4xl, font-bold
- Icon + label below
- Mini sparkline chart (optional)

**Chart Sections**:
- 2-column layout for charts (grid-cols-1 lg:grid-cols-2)
- Each chart container: p-6, rounded-xl, shadow-md, min-h-[300px]
- Chart titles: text-xl, font-semibold, mb-4
- Legend placement: Bottom or right side

**Charts to Include**:
1. Line chart: Posts per week (last 8 weeks)
2. Donut chart: Sentiment distribution
3. Bar chart: Best posting times (hours of day)
4. Horizontal bar: Top hashtags by usage

### Forms & Inputs

**Input Fields**:
- Height: h-12
- Padding: px-4
- Border radius: rounded-lg
- Border width: border-2
- Focus ring: ring-4

**Buttons**:
- Primary CTA: h-12, px-6, rounded-lg, font-semibold, shadow-lg
- Secondary: h-12, px-6, rounded-lg, font-medium, border-2
- Icon buttons: w-10, h-10, rounded-lg, flex items-center justify-center
- Loading state: Spinner icon (w-5, h-5) with "Processing..." text

**Toggle Switches**:
- Width: w-11, Height: h-6
- Handle: w-5, h-5
- Transition duration: 200ms

---

## Animations & Interactions

**Page Transitions**:
- Fade in on mount: 200ms duration
- Slide up cards: 300ms with 50ms stagger

**Hover States**:
- Cards: Subtle lift with shadow increase (translate-y-[-2px])
- Buttons: Slight scale (scale-105) and shadow enhancement
- Duration: 150ms

**AI Processing States**:
- Shimmer effect: Linear gradient animation during loading
- Success: Checkmark icon with bounce animation
- Pulse effect on AI button before click

**Micro-interactions**:
- Hashtag chips: Scale on hover (scale-105)
- Sentiment badge: Gentle glow pulse
- Stat numbers: Count-up animation on load
- Chart bars/lines: Staggered draw-in animation

**Toast Notifications**:
- Position: top-right, fixed
- Slide in from right: translateX(100%) to translateX(0)
- Auto-dismiss: 3-4 seconds
- Include icon + message + close button
- Stack vertically with gap-2

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (base styles)
- Tablet: md:768px
- Desktop: lg:1024px
- Large Desktop: xl:1280px

**Mobile Adaptations**:
- Sidebar: Convert to drawer overlay
- Grid columns: Collapse to single column (grid-cols-1)
- Stat cards: Stack vertically with gap-4
- Charts: Full width, reduce height slightly
- Hide secondary information on small screens
- Increase touch targets to min 44×44px

---

## Special Features

### Theme Toggle
- Toggle switch in Settings or header
- Smooth transition between themes: transition-colors duration-300
- Persist preference in localStorage

### Loading States
- Skeleton screens for initial page load
- Shimmer animation: Linear gradient moving left to right
- Spinner for async operations
- Progress bars for multi-step processes

### Empty States
- Centered content: flex, items-center, justify-center, min-h-[400px]
- Illustration or large icon (w-24, h-24)
- Heading: text-2xl, font-semibold, mt-6
- Description: text-base, mt-2, max-w-md, text-center
- CTA button: mt-6

---

## Images

**Hero Image**: YES - Dashboard hero section
- Placement: Background or right-side illustration
- Description: Abstract gradient mesh, AI/cloud/connection nodes visualization, or 3D isometric social media icons floating
- Treatment: Subtle opacity overlay, integrate with gradient background

**Authentication Page Illustration**:
- Placement: Left panel of split-screen layout
- Description: Modern illustration of social media dashboard with analytics graphs, AI sparkles, and scheduled posts calendar
- Style: Flat, geometric, vibrant

**Empty State Illustrations**:
- No posts yet: Calendar with sparkles
- No analytics data: Bar chart with upward arrow
- Description: Simple, friendly, encouraging

**Icons**: Use Heroicons (outline style) via CDN for all interface icons

---

## Accessibility

- Focus indicators: 4px ring on all interactive elements
- Minimum contrast ratio: 4.5:1 for all text
- Form labels: Always visible, text-sm, font-medium, mb-2
- Error messages: text-sm, mt-1, with icon
- Alt text for all images and illustrations
- Keyboard navigation: Full support with visible focus states
- ARIA labels for icon-only buttons