# 💻 Bus Incharge Dashboard - Code Snippets & Patterns

## Quick Code Reference Guide

---

## 1. Main Component Pattern (InchargeDashboard.jsx)

```jsx
// State management
const [activeSection, setActiveSection] = useState("dashboard");
const [incharge, setIncharge] = useState(null);

// Data fetching (simulated)
useEffect(() => {
  setTimeout(() => setIncharge(mockIncharge), 300);
}, []);

// Conditional rendering
const content = () => {
  if (!incharge) return <p>Loading...</p>;
  switch(activeSection) {
    case "dashboard": return <InchargeDashboardPage {...} />;
    case "students": return <InchargeStudents {...} />;
    // ...
  }
};

// Render
return <InchargeLayout active={activeSection} onSelect={setActiveSection}>
  {content()}
</InchargeLayout>;
```

**Pattern:** Composition with conditional rendering

---

## 2. Layout Wrapper Pattern (InchargeLayout.jsx)

```jsx
export default function InchargeLayout({ incharge, children, active, onSelect }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed top stripe */}
      <div className="fixed top-0 left-0 w-full h-12 bg-green-700 z-40"></div>

      {/* Fixed sidebar */}
      <InchargeSidebar active={active} onSelect={onSelect} />

      {/* Main content area */}
      <div className="ml-64 pt-20 px-10 pb-10">
        <InchargeNavbar incharge={incharge} />
        <div className="bg-white rounded-2xl shadow-md p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Pattern:** Layout composition with fixed elements and scrollable content

---

## 3. Navigation Sidebar Pattern (InchargeSidebar.jsx)

```jsx
const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: "fas fa-home" },
  { key: "students", label: "Students", icon: "fas fa-users" },
  // more items...
];

return (
  <aside className="fixed left-0 top-16 w-64 bg-slate-900 text-white">
    {/* Header */}
    <div className="px-6 py-6 border-b border-slate-700">
      <h3>Incharge Menu</h3>
    </div>

    {/* Navigation items */}
    <nav className="flex-1 px-4 py-6 space-y-3">
      {menuItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
            active === item.key
              ? "bg-emerald-500 text-white shadow-md"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <i className={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>

    {/* Footer */}
    <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
      CBIT Transport
    </div>
  </aside>
);
```

**Pattern:** Dynamic menu rendering with active state highlighting

---

## 4. Summary Card Pattern (InchargeDashboardPage.jsx)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 font-medium mb-1">Total Students</p>
        <p className="text-3xl font-bold text-blue-700">{count}</p>
      </div>
      <i className="fas fa-users text-blue-300 text-4xl"></i>
    </div>
  </div>
</div>
```

**Pattern:** Gradient cards with icon alignment and responsive grid

---

## 5. Search & Filter Pattern (InchargeStudents.jsx)

```jsx
// Controlled inputs
const [searchTerm, setSearchTerm] = useState("");
const [selectedYear, setSelectedYear] = useState("");

// Memoized filtered data
const filteredStudents = useMemo(() => {
  let filtered = incharge?.students || [];
  
  if (searchTerm) {
    filtered = filtered.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.collegeId.includes(searchTerm) ||
      student.contact.includes(searchTerm)
    );
  }
  
  if (selectedYear) {
    filtered = filtered.filter(s => s.year === selectedYear);
  }
  
  return filtered;
}, [incharge?.students, searchTerm, selectedYear]);

// Render search inputs
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

<select
  value={selectedYear}
  onChange={(e) => setSelectedYear(e.target.value)}
>
  <option value="">All Years</option>
  {years.map(year => <option key={year}>{year}</option>)}
</select>

// Render filtered table
{filteredStudents.map(student => (
  <tr key={student.id}>
    <td>{student.name}</td>
    {/* more cells... */}
  </tr>
))}
```

**Pattern:** Controlled components + useMemo for efficient filtering

---

## 6. Modal Pattern (InchargeAttendance.jsx)

```jsx
// Modal state
const [isOpen, setIsOpen] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null);

// Modal component
const QRScanModal = ({ isOpen, onClose, students, onMarkPresent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold mb-6">QR Code Scanner</h3>
        
        {/* Modal content */}
        <input
          type="text"
          placeholder="Scan or enter student ID..."
          onChange={(e) => setScannedStudentId(e.target.value)}
          autoFocus
        />
        
        <div className="flex gap-2 mt-4">
          <button onClick={handleScan}>Scan</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Usage
<button onClick={() => setIsOpen(true)}>Open Modal</button>
<QRScanModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

**Pattern:** Controlled modal with conditional rendering

---

## 7. Table with Alternating Rows Pattern

```jsx
<table className="w-full">
  <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
    <tr>
      <th className="px-6 py-4 text-left font-semibold">Header</th>
    </tr>
  </thead>
  <tbody>
    {students.map((student, index) => (
      <tr
        key={student.id}
        className={`border-t border-gray-200 ${
          index % 2 === 0 ? "bg-white" : "bg-gray-50"
        } hover:bg-green-50 transition`}
      >
        <td className="px-6 py-4 text-gray-700">{student.name}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Pattern:** Alternating background colors with hover effect

---

## 8. Form with Validation Pattern (InchargeNotices.jsx)

```jsx
const [title, setTitle] = useState("");
const [message, setMessage] = useState("");
const [toast, setToast] = useState(null);

const handleSendNotice = () => {
  // Validation
  if (!title.trim() || !message.trim()) {
    setToast({ text: "Please fill all fields", type: "error" });
    return;
  }

  // Success logic
  const newNotice = { title, message, date: new Date() };
  setSentNotices([newNotice, ...sentNotices]);
  setTitle("");
  setMessage("");
  setToast({ text: "Notice sent!", type: "success" });
};

// Form UI
<input
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Notice Title"
/>

<textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Message"
  rows="8"
/>

<button onClick={handleSendNotice}>Send Notice</button>
```

**Pattern:** Controlled form with validation and feedback

---

## 9. Toast Notification Pattern

```jsx
// Toast component
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <i className="fas fa-check-circle"></i>
      {message}
    </div>
  );
};

// Usage
const [toast, setToast] = useState(null);

{toast && <Toast message={toast} onClose={() => setToast(null)} />}

// Trigger
setToast("Success message");
```

**Pattern:** Auto-dismiss notification with cleanup

---

## 10. Checkbox List Pattern (InchargeAttendance.jsx)

```jsx
const [manualSelection, setManualSelection] = useState(new Set());

const handleToggle = (studentId) => {
  const newSelection = new Set(manualSelection);
  if (newSelection.has(studentId)) {
    newSelection.delete(studentId);
  } else {
    newSelection.add(studentId);
  }
  setManualSelection(newSelection);
};

// Render checkboxes
{students.map(student => (
  <label key={student.id} className="flex items-center">
    <input
      type="checkbox"
      checked={manualSelection.has(student.id)}
      onChange={() => handleToggle(student.id)}
      className="w-5 h-5 text-green-600"
    />
    <span className="ml-3">{student.name}</span>
  </label>
))}

// Get selected values
const selectedIds = Array.from(manualSelection);
```

**Pattern:** Set-based state for multi-selection

---

## 11. Badge Component Pattern

```jsx
<span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
  {badgeText}
</span>
```

**Variants:**
```jsx
// Blue
<span className="bg-blue-100 text-blue-700">Text</span>

// Green
<span className="bg-green-100 text-green-700">Text</span>

// Red
<span className="bg-red-200 text-red-700">Text</span>

// Yellow
<span className="bg-yellow-200 text-yellow-700">Text</span>
```

---

## 12. Avatar Pattern

```jsx
<div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
    {name.charAt(0)}
  </div>
  <span className="font-medium text-gray-800">{name}</span>
</div>
```

---

## 13. Tab Navigation Pattern (InchargeNotices.jsx)

```jsx
const [tab, setTab] = useState("send");

<div className="flex gap-2 bg-gray-100 p-2 rounded-lg">
  <button
    onClick={() => setTab("send")}
    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
      tab === "send"
        ? "bg-white text-green-600 shadow-md"
        : "text-gray-700"
    }`}
  >
    <i className="fas fa-paper-plane mr-2"></i>
    Send Notice
  </button>
  
  <button
    onClick={() => setTab("received")}
    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
      tab === "received"
        ? "bg-white text-green-600 shadow-md"
        : "text-gray-700"
    }`}
  >
    <i className="fas fa-inbox mr-2"></i>
    Received Notices
  </button>
</div>

{tab === "send" && <SendNoticeForm />}
{tab === "received" && <ReceivedNoticesList />}
```

**Pattern:** Tab state with conditional rendering

---

## 14. Radio Button Selection Pattern

```jsx
const [recipientType, setRecipientType] = useState("all");

<label className="flex items-center p-4 border-2 rounded-lg cursor-pointer">
  <input
    type="radio"
    name="recipient"
    value="all"
    checked={recipientType === "all"}
    onChange={(e) => setRecipientType(e.target.value)}
    className="w-5 h-5"
  />
  <div className="ml-3">
    <p className="font-semibold">Option 1</p>
    <p className="text-sm text-gray-600">Description</p>
  </div>
</label>
```

---

## 15. Responsive Grid Pattern

```jsx
// Dashboard cards - 5 columns on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

// Student grid - 3 columns on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Multi-select - 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

---

## 16. Empty State Pattern

```jsx
{filteredStudents.length > 0 ? (
  // Content
  filteredStudents.map(...)
) : (
  // Empty state
  <div className="text-center py-12">
    <i className="fas fa-search text-3xl mb-3 block text-gray-300"></i>
    <p className="text-gray-500">No students found</p>
  </div>
)}
```

---

## 17. Gradient Background Pattern

```jsx
// Gradient cards
className="bg-gradient-to-br from-blue-50 to-blue-100"

// Gradient button
className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"

// Gradient header
className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
```

---

## 18. Conditional Styling Pattern

```jsx
// Based on state
className={`px-4 py-2 rounded-lg ${
  isActive
    ? "bg-green-600 text-white"
    : "bg-gray-300 text-gray-800"
}`}

// Multiple conditions
className={`
  px-4 py-2 rounded-lg transition
  ${isLoading && "opacity-50 cursor-not-allowed"}
  ${isActive && "bg-green-600 text-white"}
  ${!isActive && "bg-gray-300"}
`}
```

---

## 19. Input with Icon Pattern

```jsx
<div className="relative">
  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
  />
</div>
```

---

## 20. Focus Ring Pattern (Accessibility)

```jsx
<input
  className="border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
/>

<button
  className="hover:ring-2 hover:ring-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
/>
```

---

## Common Tailwind Class Combinations

```jsx
// Button Primary
"bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition shadow-md"

// Button Secondary
"bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"

// Input Field
"w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"

// Card
"bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500"

// Table Row
"border-t border-gray-200 even:bg-gray-50 hover:bg-green-50 transition"

// Badge
"inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"

// Alert Box
"bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500 text-blue-800"

// Modal Overlay
"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
```

---

## Performance Tips Used

```javascript
// 1. useMemo for expensive calculations
const filteredList = useMemo(() => {
  return data.filter(...).sort(...);
}, [data, dependencies]);

// 2. Conditional rendering to avoid unnecessary renders
{condition && <Component />}

// 3. useCallback for stable function references
const handleClick = useCallback(() => {
  // logic
}, [dependencies]);

// 4. Array operations efficiently
const set = new Set(); // For unique values
const map = new Map(); // For key-value pairs
```

---

## Best Practices Applied

✅ Single Responsibility Principle - Each component has one job
✅ Props drilling - Minimized through proper composition
✅ State management - Kept at appropriate level
✅ Naming conventions - Clear, semantic names
✅ Code organization - Grouped logically
✅ Comments - Added for complex logic
✅ No prop drilling - Data passed efficiently
✅ Reusable functions - DRY principle
✅ Error handling - Validation on inputs
✅ Accessibility - ARIA labels, focus states

---

**Version:** 1.0  
**Last Updated:** March 1, 2026
