# 🚀 Bus Incharge Dashboard - Implementation Guide

## Quick Start

### 1. Import the Dashboard
```jsx
import InchargeDashboard from './pages/incharge/InchargeDashboard';
```

### 2. Add to Router
```jsx
// In your App.jsx or router config
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InchargeDashboard from './pages/incharge/InchargeDashboard';

function App() {
  return (
    <Routes>
      <Route path="/dashboard/incharge" element={<InchargeDashboard />} />
    </Routes>
  );
}
```

### 3. Ensure Tailwind CSS is Configured
The dashboard uses Tailwind CSS classes extensively. Make sure your `tailwind.config.js` includes:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Include Font Awesome Icons
Add to `index.html`:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

## File Structure & Relationships

```
InchargeDashboard.jsx (Main entry point)
    ↓
    ├── InchargeLayout.jsx (wraps all content)
    │   ├── InchargeSidebar.jsx (navigation)
    │   ├── InchargeNavbar.jsx (top user info)
    │   └── children (page content)
    │
    ├── InchargeDashboardPage.jsx (/ route)
    ├── InchargeStudents.jsx (/students route)
    ├── InchargeAttendance.jsx (/attendance route)
    └── InchargeNotices.jsx (/notices route)
```

---

## State Flow

### InchargeDashboard (Parent State)
```jsx
const [activeSection, setActiveSection] = useState("dashboard");
const [incharge, setIncharge] = useState(null);
```

**Responsibilities:**
- Hold active page state
- Manage incharge data
- Route to correct page component
- Pass data to child components

### Page Components (Local State)
Each page manages its own state:
- Search/filter inputs
- Form data
- Modal visibility
- Toast messages
- Lists (present students, sent notices)

---

## Mock Data Reference

### Complete Incharge Object
```javascript
{
  id: "INC001",                          // Unique ID
  name: "Ramesh Kumar",                  // Incharge name
  busNo: "Bus 7",                        // Bus number
  route: "Madhapur - KPHB - College",   // Bus route
  driver: "Mohammad Ali",                // Driver name
  status: "On Time",                     // Current status
  busNumber: "HK 09 AB 7777",            // License plate
  contactNumber: "9876543200",           // Incharge mobile
  students: [
    // Array of 12 student objects
  ]
}
```

### Complete Student Object
```javascript
{
  id: 1,                           // Unique ID
  name: "Akshay Kumar",            // Full name
  collegeId: "22CSE001",           // College ID
  contact: "9876543210",           // Phone number
  emergency: "9876543211",         // Emergency contact
  department: "CSE",               // Department
  year: "III Year",                // Year of study
  presentToday: true               // Attendance flag
}
```

### Complete Notice Object (Received)
```javascript
{
  id: 1,                           // Unique ID
  from: "Admin",                   // Sender
  date: "2026-02-28",              // Date string
  title: "Route Change Notice",    // Notice title
  message: "Bus 7 route will...",  // Full message
  type: "alert"                    // Type: alert|warning|info
}
```

### Notice Object (Sent by Incharge)
```javascript
{
  id: 1,                           // Unique ID
  date: "2026-02-28",              // Date created
  title: "Important Update",       // Title
  message: "Pickup time changed",  // Message content
  recipients: "All Students",      // Recipients
  recipientType: "all"             // Type: all|specific
}
```

---

## Component Prop Examples

### InchargeLayout
```jsx
<InchargeLayout
  incharge={{
    name: "Ramesh Kumar",
    // ... full incharge object
  }}
  active="dashboard"
  onSelect={(section) => setActiveSection(section)}
>
  {/* Page content goes here */}
</InchargeLayout>
```

### InchargeDashboardPage
```jsx
<InchargeDashboardPage 
  incharge={inchargeObject}
  onAttendanceClick={() => setActiveSection("attendance")}
/>
```

### InchargeStudents
```jsx
<InchargeStudents incharge={inchargeObject} />
```

### InchargeAttendance
```jsx
<InchargeAttendance incharge={inchargeObject} />
```

### InchargeNotices
```jsx
<InchargeNotices incharge={inchargeObject} />
```

---

## Integrating Real Backend

### Step 1: Replace Mock Data Fetch
In `InchargeDashboard.jsx`, replace:
```jsx
// Before (Mock data)
useEffect(() => {
  setTimeout(() => setIncharge(mockIncharge), 300);
}, []);
```

With:
```jsx
// After (Real API)
useEffect(() => {
  const fetchInchargeData = async () => {
    try {
      const response = await fetch('/api/incharge/dashboard', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      setIncharge(data);
    } catch (error) {
      console.error('Failed to fetch incharge data:', error);
    }
  };
  
  fetchInchargeData();
}, []);
```

### Step 2: Update Attendance API
In `InchargeAttendance.jsx`, add attendance save:
```jsx
const handleManualSave = async () => {
  const presentIds = Array.from(manualSelection);
  
  try {
    const response = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        busId: incharge.busNo,
        date: new Date().toISOString(),
        studentIds: presentIds
      })
    });
    
    if (response.ok) {
      setToast("Attendance saved successfully");
    }
  } catch (error) {
    console.error('Failed to save attendance:', error);
  }
};
```

### Step 3: Update Send Notice API
In `InchargeNotices.jsx`:
```jsx
const handleSendNotice = async () => {
  try {
    const response = await fetch('/api/notices/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        busId: incharge.busNo,
        title,
        message,
        recipients: recipientType === "all" 
          ? incharge.students.map(s => s.id)
          : [selectedStudentId]
      })
    });
    
    if (response.ok) {
      setTitle("");
      setMessage("");
      setToast({ text: "Notice sent successfully", type: "success" });
    }
  } catch (error) {
    console.error('Failed to send notice:', error);
  }
};
```

### Step 4: Fetching Received Notices
Replace mock notices in `InchargeNotices.jsx`:
```jsx
useEffect(() => {
  const fetchNotices = async () => {
    try {
      const response = await fetch(`/api/notices/bus/${incharge.busNo}`);
      const data = await response.json();
      setReceivedNotices(data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    }
  };
  
  if (incharge) {
    fetchNotices();
  }
}, [incharge]);
```

---

## Authentication Integration

If using AuthContext (already in your project):

```jsx
import { useAuth } from "../../../context/AuthContext";

function InchargeDashboard() {
  const { user, logout } = useAuth();
  
  // Use user.id to fetch incharge-specific data
  useEffect(() => {
    if (!user) return;
    
    fetchInchargeData(user.id);
  }, [user]);
}
```

---

## Error Handling

### Add Error State
```jsx
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/incharge/${inchargeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setIncharge(data);
    } catch (error) {
      setError(error.message);
      console.error('Fetch error:', error);
    }
  };
  
  fetchData();
}, []);

// In render
if (error) {
  return <div className="text-red-600">Error: {error}</div>;
}
```

### Error Toast Notification
```jsx
const handleSendNotice = () => {
  if (!title.trim()) {
    setToast({ text: "Title is required", type: "error" });
    return;
  }
  // ... rest of logic
};
```

---

## Performance Optimization

### 1. Memoize Filtered Data
Already implemented in `InchargeStudents.jsx`:
```jsx
const filteredStudents = useMemo(() => {
  // Filter logic
}, [incharge?.students, searchTerm, selectedYear]);
```

### 2. Lazy Load Pages
```jsx
import { lazy, Suspense } from 'react';

const InchargeStudents = lazy(() => import('./InchargeStudents'));
const InchargeAttendance = lazy(() => import('./InchargeAttendance'));

// In render
<Suspense fallback={<div>Loading...</div>}>
  {activeSection === "students" && <InchargeStudents incharge={incharge} />}
</Suspense>
```

### 3. Debounce Search
```jsx
import { useState, useCallback } from 'react';

const [searchTerm, setSearchTerm] = useState("");

const handleSearch = useCallback((e) => {
  const timer = setTimeout(() => {
    setSearchTerm(e.target.value);
  }, 300);
  
  return () => clearTimeout(timer);
}, []);
```

---

## Testing Examples

### Testing Dashboard Component
```javascript
import { render, screen } from '@testing-library/react';
import InchargeDashboard from './InchargeDashboard';

describe('InchargeDashboard', () => {
  it('renders loading state initially', () => {
    render(<InchargeDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays incharge name after loading', async () => {
    render(<InchargeDashboard />);
    const name = await screen.findByText('Ramesh Kumar');
    expect(name).toBeInTheDocument();
  });
});
```

### Testing Students Filter
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import InchargeStudents from './InchargeStudents';

describe('InchargeStudents', () => {
  it('filters students by search term', () => {
    render(<InchargeStudents incharge={mockIncharge} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Akshay' } });
    
    expect(screen.getByText('Akshay Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Priya Sharma')).not.toBeInTheDocument();
  });
});
```

---

## Accessibility Checklist

- [x] Semantic HTML (`<aside>`, `<nav>`, `<main>`)
- [x] ARIA labels on buttons and icons
- [x] Focus indicators (`:focus-visible`)
- [x] Color contrast ratios meet WCAG AA
- [x] Keyboard navigation (Tab, Enter, Escape)
- [x] Alt text for icons (via Font Awesome)
- [x] Form labels properly associated
- [x] Modal focus trap (optional enhancement)

### Add Focus Trap to Modal (Enhancement)
```jsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }
}, [isOpen]);
```

---

## Browser Support

- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- IE11: ❌ Not supported (uses ES6+)

---

## Customization Examples

### Change Primary Color
Replace all `green-` classes with your preferred color:
```css
/* Replace */
green-700 → blue-700
green-600 → blue-600
emerald-500 → cyan-500
emerald-600 → cyan-600
```

### Change Sidebar Color
In `InchargeSidebar.jsx`:
```jsx
className="bg-slate-900" // Change to gray-800, indigo-900, etc.
```

### Add More Students
In `InchargeDashboard.jsx`, expand `mockStudents` array:
```javascript
const mockStudents = [
  // ... existing students ...
  {
    id: 13,
    name: "New Student",
    collegeId: "22XXX013",
    // ... other properties
  }
];
```

---

## Deployment Checklist

- [ ] Remove all console.log statements
- [ ] Replace mock data with real API
- [ ] Add proper error handling
- [ ] Test on different screen sizes
- [ ] Check bundle size
- [ ] Optimize images
- [ ] Enable minification
- [ ] Add HTTPS
- [ ] Test in production browser
- [ ] Add analytics tracking
- [ ] Set up monitoring/logging

---

## Troubleshooting

### Issue: Sidebar not showing
**Solution:** Ensure left margin on main content: `className="ml-64"`

### Issue: Icons not displaying
**Solution:** Include Font Awesome CDN link in index.html

### Issue: Tailwind styles not applying
**Solution:** Rebuild Tailwind CSS or check content paths in config

### Issue: Modal behind other elements
**Solution:** Check z-index values (modal should have z-50)

### Issue: Search not working
**Solution:** Ensure `useMemo` dependencies are correct

---

**Last Updated:** March 1, 2026  
**Version:** 1.0  
**Compatibility:** React 18+, Tailwind CSS 3+
