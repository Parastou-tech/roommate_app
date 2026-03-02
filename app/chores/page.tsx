"use client";

import { useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

const roommates = ["YOU", "CALVIN"] as const;
type Roommate = (typeof roommates)[number];

type Chore = {
  id: string;
  name: string;
  turn: Roommate;
  prev: Roommate;
  icon: string;
  done: boolean;
};

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([
    { id: "1", name: "WASH DISHES", turn: "YOU", prev: "CALVIN", icon: "🍽️", done: false },
    { id: "2", name: "PUT DISHES AWAY", turn: "CALVIN", prev: "YOU", icon: "🥣", done: false },
    { id: "3", name: "CLEAN COUNTERTOPS", turn: "YOU", prev: "CALVIN", icon: "🧼", done: false },
    { id: "4", name: "SWEEP KITCHEN", turn: "CALVIN", prev: "YOU", icon: "🧹", done: true }
  ]);
  const [newChore, setNewChore] = useState("");
  const [newTurn, setNewTurn] = useState<Roommate>("YOU");
  const [newPrev, setNewPrev] = useState<Roommate>("CALVIN");

  function getAlternateRoommate(selected: Roommate) {
    return roommates.find((roommate) => roommate !== selected) ?? selected;
  }

  function toggleDone(id: string) {
    setChores((current) =>
      current.map((chore) => {
        if (chore.id !== id) {
          return chore;
        }

        return { ...chore, done: !chore.done };
      })
    );
  }

  function addChore() {
    const name = newChore.trim();
    if (!name) {
      return;
    }

    setChores((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: name.toUpperCase(),
        turn: newTurn,
        prev: newPrev,
        icon: "🧽",
        done: false
      }
    ]);
    setNewChore("");
  }

  const orderedChores = useMemo(() => [...chores].sort((a, b) => Number(a.done) - Number(b.done)), [chores]);

  return (
    <DashboardPage title="Chores">
      <section className="chore-controls">
        <div className="chore-name-row">
          <input
            value={newChore}
            onChange={(event) => setNewChore(event.target.value)}
            placeholder="New chore name"
            aria-label="New chore name"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addChore();
              }
            }}
          />
          <button type="button" onClick={addChore} className="chore-add-btn">
            + Add New
          </button>
        </div>
        <div className="chore-assignment-row">
          <label className="chore-select-field">
            Turn
            <select
              value={newTurn}
              onChange={(event) => {
                const selected = event.target.value as Roommate;
                setNewTurn(selected);
                if (newPrev === selected) {
                  setNewPrev(getAlternateRoommate(selected));
                }
              }}
              aria-label="Choose whose turn it is"
            >
              {roommates.map((roommate) => (
                <option key={`turn-${roommate}`} value={roommate}>
                  {roommate}
                </option>
              ))}
            </select>
          </label>
          <label className="chore-select-field">
            Previous
            <select
              value={newPrev}
              onChange={(event) => {
                const selected = event.target.value as Roommate;
                setNewPrev(selected);
                if (newTurn === selected) {
                  setNewTurn(getAlternateRoommate(selected));
                }
              }}
              aria-label="Choose who did it previously"
            >
              {roommates.map((roommate) => (
                <option key={`prev-${roommate}`} value={roommate}>
                  {roommate}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="chore-list">
        {orderedChores.map((chore) => (
          <article key={chore.id} className={`chore-card ${chore.done ? "done" : ""}`}>
            <h2 className="chore-name">{chore.name}</h2>
            <div className="chore-meta">
              TURN: <strong>{chore.turn}</strong>
              <br />
              PREV: {chore.prev}
            </div>
            <button
              type="button"
              className={`check-btn ${chore.done ? "done" : ""}`}
              onClick={() => toggleDone(chore.id)}
              aria-label={`${chore.done ? "Mark incomplete" : "Mark complete"}: ${chore.name}`}
            >
              {chore.done ? "✓" : "✕"}
            </button>
            <div className="chore-icon" aria-hidden>
              {chore.icon}
            </div>
          </article>
        ))}
      </section>
    </DashboardPage>
  );
}
