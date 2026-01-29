# VenueLink - Event Venue Booking Platform

A modern, fully responsive event venue booking platform built with vanilla HTML, CSS, and JavaScript. Features dynamic API integration, interactive UI components, and a complete booking workflow.

🚀 Live Demo
[View Live Demo](#)

✨ Features

🌟 **Core Functionality**
- Dynamic Venue Browsing - Browse venues with real-time search and filters
- Interactive Booking System - Book venues with date selection and availability calendar
- User Dashboard - Separate views for customers and venue owners
- Review System - Rate and review venues with interactive star ratings
- Responsive Design - Fully optimized for all device sizes

🛠️ **Technical Highlights**
- Vanilla JavaScript - No frameworks, pure ES6+ JavaScript
- API Integration - Dynamic data loading with FakeStore API integration
- Modern CSS - Flexbox, Grid, CSS Variables, and animations
- Form Validation - Client-side validation with real-time feedback
- Loading States - Professional loading spinners and error handling

## 📁 Project Structure

```
venue-link/
├── index.html              # Homepage with featured venues
├── venues.html             # Browse and search all venues
├── venue-view.html         # Individual venue details page
├── dashboard.html          # User dashboard (customer/owner)
├── login.html              # User login
├── register.html           # User registration
├── assets/
│   ├── css/
│   │   └── style.css      # All consolidated styles (20+ sections)
│   └── js/
│       ├── main.js        # Core application logic (900+ lines)
│       └── api-service.js # API integration layer
└── README.md
```

 🎯 Key Pages & Features

**1. Home Page (`index.html`)**
- Hero section with gradient backgrounds
- Featured venues loaded dynamically from API
- Call-to-action buttons for venue discovery
- Mobile-responsive navigation

**2. Venue Browser (`venues.html`)**
- Real-time search with debounced API calls
- Advanced filtering by category, capacity, price, and dates
- Sorting options by price, rating, and popularity
- Dynamic venue cards with star ratings and details

**3. Venue Details (`venue-view.html`)**
- Dynamic content based on URL parameters
- Interactive availability calendar (FullCalendar.js integration)
- Booking form with date validation
- Review system with star ratings and comments
- Toast notifications for user feedback

**4. User Dashboard (`dashboard.html`)**
- Dual interface for customers and venue owners
- Customer view: Manage bookings, track status
- Owner view: Accept/reject bookings, manage venues
- Interactive tables with real-time updates
- Add venue form with amenities selection

**5. Authentication (`login.html`, `register.html`)**
- Form validation with real-time feedback
- Error handling with user-friendly messages
- Password strength validation
- Account type selection (Customer/Owner)

🔧 API Integration

 **API Service Layer (`api-service.js`)**
```javascript
// Key features:
- Dynamic venue data fetching
- Search and filter functionality
- Booking simulation
- Review submission
- Error handling and fallbacks
```

**Supported Operations**
- `getVenues(params)` - Fetch venues with filters
- `getVenue(id)` - Get specific venue details
- `searchVenues(query)` - Real-time search
- `bookVenue(data)` - Simulate booking
- `submitReview(data)` - Submit user reviews

**Mock Data Fallback**
If FakeStore API is unavailable, the system uses sophisticated mock data with:
- 6+ detailed venue profiles
- Realistic pricing and capacities
- Pre-populated reviews and ratings
- Simulated API delays for realism


🚀 Getting Started

 **Local Development**
1. Clone or download the project
2. Open `index.html` in any modern browser
3. No build process required - it's all static!

### **Testing Features**
```bash
# Test API Integration:
1. Open browser console (F12)
2. Watch Network tab for API calls
3. Try searching venues in real-time

# Test Booking Flow:
1. Navigate to venue-view.html?id=1
2. Select dates and click "Book Now"
3. Watch for toast notification
```
🛠️ Development Notes

**Architecture Decisions**
1. Vanilla JS over Frameworks: Demonstrates core web development skills
2. Single CSS File: Easy maintenance, no preprocessor dependencies
3. API Simulation: Real HTTP patterns without backend complexity
4. Progressive Enhancement: Works without JavaScript (basic functionality)

**Code Organization**
```
main.js Structure:
├── DOMContentLoaded handler
├── API integration functions
├── Form validation modules
├── UI update functions
├── Event listener setup
└── Utility functions
```
📈 Learning Outcomes

This project demonstrates proficiency in:
- Modern frontend development without frameworks
- API integration and data management
- Responsive web design principles
- User experience best practices
- JavaScript design patterns and architecture

🙏 Acknowledgments

- **FakeStore API** for providing mock data
- **FullCalendar.js** for calendar functionality
- **Google Fonts** for typography

**Built by Eyuel Agegnehu** | **Course: Web Programming I** | **2026**

---
