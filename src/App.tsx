import { useState, useEffect, type ReactNode } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Post {
  n: string;
  live: boolean;
  sub: string;
  title: string;
  upvotes: number | null;
  comments: number | null;
  reach: string | null;
  week: string;
  insight: string;
}

interface TagProps {
  children: ReactNode;
  variant?: "live" | "neutral" | "warn";
}

interface SectionProps {
  number: string;
  title: string;
  tag?: string;
  tagVariant?: "live" | "neutral" | "warn";
  children: ReactNode;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const C = {
  paper:    "#F7F5F0",
  ink:      "#111010",
  ink2:     "#3D3B38",
  ink3:     "#7A7672",
  rule:     "#DDD9D2",
  ruleHi:   "#C5C0B8",
  signal:   "#1A6B3C",
  signalBg: "#EBF5EE",
  warn:     "#B04A00",
  warnBg:   "#FDF0E8",
  white:    "#FFFFFF",
};

const sentimentData = [
  { d: "Pre", pos: 28, neu: 42, neg: 30 },
  { d: "D1",  pos: 31, neu: 43, neg: 26 },
  { d: "D2",  pos: 33, neu: 44, neg: 23 },
  { d: "D3",  pos: 36, neu: 43, neg: 21 },
  { d: "D4",  pos: 37, neu: 44, neg: 19 },
  { d: "D5",  pos: 39, neu: 43, neg: 18 },
  { d: "D6",  pos: 40, neu: 43, neg: 17 },
  { d: "Now", pos: 40, neu: 43, neg: 17 },
];

const reachData = [
  { d: "Mon", imp: 14200 },
  { d: "Tue", imp: 19800 },
  { d: "Wed", imp: 22100 },
  { d: "Thu", imp: 25400 },
  { d: "Fri", imp: 28700 },
  { d: "Sat", imp: 18600 },
  { d: "Sun", imp: 14000 },
];

const searchData = [
  { d: "Pre", vol: 340 },
  { d: "D1",  vol: 342 },
  { d: "D2",  vol: 355 },
  { d: "D3",  vol: 371 },
  { d: "D4",  vol: 388 },
  { d: "D5",  vol: 402 },
  { d: "D6",  vol: 419 },
  { d: "Now", vol: 441 },
];

const posts: Post[] = [
  {
    n: "01", live: true,
    sub: "r/FrugalFood",
    title: "FoodieClub actually works — here's why",
    upvotes: 712, comments: 94, reach: "41.2K",
    week: "Apr 7–13",
    insight: "Seeded organically. Top comment thread ran 14 hours.",
  },
  {
    n: "02", live: false,
    sub: "r/LAEats",
    title: "How off-peak slots power real discounts",
    upvotes: null, comments: null, reach: null,
    week: "Apr 14–20",
    insight: "Shifts narrative from legitimacy → mechanics.",
  },
  {
    n: "03", live: false,
    sub: "r/personalfinance",
    title: "I was skeptical. Here's my honest take.",
    upvotes: null, comments: null, reach: null,
    week: "Apr 21–27",
    insight: "Broader CA audience. Higher trust subreddit.",
  },
  {
    n: "04", live: false,
    sub: "r/Frugal",
    title: "FoodieClub vs every other discount app",
    upvotes: null, comments: null, reach: null,
    week: "Apr 28–30",
    insight: "Comparison frame. EOM wrap before CEO check-in.",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

// Recharts Tooltip custom components work best with 'any' props to avoid complex generic mismatches
const Tooltip_ = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.ruleHi}`,
      borderRadius: 4, padding: "10px 14px", fontSize: 11,
      fontFamily: "'IBM Plex Mono', monospace",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: C.ink3, margin: "0 0 6px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || C.ink, margin: "3px 0", fontWeight: 500 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

function Divider({ style = {} }: { style?: React.CSSProperties }) {
  return <div style={{ height: 1, background: C.rule, ...style }} />;
}

function Tag({ children, variant = "neutral" }: TagProps) {
  const styles = {
    live:    { bg: C.signalBg, color: C.signal },
    neutral: { bg: "#F0EDE8",  color: C.ink3 },
    warn:    { bg: C.warnBg,   color: C.warn },
  };
  const s = styles[variant];
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "3px 8px", borderRadius: 2,
      background: s.bg, color: s.color,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {children}
    </span>
  );
}

function SignalBanner() {
  return (
    <section style={{
      padding: "22px 28px",
      background: C.signalBg,
      borderLeft: `4px solid ${C.signal}`,
      margin: "24px 0",
    }}>
      <p style={{
        fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em",
        color: C.signal, margin: "0 0 8px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        Week 1 verdict
      </p>
      <p style={{ fontSize: 15, color: C.ink, margin: 0, lineHeight: 1.75, fontWeight: 500, maxWidth: 680 }}>
        Negative sentiment nearly halved in 7 days. Branded search climbing without paid support.
        First post hit 41K reach — 18% above goal.{" "}
        <strong style={{ color: C.signal }}>The strategy is working.</strong>
      </p>
    </section>
  );
}

function HeroStats() {
  return (
    <section style={{ padding: "32px 0", borderBottom: `1px solid ${C.rule}` }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: 0,
      }}>
        <div style={{ paddingRight: 40, borderRight: `1px solid ${C.rule}` }}>
          <p style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em",
            color: C.ink3, margin: "0 0 14px", fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Total impressions · week 1
          </p>
          <p style={{
            fontSize: 60, fontWeight: 800, color: C.ink,
            letterSpacing: "-0.03em", lineHeight: 1,
            fontFamily: "'Syne', sans-serif", margin: 0,
          }}>
            142.8K
          </p>
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 4, borderRadius: 2, background: C.rule, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: "72%", background: C.signal, borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 10, color: C.ink3, fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
              72% of monthly goal · week 1
            </p>
          </div>
        </div>

        {[
          { label: "Positive sentiment", value: "40%", before: "28%", delta: "+12pp", sub: "was 28%", up: true },
          { label: "Negative sentiment", value: "17%", before: "30%", delta: "−13pp", sub: "was 30%", up: true },
          { label: "Branded search · CA", value: "+30%", before: null, delta: "340→441/day", sub: "no paid spend", up: true },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "0 0 0 32px",
            borderRight: i < 2 ? `1px solid ${C.ruleHi}` : "none",
          }}>
            <p style={{
              fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em",
              color: C.ink3, margin: "0 0 12px", fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {s.label}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontSize: 30, fontWeight: 800, color: C.ink,
                letterSpacing: "-0.02em", lineHeight: 1,
                fontFamily: "'Syne', sans-serif",
              }}>
                {s.value}
              </span>
              {s.before && (
                <span style={{
                  fontSize: 14, color: C.ink3,
                  textDecoration: "line-through",
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                }}>
                  {s.before}
                </span>
              )}
            </div>
            <p style={{
              fontSize: 11, fontWeight: 600, margin: "6px 0 0",
              color: s.up ? C.signal : C.warn,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {s.delta}
            </p>
            <p style={{ fontSize: 10, color: C.ink3, margin: "2px 0 0" }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SentimentSection() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 0 }}>
      <div style={{ paddingRight: 36, borderRight: `1px solid ${C.rule}` }}>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentData}>
              <CartesianGrid stroke={C.rule} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.ink3, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.ink3, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} unit="%" width={30} />
              <Tooltip content={Tooltip_} />
              <Line type="monotone" dataKey="pos" stroke={C.signal} strokeWidth={2.5} dot={false} name="Positive" />
              <Line type="monotone" dataKey="neu" stroke={C.ruleHi} strokeWidth={1.5} dot={false} name="Neutral" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="neg" stroke={C.warn} strokeWidth={2} dot={false} name="Negative" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          {[["Positive", C.signal], ["Neutral", C.ruleHi], ["Negative", C.warn]].map(([l, c]) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.ink3 }}>
              <span style={{ width: 16, height: 2, background: c, display: "inline-block", borderRadius: 1 }} />{l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        {[
          { label: "Positive", before: "28%", after: "40%", delta: "+12pp", up: true },
          { label: "Negative", before: "30%", after: "17%", delta: "−13pp", up: true },
          { label: "Neutral",  before: "42%", after: "43%", delta: "+1pp",  up: null },
        ].map((row, i) => (
          <div key={row.label}>
            {i > 0 && <Divider style={{ margin: "16px 0" }} />}
            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: C.ink3, margin: "0 0 8px", fontFamily: "'IBM Plex Mono', monospace" }}>
              {row.label}
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 15, color: C.ink3, textDecoration: "line-through", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{row.before}</span>
              <span style={{ fontSize: 11, color: C.ink3 }}>→</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>{row.after}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace",
                color: row.up === true ? C.signal : row.up === false ? C.warn : C.ink3,
              }}>
                {row.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReachSection() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 0 }}>
      <div style={{ paddingRight: 36, borderRight: `1px solid ${C.rule}` }}>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reachData} barGap={3}>
              <CartesianGrid stroke={C.rule} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.ink3, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.ink3, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={Tooltip_} cursor={{ fill: `${C.rule}60` }} />
              <Bar dataKey="imp" name="Impressions" radius={[2, 2, 0, 0]}>
                {reachData.map((entry, i) => (
                  <Cell key={i} fill={entry.d === "Fri" ? C.ink : C.ruleHi} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: 11, color: C.ink3, margin: "10px 0 0" }}>
          Peak: <strong style={{ color: C.ink }}>28.7K impressions on Friday</strong> — post was 4 days old, organic shares driving the tail.
        </p>
      </div>

      <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink3, margin: "0 0 16px", fontFamily: "'IBM Plex Mono', monospace" }}>
            Branded search volume · CA
          </p>
          <div style={{ height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={searchData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.signal} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={C.signal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fill: C.ink3, fontSize: 8, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[300, "auto"]} />
                <Tooltip content={Tooltip_} />
                <Area type="monotone" dataKey="vol" stroke={C.signal} strokeWidth={2} fill="url(#sg)" name="Search vol." dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 11, color: C.ink3, margin: "8px 0 0" }}>
            <strong style={{ color: C.signal }}>+30%</strong> vs pre-launch (340 → 441/day)
          </p>
        </div>

        <Divider />

        <div>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: C.ink3, margin: "0 0 10px", fontFamily: "'IBM Plex Mono', monospace" }}>
            Engagement rate
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>3.3%</span>
            <span style={{ fontSize: 11, color: C.signal, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>+0.8pp vs baseline</span>
          </div>
          <p style={{ fontSize: 11, color: C.ink3, margin: "6px 0 0" }}>4,650 total engagements this week</p>
        </div>
      </div>
    </div>
  );
}

function CampaignArc() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {posts.map((p, i) => (
        <div key={i}>
          {i > 0 && <Divider />}
          <div style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr auto",
            gap: "0 24px",
            alignItems: "start",
            padding: "20px 0",
            opacity: p.live ? 1 : 0.45,
            transition: "opacity 0.2s",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.live ? C.signal : C.ink3, fontFamily: "'IBM Plex Mono', monospace" }}>
                {p.n}
              </span>
              {p.live && <Tag variant="live">Live</Tag>}
            </div>

            <div>
              <p style={{ margin: "0 0 3px", fontSize: 9, color: C.ink3, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {p.sub} · {p.week}
              </p>
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>
                {p.title}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: C.ink3 }}>{p.insight}</p>
            </div>

            <div style={{ textAlign: "right", paddingTop: 2 }}>
              {p.live ? (
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    { label: "Upvotes", val: p.upvotes?.toLocaleString() ?? "0" },
                    { label: "Comments", val: p.comments ?? 0 },
                    { label: "Reach", val: p.reach ?? "0" },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink, fontFamily: "'Syne', sans-serif" }}>{s.val}</p>
                      <p style={{ margin: 0, fontSize: 9, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'IBM Plex Mono', monospace" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.ink3, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Scheduled
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WhatsNext() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {[
        {
          symbol: "↗",
          label: "Week 2 target",
          body: "r/LAEats post goes live. Shifts from trust-building to mechanics — how off-peak slots create real savings.",
        },
        {
          symbol: "⬡",
          label: "CEO check-in goal",
          body: "By Apr 30: ≥45% positive sentiment and branded search at 500+/day before end-of-month review.",
        },
        {
          symbol: "◈",
          label: "What we're watching",
          body: "Organic comment velocity, branded search, and whether r/personalfinance pulls broader CA intent.",
        },
      ].map((c, i) => (
        <div key={i} style={{
          padding: "20px",
          background: C.white,
          border: `1px solid ${C.rule}`,
          borderRadius: 2,
        }}>
          <div style={{ fontSize: 18, marginBottom: 10 }}>{c.symbol}</div>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: C.ink3, margin: "0 0 8px", fontFamily: "'IBM Plex Mono', monospace" }}>
            {c.label}
          </p>
          <p style={{ fontSize: 12, color: C.ink2, margin: 0, lineHeight: 1.65 }}>{c.body}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ number, title, tag, tagVariant = "live", children }: SectionProps) {
  return (
    <section style={{ borderBottom: `1px solid ${C.rule}` }}>
      <div style={{
        padding: "24px 0 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
          color: C.ink3, fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {number} · {title}
        </span>
        {tag && <Tag variant={tagVariant}>{tag}</Tag>}
      </div>
      {children}
      <div style={{ paddingBottom: 32 }} />
    </section>
  );
}

export default function Dashboard() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{
      background: C.paper,
      color: C.ink,
      minHeight: "100vh",
      width: "100%",
      fontFamily: "'Instrument Sans', 'Helvetica Neue', sans-serif",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 40px 80px" }}>

        <header style={{ padding: "36px 0 28px", borderBottom: `2px solid ${C.ink}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em",
                color: C.ink3, margin: "0 0 10px",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Campaign report · Week 1 of 4
              </p>
              <h1 style={{
                fontSize: 40, fontWeight: 800, margin: 0,
                letterSpacing: "-0.03em", lineHeight: 1,
                fontFamily: "'Syne', sans-serif",
              }}>
                FoodieClub
                <span style={{ color: C.ink3, fontWeight: 700 }}> / Sentiment</span>
              </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.signal, boxShadow: `0 0 0 2px ${C.signalBg}` }} />
                <span style={{ fontSize: 11, color: C.signal, fontWeight: 600 }}>On track</span>
              </div>
              <p style={{ fontSize: 10, color: C.ink3, margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
                Apr 7–13, 2025
              </p>
            </div>
          </div>
        </header>

        <SignalBanner />
        <HeroStats />

        <Section number="01" title="Sentiment" tag="+12pp positive in 7 days">
          <SentimentSection />
        </Section>

        <Section number="02" title="Reach & Engagement" tag="142.8K impressions">
          <ReachSection />
        </Section>

        <Section number="03" title="Campaign arc" tag="1 of 4 published" tagVariant="neutral">
          <CampaignArc />
        </Section>

        <section style={{ padding: "32px 0 0" }}>
          <p style={{
            fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em",
            color: C.ink3, margin: "0 0 20px",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            04 · What happens next
          </p>
          <WhatsNext />
        </section>

        <footer style={{
          marginTop: 48, paddingTop: 20,
          borderTop: `1px solid ${C.rule}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: C.ink3, fontFamily: "'IBM Plex Mono', monospace" }}>
            FoodieClub / Sentiment Campaign · Week 1 of 4
          </span>
          <span style={{ fontSize: 10, color: C.ink3, fontFamily: "'IBM Plex Mono', monospace" }}>
            Generated Apr 14, 2025
          </span>
        </footer>
      </div>
    </div>
  );
}
