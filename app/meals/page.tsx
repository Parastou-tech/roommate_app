"use client";

import { useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Meal = {
  name: string;
  feeds: number;
  minutes: number;
  match: number;
  companions: string[];
};

const mealData: Meal[] = [
  { name: "Oyakadon", feeds: 4, minutes: 30, match: 100, companions: ["Calvin", "Jeff"] },
  { name: "Chicken Salad", feeds: 3, minutes: 20, match: 95, companions: ["Calvin"] },
  { name: "Tacos", feeds: 2, minutes: 25, match: 73, companions: ["Rob"] },
  { name: "Mexican Risotto", feeds: 2, minutes: 40, match: 67, companions: ["Jeff"] }
];

const companionOptions = ["Calvin", "Jeff", "Rob"];

export default function MealsPage() {
  const [sortBy, setSortBy] = useState<"match" | "feeds" | "minutes">("match");
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>(["Calvin"]);
  const [savedMeals, setSavedMeals] = useState<string[]>([]);

  function toggleCompanion(name: string) {
    setSelectedCompanions((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]
    );
  }

  const visibleMeals = useMemo(() => {
    const filtered = mealData.filter((meal) =>
      selectedCompanions.length === 0
        ? true
        : meal.companions.some((companion) => selectedCompanions.includes(companion))
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === "feeds") {
        return b.feeds - a.feeds;
      }
      if (sortBy === "minutes") {
        return a.minutes - b.minutes;
      }
      return b.match - a.match;
    });
  }, [selectedCompanions, sortBy]);

  return (
    <DashboardPage title="Meals">
      <div className="meals-layout">
        <aside className="filter-box">
          <h2 className="control-title">Sort</h2>
          <label className="filter-label" htmlFor="sort-meals">
            Meal Feed
          </label>
          <select
            id="sort-meals"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "match" | "feeds" | "minutes")}
          >
            <option value="match">Ingredient Match</option>
            <option value="feeds">Feeds Most</option>
            <option value="minutes">Cook Time</option>
          </select>

          <p className="filter-label">Meal Companions</p>
          <p className="filter-hint">Pick one or multiple</p>
          <div className="radio-stack">
            {companionOptions.map((name) => (
              <label key={name}>
                <input
                  type="checkbox"
                  name="companion"
                  value={name}
                  checked={selectedCompanions.includes(name)}
                  onChange={() => toggleCompanion(name)}
                />
                {name}
              </label>
            ))}
          </div>
        </aside>

        <section className="meal-list">
          {visibleMeals.map((meal) => {
            const saved = savedMeals.includes(meal.name);
            return (
              <article key={meal.name} className="meal-card">
                <div>
                  <h3 className="meal-name">{meal.name}</h3>
                  <div className="meal-match">{meal.match}% ingredient match</div>
                </div>
                <div className="meal-meta">Feeds: {meal.feeds}</div>
                <div className="meal-meta">Time: {meal.minutes} min</div>
                <button
                  type="button"
                  className={`meal-action ${saved ? "active" : ""}`}
                  onClick={() =>
                    setSavedMeals((items) =>
                      items.includes(meal.name) ? items.filter((name) => name !== meal.name) : [...items, meal.name]
                    )
                  }
                >
                  {saved ? "Saved" : "Save"}
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </DashboardPage>
  );
}
