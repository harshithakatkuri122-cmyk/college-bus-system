export default function Placeholder({ title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
