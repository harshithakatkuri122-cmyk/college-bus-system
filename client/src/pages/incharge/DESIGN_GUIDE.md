# 🎨 Bus Incharge Dashboard - Design Guide

## Color Palette

### Primary Colors
```css
Green-700: #047857 (Primary green)
Emerald-500: #10b981 (Active state)
Emerald-600: #059669 (Hover state)
Amber-900: #78350f (Accent border)
```

### Neutral Colors
```css
Slate-900: #0f172a (Sidebar background)
Slate-800: #1e293b (Sidebar hover)
Slate-700: #334155 (Sidebar text)
Slate-300: #cbd5e1 (Sidebar secondary text)

Gray-100: #f3f4f6 (Page background)
Gray-200: #e5e7eb (Input border)
Gray-300: #d1d5db (Disabled state)
Gray-600: #4b5563 (Secondary text)
Gray-800: #1f2937 (Primary text)

White: #ffffff (Cards, content)
```

### Status Colors
```css
Blue: #3b82f6 (Info)
Purple: #a855f7 (Secondary)
Orange: #f97316 (Warning)
Red: #ef4444 (Alert/Danger)
Green: #22c55e (Success)
Yellow: #eab308 (Caution)
```

---

## Typography

### Font Hierarchy
```
Headings (h1): 30px, 700 Bold → text-3xl font-bold
Headings (h2): 20px, 700 Bold → text-xl font-bold
Headings (h3): 18px, 600 Bold → text-lg font-semibold
Body: 16px, 500 Medium → font-medium
Body: 14px, 400 Regular → text-sm
Caption: 12px, 400 Regular → text-xs
```

---

## Layout Components

### Top Green Stripe
```jsx
<div className="fixed top-0 left-0 w-full h-12 bg-green-700 border-b-4 border-amber-900 z-40"></div>
```
- Height: 48px (h-12)
- Fixed to top
- z-index: 40
- Amber bottom border for contrast
- Width: 100% full screen

### Sidebar
```jsx
<aside className="fixed left-0 top-16 w-64 bg-slate-900 text-white shadow-xl flex flex-col"
  style={{ height: "calc(100vh - 4rem)" }}>
```
- Width: 256px (w-64)
- Fixed left position
- Starts after top stripe (top-16 = 64px)
- Height: viewport - top stripe
- Background: dark slate (slate-900)
- Box shadow for depth

### Main Content Area
```jsx
<div className="ml-64 pt-20 px-10 pb-10">
```
- Left margin: 256px (ml-64) for sidebar
- Top padding: 80px (pt-20) for navbar + stripe
- Horizontal padding: 40px (px-10)
- Bottom padding: 40px (pb-10)

---

## Card Components

### Summary Cards `InchargeDashboardPage.jsx`
```jsx
<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-600 font-medium mb-1">Label</p>
      <p className="text-3xl font-bold text-blue-700">Value</p>
    </div>
    <i className="fas fa-icon text-blue-300 text-4xl"></i>
  </div>
</div>
```

**Features:**
- Gradient background (left to right, from lighter to darker)
- Border-left accent color (4px)
- Icon on right (text-4xl)
- Number display in bold (text-3xl)
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-5`

**Color Variants:**
- Blue: `from-blue-50 to-blue-100` | `border-blue-500` | `text-blue-700`
- Purple: `from-purple-50 to-purple-100` | `border-purple-500` | `text-purple-700`
- Orange: `from-orange-50 to-orange-100` | `border-orange-500` | `text-orange-700`
- Green: `from-green-50 to-green-100` | `border-green-500` | `text-green-700`
- Red: `from-red-50 to-red-100` | `border-red-500` | `text-red-700`

---

## Table Components

### Table Header
```jsx
<thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
  <tr>
    <th className="px-6 py-4 text-left font-semibold">Column</th>
  </tr>
</thead>
```

### Table Body
```jsx
<tbody>
  <tr className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition`}>
    <td className="px-6 py-4 text-gray-700">Content</td>
  </tr>
</tbody>
```

**Features:**
- Alternating row colors (white/gray-50)
- Hover state: green-50
- Border top: gray-200 (1px)
- Padding: 24px horizontal (px-6), 16px vertical (py-4)
- Smooth transition on hover

---

## Button Components

### Primary Action Button
```jsx
<button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition shadow-md">
  Label
</button>
```

### Secondary Button
```jsx
<button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">
  Label
</button>
```

### Navigation Button (Sidebar Menu)
```jsx
<button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
  ${active ? "bg-emerald-500 text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
  <i className="fas fa-icon w-5"></i>
  <span className="font-medium">Label</span>
</button>
```

**Features:**
- Full width in sidebars
- Icon + text layout (gap-3)
- Active state: emerald-500
- Hover state: slate-800 (sidebar)
- Rounded corners: lg
- Transition: all 200ms

---

## Form Components

### Input Field
```jsx
<input
  type="text"
  placeholder="Placeholder text"
  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
/>
```

### Textarea
```jsx
<textarea
  placeholder="Type message..."
  rows="8"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
/>
```

### Dropdown/Select
```jsx
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200">
  <option>Optional</option>
</select>
```

### Checkbox
```jsx
<label className="flex items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition">
  <input type="checkbox" className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500" />
  <span className="ml-3 font-medium text-gray-800">Label</span>
</label>
```

### Radio Button
```jsx
<label className="flex items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
  <input type="radio" className="w-5 h-5 text-green-600" />
  <span className="ml-3">Label</span>
</label>
```

---

## Modal/Dialog

```jsx
{isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Title</h3>
      {/* Content */}
      <div className="flex gap-2">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">Action</button>
        <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition">Cancel</button>
      </div>
    </div>
  </div>
)}
```

**Features:**
- Fixed overlay with semi-transparent black
- z-index: 50 (above other content)
- Centered with flexbox
- Max width: 448px (max-w-md)
- Two-column button layout for actions

---

## Notification Components

### Toast Message
```jsx
<div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
  <i className="fas fa-check-circle"></i>
  Message text
</div>
```

### Alert Box
```jsx
<div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
  <p className="text-blue-800">
    <i className="fas fa-info-circle mr-2"></i>
    Alert message
  </p>
</div>
```

**Alert Variants:**
- Info: `bg-blue-50`, `border-blue-500`, `text-blue-800`
- Warning: `bg-yellow-50`, `border-yellow-500`, `text-yellow-800`
- Error: `bg-red-50`, `border-red-500`, `text-red-800`
- Success: `bg-green-50`, `border-green-500`, `text-green-800`

---

## Notice Card (List Item)

```jsx
<div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-400 hover:bg-gray-100 transition">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <p className="font-semibold text-gray-800">Title</p>
      <p className="text-sm text-gray-600 mt-1">Message preview</p>
    </div>
    <p className="text-xs text-gray-500 whitespace-nowrap ml-2">Date</p>
  </div>
</div>
```

---

## Badge Components

### Status Badge
```jsx
<span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
  Badge Text
</span>
```

**Colors:**
- Blue: `bg-blue-100 text-blue-700`
- Purple: `bg-purple-100 text-purple-700`
- Green: `bg-green-100 text-green-700`
- Red: `bg-red-200 text-red-700`
- Yellow: `bg-yellow-200 text-yellow-700`

---

## Avatar Components

```jsx
<div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
    A
  </div>
  <span className="font-medium text-gray-800">Name</span>
</div>
```

**Features:**
- Size: 40px (w-10 h-10)
- Gradient background
- First letter of name
- White text, bold

---

## Responsive Grid System

### Dashboard Summary Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
```
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 5 columns
- Gap: 16px (gap-4)

### Students Table Alternatives
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Animation Classes

```css
transition           /* Smooth color/property transitions */
transition-all       /* Transition all properties */
duration-200         /* 200ms animation */
hover:*              /* Hover states */
animate-pulse        /* Pulse animation for toasts */
```

---

## Z-Index Stack

```
z-50: Modals, toasts, dropdowns
z-40: Top green stripe, fixed navbar
z-0:  Default elements
```

---

## Icons Used

- Dashboard: `fas fa-home`
- Students: `fas fa-users`
- Attendance: `fas fa-clipboard-list`
- Notices: `fas fa-bell`
- Search: `fas fa-search`
- QR Code: `fas fa-qrcode`
- Camera: `fas fa-camera`
- Check: `fas fa-check-circle`
- Edit: `fas fa-edit`
- Paper Plane: `fas fa-paper-plane`
- Bus: `fas fa-bus`
- Map: `fas fa-map-marker-alt`
- User: `fas fa-user-tie`
- Info: `fas fa-info-circle`
- History: `fas fa-history`
- Times: `fas fa-times`
- Bolt: `fas fa-bolt`
- List: `fas fa-list-check`
- Download: `fas fa-download`
- Plus: `fas fa-plus`

---

## Best Practices

1. **Consistency** - Use the same colors for the same actions across pages
2. **Spacing** - Use Tailwind spacing scale (px-4, py-3, gap-2)
3. **Shadows** - Use shadow-md for cards, shadow-lg for modals
4. **Borders** - Rounded-2xl for cards, rounded-lg for inputs
5. **Responsiveness** - Always use mobile-first breakpoints
6. **Accessibility** - Include proper labels, aria attributes, focus states
7. **Hover States** - Add clear visual feedback on interactive elements
8. **Loading States** - Show "Loading..." while fetching data
9. **Empty States** - Provide friendly messages and icons
10. **Error States** - Clear error messages with red coloring

---

**Design System Version:** 1.0  
**Framework:** Tailwind CSS 3.x  
**Icons:** Font Awesome 6.x
