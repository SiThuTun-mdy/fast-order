import { useState, useEffect, useCallback } from 'react';
import { useTenants } from '../hooks/useTenants';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';

const DEFAULT_ROLES = ['SysAdmin', 'Admin', 'Cashier', 'Chef'];

// Reusable staff-user manager. If `restaurantId` is provided, it's locked to
// that tenant with no picker — usable from a future per-tenant admin
// dashboard. If omitted (the /user sysadmin route), it renders a tenant
// picker sourced from useTenants() and re-scopes the list on selection.
export default function UserManager({ restaurantId, availableRoles = DEFAULT_ROLES, onUserCreated }) {
  const { tenants } = useTenants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurantId ?? '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', roles: [] });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ username: '', password: '', roles: [] });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const scopeId = restaurantId ?? selectedRestaurantId;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(scopeId || undefined);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [scopeId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleExpanded = (id) => {
    setExpandedId((current) => (current === id ? null : id));
    setEditingId(null);
    setConfirmingDeleteId(null);
  };

  const toggleRole = (roles, setRoles, roleName) => {
    setRoles(roles.includes(roleName) ? roles.filter((r) => r !== roleName) : [...roles, roleName]);
  };

  const renderRoleCheckboxes = (roles, onChange) => (
    <div className="flex flex-wrap gap-3">
      {availableRoles.map((roleName) => (
        <label key={roleName} className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={roles.includes(roleName)}
            onChange={() => toggleRole(roles, onChange, roleName)}
          />
          {roleName}
        </label>
      ))}
    </div>
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!scopeId) return;
    setSaving(true);
    try {
      const user = await createUser({
        username: createForm.username,
        password: createForm.password,
        restaurantId: scopeId,
        roleNames: createForm.roles,
      });
      setCreateForm({ username: '', password: '', roles: [] });
      setCreating(false);
      await loadUsers();
      onUserCreated?.(user);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditDraft({ username: user.username, password: '', roles: [...user.roles] });
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const patch = { username: editDraft.username, roleNames: editDraft.roles };
      if (editDraft.password) patch.password = editDraft.password;
      await updateUser(id, patch);
      setEditingId(null);
      await loadUsers();
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
      await deleteUser(id);
      setConfirmingDeleteId(null);
      await loadUsers();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!restaurantId && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tenant-picker">
            Tenant
          </label>
          <select
            id="tenant-picker"
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="">All tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setCreating((c) => !c)}
          disabled={!scopeId}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {creating ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3"
        >
          <input
            required
            placeholder="Username"
            value={createForm.username}
            onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          {renderRoleCheckboxes(createForm.roles, (roles) => setCreateForm((f) => ({ ...f, roles })))}
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="text-4xl animate-bounce mb-4">⏳</div>
          <p className="text-gray-500">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-sm">No users yet.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => {
            const isExpanded = expandedId === user.id;
            const isEditing = editingId === user.id;
            return (
              <li key={user.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpanded(user.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(user.id);
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <p className="font-semibold text-gray-900 text-sm">{user.username}</p>
                  <div className="flex items-center gap-2">
                    {user.roles.map((roleName) => (
                      <span
                        key={roleName}
                        className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full"
                      >
                        {roleName}
                      </span>
                    ))}
                    <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={editDraft.username}
                          onChange={(e) => setEditDraft((f) => ({ ...f, username: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <input
                          type="password"
                          placeholder="New password (leave blank to keep unchanged)"
                          value={editDraft.password}
                          onChange={(e) => setEditDraft((f) => ({ ...f, password: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        {renderRoleCheckboxes(editDraft.roles, (roles) => setEditDraft((f) => ({ ...f, roles })))}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(user.id)}
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
                          onClick={() => startEdit(user)}
                          className="text-yellow-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-yellow-200 hover:bg-yellow-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={saving}
                          className="text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-60"
                        >
                          {confirmingDeleteId === user.id ? 'Confirm Delete?' : 'Delete'}
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
