# 🚍 Bus Incharge Dashboard

A comprehensive React + Tailwind CSS dashboard for bus incharges to manage their assigned bus route, students, attendance, and communications.

## 📋 Overview

The Bus Incharge Dashboard is a role-based frontend interface that provides bus incharges with all necessary tools to manage their bus operations. Each incharge can only see data related to their assigned bus route.

### Key Features:
✅ **Admin-only visibility** - Only their assigned bus and students  
✅ **Real-time attendance tracking** - QR scan or manual entry modes  
✅ **Student management** - Search, filter, and view student details  
✅ **Notice system** - Send notices to students and receive admin notices  
✅ **Dashboard analytics** - Summary cards with key metrics  
✅ **No payment/seat info** - Role-appropriate data restrictions  

---

## 🏗️ Project Structure

```
client/src/pages/incharge/
├── InchargeDashboard.jsx          # Main component with routing logic
├── InchargeLayout.jsx             # Layout wrapper (sidebar + navbar)
├── InchargeSidebar.jsx            # Navigation sidebar
├── InchargeNavbar.jsx             # Top navbar with user info
│
├── InchargeDashboardPage.jsx      # Dashboard with summary cards
├── InchargeStudents.jsx           # Students table with search/filter
├── InchargeAttendance.jsx         # Attendance QR scan & manual entry
└── InchargeNotices.jsx            # Send/receive notices tabs
```

---

## 📱 Pages & Features

### 1️⃣ **Dashboard** (`InchargeDashboardPage.jsx`)

Displays key metrics and quick actions:

**Summary Cards:**
- **Total Students** - Count of students in bus
- **Bus Route** - Route name (e.g., "Madhapur - KPHB - College")
- **Driver Name** - Assigned driver
- **Present Today** - Real-time attendance count
- **Bus Status** - "On Time" / "Delayed"

**Additional Sections:**
- Recent Notices from admin
- Quick action buttons (Mark Attendance, View Students, Send Notice)

---

### 2️⃣ **Students** (`InchargeStudents.jsx`)

Table view of all students in the bus route:

**Features:**
- 🔍 **Search** - By name, College ID, contact, or emergency contact
- 🎯 **Filter** - By year (I, II, III, IV)
- 📊 **Display** - Name, College ID, Contact, Emergency Contact, Department, Year
- 👤 **Avatar** - First letter in gradient badge

---

### 3️⃣ **Attendance** (`InchargeAttendance.jsx`)

Two modes for marking attendance:

#### QR Scan Mode ✅
- Modal-based scanner simulation
- Scan endpoint for student ID
- Automatic confirmation
- Toast notification on success
- Prevents duplicate marking

#### Manual Entry Mode ✅
- Checkbox list of all students
- Multi-select capability
- Save all at once
- Or use with QR mode (persistent state)

**Present Today Table:**
- Name, College ID, Time Marked
- Remove students from list if needed

---

### 4️⃣ **Notices** (`InchargeNotices.jsx`)

Two-tab interface:

#### Send Notice Tab ✅
**Recipients:**
- Send to all students of this bus
- Send to one specific student (dropdown)

**Notice Details:**
- Title (required)
- Message (required, 500 char limit)
- Send button

**History:**
- Recently sent notices with timestamps

#### Received Notices Tab ✅
- Admin-sent notices to this bus
- Labeled by type: Alert, Warning, Info
- Date and sender info
- Mock data includes 4 sample notices

---

## 🎨 Design System

### Color Theme
- **Primary Green** - `green-700`, `emerald-500`, `emerald-600`
- **Accent Amber** - `amber-900` (border)
- **Dark Sidebar** - `slate-900`
- **Light Content** - `bg-gray-100` for page background, `white` for cards

### Components Design
- **Rounded Cards** - `rounded-2xl` with `shadow-md`
- **Gradients** - Used for headers and buttons
- **Icons** - Font Awesome icons (`fas` class)
- **Responsive Grid** - `grid-cols-1 md:grid-cols-2 lg:grid-cols-...`

### Layout Structure
```
┌─────────────────────────────────────────┐
│  GREEN STRIPE (Fixed Top)               │
├──────────┬──────────────────────────────┤
│ SIDEBAR  │                              │
│ (Fixed)  │  NAVBAR                      │
│          ├──────────────────────────────┤
│ Menu     │  MAIN CONTENT (Scrollable)   │
│ Items    │  - Summary Cards             │
│          │  - Tables/Forms              │
│          │  - Modals/Dialogs            │
└──────────┴──────────────────────────────┘
```

---

## 📊 Mock Data Structure

### Incharge Object
```javascript
{
  id: "INC001",
  name: "Ramesh Kumar",
  busNo: "Bus 7",
  route: "Madhapur - KPHB - College",
  driver: "Mohammad Ali",
  status: "On Time",
  students: [...],
  busNumber: "HK 09 AB 7777",
  contactNumber: "9876543200"
}
```

### Student Object
```javascript
{
  id: 1,
  name: "Akshay Kumar",
  collegeId: "22CSE001",
  contact: "9876543210",
  emergency: "9876543211",
  department: "CSE",
  year: "III Year",
  presentToday: true
}
```

### Notice Object
```javascript
{
  id: 1,
  from: "Admin",
  date: "2026-02-28",
  title: "Route Change Notice",
  message: "...",
  type: "alert" // 'alert' | 'warning' | 'info'
}
```

---

## 🚀 Getting Started

### Installation
No additional dependencies needed - uses:
- React (hooks: `useState`, `useEffect`, `useMemo`)
- Tailwind CSS
- Font Awesome Icons

### Usage
```jsx
import InchargeDashboard from './pages/incharge/InchargeDashboard';

// In your router
<Route path="/dashboard/incharge" element={<InchargeDashboard />} />
```

### Accessing Components
Each page is independently importable:
```jsx
import InchargeStudents from './pages/incharge/InchargeStudents';
import InchargeAttendance from './pages/incharge/InchargeAttendance';
```

---

## 🔄 State Management

**Component-level state** with `useState`:
- Active section navigation
- Search/filter terms
- Form inputs
- Modal visibility
- Attendance records
- Toast messages

**Mock data** initialized from constants in `InchargeDashboard.jsx`

---

## 🎯 Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Dashboard Summary Cards | ✅ | 5 cards with metrics |
| Student Search | ✅ | Real-time filtering |
| Student Filter by Year | ✅ | Dropdown with 4 options |
| QR Scan Mode | ✅ | Modal simulation with ID entry |
| Manual Attendance | ✅ | Checkbox list with save |
| Send Notices | ✅ | All students or specific student |
| Receive Notices | ✅ | Tab view with mock admin notices |
| Responsive Design | ✅ | Mobile, tablet, desktop |
| Toast Notifications | ✅ | Success/info messages |
| Role-based Visibility | ✅ | Only bus-specific data shown |

---

## 🛑 What's NOT Included

❌ Payment Information  
❌ Seat Selection  
❌ Renewal Options  
❌ Backend API integration (mock data only)  
❌ Authentication (assumes user is logged in)  
❌ Actual QR scanner library (simulated)  

---

## 🎨 Customization

### Change Bus Information
Edit `mockIncharge` in `InchargeDashboard.jsx`:
```javascript
const mockIncharge = {
  busNo: "Bus X",
  route: "Your Route",
  driver: "Driver Name",
  students: [...], // Your students array
};
```

### Change Color Theme
Modify Tailwind classes:
- Green → Blue: `green-700` → `blue-700`
- Sidebar: `slate-900` → `gray-800`

### Add Real Backend
Replace mock data with API calls:
```javascript
useEffect(() => {
  fetch('/api/incharge/dashboard')
    .then(res => res.json())
    .then(data => setIncharge(data));
}, []);
```

---

## 📝 Component Props

### InchargeLayout
```jsx
<InchargeLayout 
  incharge={inchargeObj}      // Incharge data
  active={section}             // Active menu item
  onSelect={setActiveSection}  // Menu navigation
>
  {children}
</InchargeLayout>
```

### InchargeStudents
```jsx
<InchargeStudents incharge={inchargeObj} />
```

### InchargeAttendance
```jsx
<InchargeAttendance incharge={inchargeObj} />
```

### InchargeNotices
```jsx
<InchargeNotices incharge={inchargeObj} />
```

---

## 🎓 Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation (Enter to confirm, Esc to close)
- ✅ Color contrast compliance
- ✅ Focus indicators on interactive elements

---

## 📱 Responsive Breakpoints

- **Mobile** - `grid-cols-1`
- **Tablet** - `md:grid-cols-2`
- **Desktop** - `lg:grid-cols-3+`

All components scale gracefully across device sizes.

---

## 🚦 Future Enhancements

🔄 Real-time attendance updates with WebSocket  
📍 GPS tracking for bus location  
📧 Email notifications to students  
📈 Attendance analytics and reports  
🔐 Advanced permission controls  
🌙 Dark mode toggle  
🌍 Multi-language support  
📱 Mobile app version  

---

## 📞 Support

For issues or questions, check:
1. Mock data structure in component files
2. Tailwind CSS class names
3. Font Awesome icon library
4. React hooks usage patterns

---

**Version:** 1.0  
**Last Updated:** March 1, 2026  
**Author:** CBIT Transport System Team
