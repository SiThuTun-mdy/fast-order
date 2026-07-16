import { useState } from 'react';
import { useTenants } from '../hooks/useTenants';
import { createTenant, updateTenant, deleteTenant } from '../api/tenants';

const emptyForm = { name: '', address: '', phone: '' };

export default function TenantPage() {
  const { tenants, loading, refetch } = useTenants();
  const [expandedId, setExpandedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyForm);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
    setEditingId(null);
    setConfirmingDeleteId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTenant(createForm);
      setCreateForm(emptyForm);
      setCreating(false);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tenant) => {
    setEditingId(tenant.id);
    setEditDraft({ name: tenant.name, address: tenant.address ?? '', phone: tenant.phone ?? '' });
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      await updateTenant(id, editDraft);
      setEditingId(null);
      await refetch();
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
    try {
      await deleteTenant(id);
      setConfirmingDeleteId(null);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl animate-bounce mb-4">⏳</div>
        <p className="text-gray-500">Loading tenants…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tenant Management</h1>
          <p className="text-gray-500 text-sm">Restaurants using this platform.</p>
        </div>
        <button
          onClick={() => setCreating((c) => !c)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {creating ? 'Cancel' : '+ New Tenant'}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3"
        >
          <input
            required
            placeholder="Name"
            value={createForm.name}
            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <input
            placeholder="Address"
            value={createForm.address}
            onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <input
            placeholder="Phone"
            value={createForm.phone}
            onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
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

      {tenants.length === 0 ? (
        <p className="text-gray-500 text-sm">No tenants yet.</p>
      ) : (
        <ul className="space-y-3">
          {tenants.map((tenant) => {
            const isExpanded = expandedId === tenant.id;
            const isEditing = editingId === tenant.id;
            return (
              <li key={tenant.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(tenant.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(tenant.id);
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <p className="font-semibold text-gray-900 text-sm">{tenant.name}</p>
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
                          value={editDraft.address}
                          onChange={(e) => setEditDraft((f) => ({ ...f, address: e.target.value }))}
                          placeholder="Address"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <input
                          value={editDraft.phone}
                          onChange={(e) => setEditDraft((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="Phone"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(tenant.id)}
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
                      <>
                        <p className="text-gray-500 text-xs mb-1">{tenant.address || 'No address on file'}</p>
                        <p className="text-gray-500 text-xs mb-3">{tenant.phone || 'No phone on file'}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tenant)}
                            className="text-yellow-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-yellow-200 hover:bg-yellow-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            disabled={saving}
                            className="text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-60"
                          >
                            {confirmingDeleteId === tenant.id ? 'Confirm Delete?' : 'Delete'}
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
