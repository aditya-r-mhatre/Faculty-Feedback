"use client";
import { useEffect, useState } from "react";

export default function ViewForms() {
  const [forms, setForms] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [deptId, setDeptId] = useState("");
  const [programId, setProgramId] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dept")
      .then((r) => r.json())
      .then((d) => setDepts(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!deptId) {
      setPrograms([]);
      return;
    }
    fetch(`/api/admin/program?deptId=${deptId}`)
      .then((r) => r.json())
      .then((p) => setPrograms(Array.isArray(p) ? p : []))
      .catch(() => {});
  }, [deptId]);

  const load = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (deptId) qs.set("deptId", deptId);
    if (programId) qs.set("programId", programId);
    if (year) qs.set("academicYear", year);

    const res = await fetch("/api/admin/forms?" + qs.toString());
    const data = await res.json();
    setForms(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch("/api/admin/forms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });

    if (res.ok) {
      load();
    } else {
      const err = await res.json();
      alert("Failed: " + (err?.error || "Unknown error"));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Manage Feedback Forms
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        View, filter, and activate feedback forms across departments.
      </p>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              {depts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="FE">FE</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
              <option value="GRAD">GRAD</option>
            </select>
          </div>

          <button
            onClick={load}
            className="h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-600">Loading feedback forms…</div>
      ) : forms.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-gray-500">
          No feedback forms found.
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Left */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Subject:{" "}
                  <span className="font-medium">
                    {f.subjectId?.name || "N/A"}
                  </span>{" "}
                  · Year: {f.academicYear} · Dept:{" "}
                  {f.deptId?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Faculty: {f.facultyName || "Assigned Faculty"}
                </p>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    f.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {f.isActive ? "Active" : "Inactive"}
                </span>

                <button
                  onClick={() => toggleActive(f._id, f.isActive)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Toggle Active
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
