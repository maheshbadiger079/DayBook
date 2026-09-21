import { useState, useEffect } from 'react';

// Format YYYY-MM-DD to DD/MM/YYYY for display
const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
};

// Get today in YYYY-MM-DD for input value
const getTodayIso = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayIso());
  const [type, setType] = useState('Activity'); // Activity | Project | Assignment
  const [status, setStatus] = useState('Pending'); // Pending | In Progress | Completed
  const [notes, setNotes] = useState('');

  // UI & Data states
  const [entries, setEntries] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All'); // All | Activities | Projects | Assignments
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch entries from backend
  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error('Error fetching daybook entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          date,
          type,
          status,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Prepend new entry
        setEntries((prev) => [data.data, ...prev]);
        // Reset inputs
        setTitle('');
        setNotes('');
        // Keep date, type, status as convenient defaults
      }
    } catch (err) {
      console.error('Error creating entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status cycling (Pending -> In Progress -> Completed -> Pending)
  const cycleStatus = async (entry) => {
    const nextStatus =
      entry.status === 'Pending'
        ? 'In Progress'
        : entry.status === 'In Progress'
        ? 'Completed'
        : 'Pending';

    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((item) => (item.id === entry.id ? data.data : item))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this daybook entry?')) return;
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Filtered entries
  const filteredEntries = entries.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Activities') return item.type === 'Activity';
    if (activeFilter === 'Projects') return item.type === 'Project';
    if (activeFilter === 'Assignments') return item.type === 'Assignment';
    return true;
  });

  return (
    <div className="daybook-app">
      {/* Header */}
      <header className="daybook-header">
        <h1 className="daybook-title">Daybook</h1>
        <p className="daybook-subtitle">Track activities, projects and assignments by date</p>
      </header>

      <div className="daybook-columns">
        {/* Left Column: Form Card */}
        <div className="daybook-form-col">
          <form className="daybook-card" onSubmit={handleSubmit}>
            {/* TITLE */}
            <div className="form-group">
              <label className="form-label" htmlFor="entry-title">
                What is it?
              </label>
              <input
                id="entry-title"
                className="input-underlined"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            {/* DATE */}
            <div className="form-group">
              <label className="form-label" htmlFor="entry-date">
                Date
              </label>
              <div className="date-input-wrapper">
                <input
                  id="entry-date"
                  className="input-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <span className="date-chevron">▼</span>
              </div>
            </div>

            {/* TYPE */}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div className="segmented-row">
                <button
                  type="button"
                  className={`seg-btn ${type === 'Activity' ? 'active-type' : ''}`}
                  onClick={() => setType('Activity')}
                >
                  Activity
                </button>
                <button
                  type="button"
                  className={`seg-btn ${type === 'Project' ? 'active-type' : ''}`}
                  onClick={() => setType('Project')}
                >
                  Project
                </button>
                <button
                  type="button"
                  className={`seg-btn ${type === 'Assignment' ? 'active-type' : ''}`}
                  onClick={() => setType('Assignment')}
                >
                  Assignment
                </button>
              </div>
            </div>

            {/* STATUS */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="segmented-row">
                <button
                  type="button"
                  className={`seg-btn ${status === 'Pending' ? 'active-pending' : ''}`}
                  onClick={() => setStatus('Pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`seg-btn ${status === 'In Progress' ? 'active-inprogress' : ''}`}
                  onClick={() => setStatus('In Progress')}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  className={`seg-btn ${status === 'Completed' ? 'active-completed' : ''}`}
                  onClick={() => setStatus('Completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* NOTES */}
            <div className="form-group">
              <label className="form-label" htmlFor="entry-notes">
                Notes
              </label>
              <textarea
                id="entry-notes"
                className="input-notes"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="btn-submit" disabled={submitting || !title.trim()}>
              {submitting ? 'Adding...' : 'Add to daybook'}
            </button>
          </form>
        </div>

        {/* Right Column: Filters + Entries List */}
        <div className="daybook-entries-col">
          {/* Filter Pills */}
          <div className="filters-row">
            {['All', 'Activities', 'Projects', 'Assignments'].map((filterName) => (
              <button
                key={filterName}
                type="button"
                className={`filter-pill ${activeFilter === filterName ? 'active' : ''}`}
                onClick={() => setActiveFilter(filterName)}
              >
                {filterName}
              </button>
            ))}
          </div>

          {/* Entries List */}
          <div className="entries-list">
            {loading ? (
              <div className="empty-state">Loading daybook...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="empty-state">No entries recorded yet.</div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="entry-meta">
                      <span className="entry-date">{formatDisplayDate(entry.date)}</span>
                      <span className={`entry-type-pill ${entry.type}`}>{entry.type}</span>
                    </div>
                    <button
                      type="button"
                      className={`entry-status-badge ${entry.status.replace(/\s+/g, '-')}`}
                      title="Click to toggle status"
                      onClick={() => cycleStatus(entry)}
                    >
                      {entry.status}
                    </button>
                  </div>

                  <h3 className="entry-title">
                    {entry.title}
                  </h3>

                  {entry.notes && <p className="entry-notes">{entry.notes}</p>}

                  <div className="entry-footer">
                    <div />
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
