"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type DirectoryUser = {
  username: string;
  fullName: string;
  role: string;
  foodPreferences?: string[];
  allergies?: string[];
};

type Member = {
  id: string;
  username: string;
  name: string;
  role: string;
  isYou: boolean;
  foodPreferences: string[];
  allergies: string[];
};

const DEFAULT_SELECTED_PREFERENCES = ["Asian", "Mexican"];
const DEFAULT_SELECTED_ALLERGIES = ["Peanuts", "Shellfish"];

const DEFAULT_MEMBER_DIETARY: Record<string, { foodPreferences: string[]; allergies: string[] }> = {
  bobby: { foodPreferences: DEFAULT_SELECTED_PREFERENCES, allergies: DEFAULT_SELECTED_ALLERGIES },
  calvin: { foodPreferences: ["Italian", "Mediterranean"], allergies: ["Dairy"] }
};

const USER_DIRECTORY: DirectoryUser[] = [
  { username: "bobby", fullName: "Bobby Milk", role: "Student", foodPreferences: DEFAULT_SELECTED_PREFERENCES, allergies: DEFAULT_SELECTED_ALLERGIES },
  { username: "calvin", fullName: "Calvin Park", role: "Student", foodPreferences: ["Italian", "Mediterranean"], allergies: ["Dairy"] },
  { username: "jessica", fullName: "Jessica Chen", role: "Roommate", foodPreferences: ["Vegetarian", "Mediterranean"], allergies: ["Shellfish"] },
  { username: "liam", fullName: "Liam Carter", role: "Roommate", foodPreferences: ["Mexican", "American"], allergies: [] },
  { username: "maria", fullName: "Maria Gomez", role: "Guest", foodPreferences: ["Latin American"], allergies: ["Gluten"] },
  { username: "aiden", fullName: "Aiden Wright", role: "Student", foodPreferences: ["Asian", "Italian"], allergies: ["Peanuts"] },
  { username: "zoe", fullName: "Zoe Kim", role: "Roommate", foodPreferences: ["Korean", "Japanese"], allergies: ["Dairy"] }
];

const DEFAULT_MEMBERS: Member[] = [
  { id: "1", username: "bobby", name: "Bobby", role: "Student", isYou: true, foodPreferences: DEFAULT_SELECTED_PREFERENCES, allergies: DEFAULT_SELECTED_ALLERGIES },
  { id: "2", username: "calvin", name: "Calvin", role: "Student", isYou: false, foodPreferences: ["Italian", "Mediterranean"], allergies: ["Dairy"] }
];

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeTagList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)));
}

function getDefaultDietary(name: string, isYou: boolean) {
  if (isYou) {
    return { foodPreferences: DEFAULT_SELECTED_PREFERENCES, allergies: DEFAULT_SELECTED_ALLERGIES };
  }
  return DEFAULT_MEMBER_DIETARY[name.toLowerCase()] ?? { foodPreferences: [], allergies: [] };
}

function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

function usernameFromName(name: string) {
  const normalized = normalizeUsername(name.replace(/\s+/g, ""));
  return normalized || "roommate";
}

function normalizeMember(raw: Partial<Member>): Member {
  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Roommate";
  const username = typeof raw.username === "string" && raw.username.trim() ? normalizeUsername(raw.username) : usernameFromName(name);
  const isYou = Boolean(raw.isYou);
  const defaults = getDefaultDietary(name, isYou);
  const foodPreferences = normalizeTagList(raw.foodPreferences);
  const allergies = normalizeTagList(raw.allergies);

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id : crypto.randomUUID(),
    username,
    name,
    role: typeof raw.role === "string" && raw.role.trim() ? raw.role : "Roommate",
    isYou,
    foodPreferences: foodPreferences.length ? foodPreferences : defaults.foodPreferences,
    allergies: allergies.length ? allergies : defaults.allergies
  };
}

export default function CollabPage() {
  const [hydrated, setHydrated] = useState(false);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [usernameQuery, setUsernameQuery] = useState("");
  const [newRole, setNewRole] = useState("Student");
  const [addUserError, setAddUserError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});

  const takenUsernames = useMemo(
    () => new Set(members.map((member) => normalizeUsername(member.username))),
    [members]
  );

  const normalizedUsernameQuery = useMemo(
    () => normalizeUsername(usernameQuery),
    [usernameQuery]
  );

  const matchedUser = useMemo(
    () => USER_DIRECTORY.find((user) => normalizeUsername(user.username) === normalizedUsernameQuery),
    [normalizedUsernameQuery]
  );
  const matchedUserAlreadyAdded = matchedUser ? takenUsernames.has(normalizeUsername(matchedUser.username)) : false;

  const searchResults = useMemo(() => {
    if (!normalizedUsernameQuery) return [];
    return USER_DIRECTORY.filter((user) => {
      const username = normalizeUsername(user.username);
      const matches = username.includes(normalizedUsernameQuery) || user.fullName.toLowerCase().includes(normalizedUsernameQuery);
      return matches && !takenUsernames.has(username);
    }).slice(0, 6);
  }, [normalizedUsernameQuery, takenUsernames]);

  useEffect(() => {
    const storedMembersRaw = load<unknown>("pp_members", DEFAULT_MEMBERS);
    const storedMembers = Array.isArray(storedMembersRaw) ? storedMembersRaw as Partial<Member>[] : DEFAULT_MEMBERS;
    const youPreferences = normalizeTagList(load<string[]>("pp_prefs_selected", DEFAULT_SELECTED_PREFERENCES));
    const youAllergies = normalizeTagList(load<string[]>("pp_allergies_selected", DEFAULT_SELECTED_ALLERGIES));

    const normalizedMembers = storedMembers.map((member) => {
      const normalized = normalizeMember(member);
      if (normalized.isYou) {
        return {
          ...normalized,
          foodPreferences: youPreferences.length ? youPreferences : DEFAULT_SELECTED_PREFERENCES,
          allergies: youAllergies.length ? youAllergies : DEFAULT_SELECTED_ALLERGIES
        };
      }
      return normalized;
    });

    setMembers(normalizedMembers);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("pp_members", JSON.stringify(members));
  }, [members, hydrated]);

  function addMember() {
    const username = normalizeUsername(usernameQuery);
    if (!username) {
      setAddUserError("Enter a username to search.");
      return;
    }

    const user = USER_DIRECTORY.find((entry) => normalizeUsername(entry.username) === username);
    if (!user) {
      setAddUserError("Username not found. Pick one from the suggestions.");
      return;
    }
    if (takenUsernames.has(username)) {
      setAddUserError(`@${user.username} is already in your group.`);
      return;
    }

    setMembers((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        username: user.username,
        name: user.fullName,
        role: newRole || user.role,
        isYou: false,
        foodPreferences: user.foodPreferences ?? [],
        allergies: user.allergies ?? []
      }
    ]);
    setUsernameQuery("");
    setNewRole("Student");
    setAddUserError("");
  }

  function selectUser(user: DirectoryUser) {
    setUsernameQuery(`@${user.username}`);
    setNewRole(user.role);
    setAddUserError("");
  }

  function removeMember(id: string) {
    setMembers((current) => current.filter((m) => m.id !== id));
    setExpandedMembers((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
    setConfirmRemove(null);
  }

  function toggleDietaryInfo(id: string) {
    setExpandedMembers((current) => ({ ...current, [id]: !current[id] }));
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
            <div key={member.id} className="member-card">
              <div className="member-card-main">
                <div className="member-card-identity">
                  <div className={`member-avatar ${member.isYou ? "is-you" : ""}`}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <div className="member-name-line">
                      {member.name}
                      {member.isYou && <span className="member-you-pill">You</span>}
                    </div>
                    <div className="member-role-line">@{member.username} • {member.role}</div>
                  </div>
                </div>
                <div className="member-card-actions">
                  {!member.isYou && (
                    <button type="button" onClick={() => setConfirmRemove(member)} className="member-remove-btn" aria-label={`Remove ${member.name}`}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="member-dietary-row">
                <p className="member-dietary-summary">
                  {member.foodPreferences.length} food preference{member.foodPreferences.length !== 1 ? "s" : ""} • {member.allergies.length} allerg{member.allergies.length === 1 ? "y" : "ies"}
                </p>
                <button
                  type="button"
                  className="member-expand-btn"
                  onClick={() => toggleDietaryInfo(member.id)}
                  aria-expanded={Boolean(expandedMembers[member.id])}
                  aria-controls={`member-dietary-${member.id}`}
                >
                  {expandedMembers[member.id] ? "Hide dietary needs" : "View dietary needs"}
                </button>
              </div>

              {expandedMembers[member.id] && (
                <div id={`member-dietary-${member.id}`} className="member-dietary-panel">
                  <div className="member-dietary-section">
                    <h4>Food Preferences</h4>
                    <div className="member-chip-row">
                      {member.foodPreferences.length ? member.foodPreferences.map((preference) => (
                        <span key={preference} className="member-chip">{preference}</span>
                      )) : <span className="member-chip empty">None listed</span>}
                    </div>
                  </div>

                  <div className="member-dietary-section">
                    <h4>Allergies</h4>
                    <div className="member-chip-row">
                      {member.allergies.length ? member.allergies.map((allergy) => (
                        <span key={allergy} className="member-chip allergy">{allergy}</span>
                      )) : <span className="member-chip empty">None listed</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="add-user-row">
          <div className="add-user-search">
            <input
              value={usernameQuery}
              onChange={(e) => {
                setUsernameQuery(e.target.value);
                setAddUserError("");
              }}
              placeholder="Search username (e.g. @jessica)"
              aria-label="Search by username"
              onKeyDown={(e) => { if (e.key === "Enter") addMember(); }}
            />
            {searchResults.length > 0 && (
              <div className="add-user-results" role="listbox" aria-label="Username suggestions">
                {searchResults.map((user) => (
                  <button
                    key={user.username}
                    type="button"
                    className="add-user-result-btn"
                    onClick={() => selectUser(user)}
                    aria-label={`Select ${user.fullName} (${user.username})`}
                  >
                    <span className="add-user-result-username">@{user.username}</span>
                    <span className="add-user-result-name">{user.fullName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} aria-label="Occupation">
            <option value="Student">Student</option>
            <option value="Roommate">Roommate</option>
            <option value="Guest">Guest</option>
          </select>
          <button type="button" onClick={addMember}>+ Add Member</button>
          {normalizedUsernameQuery && (
            <p className={`add-user-feedback ${addUserError || matchedUserAlreadyAdded || !matchedUser ? "error" : ""}`}>
              {addUserError
                || (matchedUserAlreadyAdded
                  ? `@${matchedUser?.username} is already in your group`
                  : matchedUser
                    ? `Adding @${matchedUser.username} as ${matchedUser.fullName}`
                    : "No matching username found")}
            </p>
          )}
        </div>
      </section>

      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Member</h3>
            <p style={{ margin: "0.75rem 0", color: "#6b7280" }}>Are you sure you want to remove <strong>{confirmRemove.name}</strong> from your group?</p>
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
