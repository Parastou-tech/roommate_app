"use client";

import { useEffect, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type ProfileData = {
  name: string;
  preferences: string[];
  allergies: string[];
};

const STORAGE_KEY = "roommate_profile_v1";

function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function uniqCaseInsensitive(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export default function HomePage() {
  // saved profile
  const [profile, setProfile] = useState<ProfileData>({
    name: "New User",
    preferences: [],
    allergies: [],
  });

  // edit mode + drafts
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);

  const [draftPrefs, setDraftPrefs] = useState<string[]>([]);
  const [draftAllergies, setDraftAllergies] = useState<string[]>([]);

  const [prefInput, setPrefInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");

  // load from localStorage on first render (prototype persistence)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProfileData>;
        setProfile({
          name:
            typeof parsed.name === "string" && parsed.name.trim()
              ? parsed.name
              : "New User",
          preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
          allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
        });
      } else {
        // optional: support register flow that stores name only
        const nameOnly = localStorage.getItem("registered_name");
        if (nameOnly) setProfile((p) => ({ ...p, name: nameOnly }));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // when entering edit mode, copy saved -> drafts
  useEffect(() => {
    if (!isEditing) return;
    setDraftName(profile.name);
    setDraftPrefs(profile.preferences);
    setDraftAllergies(profile.allergies);
    setPrefInput("");
    setAllergyInput("");
  }, [isEditing, profile]);

  const addPref = () => {
    const tag = normalizeTag(prefInput);
    if (!tag) return;
    setDraftPrefs((prev) => uniqCaseInsensitive([...prev, tag]));
    setPrefInput("");
  };

  const addAllergy = () => {
    const tag = normalizeTag(allergyInput);
    if (!tag) return;
    setDraftAllergies((prev) => uniqCaseInsensitive([...prev, tag]));
    setAllergyInput("");
  };

  const removePref = (tag: string) => {
    setDraftPrefs((prev) => prev.filter((x) => x !== tag));
  };

  const removeAllergy = (tag: string) => {
    setDraftAllergies((prev) => prev.filter((x) => x !== tag));
  };

  const saveAll = () => {
    const next: ProfileData = {
      name: draftName.trim() || "New User",
      preferences: draftPrefs,
      allergies: draftAllergies,
    };
    setProfile(next);
    setIsEditing(false);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const cancelEdit = () => setIsEditing(false);

  const prefsToShow = isEditing ? draftPrefs : profile.preferences;
  const allergiesToShow = isEditing ? draftAllergies : profile.allergies;

  return (
    <DashboardPage title="Home">
      <div className="home-wrapper">
        {/* Profile */}
        <div className="profile-card">
          <div className="profile-left">
            <div className="avatar" />
            <div>
              {isEditing ? (
                <input
                  className="profile-input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <>
                  <h1 className="profile-name">{profile.name}</h1>
                  <p className="profile-role">Student</p>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" onClick={saveAll}>
                Save
              </button>
              <button className="btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
        </div>

        <hr className="divider" />

        {/* Food Preferences */}
        <section className="section">
          <h2 className="section-title">Food Preferences</h2>

          {isEditing && (
            <div className="tag-inputRow">
              <input
                className="tag-input"
                value={prefInput}
                onChange={(e) => setPrefInput(e.target.value)}
                placeholder='Type a preference (e.g., "Indian")'
                onKeyDown={(e) => {
                  if (e.key === "Enter") addPref();
                }}
              />
              <button className="tag-addBtn" onClick={addPref}>
                Add
              </button>
            </div>
          )}

          <div className="tags">
            {prefsToShow.length === 0 ? (
              <span className="tag-empty">(none yet)</span>
            ) : (
              prefsToShow.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  {isEditing && (
                    <button
                      className="tag-x"
                      onClick={() => removePref(tag)}
                      aria-label={`Remove ${tag}`}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </section>

        {/* Allergies */}
        <section className="section">
          <h2 className="section-title">Allergies</h2>

          {isEditing && (
            <div className="tag-inputRow">
              <input
                className="tag-input"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                placeholder='Type an allergy (e.g., "Peanuts")'
                onKeyDown={(e) => {
                  if (e.key === "Enter") addAllergy();
                }}
              />
              <button className="tag-addBtn" onClick={addAllergy}>
                Add
              </button>
            </div>
          )}

          <div className="tags">
            {allergiesToShow.length === 0 ? (
              <span className="tag-empty">(none yet)</span>
            ) : (
              allergiesToShow.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  {isEditing && (
                    <button
                      className="tag-x"
                      onClick={() => removeAllergy(tag)}
                      aria-label={`Remove ${tag}`}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardPage>
  );
}