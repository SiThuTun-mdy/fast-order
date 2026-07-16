import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '../api/categories';

const emptyCreateForm = { id: '', name: '', icon: '', sortOrder: '0' };
const emptyEditForm = { name: '', icon: '', sortOrder: '0' };

export default function CategoryManager({ restaurantId }) {
  const { categories, loading, error, refetch } = useCategories(restaurantId);

  const [expandedId, setExpandedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyEditForm);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
    setEditingId(null);
    setConfirmingDeleteId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      await createCategory({
        id: createForm.id,
        name: createForm.name,
        icon: createForm.icon,
        restaurantId,
        sortOrder: parseInt(createForm.sortOrder, 10) || 0,
      });
      setCreateForm(emptyCreateForm);
      setCreating(false);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditDraft({ name: category.name, icon: category.icon, sortOrder: String(category.sortOrder ?? 0) });
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    setActionError(null);
    try {
      await updateCategory(id, {
        name: editDraft.name,
        icon: editDraft.icon,
        sortOrder: parseInt(editDraft.sortOrder, 10) || 0,
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
      await deleteCategory(id);
      setConfirmingDeleteId(null);
      await refetch();
    } catch (err) {
      // Surfaces the backend's friendly "still has menu items" message
      // (409) inline — no toast/alert system exists in this app to reuse.
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-gray-500">Loading categories…</p>
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
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {creating ? 'Cancel' : '+ New Category'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
          <input
            required
            placeholder="Slug (e.g. pizza)"
            value={createForm.id}
            onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <input
            required
            placeholder="Name"
            value={createForm.name}
            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <input
            required
            placeholder="Icon (e.g. 🍕)"
            value={createForm.icon}
            onChange={(e) => setCreateForm((f) => ({ ...f, icon: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Sort order"
            value={createForm.sortOrder}
            onChange={(e) => setCreateForm((f) => ({ ...f, sortOrder: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 text-sm">No categories yet.</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedId === category.id;
            const isEditing = editingId === category.id;
            return (
              <li key={category.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(category.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(category.id);
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <p className="font-semibold text-gray-900 text-sm">
                    {category.icon} {category.name}
                  </p>
                  <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={editDraft.name}
                          onChange={(e) => setEditDraft((f) => ({ ...f, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <input
                          value={editDraft.icon}
                          onChange={(e) => setEditDraft((f) => ({ ...f, icon: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={editDraft.sortOrder}
                          onChange={(e) => setEditDraft((f) => ({ ...f, sortOrder: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(category.id)}
                            disabled={saving}
                            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-yellow-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-yellow-200 hover:bg-yellow-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={saving}
                          className="text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-60"
                        >
                          {confirmingDeleteId === category.id ? 'Confirm Delete?' : 'Delete'}
                        </button>
                      </div>
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
