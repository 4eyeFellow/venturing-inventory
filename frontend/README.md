# UE Venturing Crew Trip Planning System - Frontend

**Built by**: Ezekiel Grant  
**Purpose**: Wood Badge Ticket Goal #1  
**Technology Stack**: React + Vite + Tailwind CSS

---

## Project Overview

This is the frontend web application for the UE Venturing Crew Trip Planning System. It provides:
- Trip planning and management
- Lessons learned database (searchable knowledge base)
- Vendor directory with ratings
- Equipment availability checking (integrates with inventory system)
- Budget tracking and cost analysis
- Template-based trip creation

---

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

---

## Installation

### 1. Install Dependencies

```bash
cd crew-trip-planner
npm install
```

This will install all required packages:
- React 18
- React Router (navigation)
- Axios (API calls)
- Tailwind CSS (styling)
- Vite (build tool)

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the API URLs:
```
VITE_API_URL=http://localhost:5000/api
VITE_INVENTORY_API_URL=http://localhost:5001/api
```

**For production (Render):**
```
VITE_API_URL=https://your-backend-api.onrender.com/api
VITE_INVENTORY_API_URL=https://your-inventory-api.onrender.com/api
```

---

## Development

### Start Development Server

```bash
npm run dev
```

This will:
- Start the development server at `http://localhost:3000`
- Enable hot module replacement (changes update instantly)
- Open the app in your default browser

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `/dist` folder.

### Preview Production Build

```bash
npm run preview
```

Test the production build locally before deploying.

---

## Project Structure

```
crew-trip-planner/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   └── Layout.jsx   # Navigation bar and page wrapper
│   ├── pages/           # Page components (one per route)
│   │   ├── Dashboard.jsx
│   │   ├── TripList.jsx
│   │   ├── TripDetails.jsx
│   │   ├── CreateTrip.jsx
│   │   ├── LessonsLearned.jsx
│   │   ├── VendorDirectory.jsx
│   │   └── EquipmentCheck.jsx
│   ├── services/        # API service functions
│   │   └── api.js       # All API calls to backend
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles + Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md            # This file
```

---

## Current Status

### ✅ Completed
- [x] Project setup with Vite + React
- [x] Tailwind CSS configured
- [x] Navigation bar with routing
- [x] Dashboard page (fully functional)
- [x] API service layer (ready for backend)
- [x] Layout component with user menu
- [x] Responsive design foundation
- [x] Custom component styles (buttons, cards, badges)

### 🚧 In Progress
- [ ] Trip List page
- [ ] Trip Details page (6 tabs)
- [ ] Create Trip wizard (5 steps)
- [ ] Lessons Learned database
- [ ] Vendor Directory
- [ ] Equipment Checker

### 📋 To Do
- [ ] Connect to backend API
- [ ] Add authentication
- [ ] Implement search functionality
- [ ] Build PDF report generator
- [ ] Integrate with inventory system (Goal #3)
- [ ] Add data visualization (charts/graphs)
- [ ] Mobile optimization
- [ ] Deploy to Render

---

## Available Routes

| Route | Page | Status |
|-------|------|--------|
| `/` | Dashboard | ✅ Complete |
| `/trips` | Trip List | 🚧 Placeholder |
| `/trips/:id` | Trip Details | 🚧 Placeholder |
| `/trips/create` | Create Trip | 🚧 Placeholder |
| `/lessons` | Lessons Learned | 🚧 Placeholder |
| `/vendors` | Vendor Directory | 🚧 Placeholder |
| `/equipment` | Equipment Check | 🚧 Placeholder |

---

## API Integration

The app connects to two backend APIs:

### 1. Trip Planning API (Goal #1 - This Project)
- Base URL: Set in `VITE_API_URL`
- Endpoints defined in `src/services/api.js`
- Database: PostgreSQL on Render (`trips_iax9`)

### 2. Inventory System API (Goal #3)
- Base URL: Set in `VITE_INVENTORY_API_URL`
- Used for equipment availability checking
- Endpoints: `/api/check-availability`, etc.

**API Service Usage Example:**
```javascript
import { tripAPI } from './services/api'

// Get all trips
const response = await tripAPI.getAll()
const trips = response.data

// Create new trip
const newTrip = await tripAPI.create({
  trip_name: 'Red River Gorge',
  trip_type: 'Spring Break Trip',
  start_date: '2025-03-15',
  // ...
})
```

---

## Styling with Tailwind CSS

### Custom Color Palette

```javascript
primary: '#4472C4'    // Blue - trust, organization
secondary: '#70AD47'  // Green - outdoor, adventure
accent: '#ED7D31'     // Orange - energy, action
danger: '#C55A11'     // Red - warnings, urgent
```

### Pre-built Component Classes

```jsx
// Buttons
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-danger">Delete</button>

// Cards
<div className="card">Content here</div>

// Input fields
<input className="input-field" />

// Status badges
<span className="badge badge-planned">Planned</span>
<span className="badge badge-completed">Completed</span>
<span className="badge badge-cancelled">Cancelled</span>
```

---

## Deployment to Render

### Step 1: Build the App

```bash
npm run build
```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_INVENTORY_API_URL`: Your inventory API URL
6. Click **"Create Static Site"**

**Result**: 
- Free hosting
- Automatic HTTPS
- No spin-down (always instant)
- Auto-deploys when you push to GitHub

---

## Next Steps for Development

### Immediate Priorities:
1. **Build Trip List Page** - Browse/search/filter trips
2. **Connect to Backend API** - Replace mock data with real data
3. **Build Create Trip Wizard** - 5-step form with template selection
4. **Build Trip Details Page** - Comprehensive trip view with 6 tabs

### Week 1 Goals:
- [ ] Complete Trip List page with search/filter
- [ ] Set up backend API (Node.js/Express)
- [ ] Connect database to API
- [ ] Test end-to-end data flow

### Month 1 Goals:
- [ ] All pages functional
- [ ] API fully connected
- [ ] Equipment integration working
- [ ] Deploy to Render
- [ ] Train 3 crew officers

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tailwind Styles Not Working
```bash
# Rebuild Tailwind
npm run dev
# Hard refresh browser: Ctrl+Shift+R (Cmd+Shift+R on Mac)
```

### API Calls Failing
- Check that backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors
- Check network tab in DevTools

---

## Contributing

This is a Wood Badge project for the UE Venturing Crew. Future officers can:
1. Fork this repository
2. Make improvements
3. Submit pull requests
4. Update documentation

---

## Support

**Developer**: Ezekiel Grant  
**Email**: zgrant4056@gmail.com  
**Wood Badge Ticket**: Goal #1  
**Completion Deadline**: March 28, 2027

---

## License

Internal use for UE Venturing Crew only.

---

## Acknowledgments

- **Ticket Counselor**: Katrina Marshall
- **Course Director**: Tony Zizak
- **Crew Advisor**: [Name]
- **Harlaxton Donor**: Duncan McNamara

Built with ❤️ for the UE Venturing Crew
