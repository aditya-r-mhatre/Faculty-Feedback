"use client";
import { useState, useEffect } from "react";

export default function HODAnalytics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calls the API route we will define in Step 2
    fetch("/api/hod/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center font-medium">Loading Departmental Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Faculty Performance Overview</h2>
      </div>

      <div className="grid gap-6">
        {stats.length > 0 ? (
          stats.map((item: any) => (
            <div key={item._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 capitalize">
                    {item.details?.subjectName || "Unnamed Subject"}
                  </h3>
                  <p className="text-gray-600 font-medium">Faculty: {item.facultyName}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                      Submissions: {item.totalSubmissions}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-indigo-600">
                    {Number(item.averageRating).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Avg Rating</p>
                </div>
              </div>
              
              {/* Performance Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round((item.averageRating / 5) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-indigo-500 h-3 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${(item.averageRating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <p className="text-gray-400 text-lg">No feedback responses found for your department yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}