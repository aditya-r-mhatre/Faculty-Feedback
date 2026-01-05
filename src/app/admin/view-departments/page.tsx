"use client";
import { useEffect, useState } from "react";

export default function ViewDepartments() {
  const [depts, setDepts] = useState<any[]>([]);
  const [hods, setHods] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [selectedHod, setSelectedHod] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/dept").then((r) => r.json()),
      fetch("/api/admin/users?role=HOD").then((r) => r.json()),
    ])
      .then(([deptsRes, hodsRes]) => {
        setDepts(Array.isArray(deptsRes) ? deptsRes : []);
        setHods(Array.isArray(hodsRes) ? hodsRes : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const findHod = (hodId: string) => {
    if (!hodId) return "—";
    const h = hods.find((h) => String(h._id) === String(hodId));
    return h ? h.username : "Unknown";
  };

  const startEdit = (deptId: string, current?: string) => {
    setEditing(deptId);
    setSelectedHod((prev) => ({ ...prev, [deptId]: current || "" }));
  };

  const cancelEdit = () => setEditing(null);

  const saveHod = async (deptId: string) => {
    const hodId = selectedHod[deptId];
    if (!hodId) return alert("Please select a HOD");

    try {
      const res = await fetch("/api/admin/dept", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deptId, hodId }),
      });

      if (!res.ok) throw new Error("Update failed");

      const [deptsRes, hodsRes] = await Promise.all([
        fetch("/api/admin/dept").then((r) => r.json()),
        fetch("/api/admin/users?role=HOD").then((r) => r.json()),
      ]);

      setDepts(deptsRes);
      setHods(hodsRes);
      setEditing(null);
    } catch (e: any) {
      alert(e.message || "Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Loading departments…</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Departments & Linked HODs
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        View departments and update their assigned Head of Department.
      </p>

      {/* Empty State */}
      {depts.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-gray-500">
          No departments found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Department
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Current HOD
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {depts.map((d) => (
                <tr
                  key={d._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {d.name}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {editing === d._id ? (
                      <select
                        value={selectedHod[d._id] || ""}
                        onChange={(e) =>
                          setSelectedHod((prev) => ({
                            ...prev,
                            [d._id]: e.target.value,
                          }))
                        }
                        className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select HOD</option>
                        {hods.map((h) => (
                          <option key={h._id} value={h._id}>
                            {h.username}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{findHod(d.hodId)}</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {editing === d._id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => saveHod(d._id)}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(d._id, d.hodId)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                      >
                        Change HOD
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
