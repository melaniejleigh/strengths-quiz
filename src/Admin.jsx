import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* Theme name lookup */
var THEME_NAMES = {
  achiever:"Achiever",arranger:"Arranger",belief:"Belief",consistency:"Consistency",
  deliberative:"Deliberative",discipline:"Discipline",focus:"Focus",responsibility:"Responsibility",
  restorative:"Restorative",activator:"Activator",command:"Command",communication:"Communication",
  competition:"Competition",maximizer:"Maximizer",self_assurance:"Self-Assurance",
  significance:"Significance",woo:"Woo",adaptability:"Adaptability",connectedness:"Connectedness",
  developer:"Developer",empathy:"Empathy",harmony:"Harmony",includer:"Includer",
  individualization:"Individualization",positivity:"Positivity",relator:"Relator",
  analytical:"Analytical",context:"Context",futuristic:"Futuristic",ideation:"Ideation",
  input:"Input",intellection:"Intellection",learner:"Learner",strategic:"Strategic"
};

var DOMAIN_NAMES = {
  executing:"Executing",influencing:"Influencing",
  relationship_building:"Relationship Building",strategic_thinking:"Strategic Thinking"
};

var DOMAIN_COLORS = {
  executing:"#7C3AED",influencing:"#DC2626",
  relationship_building:"#2563EB",strategic_thinking:"#059669"
};

var THEME_TO_DOMAIN = {
  achiever:"executing",arranger:"executing",belief:"executing",consistency:"executing",
  deliberative:"executing",discipline:"executing",focus:"executing",responsibility:"executing",
  restorative:"executing",activator:"influencing",command:"influencing",communication:"influencing",
  competition:"influencing",maximizer:"influencing",self_assurance:"influencing",
  significance:"influencing",woo:"influencing",adaptability:"relationship_building",
  connectedness:"relationship_building",developer:"relationship_building",empathy:"relationship_building",
  harmony:"relationship_building",includer:"relationship_building",individualization:"relationship_building",
  positivity:"relationship_building",relator:"relationship_building",analytical:"strategic_thinking",
  context:"strategic_thinking",futuristic:"strategic_thinking",ideation:"strategic_thinking",
  input:"strategic_thinking",intellection:"strategic_thinking",learner:"strategic_thinking",
  strategic:"strategic_thinking"
};

function exportCSV(results) {
  var headers = ["Name","Email","Completed","Dominant Domain"];
  for (var i = 1; i <= 34; i++) headers.push("Rank " + i);
  headers.push("Executing Avg","Influencing Avg","Relationship Building Avg","Strategic Thinking Avg");

  var rows = results.map(function(r) {
    var row = [
      r.name,
      r.email,
      new Date(r.created_at).toLocaleDateString(),
    ];
    // Dominant domain
    var ds = r.domain_scores || {};
    var domArr = Object.keys(ds).map(function(k) { return { id: k, avg: ds[k].avg || 0 }; });
    domArr.sort(function(a, b) { return b.avg - a.avg; });
    row.push(domArr.length > 0 ? (DOMAIN_NAMES[domArr[0].id] || domArr[0].id) : "");

    // All 34 ranked
    var rankings = r.rankings || [];
    for (var i = 0; i < 34; i++) {
      row.push(rankings[i] ? (THEME_NAMES[rankings[i].id] || rankings[i].id) : "");
    }
    // Domain avgs
    ["executing","influencing","relationship_building","strategic_thinking"].forEach(function(d) {
      row.push(ds[d] ? ds[d].avg : "");
    });
    return row;
  });

  var csv = [headers].concat(rows).map(function(r) {
    return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
  }).join("\n");

  var blob = new Blob([csv], { type: "text/csv" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "strengths-results-" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [session, setSession] = useState(null);
  var [loading, setLoading] = useState(true);
  var [results, setResults] = useState([]);
  var [expanded, setExpanded] = useState(null);
  var [error, setError] = useState("");
  var [sortBy, setSortBy] = useState("date");
  var [filterDomain, setFilterDomain] = useState("all");

  useEffect(function() {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(function(res) {
      setSession(res.data.session);
      setLoading(false);
    });
    var { data: listener } = supabase.auth.onAuthStateChange(function(_event, sess) {
      setSession(sess);
    });
    return function() { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(function() {
    if (session) fetchResults();
  }, [session]);

  async function fetchResults() {
    if (!supabase) return;
    var { data, error: err } = await supabase
      .from("quiz_results")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) { setError(err.message); return; }
    setResults(data || []);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!supabase) { setError("Supabase is not configured. Check your environment variables."); return; }
    var { error: err } = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (err) setError(err.message);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setResults([]);
  }

  function getDominantDomain(r) {
    var ds = r.domain_scores || {};
    var best = null;
    Object.keys(ds).forEach(function(k) {
      if (!best || ds[k].avg > ds[best].avg) best = k;
    });
    return best;
  }

  function getFiltered() {
    var filtered = results;
    if (filterDomain !== "all") {
      filtered = filtered.filter(function(r) { return getDominantDomain(r) === filterDomain; });
    }
    if (sortBy === "name") {
      filtered = filtered.slice().sort(function(a, b) { return (a.name || "").localeCompare(b.name || ""); });
    }
    return filtered;
  }

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading...</div>;
  }

  // Login screen
  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f8f7fc" }}>
        <div style={{ width: 360, padding: 32, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: "0 0 4px", textAlign: "center" }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: "#9999aa", margin: "0 0 24px", textAlign: "center" }}>Sign in to view quiz results</p>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={function(e) { setEmail(e.target.value); }}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e8e6f0", fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" }} />
            <input type="password" placeholder="Password" value={password} onChange={function(e) { setPassword(e.target.value); }}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e8e6f0", fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none" }} />
            {error && <p style={{ fontSize: 13, color: "#DC2626", margin: "0 0 12px" }}>{error}</p>}
            <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#6D28D9", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Sign In</button>
          </form>
          <p style={{ fontSize: 11, color: "#9999aa", margin: "16px 0 0", textAlign: "center" }}>
            <a href="#/" style={{ color: "#6D28D9" }}>Back to quiz</a>
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  var filtered = getFiltered();

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f8f7fc", color: "#1a1a2e" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e6f0", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#1a1a2e" }}>Strengths Discovery</h1>
          <p style={{ fontSize: 12, color: "#9999aa", margin: 0 }}>Admin Dashboard</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={function() { exportCSV(results); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e8e6f0", background: "#fff", color: "#1a1a2e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Export CSV</button>
          <button onClick={function() { fetchResults(); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e8e6f0", background: "#fff", color: "#1a1a2e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Refresh</button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#6D28D9", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140, padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e8e6f0" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#6D28D9" }}>{results.length}</div>
            <div style={{ fontSize: 12, color: "#9999aa" }}>Total Responses</div>
          </div>
          {Object.keys(DOMAIN_NAMES).map(function(d) {
            var count = results.filter(function(r) { return getDominantDomain(r) === d; }).length;
            return (
              <div key={d} style={{ flex: 1, minWidth: 140, padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e8e6f0" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: DOMAIN_COLORS[d] }}>{count}</div>
                <div style={{ fontSize: 12, color: "#9999aa" }}>{DOMAIN_NAMES[d]}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <select value={filterDomain} onChange={function(e) { setFilterDomain(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e8e6f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
            <option value="all">All Domains</option>
            {Object.keys(DOMAIN_NAMES).map(function(d) { return <option key={d} value={d}>{DOMAIN_NAMES[d]}</option>; })}
          </select>
          <select value={sortBy} onChange={function(e) { setSortBy(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e8e6f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
          <span style={{ fontSize: 12, color: "#9999aa" }}>Showing {filtered.length} of {results.length}</span>
        </div>

        {/* Results table */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #e8e6f0" }}>
            <p style={{ fontSize: 15, color: "#9999aa" }}>No results yet. Share the quiz link to start collecting responses.</p>
          </div>
        )}

        {filtered.map(function(r) {
          var isExpanded = expanded === r.id;
          var dom = getDominantDomain(r);
          var rankings = r.rankings || [];
          var top5 = rankings.slice(0, 5);

          return (
            <div key={r.id} style={{ marginBottom: 8, borderRadius: 12, overflow: "hidden", border: "1px solid #e8e6f0", background: "#fff" }}>
              <div onClick={function() { setExpanded(isExpanded ? null : r.id); }}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", cursor: "pointer" }}>
                <div style={{ flex: "0 0 auto" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: dom ? DOMAIN_COLORS[dom] : "#ccc" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9999aa" }}>{r.email}</div>
                </div>
                <div style={{ flex: "0 0 auto", textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: dom ? DOMAIN_COLORS[dom] : "#999", fontWeight: 600 }}>{dom ? DOMAIN_NAMES[dom] : ""}</div>
                  <div style={{ fontSize: 11, color: "#ccc" }}>{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ flex: "0 0 auto", display: "flex", gap: 4, alignItems: "center" }}>
                  {top5.map(function(t, i) {
                    var d = THEME_TO_DOMAIN[t.id];
                    return <div key={i} style={{ width: 6, height: 18, borderRadius: 2, background: d ? DOMAIN_COLORS[d] : "#ccc" }} />;
                  })}
                </div>
                <div style={{ fontSize: 18, color: "#ccc", flex: "0 0 20px", textAlign: "center" }}>{isExpanded ? "\u2212" : "+"}</div>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 18px 18px", borderTop: "1px solid #e8e6f0" }}>
                  {/* Top 5 */}
                  <div style={{ padding: "14px 0" }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9999aa", marginBottom: 10, fontWeight: 600 }}>Top 5</div>
                    {top5.map(function(t, i) {
                      var d = THEME_TO_DOMAIN[t.id];
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: d ? DOMAIN_COLORS[d] : "#ccc", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{THEME_NAMES[t.id] || t.id}</span>
                          <span style={{ fontSize: 11, color: d ? DOMAIN_COLORS[d] : "#999" }}>{d ? DOMAIN_NAMES[d] : ""}</span>
                          <span style={{ fontSize: 11, color: "#ccc", marginLeft: "auto" }}>{t.score}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Domain scores */}
                  <div style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9999aa", marginBottom: 10, fontWeight: 600 }}>Domain Scores</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.keys(r.domain_scores || {}).map(function(d) {
                        var ds = r.domain_scores[d];
                        return (
                          <div key={d} style={{ flex: 1, minWidth: 100, padding: "8px 12px", borderRadius: 8, background: "#f8f7fc", textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: DOMAIN_COLORS[d] || "#333" }}>{ds.avg}</div>
                            <div style={{ fontSize: 10, color: "#9999aa" }}>{DOMAIN_NAMES[d] || d}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full 34 */}
                  <div style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9999aa", marginBottom: 10, fontWeight: 600 }}>Full 34 Ranking</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {rankings.map(function(t, i) {
                        var d = THEME_TO_DOMAIN[t.id];
                        return (
                          <div key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: i < 5 ? (d ? DOMAIN_COLORS[d] + "18" : "#f0f0f0") : "#f8f7fc", color: i < 5 ? (d ? DOMAIN_COLORS[d] : "#333") : "#999", fontWeight: i < 5 ? 600 : 400, border: "1px solid " + (i < 5 ? (d ? DOMAIN_COLORS[d] + "33" : "#eee") : "#e8e6f0") }}>
                            {i + 1}. {THEME_NAMES[t.id] || t.id}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
