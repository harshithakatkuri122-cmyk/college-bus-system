import React from "react";

export default function ReportsSection({ routes, students, transactions }) {
  // dummy analytics calculation
  const occupancy = routes.map((r) => ({
    route: r.routeName,
    percent: Math.round((r.bookedSeats / r.capacity) * 100) || 0,
  }));
  const revenuePerRoute = routes.map((r) => ({
    route: r.routeName,
    revenue: transactions
      .filter((t) => t.route === r.routeName)
      .reduce((sum, t) => sum + t.amount, 0),
  }));
  const studentsPerRoute = routes.map((r) => ({
    route: r.routeName,
    count: students.filter((s) => s.route === r.routeName).length,
  }));

  return (
    <div className="space-y-8">
      <Section title="Route occupancy %">
        <SimpleBarChart data={occupancy} labelKey="route" valueKey="percent" />
      </Section>
      <Section title="Revenue per route">
        <SimpleBarChart data={revenuePerRoute} labelKey="route" valueKey="revenue" />
      </Section>
      <Section title="Monthly revenue">
        <div className="h-32 flex items-center justify-center text-gray-400">
          Line chart placeholder
        </div>
      </Section>
      <Section title="Students per route">
        <SimpleBarChart data={studentsPerRoute} labelKey="route" valueKey="count" />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SimpleBarChart({ data, labelKey, valueKey }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="w-full h-32 flex items-end space-x-2">
      {data.map((d, i) => (
        <div
          key={i}
          className="bg-green-500"
          style={{ height: `${(d[valueKey] / (max || 1)) * 100}%`, width: '100%'}}
          title={`${d[labelKey]}: ${d[valueKey]}`}
        ></div>
      ))}
    </div>
  );
}
