import React from "react";

export default function DashboardOverview({ routes, students, transactions }) {
  const totalRoutes = routes.length;
  const totalStudents = students.length;
  const activeBookings = transactions.filter((t) => t.status === "Success").length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = transactions.filter((t) => t.status === "Pending").length;

  // dummy analytics arrays
  const studentsPerRoute = routes.map((r) => ({
    name: r.routeName,
    count: students.filter((s) => s.route === r.routeName).length,
  }));
  const paymentStatusData = [
    { status: "Success", value: activeBookings },
    { status: "Pending", value: pendingPayments },
    { status: "Failed", value: transactions.filter((t) => t.status === "Failed").length },
  ];
  const monthlyRevenue = [
    { month: "Jan", value: 1200 },
    { month: "Feb", value: 1500 },
    { month: "Mar", value: 900 },
    { month: "Apr", value: 1800 },
    { month: "May", value: 2000 },
    { month: "Jun", value: 1700 },
  ];

  return (
    <div className="space-y-8">
      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard title="Total Routes" value={totalRoutes} />
        <StatCard title="Total Students" value={totalStudents} />
        <StatCard title="Active Bookings" value={activeBookings} />
        <StatCard title="Total Revenue" value={`$${totalRevenue}`} />
        <StatCard title="Pending Payments" value={pendingPayments} />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Students per route">
          <SimpleBarChart data={studentsPerRoute} />
        </ChartCard>
        <ChartCard title="Payment status">
          <SimplePieChart data={paymentStatusData} />
        </ChartCard>
        <ChartCard title="Monthly revenue trend">
          <SimpleLineChart data={monthlyRevenue} />
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="text-3xl font-bold text-green-700 mb-2">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="h-48 flex items-center justify-center text-gray-400">
        {children}
      </div>
    </div>
  );
}

// very rudimentary chart placeholders

function SimpleBarChart({ data }) {
  // render simple bars as divs
  return (
    <div className="w-full h-full flex items-end space-x-1">
      {data.map((d, i) => (
        <div
          key={i}
          className="bg-blue-500"
          style={{ height: `${(d.count / (Math.max(...data.map((x) => x.count)) || 1)) * 100}%`, width: '100%'}}
        ></div>
      ))}
    </div>
  );
}

function SimplePieChart({ data }) {
  // mock - just display status counts
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-sm">
      {data.map((d, i) => (
        <div key={i} className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-blue-400 inline-block rounded-full"></span>
          <span>{d.status}: {d.value}</span>
        </div>
      ))}
    </div>
  );
}

function SimpleLineChart({ data }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-sm">
      <span>Line chart placeholder</span>
    </div>
  );
}
