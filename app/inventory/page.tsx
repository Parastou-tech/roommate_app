"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/components/DashboardPage";

type StockLevel = "out" | "low" | "in";
type Category = "Produce" | "Dairy" | "Pantry" | "Proteins";

type InventoryItem = {
  id: string;
  name: string;
  category: Category;
  stock: StockLevel;
  done: boolean;
};

const categories: Category[] = ["Produce", "Dairy", "Pantry", "Proteins"];

const stockLabels: Record<string, string> = {
  out: "Out of stock",
  low: "Low stock",
  in: "In stock"
};

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: "1", name: "Lettuce", category: "Produce", stock: "low", done: false },
  { id: "2", name: "Bell Peppers", category: "Produce", stock: "in", done: false },
  { id: "3", name: "Milk", category: "Dairy", stock: "out", done: false },
  { id: "4", name: "Eggs", category: "Dairy", stock: "low", done: false },
  { id: "5", name: "Rice", category: "Pantry", stock: "in", done: false },
  { id: "6", name: "Olive Oil", category: "Pantry", stock: "out", done: false },
  { id: "7", name: "Chicken", category: "Proteins", stock: "low", done: false },
  { id: "8", name: "Black Beans", category: "Proteins", stock: "in", done: false }
];

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(() => load("pp_inventory", DEFAULT_ITEMS));
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("Pantry");
  const [newStock, setNewStock] = useState<StockLevel>("in");
  const [stockFilter, setStockFilter] = useState<"all" | StockLevel>("all");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [modalStock, setModalStock] = useState<StockLevel>("in");
  const [modalName, setModalName] = useState("");
  const [modalCategory, setModalCategory] = useState<Category>("Pantry");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [quickRemoveId, setQuickRemoveId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("pp_inventory", JSON.stringify(items)); }, [items]);

  function toggleDone(id: string) {
    setItems((current) => current.map((item) => item.id !== id ? item : { ...item, done: !item.done }));
  }

  function addItem() {
    const name = newItem.trim();
    if (!name) return;
    setItems((current) => [...current, { id: crypto.randomUUID(), name, category: newCategory, stock: newStock, done: false }]);
    setNewItem("");
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setQuickRemoveId(null);
  }

  function openItemModal(item: InventoryItem) {
    setActiveItemId(item.id);
    setModalStock(item.stock);
    setModalName(item.name);
    setModalCategory(item.category);
    setConfirmDelete(false);
  }

  function closeItemModal() {
    setActiveItemId(null);
    setConfirmDelete(false);
  }

  function saveItemSettings() {
    if (!activeItemId) return;
    setItems((current) => current.map((item) => item.id !== activeItemId ? item : { ...item, stock: modalStock, name: modalName.trim() || item.name, category: modalCategory }));
    closeItemModal();
  }

  function deleteActiveItem() {
    if (!activeItemId) return;
    setItems((current) => current.filter((item) => item.id !== activeItemId));
    closeItemModal();
  }

  const activeItem = useMemo(() => activeItemId ? items.find((item) => item.id === activeItemId) ?? null : null, [activeItemId, items]);
  const quickRemoveItem = useMemo(() => quickRemoveId ? items.find((item) => item.id === quickRemoveId) ?? null : null, [quickRemoveId, items]);

  const visibleByCategory = useMemo(() => {
    return categories.reduce<Record<Category, InventoryItem[]>>(
      (acc, category) => {
        acc[category] = items
          .filter((item) => item.category === category)
          .filter((item) => stockFilter === "all" ? true : item.stock === stockFilter)
          .sort((a, b) => Number(a.done) - Number(b.done));
        return acc;
      },
      { Produce: [], Dairy: [], Pantry: [], Proteins: [] }
    );
  }, [items, stockFilter]);

  return (
    <DashboardPage title="Inventory">
      <section className="panel inventory-wrap">
        <div className="stock-callout" role="note">
          <span className="stock-pill tone-red">Red: Out of stock</span>
          <span className="stock-pill tone-orange">Yellow: Low stock</span>
          <span className="stock-pill tone-black">Black: In stock</span>
        </div>

        <div className="inventory-toolbar">
          <label htmlFor="stock-filter">Filter by stock level</label>
          <select id="stock-filter" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as "all" | StockLevel)}>
            <option value="all">All</option>
            <option value="out">Out of stock</option>
            <option value="low">Low stock</option>
            <option value="in">In stock</option>
          </select>
        </div>

        {stockFilter !== "all" && (
          <p style={{ margin: "0.5rem 0 0.75rem 0", padding: "0.4rem 0.75rem", background: "rgba(24, 111, 195, 0.1)", border: "1px solid rgba(24, 111, 195, 0.3)", borderRadius: "8px", fontSize: "0.85rem", color: "#155999" }}>
            Showing only: <strong>{stockLabels[stockFilter]}</strong> items
          </p>
        )}

        <div className="inventory-grid">
          {categories.filter((category) => visibleByCategory[category].length > 0).map((category) => (
            <article key={category} className="inventory-box">
              <h2 className="inventory-title">{category}</h2>
              <ul className="inventory-list">
                {visibleByCategory[category].map((item) => (
                  <li key={item.id} className={`inventory-item ${item.done ? "done" : ""}`}>
                    <button type="button" className="inventory-item-btn" onClick={() => toggleDone(item.id)}>
                      <span className={`inventory-item-name ${item.stock === "out" ? "tone-red" : item.stock === "low" ? "tone-orange" : "tone-black"}`}>
                        {item.name}
                      </span>
                    </button>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button type="button" className="item-menu-btn" aria-label={`Edit ${item.name}`} onClick={() => openItemModal(item)}>•••</button>
                      <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setQuickRemoveId(item.id)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "1rem", fontWeight: 700, padding: "0 4px" }}>×</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="inventory-add">
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item" onKeyDown={(e) => { if (e.key === "Enter") addItem(); }} />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as Category)}>
            {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <select value={newStock} onChange={(e) => setNewStock(e.target.value as StockLevel)}>
            <option value="out">Out</option>
            <option value="low">Low</option>
            <option value="in">In</option>
          </select>
          <button type="button" onClick={addItem}>+ Add Item</button>
        </div>
      </section>

      {quickRemoveItem && (
        <div className="modal-overlay" onClick={() => setQuickRemoveId(null)}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Item</h3>
            <p style={{ margin: "0.75rem 0" }}>Are you sure you want to remove <strong>{quickRemoveItem.name}</strong>?</p>
            <div className="item-modal-actions">
              <button type="button" className="modal-btn" onClick={() => setQuickRemoveId(null)}>Cancel</button>
              <button type="button" className="modal-btn delete" onClick={() => removeItem(quickRemoveItem.id)}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {activeItem && (
        <div className="modal-overlay" onClick={closeItemModal}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Item</h3>
            {confirmDelete ? (
              <>
                <p style={{ color: "#c0392b", marginBottom: "1rem" }}>Are you sure you want to delete "{activeItem.name}"?</p>
                <div className="item-modal-actions">
                  <button type="button" className="modal-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  <button type="button" className="modal-btn delete" onClick={deleteActiveItem}>Yes, Delete</button>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="item-name" style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>Item Name</label>
                <input id="item-name" type="text" value={modalName} onChange={(e) => setModalName(e.target.value)} style={{ width: "100%", marginBottom: "0.75rem", fontSize: "0.9rem" }} />
                <label htmlFor="item-category" style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>Category</label>
                <select id="item-category" value={modalCategory} onChange={(e) => setModalCategory(e.target.value as Category)} style={{ width: "100%", marginBottom: "0.75rem" }}>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <label htmlFor="item-status" style={{ fontSize: "0.85rem", marginBottom: "0.25rem", display: "block" }}>Stock Status</label>
                <select id="item-status" value={modalStock} onChange={(e) => setModalStock(e.target.value as StockLevel)} style={{ width: "100%", marginBottom: "0.75rem" }}>
                  <option value="out">Out of stock</option>
                  <option value="low">Low stock</option>
                  <option value="in">In stock</option>
                </select>
                <div className="item-modal-actions">
                  <button type="button" className="modal-btn delete" onClick={() => setConfirmDelete(true)}>Delete</button>
                  <button type="button" className="modal-btn" onClick={closeItemModal}>Cancel</button>
                  <button type="button" className="modal-btn save" onClick={saveItemSettings}>Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardPage>
  );
}