import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function DashboardOverview({ routes, students, transactions }) {
  const totalRoutes = routes.length;
  const totalStudents = students.length;
  const activeBookings = transactions.filter((t) => t.status === "Success").length;
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = transactions.filter((t) => t.status === "Pending").length;

  const studentsPerRoute = routes.map((r) => ({
    name: r.routeName,
    count: students.filter((s) => s.route === r.routeName).length,
  }));

  const paymentStatusData = [
    { name: "Success", value: activeBookings },
    { name: "Pending", value: pendingPayments },
    { name: "Failed", value: transactions.filter((t) => t.status === "Failed").length },
  ];

  const monthlyRevenue = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1500 },
    { month: "Mar", revenue: 900 },
    { month: "Apr", revenue: 1800 },
    { month: "May", revenue: 2000 },
    { month: "Jun", revenue: 1700 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total Routes" value={totalRoutes} icon="fas fa-route" change={+8} />
        <StatCard title="Total Students" value={totalStudents} icon="fas fa-users" change={+4} />
        <StatCard title="Active Bookings" value={activeBookings} icon="fas fa-bus" change={+12} />
        <StatCard title="Revenue" value={`$${totalRevenue}`} icon="fas fa-dollar-sign" change={+6} />
        <StatCard title="Pending Payments" value={pendingPayments} icon="fas fa-clock" change={-3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Students per Route">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={studentsPerRoute}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#16a34a" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={paymentStatusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4}>
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index===0?"#16a34a": index===1?"#f59e0b":"#ef4444"} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, change }) {
  const positive = change >= 0;
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className="p-3 bg-gray-100 rounded-lg text-gray-700">
        <i className={`${icon} text-xl`} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </div>
      <div className={`text-sm font-semibold ${positive?"text-green-600":"text-red-600"}`}>
        {positive?"↑":"↓"} {Math.abs(change)}%
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
