import { useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowDownRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardCheck,
  Download, FileText, Filter, LayoutDashboard, ListChecks, Menu, MessageSquareText,
  MoreHorizontal, Plus, Search, ShieldCheck, Sparkles, Target, Users, X,
} from "lucide-react";
import { errorBreakdown, evaluations, qmsumExamples, rubric, type Evaluation } from "./data";

type NavItem = "Overview" | "Evaluations" | "Rubric & guidelines" | "Rater calibration" | "Error taxonomy";

const navigation: { label: NavItem; icon: typeof LayoutDashboard; count?: string }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Evaluations", icon: ClipboardCheck, count: "128" },
  { label: "Rubric & guidelines", icon: ListChecks },
  { label: "Rater calibration", icon: Users },
  { label: "Error taxonomy", icon: Activity },
];

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("Overview");
  const [activeTab, setActiveTab] = useState("All evaluations");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [evaluationList, setEvaluationList] = useState([...evaluations, ...qmsumExamples]);
  const [selected, setSelected] = useState<Evaluation | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 7 days");

  const filteredEvaluations = useMemo(() => evaluationList.filter((item) => {
    const matchesQuery = `${item.title} ${item.team} ${item.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = activeTab === "All evaluations"
      || (activeTab === "QMSum dataset" && item.dataset?.name === "QMSum")
      || (activeTab === "Needs attention" && item.status === "Needs attention")
      || (activeTab === "In review" && item.status === "In review");
    return matchesQuery && matchesTab;
  }), [activeTab, evaluationList, query]);
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filteredEvaluations.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleEvaluations = filteredEvaluations.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstVisible = filteredEvaluations.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisible = Math.min(currentPage * pageSize, filteredEvaluations.length);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const exportCsv = () => {
    const headers = ["ID", "Meeting / topic", "Team / domain", "Date / split", "Model / source", "Score", "Status", "Raters", "Agreement", "Errors", "Reference query", "Summary"];
    const rows = filteredEvaluations.map((item) => [
      item.id, item.title, item.team, item.date, item.dataset?.name ?? item.model, item.score ?? "",
      item.status, item.raters ?? "", item.agreement === null ? "" : `${Math.round(item.agreement * 100)}%`,
      item.errors.join("; "), item.dataset?.query ?? "", item.summary,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "meeting-summary-evaluations.csv";
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Evaluation data exported as CSV");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><MessageSquareText size={17} strokeWidth={2.2} /></div>
          <span className="brand-name">briefly<span className="brand-dot">.</span></span>
          <button className="icon-btn sidebar-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy"><strong>Northstar</strong><span>Research workspace</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-link ${activeNav === label ? "nav-active" : ""}`} onClick={() => { setActiveNav(label); setMenuOpen(false); }}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="side-label project-label">PROJECTS <button aria-label="Add project" onClick={() => showNotice("Project creation is coming soon")}><Plus size={15} /></button></div>
        <button className="project-link"><span className="project-dot dot-teal" />Meeting summaries<span className="project-more"><MoreHorizontal size={17} /></span></button>
        <button className="project-link"><span className="project-dot dot-yellow" />Support call notes</button>
        <button className="project-link"><span className="project-dot dot-purple" />Sales discovery</button>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Need a hand?</strong>
            <p>Explore the evaluation guide and get your team started.</p>
            <button onClick={() => setActiveNav("Rubric & guidelines")}>View guide <ArrowUpRight size={13} /></button>
          </div>
          <button className="profile-row" onClick={() => showNotice("Account settings are coming soon")}>
            <div className="profile-avatar">JD</div>
            <div className="profile-copy"><strong>Jordan Davis</strong><span>Admin</span></div>
            <MoreHorizontal size={17} className="muted-icon" />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><button className="mobile-menu icon-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={19} /></button><span>Projects</span><ChevronRight size={14} /><strong>Meeting summaries</strong></div>
          <div className="topbar-actions">
            <button className="topbar-search" onClick={() => document.getElementById("evaluation-search")?.focus()}><Search size={15} /><span>Search anything...</span><kbd>⌘ K</kbd></button>
            <button className="icon-btn notification-btn" aria-label="Notifications" onClick={() => showNotice("You're all caught up")}><Bell size={17} /><i /></button>
            <div className="topbar-avatar">JD</div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="live-dot" /> EVALUATION WORKSPACE <span className="demo-tag">QMSUM + DEMO METRICS</span></div>
              <h1>{activeNav === "Overview" ? "Meeting summaries" : activeNav}</h1>
              <p className="page-subtitle">{pageSubtitle(activeNav)}</p>
            </div>
            <div className="heading-actions">
              <button className="button button-secondary" onClick={exportCsv}><Download size={15} /> Export</button>
              <button className="button button-primary" onClick={() => setShowNew(true)}><Plus size={16} /> New evaluation</button>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Evaluation summary metrics">
            <MetricCard title="Summaries evaluated" value="128" change="+12.8%" caption="vs. previous 7 days" icon={<FileText size={17} />} trend="up" />
            <MetricCard title="Average rubric score" value="4.1<span> / 5</span>" change="+0.4 pts" caption="since calibration" icon={<Target size={17} />} trend="up" progress={82} />
            <MetricCard title="Inter-rater agreement" value="0.71" change="+0.19" caption="κ · target ≥ 0.70" icon={<Users size={17} />} trend="up" progress={71} />
            <MetricCard title="Flagged for review" value="8" change="−3 this week" caption="across all summaries" icon={<ShieldCheck size={17} />} trend="down" />
          </section>

          <section className="insights-grid">
            <article className="panel score-panel">
              <div className="panel-heading">
                <div><h2>Quality over time</h2><p>Average rubric score across all raters</p></div>
                <button className="select-button" onClick={() => setDateRange(dateRange === "Last 7 days" ? "Last 30 days" : "Last 7 days")}>{dateRange}<ChevronDown size={14} /></button>
              </div>
              <div className="chart-legend"><span><i className="legend-dot legend-purple" /> Quality score</span><span><i className="legend-dot legend-grey" /> Target score</span></div>
              <div className="chart-wrap" role="img" aria-label={`Line chart showing summary quality over the ${dateRange.toLowerCase()}, trending upward to 4.1 out of 5`}>
                <div className="chart-y-labels"><span>5.0</span><span>4.0</span><span>3.0</span><span>2.0</span></div>
                <div className="chart-content">
                  <div className="chart-gridline line-5" /><div className="chart-gridline line-4" /><div className="chart-gridline line-3" /><div className="chart-gridline line-2" />
                  <div className="target-line" />
                  <svg className="quality-chart" viewBox="0 0 640 160" preserveAspectRatio="none" aria-hidden="true">
                    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7866e8" stopOpacity=".19" /><stop offset="100%" stopColor="#7866e8" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0,111 C35,105 43,91 80,96 S131,82 160,91 S210,72 240,81 S292,54 320,64 S370,50 400,57 S450,34 480,45 S532,29 560,36 S612,18 640,22 L640,160 L0,160Z" fill="url(#chartFill)" />
                    <path d="M0,111 C35,105 43,91 80,96 S131,82 160,91 S210,72 240,81 S292,54 320,64 S370,50 400,57 S450,34 480,45 S532,29 560,36 S612,18 640,22" fill="none" stroke="#7665df" strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
                    <circle cx="640" cy="22" r="4.5" fill="#7665df" stroke="white" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="chart-x-labels"><span>Nov 08</span><span>Nov 09</span><span>Nov 10</span><span>Nov 11</span><span>Nov 12</span><span>Nov 13</span><span>Nov 14</span></div>
                  <div className="chart-tooltip"><strong>4.1</strong><span>Nov 14</span></div>
                </div>
              </div>
            </article>
            <article className="panel rubric-panel">
              <div className="panel-heading">
                <div><h2>Rubric dimensions</h2><p>Average score by quality dimension</p></div>
                <button className="icon-btn small-icon-btn" aria-label="Rubric options" onClick={() => setActiveNav("Rubric & guidelines")}><MoreHorizontal size={19} /></button>
              </div>
              <div className="rubric-list">
                {rubric.map((item) => <div className="rubric-row" key={item.label}>
                  <div className="rubric-copy"><strong>{item.label}</strong><span>{item.detail}</span></div>
                  <div className="rubric-score-line"><div className="progress-track"><div className={`progress-fill fill-${item.color}`} style={{ width: `${item.score * 20}%` }} /></div><strong>{item.score.toFixed(1)}</strong></div>
                </div>)}
              </div>
              <button className="text-link" onClick={() => setActiveNav("Rubric & guidelines")}>View scoring rubric <ArrowUpRight size={13} /></button>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel evaluations-panel">
              <div className="panel-heading table-panel-heading">
                <div><h2>Recent evaluations &amp; references</h2><p>Demo reviews alongside QMSum human reference summaries</p></div>
                <button className="button button-secondary button-compact" onClick={exportCsv}><Download size={14} /> Export</button>
              </div>
              <div className="table-controls">
                <div className="tabs" role="tablist" aria-label="Filter evaluations">
                  {["All evaluations", "QMSum dataset", "Needs attention", "In review"].map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "tab-active" : ""} onClick={() => { setActiveTab(tab); setPage(1); }}>{tab}{tab === "Needs attention" && <span className="tab-count">8</span>}{tab === "QMSum dataset" && <span className="tab-count">{qmsumExamples.length}</span>}</button>)}
                </div>
                <div className="table-tools">
                  <label className="table-search"><Search size={14} /><input id="evaluation-search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search meetings" /></label>
                  <button className="filter-button" onClick={() => showNotice("Showing evaluations from the last 7 days")}><Filter size={14} /><span>Filter</span><span className="filter-count">2</span></button>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>MEETING</th><th>QUALITY SCORE</th><th>AGREEMENT</th><th>ERRORS</th><th>STATUS</th><th><span className="sr-only">Open evaluation</span></th></tr></thead>
                  <tbody>
                    {visibleEvaluations.map((item) => <tr key={item.id} onClick={() => setSelected(item)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelected(item); }}>
                      <td><div className="meeting-cell"><div className={`meeting-icon meeting-${item.team.toLowerCase()}`}><CalendarDays size={15} /></div><div><strong>{item.title}</strong><span>{item.team} <i /> {item.date}</span></div></div></td>
                      <td>{item.score === null ? <span className="reference-cell">Human ref.</span> : <div className="score-cell"><strong>{item.score.toFixed(1)}</strong><span className="score-outof">/ 5</span><ScoreDots score={item.score} /></div>}</td>
                      <td>{item.agreement === null ? <span className="not-rated">—</span> : <div className="agreement-cell"><span className={`agreement-dot ${item.agreement < .65 ? "agreement-low" : ""}`} />{item.agreement.toFixed(2)}</div>}</td>
                      <td>{item.dataset ? <span className="not-rated">Not rated</span> : item.errors.length ? <span className={`error-pill ${item.errors.length > 1 ? "error-pill-high" : ""}`}>{item.errors.length} {item.errors.length === 1 ? "flag" : "flags"}</span> : <span className="no-errors"><Check size={13} /> None</span>}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td><button className="row-arrow" aria-label={`View ${item.title}`} onClick={(event) => { event.stopPropagation(); setSelected(item); }}><ChevronRight size={16} /></button></td>
                    </tr>)}
                    {!visibleEvaluations.length && <tr><td colSpan={6} className="empty-state">No evaluations match. Try another search or filter.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer"><span>Showing <strong>{firstVisible}–{lastVisible}</strong> of <strong>{filteredEvaluations.length}</strong> records</span><div className="pagination"><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button><span className="page-indicator">Page {currentPage} of {pageCount}</span><button aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button></div></div>
            </article>

            <aside className="right-rail">
              <article className="panel errors-panel">
                <div className="panel-heading compact-heading"><div><h2>Top error categories</h2><p>45 flags across 128 summaries</p></div><button className="icon-btn small-icon-btn" aria-label="View error taxonomy" onClick={() => setActiveNav("Error taxonomy")}><ArrowUpRight size={16} /></button></div>
                <div className="error-list">{errorBreakdown.map((error, index) => <div className="error-row" key={error.label}><span className={`error-rank rank-${index + 1}`}>{String(index + 1).padStart(2, "0")}</span><span className={`error-dot error-${error.color}`} /><span className="error-label">{error.label}</span><span className="error-count">{error.count}</span></div>)}</div>
                <button className="text-link" onClick={() => setActiveNav("Error taxonomy")}>Explore error taxonomy <ArrowUpRight size={13} /></button>
              </article>
              <article className="calibration-card">
                <div className="calibration-top"><div className="calibration-icon"><Sparkles size={16} /></div><span className="calibration-status"><span /> ON TRACK</span></div>
                <h3>Rater calibration</h3>
                <p>Agreement has improved <strong>+0.19</strong> since your last calibration session.</p>
                <div className="calibration-progress"><div><span>Current agreement</span><strong>0.71</strong></div><div className="progress-track"><div className="progress-fill fill-mint" style={{ width: "71%" }} /></div><div className="calibration-foot"><span>0.00</span><span>Target 0.70</span><span>1.00</span></div></div>
                <button onClick={() => setActiveNav("Rater calibration")}>View calibration <ArrowUpRight size={13} /></button>
              </article>
              <div className="info-note"><div><ShieldCheck size={15} /></div><p><strong>Human-first evaluation.</strong> Scores reflect your team's rubric, not automated judgments.</p></div>
            </aside>
          </section>
          <footer className="app-footer"><span>Briefly Evaluation Framework <span>·</span> QMSum test references + illustrative evaluation metrics</span><span><span className="footer-live" /> All changes saved</span></footer>
        </div>
      </main>

      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      {selected && <EvaluationDrawer evaluation={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewEvaluationModal onClose={() => setShowNew(false)} onCreate={(title, summary) => {
        const nextEvaluation: Evaluation = {
          id: `EV-${2050 + evaluationList.length}`,
          title,
          team: "Other",
          date: "Nov 14, 2026",
          duration: "—",
          model: "Pending review",
          score: 0,
          status: "In review",
          raters: 0,
          agreement: 0,
          errors: [],
          summary: summary || "No summary or transcript provided yet.",
        };
        setEvaluationList((current) => [nextEvaluation, ...current]);
        setActiveTab("All evaluations");
        setQuery("");
        setPage(1);
        setShowNew(false);
        showNotice(`"${title}" added to your evaluation queue`);
      }} />}
      {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={14} /></button></div>}
    </div>
  );
}

function pageSubtitle(activeNav: NavItem) {
  if (activeNav === "Overview") return "Explore QMSum reference summaries alongside the evaluation framework.";
  if (activeNav === "Evaluations") return "Review, compare, and annotate meeting summary evaluations.";
  if (activeNav === "Rubric & guidelines") return "Shared scoring criteria for consistent, actionable feedback.";
  if (activeNav === "Rater calibration") return "Align your reviewers and track inter-rater agreement.";
  return "A structured vocabulary for identifying and resolving summary errors.";
}

function MetricCard({ title, value, change, caption, icon, trend, progress }: {
  title: string; value: string; change: string; caption: string; icon: React.ReactNode; trend: "up" | "down"; progress?: number;
}) {
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><div className="metric-icon">{icon}</div></div><div className="metric-value" dangerouslySetInnerHTML={{ __html: value }} /><div className="metric-bottom"><span className={`metric-change ${trend === "down" ? "change-down" : ""}`}>{trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span><span>{caption}</span></div>{progress !== undefined && <div className="metric-progress"><div style={{ width: `${progress}%` }} /></div>}</article>;
}

function ScoreDots({ score }: { score: number }) {
  return <span className="score-dots" aria-label={`${score} out of 5`}>{[1, 2, 3, 4, 5].map((dot) => <i key={dot} className={score >= dot ? "dot-filled" : ""} />)}</span>;
}

function StatusBadge({ status }: { status: Evaluation["status"] }) {
  return <span className={`status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span>;
}

function EvaluationDrawer({ evaluation, onClose }: { evaluation: Evaluation; onClose: () => void }) {
  const isDatasetReference = evaluation.dataset !== undefined;
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="detail-drawer" aria-label="Evaluation details">
    <div className="drawer-header"><div><span className="drawer-eyebrow">{evaluation.id} <i /> {evaluation.date}</span><h2>{evaluation.title}</h2><p>{evaluation.team} <span>·</span> {evaluation.duration} <span>·</span> {evaluation.model}</p></div><button className="icon-btn" onClick={onClose} aria-label="Close details"><X size={18} /></button></div>
    <div className="drawer-content">
      {isDatasetReference && evaluation.dataset ? <>
        <div className="detail-score-card reference-score-card"><div><span>QMSUM HUMAN REFERENCE</span><strong>Not rated</strong><small>Gold summary from the benchmark; no model score or rater agreement is provided.</small></div><span className="reference-emblem"><Check size={16} /></span></div>
        <div className="detail-section"><div className="detail-section-head"><h3>Reference summary</h3><button className="icon-btn small-icon-btn" aria-label="Copy summary" onClick={() => navigator.clipboard?.writeText(evaluation.summary)}><FileText size={15} /></button></div><p className="summary-quote">“{evaluation.summary}”</p></div>
        <div className="detail-section"><div className="detail-section-head"><h3>Query and dataset context</h3></div><div className="query-card"><span>BENCHMARK QUERY</span><p>{evaluation.dataset.query}</p></div><div className="dataset-facts"><span>Domain <strong>{evaluation.dataset.domain}</strong></span><span>Split <strong>{evaluation.dataset.split}</strong></span><span>Transcript turns <strong>{evaluation.dataset.transcriptTurns}</strong></span></div></div>
        <div className="detail-note"><ShieldCheck size={15} /><p><strong>Reference data, not an evaluation.</strong><br />QMSum provides human-written reference summaries. No model output, quality score, or inter-rater agreement is included for this row.</p></div>
        <a className="source-link" href={evaluation.dataset.sourceUrl} target="_blank" rel="noreferrer">View original QMSum test split <ArrowUpRight size={13} /></a>
      </> : <>
        <div className="detail-score-card"><div><span>OVERALL QUALITY SCORE</span><strong>{evaluation.score?.toFixed(1)}<small> / 5</small></strong></div><ScoreDots score={evaluation.score ?? 0} /></div>
        <div className="detail-section"><div className="detail-section-head"><h3>Model summary</h3><button className="icon-btn small-icon-btn" aria-label="Copy summary" onClick={() => navigator.clipboard?.writeText(evaluation.summary)}><FileText size={15} /></button></div><p className="summary-quote">“{evaluation.summary}”</p></div>
        <div className="detail-section"><div className="detail-section-head"><h3>Evaluation overview</h3><span className="detail-meta">{evaluation.raters} raters</span></div><div className="overview-stats"><div><span>Agreement (κ)</span><strong>{evaluation.agreement?.toFixed(2)}</strong></div><div><span>Evaluation status</span><StatusBadge status={evaluation.status} /></div></div></div>
        <div className="detail-section"><div className="detail-section-head"><h3>Rubric scores</h3><span className="detail-meta">Average across raters</span></div><div className="detail-rubric">{rubric.map((item, index) => {
          const score = Math.max(2.2, Math.min(5, (evaluation.score ?? 0) + [0.2, -0.3, -0.6, 0.1][index]));
          return <div key={item.label}><span>{item.label}</span><strong>{score.toFixed(1)}<small> / 5</small></strong></div>;
        })}</div></div>
        <div className="detail-section"><div className="detail-section-head"><h3>Detected error categories</h3></div>{evaluation.errors.length ? <div className="detail-error-list">{evaluation.errors.map((error) => <span key={error}><span />{error}</span>)}</div> : <div className="clean-result"><Check size={15} /> No errors flagged by raters</div>}</div>
        <div className="detail-note"><Sparkles size={15} /><p><strong>Evaluator note</strong><br />Compare source transcript against each claim before marking factual accuracy.</p></div>
      </>}
    </div>
    <div className="drawer-footer"><button className="button button-secondary" onClick={onClose}>Close</button><button className="button button-primary" onClick={() => { navigator.clipboard?.writeText(evaluation.summary); }}>Copy summary <ArrowDown size={14} /></button></div>
  </aside></div>;
}

function NewEvaluationModal({ onClose, onCreate }: { onClose: () => void; onCreate: (title: string, summary: string) => void }) {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (title.trim()) onCreate(title.trim(), transcript.trim()); };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="new-modal" onSubmit={submit}>
    <div className="modal-heading"><div className="modal-icon"><ClipboardCheck size={19} /></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close modal"><X size={18} /></button></div>
    <h2>Start an evaluation</h2><p className="modal-subtitle">Add a meeting summary to your human review queue.</p>
    <label className="form-label">Meeting name<input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Product weekly sync" /></label>
    <label className="form-label">Summary or transcript <span className="optional">OPTIONAL</span><textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Paste a summary or transcript to give your raters context..." rows={4} /></label>
    <div className="modal-rubric"><ListChecks size={15} /><span>Default rubric</span><strong>4 dimensions</strong><ChevronDown size={14} /></div>
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={!title.trim()}><Plus size={15} /> Add to queue</button></div>
  </form></div>;
}

export default App;
