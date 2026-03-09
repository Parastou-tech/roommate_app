"use client";

import { useEffect, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Member = {
  id: string;
  name: string;
  role: string;
  isYou: boolean;
};

const DEFAULT_MEMBERS: Member[] = [
  { id: "1", name: "Bobby", role: "Student", isYou: true },
  { id: "2", name: "Calvin", role: "Student", isYou: false }
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
  const [members, setMembers] = useState<Member[]>(() => load("pp_members", DEFAULT_MEMBERS));
  const [newMember, setNewMember] = useState("");
  const [newRole, setNewRole] = useState("Student");
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);

  useEffect(() => { localStorage.setItem("pp_members", JSON.stringify(members)); }, [members]);

  function addMember() {
    if (!newMember.trim()) return;
    setMembers((current) => [...current, { id: crypto.randomUUID(), name: newMember.trim(), role: newRole, isYou: false }]);
    setNewMember("");
    setNewRole("Student");
  }

  function removeMember(id: string) {
    setMembers((current) => current.filter((m) => m.id !== id));
    setConfirmRemove(null);
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <DashboardPage title="Collab">
      <section className="panel group-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 className="control-title" style={{ margin: 0 }}>Your Group</h2>
          <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{members.length} member{members.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="member-list">
          {members.map((member) => (
            <div key={member.id} className="member-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.65rem 0.75rem" }}>
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
              {!member.isYou && (
                <button type="button" onClick={() => setConfirmRemove(member)} style={{ background: "none", border: "1px solid #c0392b", color: "#c0392b", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, borderRadius: "4px", padding: "3px 10px", whiteSpace: "nowrap" }} aria-label={`Remove ${member.name}`}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="add-user-row">
          <input value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="Add user" aria-label="Add user" onKeyDown={(e) => { if (e.key === "Enter") addMember(); }} />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} aria-label="Occupation">
            <option value="Student">Student</option>
            <option value="Roommate">Roommate</option>
            <option value="Guest">Guest</option>
          </select>
          <button type="button" onClick={addMember}>+ Add Member</button>
        </div>
      </section>

      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Member</h3>
            <p style={{ margin: "0.75rem 0", color: "#2a6fa8" }}>Are you sure you want to remove <strong>{confirmRemove.name}</strong> from your group?</p>
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
