"use client";

import { useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type Status = "out" | "low" | "normal";

type Item = {
  id: number;
  name: string;
  status: Status;
  checked: boolean;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Rice", status: "normal", checked: false },
    { id: 2, name: "Eggs", status: "low", checked: false },
    { id: 3, name: "Chicken", status: "out", checked: false },
    { id: 4, name: "Onions", status: "normal", checked: false },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftStatus, setDraftStatus] = useState<Status>("normal");

  const getColor = (status: Status) => {
    if (status === "out") return "#dc2626"; // red
    if (status === "low") return "#facc15"; // yellow
    return "#000000"; // black
  };

  const toggleItem = (id: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, checked: !it.checked } : it
      )
    );

  const addItem = () => {
    const name = draftName.trim();
    if (!name) return;

    setItems((prev) => [
      ...prev,
      { id: Date.now(), name, status: draftStatus, checked: false },
    ]);

    setDraftName("");
    setDraftStatus("normal");
    setIsAdding(false);
  };

  return (
    <DashboardPage title="Inventory">
      <div className="inventory-wrapper">
        <div className="inventory-card">
          <div className="inventory-cardHeader">
            <h2 className="inventory-title">Staples</h2>
          </div>

          {/* Legend */}
          <div style={{ marginBottom: "16px", fontSize: "14px" }}>
            <div style={{ color: "#dc2626" }}>Red – Out of Stock</div>
            <div style={{ color: "#facc15" }}>Yellow – Low Stock</div>
            <div style={{ color: "#000000" }}>Black – In Stock</div>
          </div>

          <ul className="inventory-list" aria-label="Staples inventory">
            {items.map((item) => (
              <li
                key={item.id}
                className="inventory-row"
                onClick={() => toggleItem(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    toggleItem(item.id);
                }}
              >
                <span
                  className={`check-circle ${
                    item.checked ? "checked" : ""
                  }`}
                />
                <span
                  className="inventory-name"
                  style={{ color: getColor(item.status) }}
                >
                  {item.name}
                </span>
              </li>
            ))}
          </ul>

          {isAdding ? (
            <div className="inventory-addRow">
              <input
                className="inventory-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="New item..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                  if (e.key === "Escape") {
                    setDraftName("");
                    setDraftStatus("normal");
                    setIsAdding(false);
                  }
                }}
                autoFocus
              />

              <select
                value={draftStatus}
                onChange={(e) =>
                  setDraftStatus(e.target.value as Status)
                }
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="normal">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <button className="inventory-btn" onClick={addItem}>
                Save
              </button>

              <button
                className="inventory-btnAlt"
                onClick={() => {
                  setDraftName("");
                  setDraftStatus("normal");
                  setIsAdding(false);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="inventory-addBtn"
              onClick={() => setIsAdding(true)}
            >
              + Add Item
            </button>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}