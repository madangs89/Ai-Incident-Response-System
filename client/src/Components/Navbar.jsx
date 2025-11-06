export default function Navbar() {
  return (
    <div className="fixed left-64 top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="Search incidents..."
        className="border rounded-md px-3 py-2 w-80"
      />
      <div className="flex items-center space-x-4">
        <span className="cursor-pointer">🔔</span>
        <span className="cursor-pointer">👤</span>
      </div>
    </div>
  );
}
