"use client";

import { useEffect, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Member = {
  id: string;
  name: string;
  role: string;
  isYou: boolean;
  allergies: string[];
  preferences: string[];
};

const DEFAULT_MEMBERS: Member[] = [
  { id: "1", name: "Bobby", role: "Student", isYou: true, allergies: ["Peanuts", "Shellfish"], preferences: ["Asian", "Mexican"] },
  { id: "2", name: "Calvin", role: "Student", isYou: false, allergies: ["Dairy"], preferences: ["Italian"] }
];

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export default function CollabPage() {
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [newMember, setNewMember] = useState("");
  const [newRole, setNewRole] = useState("Student");
  const [newAllergies, setNewAllergies] = useState("");
  const [newPreferences, setNewPreferences] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = load<Member[]>("pp_members", DEFAULT_MEMBERS);
    const migrated = saved.map((m) => ({
      ...m,
      allergies: m.allergies ?? [],
      preferences: m.preferences ?? []
    }));
    setMembers(migrated);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("pp_members", JSON.stringify(members));
  }, [members, mounted]);

  function addMember() {
    if (!newMember.trim()) return;
    setMembers((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: newMember.trim(),
        role: newRole,
        isYou: false,
        allergies: newAllergies.split(",").map((a) => a.trim()).filter(Boolean),
        preferences: newPreferences.split(",").map((p) => p.trim()).filter(Boolean)
      }
    ]);
    setNewMember("");
    setNewRole("Student");
    setNewAllergies("");
    setNewPreferences("");
    setShowAddForm(false);
  }

  function removeMember(id: string) {
    setMembers((current) => current.filter((m) => m.id !== id));
    setConfirmRemove(null);
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  if (!mounted) return null;

  return (
    <DashboardPage title="Collab">
      <section className="panel group-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 className="control-title" style={{ margin: 0 }}>Your Group</h2>
          <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{members.length} member{members.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="member-list">
          {members.map((member) => (
            <div key={member.id} style={{ marginBottom: "0.5rem", border: "1px solid #e0eaf5", borderRadius: "10px", overflow: "hidden" }}>
              <div
                className="member-card"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.65rem 0.75rem", cursor: "pointer", margin: 0, borderRadius: 0, border: "none" }}
                onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: member.isYou ? "linear-gradient(135deg, #186fc3, #4aa3e8)" : "linear-gradient(135deg, #6c757d, #adb5bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#186fc3" }}>
                      {member.name}
                      {member.isYou && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "rgba(24,111,195,0.1)", color: "#186fc3", borderRadius: "20px", padding: "1px 8px", fontWeight: 600 }}>You</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{member.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{expandedId === member.id ? "▲" : "▼"}</span>
                  {!member.isYou && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmRemove(member); }}
                      style={{ background: "none", border: "1px solid #c0392b", color: "#c0392b", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, borderRadius: "4px", padding: "3px 10px", whiteSpace: "nowrap" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {expandedId === member.id && (
                <div style={{ padding: "0.75rem 1rem", background: "#f5f8fc", borderTop: "1px solid #e0eaf5" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#186fc3" }}>🍜 Food Preferences</span>
                    <div style={{ marginTop: "0.25rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {member.preferences.length > 0 ? member.preferences.map((p) => (
                        <span key={p} style={{ fontSize: "0.78rem", background: "rgba(24,111,195,0.1)", color: "#186fc3", borderRadius: "20px", padding: "2px 10px", fontWeight: 500 }}>{p}</span>
                      )) : <span style={{ fontSize: "0.78rem", color: "#aaa" }}>None listed</span>}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#c0392b" }}>⚠️ Allergies</span>
                    <div style={{ marginTop: "0.25rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {member.allergies.length > 0 ? member.allergies.map((a) => (
                        <span key={a} style={{ fontSize: "0.78rem", background: "rgba(192,57,43,0.08)", color: "#c0392b", borderRadius: "20px", padding: "2px 10px", fontWeight: 500 }}>{a}</span>
                      )) : <span style={{ fontSize: "0.78rem", color: "#aaa" }}>None listed</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Toggle add form button */}
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          style={{
            marginTop: "0.75rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            background: "none",
            border: "1px solid #186fc3",
            color: "#186fc3",
            borderRadius: "8px",
            padding: "0.4rem 1rem",
            cursor: "pointer",
            width: "100%"
          }}
        >
          {showAddForm ? "Cancel" : "+ Add Member"}
        </button>

        {/* Add member form — only shows when expanded */}
        {showAddForm && (
          <div style={{
            marginTop: "0.75rem",
            background: "#f5f8fc",
            border: "1px solid #d0e2f5",
            borderRadius: "10px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem"
          }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#186fc3" }}>New Member</p>

            {/* Name + Role row */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Name"
                aria-label="Add user"
                style={{ flex: 1, minWidth: 0 }}
                onKeyDown={(e) => { if (e.key === "Enter") addMember(); }}
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                style={{ fontSize: "0.85rem", flexShrink: 0 }}
              >
                <option value="Student">Student</option>
                <option value="Roommate">Roommate</option>
                <option value="Guest">Guest</option>
              </select>
            </div>

            {/* Preferences */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#186fc3", display: "block", marginBottom: "0.25rem" }}>
                🍜 Food Preferences
              </label>
              <input
                value={newPreferences}
                onChange={(e) => setNewPreferences(e.target.value)}
                placeholder="e.g. Asian, Italian"
                style={{ width: "100%", fontSize: "0.85rem", boxSizing: "border-box" }}
              />
            </div>

            {/* Allergies */}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#c0392b", display: "block", marginBottom: "0.25rem" }}>
                ⚠️ Allergies
              </label>
              <input
                value={newAllergies}
                onChange={(e) => setNewAllergies(e.target.value)}
                placeholder="e.g. Peanuts, Dairy"
                style={{ width: "100%", fontSize: "0.85rem", boxSizing: "border-box" }}
              />
            </div>

            <p style={{ margin: 0, fontSize: "0.75rem", color: "#aaa" }}>Separate multiple items with commas</p>

            <button
              type="button"
              onClick={addMember}
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                background: "#186fc3",
                border: "none",
                color: "white",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                alignSelf: "flex-start"
              }}
            >
              Save Member
            </button>
          </div>
        )}
      </section>

      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Member</h3>
            <p style={{ margin: "0.75rem 0" }}>Are you sure you want to remove <strong>{confirmRemove.name}</strong> from your group?</p>
            <div className="item-modal-actions">
              <button type="button" className="modal-btn" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button type="button" className="modal-btn delete" onClick={() => removeMember(confirmRemove.id)}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}