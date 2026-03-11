"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

const DEFAULT_NAME = "Bobby Milk";
const DEFAULT_SELECTED_PREFERENCES = ["Asian", "Mexican"];
const DEFAULT_SELECTED_ALLERGIES = ["Peanuts", "Shellfish"];
const DEFAULT_PREFERENCE_OPTIONS = ["Asian", "Mexican", "Italian", "Mediterranean"];
const DEFAULT_ALLERGY_OPTIONS = ["Peanuts", "Shellfish", "Dairy", "Gluten"];

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(DEFAULT_NAME);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(DEFAULT_SELECTED_PREFERENCES);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(DEFAULT_SELECTED_ALLERGIES);
  const [preferenceOptions, setPreferenceOptions] = useState<string[]>(DEFAULT_PREFERENCE_OPTIONS);
  const [allergyOptions, setAllergyOptions] = useState<string[]>(DEFAULT_ALLERGY_OPTIONS);
  const [newPreference, setNewPreference] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [lastDeleted, setLastDeleted] = useState<{ type: "preference" | "allergy"; value: string } | null>(null);

  useEffect(() => {
    setName(load("pp_name", DEFAULT_NAME));
    setSelectedPreferences(load("pp_prefs_selected", DEFAULT_SELECTED_PREFERENCES));
    setSelectedAllergies(load("pp_allergies_selected", DEFAULT_SELECTED_ALLERGIES));
    setPreferenceOptions(load("pp_prefs_options", DEFAULT_PREFERENCE_OPTIONS));
    setAllergyOptions(load("pp_allergies_options", DEFAULT_ALLERGY_OPTIONS));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("pp_name", JSON.stringify(name)); }, [name, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("pp_prefs_selected", JSON.stringify(selectedPreferences)); }, [selectedPreferences, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("pp_allergies_selected", JSON.stringify(selectedAllergies)); }, [selectedAllergies, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("pp_prefs_options", JSON.stringify(preferenceOptions)); }, [preferenceOptions, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("pp_allergies_options", JSON.stringify(allergyOptions)); }, [allergyOptions, hydrated]);

  const displayPreferences = useMemo(() => Array.from(new Set([...preferenceOptions, ...selectedPreferences])), [preferenceOptions, selectedPreferences]);
  const displayAllergies = useMemo(() => Array.from(new Set([...allergyOptions, ...selectedAllergies])), [allergyOptions, selectedAllergies]);

  function getUpdatedTags(items: string[], value: string) {
    return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
  }

  function removePreference(value: string) {
    setPreferenceOptions((c) => c.filter((i) => i !== value));
    setSelectedPreferences((c) => c.filter((i) => i !== value));
    setLastDeleted({ type: "preference", value });
  }

  function removeAllergy(value: string) {
    setAllergyOptions((c) => c.filter((i) => i !== value));
    setSelectedAllergies((c) => c.filter((i) => i !== value));
    setLastDeleted({ type: "allergy", value });
  }

  function undoDelete() {
    if (!lastDeleted) return;
    if (lastDeleted.type === "preference") {
      setPreferenceOptions((c) => [...c, lastDeleted.value]);
      setSelectedPreferences((c) => [...c, lastDeleted.value]);
    } else {
      setAllergyOptions((c) => [...c, lastDeleted.value]);
      setSelectedAllergies((c) => [...c, lastDeleted.value]);
    }
    setLastDeleted(null);
  }

  function addPreference() {
    const value = newPreference.trim();
    if (!value) return;
    if (!displayPreferences.includes(value)) setPreferenceOptions((c) => [...c, value]);
    setSelectedPreferences((c) => c.includes(value) ? c : [...c, value]);
    setNewPreference("");
  }

  function addAllergy() {
    const value = newAllergy.trim();
    if (!value) return;
    if (!displayAllergies.includes(value)) setAllergyOptions((c) => [...c, value]);
    setSelectedAllergies((c) => c.includes(value) ? c : [...c, value]);
    setNewAllergy("");
  }

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardPage title="Home">
      <section className="panel" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #186fc3, #4aa3e8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.2rem", flexShrink: 0, boxShadow: "0 2px 8px rgba(24,111,195,0.3)" }}>
              {initials}
            </div>
            <div>
              {editing ? (
                <input value={name} onChange={(e) => setName(e.target.value)} className="profile-name-input" aria-label="Display name" style={{ fontSize: "1.1rem", fontWeight: 700 }} />
              ) : (
                <div style={{ fontSize: "2.1rem", fontWeight: 700, color: "#186fc3" }}>{name}</div>
              )}
              <div style={{ display: "inline-block", marginTop: "4px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(24,111,195,0.1)", color: "#186fc3", borderRadius: "20px", padding: "2px 10px" }}>Student</div>
            </div>
          </div>
          <button type="button" className={`profile-edit ${editing ? "active" : ""}`} onClick={() => setEditing((v) => !v)}>
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </section>

      {lastDeleted && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0 0 0.75rem 0", padding: "0.4rem 0.75rem", background: "rgba(24, 111, 195, 0.1)", border: "1px solid rgba(24, 111, 195, 0.3)", borderRadius: "8px", fontSize: "0.85rem", color: "#155999" }}>
          <span>{lastDeleted.value} deleted.</span>
          <button type="button" onClick={undoDelete} style={{ fontWeight: 600, textDecoration: "underline", background: "none", border: "none", color: "#155999", cursor: "pointer" }}>Undo</button>
        </div>
      )}

      <section className="panel" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 className="section-title" style={{ margin: 0 }}>🍜 Food Preferences</h2>
          <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{selectedPreferences.length} selected</span>
        </div>
        <div className="pill-row">
          {displayPreferences.map((option) => {
            const active = selectedPreferences.includes(option);
            return (
              <div key={option} className={`pill-chip ${active ? "active" : ""} ${editing ? "" : "locked"}`}>
                <button type="button" className="pill-label-btn" onClick={() => editing && setSelectedPreferences(getUpdatedTags(selectedPreferences, option))}>{option}</button>
                {editing && <button type="button" className="pill-delete-btn" aria-label={`Delete ${option}`} onClick={() => removePreference(option)}>×</button>}
              </div>
            );
          })}
        </div>
        {editing && (
          <div className="home-add-row">
            <input className="home-add-input" value={newPreference} onChange={(e) => setNewPreference(e.target.value)} placeholder="Add food preference" onKeyDown={(e) => { if (e.key === "Enter") addPreference(); }} />
            <button type="button" className="profile-edit" onClick={addPreference}>+ Add</button>
          </div>
        )}
      </section>

      <section className="panel" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 className="section-title" style={{ margin: 0 }}>⚠️ Allergies</h2>
          <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{selectedAllergies.length} selected</span>
        </div>
        <div className="pill-row">
          {displayAllergies.map((option) => {
            const active = selectedAllergies.includes(option);
            return (
              <div key={option} className={`pill-chip ${active ? "active" : ""} ${editing ? "" : "locked"}`}>
                <button type="button" className="pill-label-btn" onClick={() => editing && setSelectedAllergies(getUpdatedTags(selectedAllergies, option))}>{option}</button>
                {editing && <button type="button" className="pill-delete-btn" aria-label={`Delete ${option}`} onClick={() => removeAllergy(option)}>×</button>}
              </div>
            );
          })}
        </div>
        {editing && (
          <div className="home-add-row">
            <input className="home-add-input" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add allergy" onKeyDown={(e) => { if (e.key === "Enter") addAllergy(); }} />
            <button type="button" className="profile-edit" onClick={addAllergy}>+ Add</button>
          </div>
        )}
      </section>
    </DashboardPage>
  );
}
