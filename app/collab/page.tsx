"use client";

import { useState } from "react";
import DashboardPage from "@/components/DashboardPage";

export default function CollabPage() {
  const [members, setMembers] = useState<string[]>(["Bobby (You)", "Calvin"]);
  const [newMember, setNewMember] = useState("");

  function addMember() {
    if (!newMember.trim()) {
      return;
    }
    setMembers((current) => [...current, newMember.trim()]);
    setNewMember("");
  }

  return (
    <DashboardPage title="Collab">
      <section className="panel group-panel">
        <h2 className="control-title">Your Group</h2>
        <div className="member-list">
          {members.map((member) => (
            <div key={member} className="member-card">
              {member}
            </div>
          ))}
        </div>
        <div className="add-user-row">
          <input
            value={newMember}
            onChange={(event) => setNewMember(event.target.value)}
            placeholder="Add user"
            aria-label="Add user"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addMember();
              }
            }}
          />
          <button type="button" onClick={addMember} aria-label="Add user button">
            +
          </button>
        </div>
      </section>
    </DashboardPage>
  );
}
