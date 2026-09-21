import streamlit as st
import datetime
import os
import sqlite3

# Set Page Config
st.set_page_config(
    page_title="Daybook",
    page_icon="📖",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# -------------------------------------------------------------
# Database Connection (PostgreSQL with SQLite Fallback for Cloud)
# -------------------------------------------------------------
def get_db_connection():
    # 1. Check Streamlit secrets or environment for PostgreSQL
    pg_host = os.environ.get("DB_HOST", "localhost")
    pg_port = os.environ.get("DB_PORT", "5432")
    pg_name = os.environ.get("DB_NAME", "worktrack")
    pg_user = os.environ.get("DB_USER", "postgres")
    pg_pass = os.environ.get("DB_PASSWORD", "")

    # Try Streamlit Secrets if available
    if hasattr(st, "secrets") and "postgres" in st.secrets:
        sec = st.secrets["postgres"]
        pg_host = sec.get("host", pg_host)
        pg_port = sec.get("port", pg_port)
        pg_name = sec.get("database", pg_name)
        pg_user = sec.get("user", pg_user)
        pg_pass = sec.get("password", pg_pass)

    try:
        import psycopg2
        import psycopg2.extras
        conn = psycopg2.connect(
            host=pg_host,
            port=pg_port,
            dbname=pg_name,
            user=pg_user,
            password=pg_pass,
            connect_timeout=3
        )
        return conn, "postgres"
    except Exception:
        # Fallback to local SQLite for seamless standalone cloud hosting
        conn = sqlite3.connect("daybook.db", check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"

# Initialize Database Schema
def init_db():
    conn, db_type = get_db_connection()
    cur = conn.cursor()
    if db_type == "postgres":
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daybook_entries (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                type VARCHAR(50) NOT NULL,
                notes TEXT,
                status VARCHAR(50) NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
    else:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS daybook_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                type TEXT NOT NULL,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    conn.commit()
    cur.close()
    conn.close()

init_db()

# DB Operations
def fetch_entries(filter_type="All"):
    conn, db_type = get_db_connection()
    cur = conn.cursor()
    if filter_type == "All":
        query = "SELECT id, title, date, type, notes, status FROM daybook_entries ORDER BY date DESC, id DESC"
        cur.execute(query)
    else:
        # Map filter pills: Activities -> Activity, Projects -> Project, Assignments -> Assignment
        type_map = {"Activities": "Activity", "Projects": "Project", "Assignments": "Assignment"}
        target_type = type_map.get(filter_type, filter_type)
        placeholder = "%s" if db_type == "postgres" else "?"
        query = f"SELECT id, title, date, type, notes, status FROM daybook_entries WHERE type = {placeholder} ORDER BY date DESC, id DESC"
        cur.execute(query, (target_type,))
    
    rows = cur.fetchall()
    cur.close()
    conn.close()

    entries = []
    for r in rows:
        d_val = r[2]
        if isinstance(d_val, (datetime.date, datetime.datetime)):
            d_str = d_val.strftime("%d/%m/%Y")
        else:
            parts = str(d_val).split("-")
            d_str = f"{parts[2]}/{parts[1]}/{parts[0]}" if len(parts) == 3 else str(d_val)

        entries.append({
            "id": r[0],
            "title": r[1],
            "date": d_str,
            "type": r[3],
            "notes": r[4] or "",
            "status": r[5]
        })
    return entries

def add_entry(title, date_val, entry_type, status_val, notes_val):
    conn, db_type = get_db_connection()
    cur = conn.cursor()
    ph = ("%s", "%s", "%s", "%s", "%s") if db_type == "postgres" else ("?", "?", "?", "?", "?")
    query = f"""
        INSERT INTO daybook_entries (title, date, type, status, notes)
        VALUES ({', '.join(ph)})
    """
    cur.execute(query, (title, date_val, entry_type, status_val, notes_val))
    conn.commit()
    cur.close()
    conn.close()

def cycle_status(entry_id, current_status):
    status_order = {"Pending": "In Progress", "In Progress": "Completed", "Completed": "Pending"}
    next_status = status_order.get(current_status, "Pending")
    conn, db_type = get_db_connection()
    cur = conn.cursor()
    ph = "%s" if db_type == "postgres" else "?"
    query = f"UPDATE daybook_entries SET status = {ph}, updated_at = CURRENT_TIMESTAMP WHERE id = {ph}"
    cur.execute(query, (next_status, entry_id))
    conn.commit()
    cur.close()
    conn.close()

def delete_entry(entry_id):
    conn, db_type = get_db_connection()
    cur = conn.cursor()
    ph = "%s" if db_type == "postgres" else "?"
    query = f"DELETE FROM daybook_entries WHERE id = {ph}"
    cur.execute(query, (entry_id,))
    conn.commit()
    cur.close()
    conn.close()

# -------------------------------------------------------------
# Custom CSS: Minimalist Black & White + Times New Roman Upright
# -------------------------------------------------------------
st.markdown("""
<style>
    /* Force Times New Roman and Upright (No Italic) Everywhere */
    * {
        font-family: 'Times New Roman', Times, serif !important;
        font-style: normal !important;
    }

    /* Remove shadows across Streamlit elements */
    *, *::before, *::after {
        box-shadow: none !important;
    }

    /* Page background */
    .stApp {
        background-color: #fafafa;
        color: #09090b;
    }

    /* Container constraints */
    .block-container {
        max-width: 1140px;
        padding-top: 2rem;
        padding-bottom: 3rem;
    }

    /* App Header */
    .daybook-title {
        font-size: 3.2rem;
        font-weight: 700;
        color: #09090b;
        margin-bottom: 0.15rem;
        line-height: 1.1;
    }
    .daybook-subtitle {
        font-size: 1.15rem;
        color: #71717a;
        margin-bottom: 2rem;
    }

    /* Form Card Container */
    [data-testid="stVerticalBlockBorderWrapper"] {
        background-color: #ffffff;
        border: 1px solid #e4e4e7 !important;
        border-radius: 16px !important;
        box-shadow: none !important;
        padding: 1rem;
    }

    /* Underlined input look */
    .stTextInput input, .stDateInput input, .stTextArea textarea {
        background-color: #ffffff !important;
        border: 1px solid #e4e4e7 !important;
        border-radius: 8px !important;
        color: #09090b !important;
        font-size: 1.05rem !important;
        box-shadow: none !important;
    }
    .stTextInput input:focus, .stDateInput input:focus, .stTextArea textarea:focus {
        border-color: #09090b !important;
    }

    /* Submit Button */
    .stButton > button[kind="primary"] {
        background-color: #09090b !important;
        color: #ffffff !important;
        font-size: 1.2rem !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        border: none !important;
        padding: 0.65rem 1rem !important;
        width: 100% !important;
        box-shadow: none !important;
    }
    .stButton > button[kind="primary"]:hover {
        background-color: #27272a !important;
    }

    /* Entry Card in List */
    .entry-card {
        background-color: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 14px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        box-shadow: none;
    }
    .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .entry-meta {
        display: flex;
        align-items: center;
        gap: 0.65rem;
    }
    .entry-date {
        font-size: 0.95rem;
        color: #71717a;
    }
    .entry-type {
        font-size: 0.8rem;
        padding: 0.15rem 0.65rem;
        border-radius: 9999px;
        background-color: #f4f4f5;
        color: #18181b;
        border: 1px solid #e4e4e7;
        font-weight: 600;
    }

    /* Status Badges */
    .badge-pending {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
        padding: 0.2rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .badge-inprogress {
        background-color: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
        padding: 0.2rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .badge-completed {
        background-color: #f0fdf4;
        color: #16a34a;
        border: 1px solid #bbf7d0;
        padding: 0.2rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .entry-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #09090b;
        margin: 0.4rem 0;
    }
    .entry-notes {
        font-size: 1rem;
        color: #52525b;
        margin-bottom: 0.6rem;
        white-space: pre-wrap;
    }

    /* Action buttons inside cards */
    .card-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# Header
# -------------------------------------------------------------
st.markdown('<div class="daybook-title">Daybook</div>', unsafe_allow_html=True)
st.markdown('<div class="daybook-subtitle">Track activities, projects and assignments by date</div>', unsafe_allow_html=True)

# -------------------------------------------------------------
# Two-Column Side-by-Side Layout
# -------------------------------------------------------------
col_form, col_entries = st.columns([1, 1.35], gap="large")

# =============================================================
# LEFT COLUMN: Daybook Form
# =============================================================
with col_form:
    with st.container(border=True):
        st.markdown("<h3 style='margin-top:0; font-size:1.35rem; font-weight:600;'>Add Entry</h3>", unsafe_allow_html=True)
        
        with st.form("daybook_form", clear_on_submit=True):
            # 1. TITLE
            title = st.text_input("What is it?", placeholder="")
            
            # 2. DATE
            entry_date = st.date_input("Date", value=datetime.date.today())
            
            # 3. TYPE
            entry_type = st.radio("Type", ["Activity", "Project", "Assignment"], horizontal=True)
            
            # 4. STATUS
            entry_status = st.radio("Status", ["Pending", "In Progress", "Completed"], horizontal=True)
            
            # 5. NOTES
            notes = st.text_area("Notes", placeholder="", height=70)
            
            # SUBMIT BUTTON
            submitted = st.form_submit_button("Add to daybook", type="primary", use_container_width=True)
            
            if submitted:
                if title.strip():
                    add_entry(title.strip(), str(entry_date), entry_type, entry_status, notes.strip())
                    st.success("Added to daybook!")
                    st.rerun()
                else:
                    st.error("Please enter a title for 'What is it?'.")

# =============================================================
# RIGHT COLUMN: Filter Pills + Entries List
# =============================================================
with col_entries:
    # Filter Pills
    filter_choice = st.pills(
        "Filters",
        ["All", "Activities", "Projects", "Assignments"],
        default="All",
        label_visibility="collapsed"
    )
    
    entries = fetch_entries(filter_choice or "All")
    
    if not entries:
        st.markdown("""
            <div style="text-align: center; padding: 2.5rem; background: #ffffff; border: 1px dashed #e4e4e7; border-radius: 16px; color: #71717a;">
                No entries recorded yet.
            </div>
        """, unsafe_allow_html=True)
    else:
        for item in entries:
            # Determine badge class
            st_class = "badge-pending"
            if item["status"] == "In Progress":
                st_class = "badge-inprogress"
            elif item["status"] == "Completed":
                st_class = "badge-completed"

            # Entry Card HTML
            card_html = f"""
            <div class="entry-card">
                <div class="entry-header">
                    <div class="entry-meta">
                        <span class="entry-date">{item['date']}</span>
                        <span class="entry-type">{item['type']}</span>
                    </div>
                    <span class="{st_class}">{item['status']}</span>
                </div>
                <div class="entry-title">{item['title']}</div>
                {f'<div class="entry-notes">{item["notes"]}</div>' if item["notes"] else ''}
            </div>
            """
            st.markdown(card_html, unsafe_allow_html=True)
            
            # Inline card action buttons (Toggle Status, Delete)
            btn_col1, btn_col2, _ = st.columns([1.2, 0.8, 2.5])
            with btn_col1:
                if st.button("Toggle Status", key=f"status_{item['id']}", help="Cycle: Pending -> In Progress -> Completed"):
                    cycle_status(item['id'], item['status'])
                    st.rerun()
            with btn_col2:
                if st.button("Delete", key=f"del_{item['id']}"):
                    delete_entry(item['id'])
                    st.rerun()
