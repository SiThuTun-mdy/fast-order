import { useState } from 'react';
import { useMenuItems } from '../hooks/useMenuItems';
import { useCategories } from '../hooks/useCategories';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menu';

const emptyForm = { name: '', category: '', price: '', description: '', emoji: '', popular: false };

export default function MenuManager({ restaurantId }) {
  const { menuItems, loading, error, refetch } = useMenuItems(restaurantId);
  const { categories } = useCategories(restaurantId);

  const [expandedId, setExpandedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyForm);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
    setEditingId(null);
    setConfirmingDeleteId(null);
  };

  const renderFields = (draft, setDraft) => (
    <>
      <input
        required
        placeholder="Name"
        value={draft.name}
        onChange={(e) => setDraft((f) => ({ ...f, name: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />
      <select
        required
        value={draft.category}
        onChange={(e) => setDraft((f) => ({ ...f, category: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      >
        <option value="" disabled>
          Select a category
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>
      <input
        required
        type="number"
        step="0.01"
        min="0"
        placeholder="Price"
        value={draft.price}
        onChange={(e) => setDraft((f) => ({ ...f, price: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />
      <input
        placeholder="Description"
        value={draft.description}
        onChange={(e) => setDraft((f) => ({ ...f, description: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />
      <input
        placeholder="Emoji (e.g. 🍔)"
        value={draft.emoji}
        onChange={(e) => setDraft((f) => ({ ...f, emoji: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />
      <label className="flex items-center gap-1.5 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={draft.popular}
          onChange={(e) => setDraft((f) => ({ ...f, popular: e.target.checked }))}
        />
        Popular
      </label>
    </>
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      await createMenuItem({
        name: createForm.name,
        category: createForm.category,
        restaurantId,
        price: parseFloat(createForm.price),
        description: createForm.description,
        emoji: createForm.emoji,
        popular: createForm.popular,
      });
      setCreateForm(emptyForm);
      setCreating(false);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditDraft({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description ?? '',
      emoji: item.emoji ?? '',
      popular: item.popular,
    });
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    setActionError(null);
    try {
      await updateMenuItem(id, {
        name: editDraft.name,
        category: editDraft.category,
        price: parseFloat(editDraft.price),
        description: editDraft.description,
        emoji: editDraft.emoji,
        popular: editDraft.popular,
      });
      setEditingId(null);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await deleteMenuItem(id);
      setConfirmingDeleteId(null);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-gray-500">Loading menu items…</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}

      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setCreating((c) => !c)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {creating ? 'Cancel' : '+ New Item'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
          {renderFields(createForm, setCreateForm)}
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {menuItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No menu items yet.</p>
      ) : (
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const isEditing = editingId === item.id;
            return (
              <li key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(item.id);
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.emoji} {item.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {item.popular && (
                      <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <span className="text-gray-500 text-sm">${item.price.toFixed(2)}</span>
                    <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {isEditing ? (
                      <div className="space-y-2">
                        {renderFields(editDraft, setEditDraft)}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 text-xs font-medium px-3 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-500 text-xs mb-3">{item.description || 'No description'}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={saving}
                            className="text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-60"
                          >
                            {confirmingDeleteId === item.id ? 'Confirm Delete?' : 'Delete'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
