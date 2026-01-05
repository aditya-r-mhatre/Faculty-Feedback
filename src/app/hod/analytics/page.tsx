"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function HODAnalytics() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const [hodName, setHodName] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string | null>(null);

  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<any[]>([]);

  /* Fetch analytics */
  useEffect(() => {
    fetch("/api/hod/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Fetch HOD + Dept info */
  useEffect(() => {
    if (session?.user) {
      setHodName(session.user.username || null);
      const deptId = session.user.deptId;

      if (deptId) {
        fetch("/api/admin/dept")
          .then((r) => r.json())
          .then((depts) => {
            const found = Array.isArray(depts)
              ? depts.find((d: any) => String(d._id) === String(deptId))
              : null;
            if (found) setDeptName(found.name || null);
          })
          .catch(() => {});
      }
    }
  }, [session]);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-600 font-medium">
        Loading Departmental Analytics…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* PAGE HEADER */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900">
          Faculty Performance Overview
        </h1>

        {/* HOD + DEPT HIGHLIGHT */}
        <div className="mt-4 inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold uppercase">
            {hodName?.[0] || "H"}
          </div>

          <div className="text-sm">
            <div className="font-semibold text-indigo-900">
              {hodName || "HOD"}
            </div>
            <div className="text-gray-600">
              Department of{" "}
              <span className="font-medium">{deptName || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid gap-6">
        {stats.length > 0 ? (
          stats.map((item: any) => {
            const avg =
              item.overallAverage ??
              item.averageRating ??
              0;

            const progress = Math.round((avg / 5) * 100);

            const barColor =
              avg >= 4
                ? "bg-green-500"
                : avg >= 3
                ? "bg-indigo-500"
                : "bg-yellow-500";

            return (
              <div
                key={item.formId || item._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                {/* TOP */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-indigo-900">
                      {item.title ||
                        item.details?.subjectName ||
                        "Unnamed Subject"}
                    </h3>

                    <p className="text-gray-600 font-medium">
                      Faculty: {item.facultyName}
                    </p>

                    <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                      Submissions: {item.totalSubmissions}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-extrabold text-indigo-700">
                      {avg.toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-500">
                      Average Score
                    </div>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* QUESTIONS */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    Question-wise Averages
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(item.perQuestionAverages || []).map(
                      (q: any, idx: number) => {
                        const qi = parseInt(String(q.key), 10);
                        const qText =
                          item.questions?.[qi]?.questionText ||
                          `Question ${qi + 1}`;

                        return (
                          <div
                            key={q.key || idx}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                          >
                            <span className="text-sm text-gray-700">
                              {qText}
                            </span>
                            <span className="text-sm font-bold text-indigo-600">
                              {Number(q.avg).toFixed(2)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* COMMENTS */}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Comments: {(item.comments || []).length}
                  </span>

                  <button
                    className="px-4 py-2 bg-white text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-50 font-medium"
                    onClick={() => {
                      setSelectedComments(item.comments || []);
                      setShowCommentsFor(item.formId || item._id);
                    }}
                  >
                    View Comments
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <p className="text-gray-400 text-lg">
              No feedback responses found for your department yet.
            </p>
          </div>
        )}
      </div>

      {/* COMMENTS MODAL */}
      {showCommentsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCommentsFor(null)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-11/12 max-w-2xl p-6 z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Student Comments</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCommentsFor(null)}
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-auto space-y-3">
              {selectedComments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No comments available.
                </p>
              ) : (
                selectedComments.map((c: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{c.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
