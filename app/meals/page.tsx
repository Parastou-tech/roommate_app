"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Meal = {
  id: string;
  name: string;
  feeds: number;
  minutes: number;
  match: number;
  companions: string[];
};

type Member = {
  id: string;
  name: string;
  role: string;
  isYou: boolean;
};

const DEFAULT_MEALS: Meal[] = [
  { id: "1", name: "Oyakadon", feeds: 4, minutes: 30, match: 100, companions: ["Calvin", "Jeff"] },
  { id: "2", name: "Chicken Salad", feeds: 3, minutes: 20, match: 95, companions: ["Calvin"] },
  { id: "3", name: "Tacos", feeds: 2, minutes: 25, match: 73, companions: ["Rob"] },
  { id: "4", name: "Mexican Risotto", feeds: 2, minutes: 40, match: 67, companions: ["Jeff"] }
];

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>(() => load("pp_meals", DEFAULT_MEALS));
  const [members, setMembers] = useState<Member[]>(() => load("pp_members", []));
  const [sortBy, setSortBy] = useState<"match" | "feeds" | "minutes">("match");
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);
  const [savedMeals, setSavedMeals] = useState<string[]>(() => load("pp_saved_meals", []));
  const [confirmRemoveMeal, setConfirmRemoveMeal] = useState<Meal | null>(null);
  const [newMealName, setNewMealName] = useState("");
  const [newMealFeeds, setNewMealFeeds] = useState(2);
  const [newMealMinutes, setNewMealMinutes] = useState(30);
  const [newMealCompanions, setNewMealCompanions] = useState<string[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);

  // Sync members from localStorage
  useEffect(() => {
    const synced = load<Member[]>("pp_members", []);
    setMembers(synced);
  }, []);

  useEffect(() => { localStorage.setItem("pp_meals", JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem("pp_saved_meals", JSON.stringify(savedMeals)); }, [savedMeals]);

  const companionOptions = members.map((m) => m.name);

  function toggleCompanion(name: string) {
    setSelectedCompanions((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]
    );
  }

  function toggleNewMealCompanion(name: string) {
    setNewMealCompanions((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]
    );
  }

  function addMeal() {
    const name = newMealName.trim();
    if (!name) return;
    setMeals((current) => [
      ...current,
      { id: crypto.randomUUID(), name, feeds: newMealFeeds, minutes: newMealMinutes, match: 0, companions: newMealCompanions }
    ]);
    setNewMealName("");
    setNewMealFeeds(2);
    setNewMealMinutes(30);
    setNewMealCompanions([]);
    setShowAddMeal(false);
  }

  function removeMeal(id: string) {
    const meal = meals.find((m) => m.id === id);
    setMeals((current) => current.filter((m) => m.id !== id));
    if (meal) setSavedMeals((current) => current.filter((name) => name !== meal.name));
    setConfirmRemoveMeal(null);
  }

  const visibleMeals = useMemo(() => {
    const filtered = meals.filter((meal) =>
      selectedCompanions.length === 0 ? true : meal.companions.some((c) => selectedCompanions.includes(c))
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "feeds") return b.feeds - a.feeds;
      if (sortBy === "minutes") return a.minutes - b.minutes;
      return b.match - a.match;
    });
  }, [selectedCompanions, sortBy, meals]);

  const isFiltered = selectedCompanions.length > 0 && selectedCompanions.length < companionOptions.length;

  return (
    <DashboardPage title="Meals">
      <div className="meals-layout">
        <aside className="filter-box">
          <h2 className="control-title">Sort</h2>
          <label className="filter-label" htmlFor="sort-meals">Meal Feed</label>
          <select id="sort-meals" value={sortBy} onChange={(e) => setSortBy(e.target.value as "match" | "feeds" | "minutes")}>
            <option value="match">Ingredient Match</option>
            <option value="feeds">Feeds Most</option>
            <option value="minutes">Cook Time</option>
          </select>

          <p className="filter-label">Meal Companions</p>
          <p className="filter-hint">Pick one or multiple</p>
          <div className="radio-stack">
            {companionOptions.map((name) => (
              <label key={name}>
                <input type="checkbox" checked={selectedCompanions.includes(name)} onChange={() => toggleCompanion(name)} />
                {name}
              </label>
            ))}
          </div>
          <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.5rem" }}>
            ℹ️ Add or remove companions from the Collab page.
          </p>
        </aside>

        <section className="meal-list">
          {isFiltered && (
            <p style={{ margin: "0 0 0.75rem 0", padding: "0.4rem 0.75rem", background: "rgba(24, 111, 195, 0.1)", border: "1px solid rgba(24, 111, 195, 0.3)", borderRadius: "8px", fontSize: "0.85rem", color: "#155999" }}>
              Showing meals for: <strong>{selectedCompanions.join(", ")}</strong>
            </p>
          )}

          <p style={{ fontSize: "0.8rem", color: "#888", margin: "0 0 0.75rem 0" }}>
            ℹ️ Ingredient match % shows how many ingredients you already have in your inventory.
          </p>

          <button type="button" onClick={() => setShowAddMeal((v) => !v)} style={{ marginBottom: "0.75rem", fontSize: "0.9rem", fontWeight: 600, background: "none", border: "1px solid #186fc3", color: "#186fc3", borderRadius: "8px", padding: "0.4rem 1rem", cursor: "pointer" }}>
            {showAddMeal ? "Cancel" : "+ Add Meal"}
          </button>

          {showAddMeal && (
            <div style={{ background: "#f5f8fc", border: "1px solid #d0e2f5", borderRadius: "10px", padding: "1rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="Meal name" style={{ fontSize: "0.9rem" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  Feeds
                  <input type="number" min={1} value={newMealFeeds} onChange={(e) => setNewMealFeeds(Number(e.target.value))} style={{ fontSize: "0.85rem" }} />
                </label>
                <label style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  Minutes
                  <input type="number" min={1} value={newMealMinutes} onChange={(e) => setNewMealMinutes(Number(e.target.value))} style={{ fontSize: "0.85rem" }} />
                </label>
              </div>
              <p style={{ fontSize: "0.85rem", margin: 0 }}>Companions</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {companionOptions.map((name) => (
                  <label key={name} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <input type="checkbox" checked={newMealCompanions.includes(name)} onChange={() => toggleNewMealCompanion(name)} />
                    {name}
                  </label>
                ))}
              </div>
              <button type="button" onClick={addMeal} style={{ fontSize: "0.9rem", fontWeight: 600, background: "#186fc3", border: "none", color: "white", borderRadius: "8px", padding: "0.4rem 1rem", cursor: "pointer", alignSelf: "flex-start" }}>
                Save Meal
              </button>
            </div>
          )}

          {meals.length === 0 && (
            <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>No meals yet. Click "+ Add Meal" to get started.</p>
          )}
          {visibleMeals.length === 0 && meals.length > 0 && (
            <p style={{ color: "#888" }}>No meals match the selected companions.</p>
          )}

          {visibleMeals.map((meal) => {
            const saved = savedMeals.includes(meal.name);
            return (
              <article key={meal.id} className="meal-card">
                <div>
                  <h3 className="meal-name">{meal.name}</h3>
                  <div className="meal-match">{meal.match}% ingredient match</div>
                </div>
                <div className="meal-meta">Feeds: {meal.feeds}</div>
                <div className="meal-meta">Time: {meal.minutes} min</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button type="button" className={`meal-action ${saved ? "active" : ""}`} onClick={() => setSavedMeals((items) => items.includes(meal.name) ? items.filter((n) => n !== meal.name) : [...items, meal.name])}>
                    {saved ? "Saved ✓" : "Save"}
                  </button>
                  <button type="button" onClick={() => setConfirmRemoveMeal(meal)} style={{ background: "none", border: "1px solid #c0392b", color: "#c0392b", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, borderRadius: "6px", padding: "0.3rem 0.75rem" }}>
                    Remove
                  </button>
                </div>
              </article>
            );
          })}

          <p style={{ margin: "0.9rem 0 0", fontSize: "0.95rem", color: "#5f6f80", textAlign: "center" }}>
            {visibleMeals.length} out of {meals.length} meals shown
          </p>
        </section>
      </div>

      {confirmRemoveMeal && (
        <div className="modal-overlay" onClick={() => setConfirmRemoveMeal(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Meal</h3>
            <p style={{ margin: "0.75rem 0" }}>Are you sure you want to remove <strong>{confirmRemoveMeal.name}</strong>?</p>
            <div className="item-modal-actions">
              <button type="button" className="modal-btn" onClick={() => setConfirmRemoveMeal(null)}>Cancel</button>
              <button type="button" className="modal-btn delete" onClick={() => removeMeal(confirmRemoveMeal.id)}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}
