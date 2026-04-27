from __future__ import annotations

from datetime import date, datetime
import json

import streamlit as st

BADGES = [
    {"id": "first-entry", "title": "First Entry", "type": "entries", "threshold": 1},
    {"id": "week-of-entries", "title": "7 Entries", "type": "entries", "threshold": 7},
    {"id": "month-of-entries", "title": "30 Entries", "type": "entries", "threshold": 30},
    {"id": "getting-started", "title": "Getting Started", "type": "streak", "threshold": 3},
    {"id": "one-week-warrior", "title": "One Week Warrior", "type": "streak", "threshold": 7},
    {"id": "two-week-champion", "title": "Two Week Champion", "type": "streak", "threshold": 14},
    {"id": "monthly-master", "title": "Monthly Master", "type": "streak", "threshold": 30},
    {"id": "sixty-day-builder", "title": "Sixty Day Builder", "type": "streak", "threshold": 60},
    {"id": "hundred-day-run", "title": "Hundred Day Run", "type": "streak", "threshold": 100},
    {"id": "quarter-centurion", "title": "Quarter Centurion", "type": "entries", "threshold": 100},
    {"id": "double-century-writer", "title": "Double Century", "type": "entries", "threshold": 200},
    {"id": "five-hundred-club", "title": "500 Club", "type": "entries", "threshold": 500},
    {"id": "half-year-hero", "title": "Half Year Hero", "type": "streak", "threshold": 180},
    {"id": "year-long-legend", "title": "Year Long Legend", "type": "streak", "threshold": 365},
]


def date_key(value: date) -> str:
    return value.isoformat()


def parse_date_key(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def word_count(text: str) -> int:
    stripped = text.strip()
    if not stripped:
        return 0
    return len(stripped.split())


def active_dates(entries: dict[str, str]) -> list[str]:
    return sorted([d for d, text in entries.items() if word_count(text) > 0])


def streak_stats(entries: dict[str, str]) -> dict[str, int]:
    dates = active_dates(entries)
    if not dates:
        return {"current": 0, "longest": 0, "total": 0}

    parsed = [parse_date_key(value) for value in dates]
    longest = 1
    running = 1

    for index in range(1, len(parsed)):
        if (parsed[index] - parsed[index - 1]).days == 1:
            running += 1
            longest = max(longest, running)
        else:
            running = 1

    current = 0
    today = date.today()
    last = parsed[-1]

    if (today - last).days <= 1:
        current = 1
        for index in range(len(parsed) - 1, 0, -1):
            if (parsed[index] - parsed[index - 1]).days == 1:
                current += 1
            else:
                break

    return {"current": current, "longest": longest, "total": len(parsed)}


def unlocked_badges(stats: dict[str, int]) -> list[dict[str, str]]:
    unlocked = []
    for badge in BADGES:
        if badge["type"] == "streak":
            is_unlocked = stats["longest"] >= badge["threshold"]
        else:
            is_unlocked = stats["total"] >= badge["threshold"]
        unlocked.append({**badge, "unlocked": is_unlocked})
    return unlocked


def build_txt(entries: dict[str, str], dates: list[str]) -> str:
    blocks = []
    for d in dates:
        content = entries.get(d, "").strip() or "(empty entry)"
        blocks.append(f"{d}\n{'=' * 24}\n{content}\n")
    return "\n".join(blocks)


def init_state() -> None:
    if "entries" not in st.session_state:
        st.session_state.entries = {}
    if "current_date" not in st.session_state:
        st.session_state.current_date = date.today()


def inject_styles() -> None:
        st.markdown(
                """
                <style>
                    .stApp {
                        background:
                            radial-gradient(circle at top left, rgba(47, 110, 87, 0.10), transparent 26%),
                            radial-gradient(circle at top right, rgba(95, 143, 123, 0.10), transparent 20%),
                            linear-gradient(180deg, #f5f6f2 0%, #eef2eb 100%);
                        color: #1f2a23;
                    }

                    [data-testid="stHeader"],
                    [data-testid="stToolbar"],
                    #MainMenu,
                    footer {
                        visibility: hidden;
                        height: 0;
                    }

                    section[data-testid="stSidebar"] {
                        display: none;
                    }

                    .block-container {
                        padding-top: 2.2rem;
                        padding-bottom: 2.5rem;
                        max-width: 1120px;
                    }

                    .hero {
                        padding: 1.35rem 1.35rem 1.2rem;
                        border: 1px solid rgba(31, 42, 35, 0.08);
                        border-radius: 22px;
                        background: rgba(255, 255, 255, 0.72);
                        backdrop-filter: blur(12px);
                        box-shadow: 0 20px 48px rgba(25, 43, 34, 0.08);
                        margin-bottom: 1rem;
                    }

                    .eyebrow {
                        text-transform: uppercase;
                        letter-spacing: 0.14em;
                        font-size: 0.73rem;
                        color: #5d6c63;
                        margin-bottom: 0.45rem;
                    }

                    .hero h1 {
                        margin: 0;
                        font-size: clamp(2rem, 4vw, 3.4rem);
                        line-height: 0.98;
                        letter-spacing: -0.05em;
                    }

                    .hero p {
                        margin: 0.75rem 0 0;
                        color: #5b675f;
                        max-width: 66ch;
                    }

                    .metric-card,
                    .surface-card {
                        background: rgba(255, 255, 255, 0.84);
                        border: 1px solid rgba(31, 42, 35, 0.08);
                        border-radius: 18px;
                        box-shadow: 0 12px 32px rgba(25, 43, 34, 0.06);
                    }

                    .metric-card {
                        padding: 1rem 1rem 0.9rem;
                    }

                    .metric-label {
                        color: #5b675f;
                        font-size: 0.78rem;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        margin-bottom: 0.35rem;
                    }

                    .metric-value {
                        font-size: 2rem;
                        line-height: 1;
                        font-weight: 700;
                        letter-spacing: -0.05em;
                    }

                    .metric-caption {
                        color: #5b675f;
                        font-size: 0.86rem;
                        margin-top: 0.35rem;
                    }

                    .section-title {
                        font-size: 1.05rem;
                        margin: 0 0 0.8rem;
                        letter-spacing: -0.03em;
                    }

                    .badge-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 0.85rem;
                    }

                    .badge-item {
                        padding: 0.95rem;
                        border: 1px solid rgba(31, 42, 35, 0.08);
                        border-radius: 16px;
                        background: rgba(255, 255, 255, 0.82);
                    }

                    .badge-name {
                        font-weight: 700;
                        margin-bottom: 0.2rem;
                    }

                    .badge-meta,
                    .muted {
                        color: #5b675f;
                        font-size: 0.88rem;
                    }

                    .badge-state {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.4rem;
                        margin-top: 0.65rem;
                        padding: 0.36rem 0.65rem;
                        border-radius: 999px;
                        font-size: 0.76rem;
                        border: 1px solid rgba(31, 42, 35, 0.08);
                    }

                    .badge-state.unlocked {
                        background: rgba(47, 110, 87, 0.10);
                        color: #245745;
                    }

                    .badge-state.locked {
                        background: rgba(91, 103, 95, 0.06);
                        color: #5b675f;
                    }

                    div[data-testid="stTextInput"] input,
                    div[data-testid="stDateInput"] input,
                    div[data-testid="stTextArea"] textarea {
                        border-radius: 14px !important;
                        border: 1px solid rgba(31, 42, 35, 0.12) !important;
                        background: rgba(255, 255, 255, 0.92) !important;
                        box-shadow: none !important;
                    }

                    div[data-testid="stButton"] > button,
                    div[data-testid="stDownloadButton"] > button {
                        border-radius: 12px;
                        border: 1px solid rgba(31, 42, 35, 0.12);
                        background: #ffffff;
                        color: #1f2a23;
                        padding: 0.6rem 0.95rem;
                        transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
                    }

                    div[data-testid="stButton"] > button:hover,
                    div[data-testid="stDownloadButton"] > button:hover {
                        transform: translateY(-1px);
                        border-color: rgba(47, 110, 87, 0.35);
                        background: #f7fbf8;
                    }

                    div[data-baseweb="tab-list"] {
                        gap: 0.5rem;
                    }

                    button[data-baseweb="tab"] {
                        border-radius: 999px !important;
                        padding: 0.65rem 1rem !important;
                        background: rgba(255, 255, 255, 0.8) !important;
                        border: 1px solid rgba(31, 42, 35, 0.08) !important;
                    }

                    button[data-baseweb="tab"][aria-selected="true"] {
                        background: #2f6e57 !important;
                        color: #ffffff !important;
                        border-color: #2f6e57 !important;
                    }

                    .entry-card {
                        padding: 1rem;
                        border-radius: 16px;
                        background: rgba(255, 255, 255, 0.82);
                        border: 1px solid rgba(31, 42, 35, 0.08);
                    }

                    .entry-preview {
                        color: #5b675f;
                        line-height: 1.55;
                    }

                    @media (max-width: 760px) {
                        .block-container {
                            padding-top: 1rem;
                            padding-bottom: 1.5rem;
                        }
                    }
                </style>
                """,
                unsafe_allow_html=True,
        )


def metric_card(label: str, value: str, caption: str) -> None:
        st.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-label">{label}</div>
                    <div class="metric-value">{value}</div>
                    <div class="metric-caption">{caption}</div>
                </div>
                """,
                unsafe_allow_html=True,
        )


def badge_card(badge: dict[str, str]) -> None:
        state_class = "unlocked" if badge["unlocked"] else "locked"
        state_text = "Unlocked" if badge["unlocked"] else "Locked"
        requirement = f"{badge['threshold']} {'day streak' if badge['type'] == 'streak' else 'entries'}"
        st.markdown(
                f"""
                <div class="badge-item">
                    <div class="badge-name">{badge['title']}</div>
                    <div class="badge-meta">{requirement}</div>
                    <div class="badge-state {state_class}">{state_text}</div>
                </div>
                """,
                unsafe_allow_html=True,
        )


st.set_page_config(page_title="Daily Dump - Streamlit", page_icon="🗒️", layout="wide")
init_state()
inject_styles()

entries: dict[str, str] = st.session_state.entries
stats = streak_stats(entries)
badges = unlocked_badges(stats)

st.markdown(
    """
    <div class="hero">
      <div class="eyebrow">Daily Dump</div>
      <h1>A calm place to write, review, and grow.</h1>
      <p>Clean journal UI, TXT exports, and achievements. Built for Streamlit Cloud, without the noisy default shell.</p>
    </div>
    """,
    unsafe_allow_html=True,
)

tab_journal, tab_achievements = st.tabs(["Journal", "Achievements"])

with tab_journal:
    journal_top_left, journal_top_right = st.columns([2, 1], gap="large")

    with journal_top_left:
        st.markdown("<div class='section-title'>Write entry</div>", unsafe_allow_html=True)
        selected_date = st.date_input("Entry date", value=st.session_state.current_date)
        st.session_state.current_date = selected_date
        selected_key = date_key(selected_date)

        content = st.text_area(
            "Write your entry",
            value=entries.get(selected_key, ""),
            height=320,
            placeholder="Write anything...",
            label_visibility="collapsed",
        )

        entries[selected_key] = content

        text_count_col1, text_count_col2 = st.columns(2)
        with text_count_col1:
            st.caption(f"{len(content)} characters")
        with text_count_col2:
            st.caption(f"{word_count(content)} words")

    with journal_top_right:
        st.markdown("<div class='section-title'>At a glance</div>", unsafe_allow_html=True)
        metric_card("Current streak", f"{stats['current']}", "days in a row")
        metric_card("Longest streak", f"{stats['longest']}", "best run so far")
        metric_card("Total entries", f"{stats['total']}", "saved writing days")

        all_dates = sorted(entries.keys())
        if all_dates:
            json_payload = json.dumps(
                {"version": 1, "exportedAt": datetime.utcnow().isoformat(), "entries": entries},
                indent=2,
            )
            st.download_button(
                "Export JSON backup",
                data=json_payload,
                file_name=f"daily-dump-backup-{date.today().isoformat()}.json",
                mime="application/json",
                use_container_width=True,
            )

            st.download_button(
                "Export all as TXT",
                data=build_txt(entries, all_dates),
                file_name=f"daily-dump-all-{date.today().isoformat()}.txt",
                mime="text/plain",
                use_container_width=True,
            )

            st.markdown("<div class='section-title' style='margin-top:1rem;'>Range export</div>", unsafe_allow_html=True)
            range_col1, range_col2 = st.columns(2)
            with range_col1:
                start = st.date_input("Start", value=parse_date_key(all_dates[0]), key="range_start")
            with range_col2:
                end = st.date_input("End", value=parse_date_key(all_dates[-1]), key="range_end")
            if start <= end:
                selected_dates = [d for d in all_dates if date_key(start) <= d <= date_key(end)]
                if selected_dates:
                    st.download_button(
                        "Export selected range",
                        data=build_txt(entries, selected_dates),
                        file_name=f"daily-dump-{date_key(start)}-to-{date_key(end)}.txt",
                        mime="text/plain",
                        use_container_width=True,
                    )

    st.markdown("<div class='section-title' style='margin-top:1rem;'>Past entries</div>", unsafe_allow_html=True)
    query = st.text_input("Search", placeholder="Search date or text", label_visibility="collapsed")

    sorted_dates = sorted(entries.keys(), reverse=True)
    if query.strip():
        token = query.strip().lower()
        sorted_dates = [
            d for d in sorted_dates if token in d.lower() or token in entries.get(d, "").lower()
        ]

    if not sorted_dates:
        st.info("No matching entries.")
    else:
        for d in sorted_dates[:30]:
            with st.container(border=True):
                entry_cols = st.columns([3, 1])
                with entry_cols[0]:
                    st.markdown(f"**{d}**")
                    preview = entries.get(d, "").strip() or "(empty entry)"
                    st.markdown(f"<div class='entry-preview'>{preview[:220]}</div>", unsafe_allow_html=True)
                with entry_cols[1]:
                    if st.button(f"Open", key=f"open_{d}", use_container_width=True):
                        st.session_state.current_date = parse_date_key(d)
                        st.rerun()

with tab_achievements:
    unlocked_count = len([b for b in badges if b["unlocked"]])
    completion = round((unlocked_count / len(badges)) * 100) if badges else 0

    metric_cols = st.columns(3, gap="large")
    with metric_cols[0]:
        metric_card("Unlocked", f"{unlocked_count}/{len(badges)}", "milestones earned")
    with metric_cols[1]:
        metric_card("Completion", f"{completion}%", "badge progress")
    with metric_cols[2]:
        metric_card("Best streak", f"{stats['longest']}", "days")

    st.markdown("<div class='section-title' style='margin-top:1rem;'>Badge board</div>", unsafe_allow_html=True)
    st.markdown("<div class='badge-grid'>", unsafe_allow_html=True)
    for badge in badges:
        badge_card(badge)
    st.markdown("</div>", unsafe_allow_html=True)
