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


st.set_page_config(page_title="Daily Dump - Streamlit", page_icon="🗒️", layout="wide")
init_state()

entries: dict[str, str] = st.session_state.entries
stats = streak_stats(entries)
badges = unlocked_badges(stats)

st.title("Daily Dump")
st.caption("Streamlit version for Streamlit Cloud deployment")

page = st.sidebar.radio("Page", options=["Journal", "Achievements"], index=0)

if page == "Journal":
    col1, col2 = st.columns([2, 1])

    with col1:
        selected_date = st.date_input("Entry date", value=st.session_state.current_date)
        st.session_state.current_date = selected_date
        selected_key = date_key(selected_date)

        content = st.text_area(
            "Write your entry",
            value=entries.get(selected_key, ""),
            height=280,
            placeholder="Write anything..."
        )

        entries[selected_key] = content

        st.caption(f"{len(content)} characters | {word_count(content)} words")

    with col2:
        st.subheader("Stats")
        st.metric("Current streak", f"{stats['current']} days")
        st.metric("Longest streak", f"{stats['longest']} days")
        st.metric("Total entries", stats["total"])

        all_dates = sorted(entries.keys())
        if all_dates:
            json_payload = json.dumps(
                {"version": 1, "exportedAt": datetime.utcnow().isoformat(), "entries": entries},
                indent=2,
            )
            st.download_button(
                "Export JSON",
                data=json_payload,
                file_name=f"daily-dump-backup-{date.today().isoformat()}.json",
                mime="application/json",
            )

            st.download_button(
                "Export all as TXT",
                data=build_txt(entries, all_dates),
                file_name=f"daily-dump-all-{date.today().isoformat()}.txt",
                mime="text/plain",
            )

            st.markdown("#### Range export")
            start = st.date_input("Start", value=parse_date_key(all_dates[0]), key="range_start")
            end = st.date_input("End", value=parse_date_key(all_dates[-1]), key="range_end")
            if start <= end:
                selected_dates = [d for d in all_dates if date_key(start) <= d <= date_key(end)]
                if selected_dates:
                    st.download_button(
                        "Export selected range",
                        data=build_txt(entries, selected_dates),
                        file_name=f"daily-dump-{date_key(start)}-to-{date_key(end)}.txt",
                        mime="text/plain",
                    )

    st.markdown("---")
    st.subheader("Past entries")
    query = st.text_input("Search", placeholder="Search date or text")

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
            with st.expander(d):
                st.write(entries.get(d, "(empty entry)"))
                if st.button(f"Open {d}", key=f"open_{d}"):
                    st.session_state.current_date = parse_date_key(d)
                    st.rerun()

else:
    st.subheader("Achievements")
    unlocked_count = len([b for b in badges if b["unlocked"]])
    completion = round((unlocked_count / len(badges)) * 100) if badges else 0

    c1, c2, c3 = st.columns(3)
    c1.metric("Unlocked", f"{unlocked_count}/{len(badges)}")
    c2.metric("Completion", f"{completion}%")
    c3.metric("Best streak", f"{stats['longest']} days")

    st.markdown("---")
    for badge in badges:
        state = "Unlocked" if badge["unlocked"] else "Locked"
        rule = f"{badge['threshold']} {'day streak' if badge['type'] == 'streak' else 'entries'}"
        st.write(f"- **{badge['title']}**: {state} ({rule})")
