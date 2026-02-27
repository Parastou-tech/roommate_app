"use client";

import { useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Meal = {
  name: string;
  feeds: number;
  time: number;
  ingredients: string[];
};

const availableInventory = [
  "chicken",
  "rice",
  "egg",
  "lettuce",
  "tortilla",
  "cheese",
];

const meals: Meal[] = [
  {
    name: "Oyakadon",
    feeds: 4,
    time: 30,
    ingredients: ["chicken", "rice", "egg"],
  },
  {
    name: "Chicken Salad",
    feeds: 3,
    time: 20,
    ingredients: ["chicken", "lettuce", "cheese"],
  },
  {
    name: "Tacos",
    feeds: 2,
    time: 25,
    ingredients: ["tortilla", "cheese", "chicken"],
  },
  {
    name: "Mexican Risotto",
    feeds: 2,
    time: 40,
    ingredients: ["rice", "cheese", "beans"],
  },
];

export default function MealsPage() {
  const [sortOption, setSortOption] = useState("match");

  function getMatchPercentage(meal: Meal) {
    const matched = meal.ingredients.filter((ingredient) =>
      availableInventory.includes(ingredient)
    ).length;
    return Math.round((matched / meal.ingredients.length) * 100);
  }

  const sortedMeals = [...meals].sort((a, b) => {
    if (sortOption === "time") return a.time - b.time;
    if (sortOption === "feeds") return b.feeds - a.feeds;
    if (sortOption === "match")
      return getMatchPercentage(b) - getMatchPercentage(a);
    return 0;
  });

  return (
    <DashboardPage title="Meals">
      <div className="meals-container">
        <div className="meals-filters">
          <label>Sort </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="match">Ingredient Match</option>
            <option value="feeds">Feeds</option>
            <option value="time">Time</option>
          </select>
        </div>

        <div className="meals-list">
          {sortedMeals.map((meal) => {
            const match = getMatchPercentage(meal);

            return (
              <div key={meal.name} className="meal-card">
                <div>
                  <h2>{meal.name}</h2>
                  <p className={`match-indicator ${getMatchClass(match)}`}>
                    {match}% ingredient match
                  </p>
                </div>

                <div className="meal-badges">
                  <span className="badge">Feeds: {meal.feeds}</span>
                  <span className="badge">Time: {meal.time} min</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardPage>
  );
}

function getMatchClass(match: number) {
  if (match === 100) return "match-perfect";
  if (match >= 70) return "match-good";
  return "match-low";
}