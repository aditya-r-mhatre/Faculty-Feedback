"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function SetupDept() {
  const [name, setName] = useState("");
  const [hodUsername, setHodUsername] = useState("");
  const [hodUsers, setHodUsers] = useState<Array<{ _id: string; username: string }>>([]);
  
  const router = useRouter();

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/dept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hodUsername }),
    });
    if (res.ok) {
      alert("Department created and HOD linked!");
      router.push("/admin/dashboard");
    }
  };

  useEffect(() => {
    // Fetch users with role=HOD to populate select
    const fetchHods = async () => {
      try {
        const res = await fetch('/api/admin/users?role=HOD');
        if (!res.ok) return;
        const data = await res.json();
        setHodUsers(data || []);
        if (data && data.length > 0) setHodUsername(data[0].username);
      } catch (err) {
        console.error('Failed to fetch HOD users', err);
      }
    };
    fetchHods();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg border-t-4 border-indigo-600">
      <h2 className="text-2xl font-bold mb-6 text-black">Department Management</h2>
      <form onSubmit={handleCreateDept} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">Department Name</label>
          <input 
            type="text" required className="w-full border p-2 rounded"
            placeholder="e.g. Computer Engineering"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-black">Assign HOD</label>
          {hodUsers.length === 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">No HOD users found. Please create a HOD user first.</p>
              <select className="w-full border p-2 rounded bg-gray-50" disabled>
                <option>No HODs available</option>
              </select>
            </div>
          ) : (
            <select
              required
              value={hodUsername}
              onChange={(e) => setHodUsername(e.target.value)}
              className="w-full border p-2 rounded bg-white"
            >
              {hodUsers.map((u) => (
                <option key={u._id} value={u.username}>{u.username}</option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-400 mt-1 italic">Note: The selected user will be set to HOD and linked to the department.</p>
        </div>

        <button className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700">
          Create Department & Link HOD
        </button>
      </form>
    </div>
  );
}