"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Chore = {
  id: string;
  name: string;
  turn: string;
  prev: string;
  day: string;
  icon?: string;
  done: boolean;
};

type Member = {
  id: string;
  name: string;
  role: string;
  isYou: boolean;
};

const DEFAULT_CHORES: Chore[] = [
  { id: "1", name: "WASH DISHES", turn: "YOU", prev: "CALVIN", day: "MONDAY", done: false },
  { id: "2", name: "PUT DISHES AWAY", turn: "CALVIN", prev: "YOU", day: "TUESDAY", done: false },
  { id: "3", name: "CLEAN COUNTERTOPS", turn: "YOU", prev: "CALVIN", day: "WEDNESDAY", done: false },
  { id: "4", name: "SWEEP KITCHEN", turn: "CALVIN", prev: "YOU", day: "THURSDAY", done: true }
];

const WEEK_DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

const DEFAULT_MEMBERS: Member[] = [
  { id: "1", name: "Bobby", role: "Student", isYou: true },
  { id: "2", name: "Calvin", role: "Student", isYou: false }
];

export default function ChoresPage() {
  const [mounted, setMounted] = useState(false);
  const [chores, setChores] = useState<Chore[]>(DEFAULT_CHORES);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [newChore, setNewChore] = useState("");
  const [newTurn, setNewTurn] = useState("BOBBY");
  const [newPrev, setNewPrev] = useState("CALVIN");
  const [newDay, setNewDay] = useState(WEEK_DAYS[new Date().getDay()]);
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function formatLabel(value: string) {
    return value
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ");
  }

  function normalizeStoredChore(raw: Partial<Chore>, index: number): Chore {
    return {
      id: raw.id ?? `chore-${index + 1}`,
      name: (raw.name ?? "UNTITLED CHORE").toUpperCase(),
      turn: (raw.turn ?? "UNASSIGNED").toUpperCase(),
      prev: (raw.prev ?? "UNASSIGNED").toUpperCase(),
      day: (raw.day ?? WEEK_DAYS[index % WEEK_DAYS.length]).toUpperCase(),
      icon: raw.icon,
      done: Boolean(raw.done)
    };
  }

  // Only load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const savedChores = localStorage.getItem("pp_chores");
      if (savedChores) {
        const parsed = JSON.parse(savedChores);
        if (Array.isArray(parsed)) {
          setChores(parsed.map((chore, index) => normalizeStoredChore(chore, index)));
        }
      }

      const savedMembers = localStorage.getItem("pp_members");
      const parsedMembers: Member[] = savedMembers ? JSON.parse(savedMembers) : DEFAULT_MEMBERS;
      setMembers(parsedMembers);

      if (parsedMembers.length > 0) setNewTurn(parsedMembers[0].name.toUpperCase());
      if (parsedMembers.length > 1) setNewPrev(parsedMembers[1].name.toUpperCase());
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("pp_chores", JSON.stringify(chores));
  }, [chores, mounted]);

  const roommateNames = members.map((m) => m.name.toUpperCase());
  const yourNameOptions = members
    .filter((member) => member.isYou)
    .map((member) => member.name.toUpperCase());

  function isCurrentUserTurn(turn: string) {
    return turn === "YOU" || yourNameOptions.includes(turn);
  }

  function getAlternateRoommate(selected: string) {
    return roommateNames.find((r) => r !== selected) ?? selected;
  }

  function toggleDone(id: string) {
    setChores((current) =>
      current.map((chore) => chore.id !== id ? chore : { ...chore, done: !chore.done })
    );
    setLastToggled(id);
  }

  function undoToggle() {
    if (!lastToggled) return;
    setChores((current) =>
      current.map((chore) => chore.id !== lastToggled ? chore : { ...chore, done: !chore.done })
    );
    setLastToggled(null);
  }

  function addChore() {
    const name = newChore.trim();
    if (!name) return;
    setChores((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: name.toUpperCase(),
        turn: newTurn,
        prev: newPrev,
        day: newDay,
        done: false
      }
    ]);
    setNewChore("");
  }

  function deleteChore(id: string) {
    setChores((current) => current.filter((chore) => chore.id !== id));
    setConfirmDeleteId(null);
  }

  const orderedChores = useMemo(
    () => [...chores].sort((a, b) => Number(a.done) - Number(b.done)),
    [chores]
  );

  const lastToggledChore = chores.find((c) => c.id === lastToggled);
  const confirmDeleteChore = chores.find((c) => c.id === confirmDeleteId);

  // Don't render dynamic content until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <DashboardPage title="Chores">
      <section className="chore-controls">
        <div className="chore-name-row">
          <input
            value={newChore}
            onChange={(e) => setNewChore(e.target.value)}
            placeholder="New chore name"
            aria-label="New chore name"
            onKeyDown={(e) => { if (e.key === "Enter") addChore(); }}
          />
          <button type="button" onClick={addChore} className="chore-add-btn">+ Add New</button>
        </div>
        <div className="chore-assignment-row">
          <label className="chore-select-field">
            Current Turn
            <select value={newTurn} onChange={(e) => {
              const selected = e.target.value;
              setNewTurn(selected);
              if (newPrev === selected) setNewPrev(getAlternateRoommate(selected));
            }}>
              {roommateNames.map((r) => (<option key={`turn-${r}`} value={r}>{r}</option>))}
            </select>
          </label>
          <label className="chore-select-field">
            Previous Turn
            <select value={newPrev} onChange={(e) => {
              const selected = e.target.value;
              setNewPrev(selected);
              if (newTurn === selected) setNewTurn(getAlternateRoommate(selected));
            }}>
              {roommateNames.map((r) => (<option key={`prev-${r}`} value={r}>{r}</option>))}
            </select>
          </label>
          <label className="chore-select-field">
            Day
            <select value={newDay} onChange={(e) => setNewDay(e.target.value)}>
              {WEEK_DAYS.map((day) => (<option key={`day-${day}`} value={day}>{formatLabel(day)}</option>))}
            </select>
          </label>
        </div>
        <p className="chore-helper-text">Manage members in Collab.</p>
      </section>

      {lastToggled && lastToggledChore && (
        <div className="chore-toast">
          <span>{formatLabel(lastToggledChore.name)} set to {lastToggledChore.done ? "done" : "incomplete"}.</span>
          <button type="button" onClick={undoToggle} className="chore-toast-undo">Undo</button>
        </div>
      )}

      <section className="chore-list">
        {orderedChores.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>
            No chores yet. Click + Add New to get started.
          </p>
        )}
        {orderedChores.map((chore) => (
          <article
            key={chore.id}
            className={`chore-card ${chore.done ? "done" : ""} ${isCurrentUserTurn(chore.turn) ? "your-turn" : ""}`}
          >
            <div className="chore-card-header">
              <h2 className="chore-name">{formatLabel(chore.name)}</h2>
              <span className="chore-day-badge">{formatLabel(chore.day)}</span>
            </div>
            <div className="chore-meta-row">
              <span className={`chore-meta-pill turn ${isCurrentUserTurn(chore.turn) ? "active" : ""}`}>
                <span className="pill-label">Current Turn</span>
                <strong>{formatLabel(chore.turn)}</strong>
              </span>
              <span className="chore-meta-pill prev">
                <span className="pill-label">Previous Turn</span>
                <strong>{formatLabel(chore.prev)}</strong>
              </span>
            </div>
            <div className="chore-card-actions">
              <button type="button" className={`check-btn ${chore.done ? "done" : ""}`} onClick={() => toggleDone(chore.id)}>
                {chore.done ? "Mark Incomplete" : "Mark Done"}
              </button>
              <button type="button" className="chore-delete-btn" onClick={() => setConfirmDeleteId(chore.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {confirmDeleteChore && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Chore</h3>
            <p style={{ margin: "0.75rem 0", color: "#2a6fa8" }}>Are you sure you want to delete <strong>{confirmDeleteChore.name}</strong>?</p>
            <div className="item-modal-actions">
              <button type="button" className="modal-btn" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button type="button" className="modal-btn delete" onClick={() => deleteChore(confirmDeleteChore.id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}
