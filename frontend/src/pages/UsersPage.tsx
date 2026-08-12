import { useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { LiquidLoader } from '../components/ui/LiquidLoader';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES',
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES',
    isActive: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await authApi.listUsers({ search, page, limit: 10 });
      setUsers(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Unable to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, page]);

  const handleSelectUser = (user: UserRow) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    setEditMode(false);
  };

  const handleStartEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedUser) {
      handleSelectUser(selectedUser);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUserId) return;

    setUpdating(true);
    try {
      await authApi.updateUser(selectedUserId, {
        name: userFormData.name,
        email: userFormData.email,
        password: userFormData.password || undefined,
        role: userFormData.role,
        isActive: userFormData.isActive,
      });
      setSelectedUser({
        ...selectedUser!,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        isActive: userFormData.isActive,
      });
      loadUsers();
      setEditMode(false);
    } catch (err) {
      console.error('Unable to update user', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      await authApi.createUser(formData);
      setFormData({ name: '', email: '', password: '', role: 'SALES' });
      loadUsers();
    } catch (err) {
      console.error('Unable to create user', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-container">
      <div className="flex justify-between align-center" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Staff management</h1>
        </div>
      </div>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Admin-only user accounts for ERP access and role control.
      </p>

      <div className="glass-card" style={{ marginBottom: '24px', animationDelay: '0.1s', padding: '16px 20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Search users</h3>
        <div style={{ marginBottom: '16px' }}>
          <input
            className="input-control"
            style={{ width: '100%', padding: '10px 14px' }}
            placeholder="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                  <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 0' }}>
                    <LiquidLoader text="Loading users..." />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state" style={{ padding: '16px' }}>No users found.</div>
                    </td>
                  </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-link" onClick={() => handleSelectUser(user)}>
                          View
                        </button>
                        <button className="btn btn-link" onClick={() => { handleSelectUser(user); setEditMode(true); }}>
                          Edit
                        </button>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setPage(Math.max(page - 1, 1))} disabled={page <= 1}>
            Previous
          </button>
          <span style={{ alignSelf: 'center' }}>Page {page} / {totalPages}</span>
          <button className="btn btn-secondary" onClick={() => setPage(Math.min(page + 1, totalPages))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="glass-card glass-surface" style={{ marginTop: '24px', animationDelay: '0.2s', padding: '24px' }}>
          <div className="flex justify-between align-center mb-16">
            <div>
              <h2>Staff details</h2>
              <p style={{ color: '#9ca3af' }}>View and manage the selected staff account.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => { setSelectedUserId(null); setSelectedUser(null); }}>
              Close
            </button>
          </div>
          {editMode ? (
            <form className="form-grid" onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="editName">Name</label>
                <input
                  id="editName"
                  className="input-control"
                  value={userFormData.name}
                  onChange={(event) => setUserFormData({ ...userFormData, name: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">Email</label>
                <input
                  id="editEmail"
                  type="email"
                  className="input-control"
                  value={userFormData.email}
                  onChange={(event) => setUserFormData({ ...userFormData, email: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPassword">Password</label>
                <input
                  id="editPassword"
                  type="password"
                  className="input-control"
                  value={userFormData.password}
                  onChange={(event) => setUserFormData({ ...userFormData, password: event.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editRole">Role</label>
                <select
                  id="editRole"
                  className="input-control"
                  value={userFormData.role}
                  onChange={(event) => setUserFormData({ ...userFormData, role: event.target.value })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ACCOUNTS">Accounts</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editIsActive">Active</label>
                <select
                  id="editIsActive"
                  className="input-control"
                  value={userFormData.isActive ? 'true' : 'false'}
                  onChange={(event) => setUserFormData({ ...userFormData, isActive: event.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={updating}>
                  {updating ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                  <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleStartEdit}>
                  Edit user
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="glass-card" style={{ animationDelay: '0.3s' }}>
        <h2>Create staff user</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              className="input-control"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-control"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-control"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className="input-control"
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value })}
            >
              <option value="ADMIN">Admin</option>
              <option value="SALES">Sales</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="ACCOUNTS">Accounts</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
