"use client";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const durations = ["30m", "45m", "60m"];
const colors = [
  "var(--red)",
  "var(--orange)",
  "var(--yellow)",
  "var(--green)",
  "var(--cyan)",
  "var(--blue)",
  "var(--purple)",
];

type Meeting = { duration: string; content: string };
type Day = { day: string; meetings: Meeting[] };

type ButtonInfo = { label: string; url: string };

function extractButtons(markdown: string): { content: string; buttons: ButtonInfo[] } {

  const buttonRegex = /\[Button:([^\]]+)\]\(([^)]+)\)/gi;
  const buttons: ButtonInfo[] = [];
  let match;
  let content = markdown;
  while ((match = buttonRegex.exec(markdown)) !== null) {
    buttons.push({ label: match[1].trim(), url: match[2].trim() });
  }

  content = content.replace(buttonRegex, "").replace(/\n{2,}/g, "\n\n");
  return { content, buttons };
}

function parseSchedule(markdown: string): Day[] {
  const lines = markdown.split("\n");
  const days: Day[] = [];
  let currentDay: Day | null = null;
  let currentDuration: string | null = null;
  let buffer: string[] = [];
  for (let line of lines) {
    if (line.startsWith("## ")) {
      if (currentDay) {
        if (currentDuration && buffer.length) {
          currentDay.meetings.push({ duration: currentDuration, content: buffer.join("\n") });
        }
        days.push(currentDay);
      }
      currentDay = { day: line.replace("## ", ""), meetings: [] };
      currentDuration = null;
      buffer = [];
    } else if (line.startsWith("### ")) {
      if (currentDay && currentDuration && buffer.length) {
        currentDay.meetings.push({ duration: currentDuration, content: buffer.join("\n") });
      }
      currentDuration = line.replace("### ", "");
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (currentDay) {
    if (currentDuration && buffer.length) {
      currentDay.meetings.push({ duration: currentDuration, content: buffer.join("\n") });
    }
    days.push(currentDay);
  }
  return days;
}

export default function Home() {
  const [schedule, setSchedule] = useState<Day[]>([]);
  const [duration, setDuration] = useState("45m");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("/schedule.md")
      .then((res) => res.text())
      .then((md) => setSchedule(parseSchedule(md)));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 0 }}>
      {/* dark mode so my eyes don't BURN */}
      <button
        onClick={() => setDarkMode((d) => !d)}
        aria-label="Toggle dark mode"
        style={{
          position: "fixed",
          top: 18,
          right: 24,
          zIndex: 1000,
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--muted)",
          borderRadius: 24,
          width: 44,
          height: 44,
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
          cursor: "pointer",
          transition: "background 0.2s, color 0.2s, border 0.2s",
        }}
      >
        {darkMode ? "🌞" : "🌙"}
      </button>
      <div
        style={{
          background: darkMode
            ? "linear-gradient(90deg, var(--red), var(--orange))"
            : "linear-gradient(90deg, var(--red), var(--orange))",
          borderRadius: 0,
          padding: "64px 0 48px 0",
          marginTop: 0,
          marginBottom: 40,
          textAlign: "center",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100vw",
        }}
      >
        <img
          src="https://icons.hackclub.com/api/icons/0xffffff/clubs"
          alt="clubs"
          style={{
            width: 80,
            height: 80,
            display: "block",
            margin: "0 auto 12px auto",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.10))",
          }}
        />
        <h1
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 40,
            margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.10)",
            letterSpacing: 1,
          }}
        >
          WebDev Meeting Schedule
        </h1>
        <p style={{ color: "#fff", margin: "18px auto 0 auto", maxWidth: 520, fontSize: 18, fontWeight: 400, textAlign: "center", textShadow: "0 1px 6px rgba(0,0,0,0.10)" }}>
          You lead your own meeting! These are just recommendations to help you save time.  
          
        </p>
      </div>
      <div style={{ textAlign: "center", margin: "2rem 0 2.5rem 0" }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Meeting Duration</div>
        {durations.map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            style={{
              background: duration === d ? "var(--green)" : "var(--muted)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              marginRight: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 16,
              transition: "background 0.2s",
              boxShadow: duration === d ? "0 2px 8px 0 rgba(0,0,0,0.10)" : undefined,
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <div>
        {schedule.map((day, i) => {
          const meeting = day.meetings.find((m) => m.duration === duration);
          if (!meeting) return null;
          const { content, buttons } = extractButtons(meeting.content);
          return (
            <div
              key={day.day}
              style={{
                display: "flex",
                alignItems: "stretch",
                marginBottom: 32,
                background: "var(--background)",
                borderRadius: 12,
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: colors[i % colors.length],
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 22,
                  padding: "32px 20px",
                  minWidth: 110,
                  alignSelf: "stretch",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <img src={`https://icons.hackclub.com/api/icons/0xffffff/event-code`} alt="event-code" style={{ width: 32, margin: 0, padding: 0 }} />
                  <span style={{ margin: 0, padding: 0, width: '100%' }}>{day.day}</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: "24px 28px", position: "relative" }}>
                <div className="markdown-content">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                {buttons.length > 0 && (
                  <div style={{ position: "absolute", top: 18, right: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                    {buttons.map((button, idx) => (
                      <a
                        key={button.label + button.url + idx}
                        href={button.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "var(--red)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 15,
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
                        <img src="https://icons.hackclub.com/api/icons/0xffffff/x" alt="icon" style={{ width: 18, marginRight: 4 }} />
                        {button.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ color: "var(--muted)", marginTop: 40, fontSize: 15, textAlign: "center" }}>
        Made with ❤️ by <a href="https://hackclub.com" style={{ color: "var(--muted)" }}>Hack Club</a> and <a href="https://github.com/whatbeato" style={{ color: "var(--muted)" }}>Afonso Beato</a>.
      </div>
      <div style={{ color: "var(--muted)", marginTop: 10, fontSize: 15, textAlign: "center" }}>
        Any questions? Message #leaders in the Hack Club Slack.
      </div>
    </main>
  );
}
