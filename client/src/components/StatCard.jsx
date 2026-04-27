import React from 'react';

// A reusable card to show a single stat (e.g. Total Income)
// Props:
//   title  - label like "Total Income"
//   value  - the number to show like "₹5000"
//   icon   - a Lucide icon component
//   color  - Tailwind color classes for the icon background/text
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
      {/* Icon Circle */}
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Text */}
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
