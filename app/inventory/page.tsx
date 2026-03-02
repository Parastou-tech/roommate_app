"use client";

import { useMemo, useState } from "react";
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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([
    { id: "1", name: "Lettuce", category: "Produce", stock: "low", done: false },
    { id: "2", name: "Bell Peppers", category: "Produce", stock: "in", done: false },
    { id: "3", name: "Milk", category: "Dairy", stock: "out", done: false },
    { id: "4", name: "Eggs", category: "Dairy", stock: "low", done: false },
    { id: "5", name: "Rice", category: "Pantry", stock: "in", done: false },
    { id: "6", name: "Olive Oil", category: "Pantry", stock: "out", done: false },
    { id: "7", name: "Chicken", category: "Proteins", stock: "low", done: false },
    { id: "8", name: "Black Beans", category: "Proteins", stock: "in", done: false }
  ]);

  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("Pantry");
  const [newStock, setNewStock] = useState<StockLevel>("in");
  const [stockFilter, setStockFilter] = useState<"all" | StockLevel>("all");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [modalStock, setModalStock] = useState<StockLevel>("in");

  function toggleDone(id: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return { ...item, done: !item.done };
      })
    );
  }

  function addItem() {
    const name = newItem.trim();
    if (!name) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name,
        category: newCategory,
        stock: newStock,
        done: false
      }
    ]);
    setNewItem("");
  }

  function openItemModal(item: InventoryItem) {
    setActiveItemId(item.id);
    setModalStock(item.stock);
  }

  function closeItemModal() {
    setActiveItemId(null);
  }

  function saveItemSettings() {
    if (!activeItemId) {
      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id !== activeItemId) {
          return item;
        }

        return { ...item, stock: modalStock };
      })
    );
    closeItemModal();
  }

  function deleteActiveItem() {
    if (!activeItemId) {
      return;
    }

    setItems((current) => current.filter((item) => item.id !== activeItemId));
    closeItemModal();
  }

  const activeItem = useMemo(
    () => (activeItemId ? items.find((item) => item.id === activeItemId) ?? null : null),
    [activeItemId, items]
  );

  const visibleByCategory = useMemo(() => {
    return categories.reduce<Record<Category, InventoryItem[]>>(
      (acc, category) => {
        const filtered = items
          .filter((item) => item.category === category)
          .filter((item) => (stockFilter === "all" ? true : item.stock === stockFilter))
          .sort((a, b) => Number(a.done) - Number(b.done));

        acc[category] = filtered;
        return acc;
      },
      {
        Produce: [],
        Dairy: [],
        Pantry: [],
        Proteins: []
      }
    );
  }, [items, stockFilter]);

  return (
    <DashboardPage title="Inventory">
      <section className="panel inventory-wrap">
        <div className="stock-callout" role="note" aria-label="Stock level legend">
          <span className="stock-pill tone-red">Red: Out of stock</span>
          <span className="stock-pill tone-orange">Yellow: Low stock</span>
          <span className="stock-pill tone-black">Black: In stock</span>
        </div>

        <div className="inventory-toolbar">
          <label htmlFor="stock-filter">Filter by stock level</label>
          <select
            id="stock-filter"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as "all" | StockLevel)}
          >
            <option value="all">All</option>
            <option value="out">Out of stock</option>
            <option value="low">Low stock</option>
            <option value="in">In stock</option>
          </select>
        </div>

        <div className="inventory-grid">
          {categories.map((category) => (
            <article key={category} className="inventory-box">
              <h2 className="inventory-title">{category}</h2>
              <ul className="inventory-list">
                {visibleByCategory[category].map((item) => (
                  <li key={item.id} className={`inventory-item ${item.done ? "done" : ""}`}>
                    <button type="button" className="inventory-item-btn" onClick={() => toggleDone(item.id)}>
                      <span
                        className={`inventory-item-name ${
                          item.stock === "out" ? "tone-red" : item.stock === "low" ? "tone-orange" : "tone-black"
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="item-menu-btn"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openItemModal(item)}
                    >
                      •••
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="inventory-add">
          <input
            type="text"
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            placeholder="Add item"
            aria-label="Add inventory item"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addItem();
              }
            }}
          />
          <select value={newCategory} onChange={(event) => setNewCategory(event.target.value as Category)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select value={newStock} onChange={(event) => setNewStock(event.target.value as StockLevel)}>
            <option value="out">Out</option>
            <option value="low">Low</option>
            <option value="in">In</option>
          </select>
          <button type="button" onClick={addItem}>
            + Add Item
          </button>
        </div>
      </section>

      {activeItem ? (
        <div className="modal-overlay" onClick={closeItemModal}>
          <div className="item-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>{activeItem.name}</h3>
            <label htmlFor="item-status">Stock Status</label>
            <select
              id="item-status"
              value={modalStock}
              onChange={(event) => setModalStock(event.target.value as StockLevel)}
            >
              <option value="out">Out of stock</option>
              <option value="low">Low stock</option>
              <option value="in">In stock</option>
            </select>

            <div className="item-modal-actions">
              <button type="button" className="modal-btn delete" onClick={deleteActiveItem}>
                Delete
              </button>
              <button type="button" className="modal-btn" onClick={closeItemModal}>
                Cancel
              </button>
              <button type="button" className="modal-btn save" onClick={saveItemSettings}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPage>
  );
}
