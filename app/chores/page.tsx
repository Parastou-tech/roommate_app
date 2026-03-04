"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Chore = {
  id: string;
  name: string;
  turn: string;
  prev: string;
  icon: string;
  done: boolean;
};

type Member = {
  id: string;
  name: string;
  role: string;
  isYou: boolean;
};

const DEFAULT_CHORES: Chore[] = [
  { id: "1", name: "WASH DISHES", turn: "YOU", prev: "CALVIN", icon: "🍽️", done: false },
  { id: "2", name: "PUT DISHES AWAY", turn: "CALVIN", prev: "YOU", icon: "🥣", done: false },
  { id: "3", name: "CLEAN COUNTERTOPS", turn: "YOU", prev: "CALVIN", icon: "🧼", done: false },
  { id: "4", name: "SWEEP KITCHEN", turn: "CALVIN", prev: "YOU", icon: "🧹", done: true }
];

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
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Only load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const savedChores = localStorage.getItem("pp_chores");
      if (savedChores) setChores(JSON.parse(savedChores));

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
      { id: crypto.randomUUID(), name: name.toUpperCase(), turn: newTurn, prev: newPrev, icon: "🧽", done: false }
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
            Whose Turn
            <select value={newTurn} onChange={(e) => {
              const selected = e.target.value;
              setNewTurn(selected);
              if (newPrev === selected) setNewPrev(getAlternateRoommate(selected));
            }}>
              {roommateNames.map((r) => (<option key={`turn-${r}`} value={r}>{r}</option>))}
            </select>
          </label>
          <label className="chore-select-field">
            Previously
            <select value={newPrev} onChange={(e) => {
              const selected = e.target.value;
              setNewPrev(selected);
              if (newTurn === selected) setNewTurn(getAlternateRoommate(selected));
            }}>
              {roommateNames.map((r) => (<option key={`prev-${r}`} value={r}>{r}</option>))}
            </select>
          </label>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#888", margin: "0.5rem 0 0 0" }}>
          ℹ️ Add or remove members from the Collab page.
        </p>
      </section>

      {lastToggled && lastToggledChore && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.75rem 0", padding: "0.4rem 0.75rem", background: "rgba(24, 111, 195, 0.1)", border: "1px solid rgba(24, 111, 195, 0.3)", borderRadius: "8px", fontSize: "0.85rem", color: "#155999" }}>
          <span>"{lastToggledChore.name}" marked {lastToggledChore.done ? "done" : "incomplete"}.</span>
          <button type="button" onClick={undoToggle} style={{ fontWeight: 600, textDecoration: "underline", background: "none", border: "none", color: "#155999", cursor: "pointer" }}>Undo</button>
        </div>
      )}

      <section className="chore-list">
        {orderedChores.length === 0 && (
          <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>
            No chores yet. Click "+ Add New" to get started.
          </p>
        )}
        {orderedChores.map((chore) => (
          <article key={chore.id} className={`chore-card ${chore.done ? "done" : ""}`} style={{ padding: "0.75rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 className="chore-name" style={{ fontSize: "1rem", margin: 0 }}>{chore.name}</h2>
              <button type="button" onClick={() => setConfirmDeleteId(chore.id)} style={{ background: "none", border: "1px solid #c0392b", color: "#c0392b", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, borderRadius: "4px", padding: "2px 8px" }}>
                Delete Task
              </button>
            </div>
            <div className="chore-meta" style={{ fontSize: "0.8rem", margin: "0.25rem 0" }}>
              WHOSE TURN: <strong>{chore.turn}</strong> · PREVIOUSLY: {chore.prev}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button type="button" className={`check-btn ${chore.done ? "done" : ""}`} onClick={() => toggleDone(chore.id)} style={{ fontSize: "0.85rem" }}>
                {chore.done ? "✓ Done" : "Mark Done"}
              </button>
              <span aria-hidden style={{ fontSize: "1.2rem" }}>{chore.icon}</span>
            </div>
          </article>
        ))}
      </section>

      {confirmDeleteChore && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Chore</h3>
            <p style={{ margin: "0.75rem 0" }}>Are you sure you want to delete <strong>{confirmDeleteChore.name}</strong>?</p>
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