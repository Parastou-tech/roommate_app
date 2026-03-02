"use client";

import { useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

export default function HomePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Bobby Milk");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(["Asian", "Mexican"]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["Peanuts", "Shellfish"]);
  const [preferenceOptions, setPreferenceOptions] = useState<string[]>([
    "Asian",
    "Mexican",
    "Italian",
    "Mediterranean"
  ]);
  const [allergyOptions, setAllergyOptions] = useState<string[]>(["Peanuts", "Shellfish", "Dairy", "Gluten"]);
  const [newPreference, setNewPreference] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  const displayPreferences = useMemo(
    () => Array.from(new Set([...preferenceOptions, ...selectedPreferences])),
    [preferenceOptions, selectedPreferences]
  );

  const displayAllergies = useMemo(
    () => Array.from(new Set([...allergyOptions, ...selectedAllergies])),
    [allergyOptions, selectedAllergies]
  );

  function getUpdatedTags(items: string[], value: string) {
    return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
  }

  function removePreference(value: string) {
    setPreferenceOptions((current) => current.filter((item) => item !== value));
    setSelectedPreferences((current) => current.filter((item) => item !== value));
  }

  function removeAllergy(value: string) {
    setAllergyOptions((current) => current.filter((item) => item !== value));
    setSelectedAllergies((current) => current.filter((item) => item !== value));
  }

  function addPreference() {
    const value = newPreference.trim();
    if (!value) {
      return;
    }

    if (!displayPreferences.includes(value)) {
      setPreferenceOptions((current) => [...current, value]);
    }

    setSelectedPreferences((current) => (current.includes(value) ? current : [...current, value]));
    setNewPreference("");
  }

  function addAllergy() {
    const value = newAllergy.trim();
    if (!value) {
      return;
    }

    if (!displayAllergies.includes(value)) {
      setAllergyOptions((current) => [...current, value]);
    }

    setSelectedAllergies((current) => (current.includes(value) ? current : [...current, value]));
    setNewAllergy("");
  }

  return (
    <DashboardPage title="Home">
      <section className="panel">
        <div className="profile-row">
          <div className="profile-info">
            <div className="avatar-dot" aria-hidden>
              BM
            </div>
            <div>
              {editing ? (
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="profile-name-input"
                  aria-label="Display name"
                />
              ) : (
                <div className="profile-name">{name}</div>
              )}
              <div className="profile-role">Student</div>
            </div>
          </div>
          <button
            type="button"
            className={`profile-edit ${editing ? "active" : ""}`}
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>

        <h2 className="section-title">Food Preferences</h2>
        <div className="pill-row">
          {displayPreferences.map((option) => {
            const active = selectedPreferences.includes(option);
            return (
              <div key={option} className={`pill-chip ${active ? "active" : ""} ${editing ? "" : "locked"}`}>
                <button
                  type="button"
                  className="pill-label-btn"
                  onClick={() => editing && setSelectedPreferences(getUpdatedTags(selectedPreferences, option))}
                >
                  {option}
                </button>
                <button
                  type="button"
                  className="pill-delete-btn"
                  aria-label={`Delete ${option}`}
                  onClick={() => removePreference(option)}
                >
                  ×
                </button>
              </div>
            );
          })}
          {editing ? (
            <button type="button" className="profile-edit section-add-btn" onClick={addPreference}>
              Add
            </button>
          ) : null}
        </div>
        {editing ? (
          <div className="section-add-row">
            <input
              value={newPreference}
              onChange={(event) => setNewPreference(event.target.value)}
              placeholder="Add food preference"
              aria-label="Add food preference"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addPreference();
                }
              }}
            />
          </div>
        ) : null}

        <h2 className="section-title">Allergies</h2>
        <div className="pill-row">
          {displayAllergies.map((option) => {
            const active = selectedAllergies.includes(option);
            return (
              <div key={option} className={`pill-chip ${active ? "active" : ""} ${editing ? "" : "locked"}`}>
                <button
                  type="button"
                  className="pill-label-btn"
                  onClick={() => editing && setSelectedAllergies(getUpdatedTags(selectedAllergies, option))}
                >
                  {option}
                </button>
                <button
                  type="button"
                  className="pill-delete-btn"
                  aria-label={`Delete ${option}`}
                  onClick={() => removeAllergy(option)}
                >
                  ×
                </button>
              </div>
            );
          })}
          {editing ? (
            <button type="button" className="profile-edit section-add-btn" onClick={addAllergy}>
              Add
            </button>
          ) : null}
        </div>
        {editing ? (
          <div className="section-add-row">
            <input
              value={newAllergy}
              onChange={(event) => setNewAllergy(event.target.value)}
              placeholder="Add allergy"
              aria-label="Add allergy"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addAllergy();
                }
              }}
            />
          </div>
        ) : null}
      </section>
    </DashboardPage>
  );
}
