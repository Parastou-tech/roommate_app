"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Meal = {
  id: string;
  name: string;
  feeds: number;
  minutes: number;
  companions: string[];
  ingredients: string[];
  match?: number;
};

type Member = {
  id: string;
  name: string;
  role: string;
  isYou: boolean;
};

type InventoryItem = {
  name: string;
  stock: string;
};

type StoredMeal = Omit<Meal, "ingredients"> & { ingredients?: string[] };

const DEFAULT_MEALS: Meal[] = [
  { id: "1", name: "Oyakadon", feeds: 4, minutes: 30, companions: ["Calvin", "Jeff"], ingredients: ["Chicken", "Eggs", "Rice"] },
  { id: "2", name: "Chicken Salad", feeds: 3, minutes: 20, companions: ["Calvin"], ingredients: ["Chicken", "Lettuce", "Olive Oil"] },
  { id: "3", name: "Tacos", feeds: 2, minutes: 25, companions: ["Rob"], ingredients: ["Chicken", "Bell Peppers", "Black Beans"] },
  { id: "4", name: "Mexican Risotto", feeds: 2, minutes: 40, companions: ["Jeff"], ingredients: ["Rice", "Bell Peppers", "Olive Oil"] }
];

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeIngredient(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMeal(meal: StoredMeal): Meal {
  return {
    ...meal,
    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.filter((ingredient) => ingredient.trim().length > 0) : []
  };
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>(() => load<StoredMeal[]>("pp_meals", DEFAULT_MEALS).map(normalizeMeal));
  const [members, setMembers] = useState<Member[]>(() => load("pp_members", []));
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => load("pp_inventory", []));
  const [sortBy, setSortBy] = useState<"match" | "feeds" | "minutes">("match");
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);
  const [confirmRemoveMeal, setConfirmRemoveMeal] = useState<Meal | null>(null);
  const [newMealName, setNewMealName] = useState("");
  const [newMealFeeds, setNewMealFeeds] = useState(2);
  const [newMealMinutes, setNewMealMinutes] = useState(30);
  const [newMealCompanions, setNewMealCompanions] = useState<string[]>([]);
  const [newMealIngredients, setNewMealIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [showAddMeal, setShowAddMeal] = useState(false);

  // Sync members from localStorage
  useEffect(() => {
    const synced = load<Member[]>("pp_members", []);
    setMembers(synced);
    const syncedInventory = load<InventoryItem[]>("pp_inventory", []);
    setInventoryItems(syncedInventory);
  }, []);

  useEffect(() => { localStorage.setItem("pp_meals", JSON.stringify(meals)); }, [meals]);

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

  function toggleNewMealIngredient(name: string) {
    const normalized = normalizeIngredient(name);
    setNewMealIngredients((current) =>
      current.some((entry) => normalizeIngredient(entry) === normalized)
        ? current.filter((entry) => normalizeIngredient(entry) !== normalized)
        : [...current, name]
    );
  }

  function addCustomIngredient() {
    const value = newIngredient.trim();
    if (!value) return;
    const normalized = normalizeIngredient(value);
    setNewMealIngredients((current) =>
      current.some((entry) => normalizeIngredient(entry) === normalized) ? current : [...current, value]
    );
    setNewIngredient("");
  }

  function addMeal() {
    const name = newMealName.trim();
    if (!name) return;
    setMeals((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name,
        feeds: newMealFeeds,
        minutes: newMealMinutes,
        companions: newMealCompanions,
        ingredients: newMealIngredients
      }
    ]);
    setNewMealName("");
    setNewMealFeeds(2);
    setNewMealMinutes(30);
    setNewMealCompanions([]);
    setNewMealIngredients([]);
    setNewIngredient("");
    setShowAddMeal(false);
  }

  function removeMeal(id: string) {
    setMeals((current) => current.filter((m) => m.id !== id));
    setConfirmRemoveMeal(null);
  }

  const inventoryIngredientOptions = useMemo(() =>
    Array.from(
      new Set(
        inventoryItems
          .map((item) => item.name?.trim())
          .filter((name): name is string => Boolean(name))
      )
    ),
  [inventoryItems]);

  const availableInventoryIngredients = useMemo(() =>
    new Set(
      inventoryItems
        .filter((item) => normalizeIngredient(item.stock ?? "") !== "out of stock")
        .map((item) => normalizeIngredient(item.name ?? ""))
        .filter(Boolean)
    ),
  [inventoryItems]);

  const getMealMatchPercent = useCallback((meal: Meal) => {
    const ingredients = (meal.ingredients ?? []).map(normalizeIngredient).filter(Boolean);
    if (ingredients.length === 0) return typeof meal.match === "number" ? meal.match : 0;
    const availableCount = ingredients.filter((ingredient) => availableInventoryIngredients.has(ingredient)).length;
    return Math.round((availableCount / ingredients.length) * 100);
  }, [availableInventoryIngredients]);

  const visibleMeals = useMemo(() => {
    const filtered = meals.filter((meal) =>
      selectedCompanions.length === 0 ? true : meal.companions.some((c) => selectedCompanions.includes(c))
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "feeds") return b.feeds - a.feeds;
      if (sortBy === "minutes") return a.minutes - b.minutes;
      return getMealMatchPercent(b) - getMealMatchPercent(a);
    });
  }, [selectedCompanions, sortBy, meals, getMealMatchPercent]);

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

          {!showAddMeal && (
            <button type="button" className="meal-toggle-btn" onClick={() => setShowAddMeal(true)}>
              + Add Meal
            </button>
          )}

          {showAddMeal && (
            <div className="meal-add-panel">
              <input className="meal-add-input" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="Meal name" />
              <div className="meal-add-grid">
                <label className="meal-add-field">
                  Feeds
                  <input className="meal-add-input" type="number" min={1} value={newMealFeeds} onChange={(e) => setNewMealFeeds(Number(e.target.value))} />
                </label>
                <label className="meal-add-field">
                  Minutes
                  <input className="meal-add-input" type="number" min={1} value={newMealMinutes} onChange={(e) => setNewMealMinutes(Number(e.target.value))} />
                </label>
              </div>
              <p className="meal-add-companions-title">Companions</p>
              <div className="meal-add-companions">
                {companionOptions.map((name) => (
                  <label key={name} className="meal-add-companion">
                    <input type="checkbox" checked={newMealCompanions.includes(name)} onChange={() => toggleNewMealCompanion(name)} />
                    {name}
                  </label>
                ))}
              </div>
              <p className="meal-add-companions-title">Ingredients</p>
              <div className="meal-ingredient-entry">
                <input
                  className="meal-add-input"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Type ingredient and press Enter"
                  onKeyDown={(e) => { if (e.key === "Enter") addCustomIngredient(); }}
                />
                <button type="button" className="meal-ingredient-add-btn" onClick={addCustomIngredient}>+ Add</button>
              </div>
              {newMealIngredients.length > 0 && (
                <div className="meal-ingredient-chips">
                  {newMealIngredients.map((ingredient) => (
                    <button key={`new-ingredient-${ingredient}`} type="button" className="meal-ingredient-chip" onClick={() => toggleNewMealIngredient(ingredient)}>
                      {ingredient} ×
                    </button>
                  ))}
                </div>
              )}
              {inventoryIngredientOptions.length > 0 && (
                <div className="meal-ingredient-suggestions">
                  {inventoryIngredientOptions.map((ingredient) => (
                    <button
                      key={`inventory-ingredient-${ingredient}`}
                      type="button"
                      className={`meal-ingredient-option ${newMealIngredients.some((entry) => normalizeIngredient(entry) === normalizeIngredient(ingredient)) ? "selected" : ""}`}
                      onClick={() => toggleNewMealIngredient(ingredient)}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
              )}
              <div className="meal-add-actions">
                <button type="button" className="meal-add-save-btn" onClick={addMeal}>
                  Save Meal
                </button>
                <button type="button" className="meal-add-cancel-btn" onClick={() => setShowAddMeal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {meals.length === 0 && (
            <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>No meals yet. Click + Add Meal to get started.</p>
          )}
          {visibleMeals.length === 0 && meals.length > 0 && (
            <p style={{ color: "#888" }}>No meals match the selected companions.</p>
          )}

          {visibleMeals.map((meal) => (
            <article key={meal.id} className="meal-card">
              <div>
                <h3 className="meal-name">{meal.name}</h3>
                <div className="meal-match">{getMealMatchPercent(meal)}% ingredient match</div>
              </div>
              <div className="meal-meta">Feeds: {meal.feeds}</div>
              <div className="meal-meta">Time: {meal.minutes} min</div>
              <div className="meal-actions">
                <button type="button" className="meal-remove-btn" onClick={() => setConfirmRemoveMeal(meal)}>
                  Remove
                </button>
              </div>
            </article>
          ))}

          <p style={{ margin: "0.9rem 0 0", fontSize: "0.95rem", color: "#5f6f80", textAlign: "center" }}>
            {visibleMeals.length} out of {meals.length} meals shown
          </p>
        </section>
      </div>

      {confirmRemoveMeal && (
        <div className="modal-overlay" onClick={() => setConfirmRemoveMeal(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Meal</h3>
            <p style={{ margin: "0.75rem 0", color: "#2a6fa8" }}>Are you sure you want to remove <strong>{confirmRemoveMeal.name}</strong>?</p>
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
