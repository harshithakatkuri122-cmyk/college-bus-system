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

export default function ReportsSection({ routes, students, transactions }) {
  const occupancy = routes.map((r) => ({
    route: r.routeName,
    percent: Math.round((r.bookedSeats / r.capacity) * 100) || 0,
  }));

  const revenuePerRoute = routes.map((r) => ({
    route: r.routeName,
    revenue: transactions
      .filter((t) => t.route === r.routeName && t.status === "Success")
      .reduce((sum, t) => sum + t.amount, 0),
  }));

  const monthlyRevenue = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1500 },
    { month: "Mar", revenue: 900 },
    { month: "Apr", revenue: 1800 },
    { month: "May", revenue: 2000 },
    { month: "Jun", revenue: 1700 },
  ];

  const studentsPerRoute = routes.map((r) => ({
    name: r.routeName,
    count: students.filter((s) => s.route === r.routeName).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Route Occupancy %">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={occupancy}>
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percent" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Per Route">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenuePerRoute}>
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Revenue Trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Students Per Route">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={studentsPerRoute}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
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
