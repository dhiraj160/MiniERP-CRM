import { useEffect, useState } from 'react';
import { customersApi } from '../api/customers';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { GlobalApiError } from '../components/Layout/GlobalApiError';
import { LiquidLoader } from '../components/ui/LiquidLoader';
import { AdvancedCalendar } from '../components/ui/AdvancedCalendar';

interface Customer {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  businessName?: string;
  gstNumber?: string;
  address?: string;
  notes?: string;
  customerType: string;
  status: string;
  followUpDate?: string | null;
  createdBy?: { name: string };
  customerNotes?: Array<{ id: string; note: string; createdAt: string; createdBy?: { name: string } }>;
  challans?: Array<{ id: string; challanNumber: string; status: string; totalAmount: number; createdAt: string }>;
}

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    address: '',
    customerType: 'RETAILER' as 'RETAILER' | 'WHOLESALER' | 'DISTRIBUTOR',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'LEAD',
    followUpDate: '',
    notes: '',
  });
  const [formError, setFormError] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    address: '',
    customerType: 'RETAILER' as 'RETAILER' | 'WHOLESALER' | 'DISTRIBUTOR',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'LEAD',
    followUpDate: '',
    notes: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isFormDirty = formData.name !== '' || formData.email !== '' || formData.mobile !== '' || formData.businessName !== '';
  useUnsavedChanges(isFormDirty || isEditMode);

  // Debounced search - search after user stops typing for 300ms
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await customersApi.list({
        search: debouncedSearch,
        page,
        limit: 10,
      });
      setCustomers(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading customers', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (id: string) => {
    setSelectedCustomerId(id);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const result = await customersApi.getById(id);
      setSelectedCustomer(result.data);
      setEditFormData({
        name: result.data.name || '',
        mobile: result.data.mobile || '',
        email: result.data.email || '',
        businessName: result.data.businessName || '',
        gstNumber: result.data.gstNumber || '',
        address: result.data.address || '',
        customerType: result.data.customerType || 'RETAILER',
        status: result.data.status || 'ACTIVE',
        followUpDate: result.data.followUpDate ? new Date(new Date(result.data.followUpDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
        notes: result.data.notes || '',
      });
      setIsEditMode(false);
    } catch (error: any) {
      setDetailError(error?.response?.data?.message || 'Unable to load customer details');
      setSelectedCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  };


  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch, page]);


  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    // Client validation
    if (!formData.name.trim()) {
      setFormError('Customer name is required');
      setSaving(false);
      return;
    }

    if (!/\S+@\S+/.test(formData.email) && formData.email) {
      setFormError('Invalid email format');
      setSaving(false);
      return;
    }

    try {
      await customersApi.create({
        ...formData,
        followUpDate: formData.followUpDate || undefined,
      });
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        address: '',
        customerType: 'RETAILER',
        status: 'ACTIVE',
        followUpDate: '',
        notes: '',
      });
      await loadCustomers();
    } catch (error: any) {
      setFormError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    loadCustomerDetails(customerId);
  };

  const handleEditCustomer = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (selectedCustomerId) {
      loadCustomerDetails(selectedCustomerId);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCustomerId) return;

    setUpdating(true);
    try {
      await customersApi.update(selectedCustomerId, {
        ...editFormData,
        followUpDate: editFormData.followUpDate || undefined,
      });
      await loadCustomerDetails(selectedCustomerId);
      loadCustomers();
      setDetailError(null);
    } catch (error: any) {
      setDetailError(error);
    } finally {
      setDetailLoading(false);
    }
  };


  return (
    <section className="page-container">
      <div className="flex justify-between align-center" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Customers</h1>
        </div>
      </div>

      {formError && <GlobalApiError error={formError} />}

      <div className="glass-card" style={{ animationDelay: '0.1s', padding: '16px 20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Search customers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <input
            className="input-control"
            style={{ width: '100%', padding: '10px 14px' }}
            placeholder="Search by name, business, mobile or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="input-control"
              style={{ padding: '8px 12px', flex: '1 1 150px' }}
              onChange={(event) => setSearch(event.target.value)}
            >
              <option value="">All customers ▼</option>
              <option value="ACTIVE">Active only</option>
              <option value="INACTIVE">Inactive only</option>
              <option value="LEAD">Lead only</option>
            </select>
            <input
              className="input-control"
              style={{ flex: '2 1 200px', padding: '8px 12px' }}
              placeholder="Filter by status or type"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Mobile</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 0' }}>
                      <LiquidLoader text="Loading customers..." />
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state" style={{ padding: '16px' }}>No customers found.</div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} style={{ transition: 'background-color 0.15s ease' }}>
                      <td>{customer.name}</td>
                      <td>{customer.businessName || '-'}</td>
                      <td>{customer.customerType}</td>
                      <td>
                        <span className={`badge badge-${customer.status.toLowerCase()}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td>{customer.mobile || '-'}</td>
                      <td>
                        {customer.followUpDate
                          ? new Date(customer.followUpDate).toLocaleString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric', 
                              hour: '2-digit', minute: '2-digit' 
                            })
                          : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-link"
                          onClick={() => handleSelectCustomer(customer.id)}
                          aria-label="View customer"
                        >
                          View
                        </button>
                        <button
                          className="btn btn-link"
                          onClick={() => {
                            handleSelectCustomer(customer.id);
                            setIsEditMode(true);
                          }}
                          aria-label="Edit customer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span style={{ alignSelf: 'center' }}>Page {page} / {totalPages}</span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {selectedCustomer && (
        <div className="profile-sheet-overlay" onClick={() => {
          setSelectedCustomerId(null);
          setSelectedCustomer(null);
        }}>
          <div className="profile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="profile-sheet-header">
              <h2 style={{ margin: 0 }}>Customer Details</h2>
              <button className="btn btn-secondary" onClick={() => {
                setSelectedCustomerId(null);
                setSelectedCustomer(null);
              }}>Close</button>
            </div>
            <div className="profile-sheet-content">

          {detailError && <GlobalApiError error={detailError} />}

          {detailLoading ? (
            <LiquidLoader text="Loading customer profile..." />
          ) : isEditMode ? (
            <form onSubmit={handleUpdate} className="form-grid">
              <div className="form-group">
                <label htmlFor="editName">Name</label>
                <input
                  id="editName"
                  className="input-control"
                  value={editFormData.name}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editBusinessName">Business name</label>
                <input
                  id="editBusinessName"
                  className="input-control"
                  value={editFormData.businessName}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, businessName: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="editGstNumber">GST Number</label>
                <input
                  id="editGstNumber"
                  className="input-control"
                  value={editFormData.gstNumber}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, gstNumber: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">Email</label>
                <input
                  id="editEmail"
                  className="input-control"
                  type="email"
                  value={editFormData.email}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, email: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="editMobile">Mobile</label>
                <input
                  id="editMobile"
                  className="input-control"
                  value={editFormData.mobile}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, mobile: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="editStatus">Status</label>
                <select
                  id="editStatus"
                  className="input-control"
                  value={editFormData.status}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, status: event.target.value as 'ACTIVE' | 'INACTIVE' | 'LEAD' })
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editCustomerType">Customer type</label>
                <select
                  id="editCustomerType"
                  className="input-control"
                  value={editFormData.customerType}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, customerType: event.target.value as 'RETAILER' | 'WHOLESALER' | 'DISTRIBUTOR' })
                  }
                >
                  <option value="RETAILER">Retailer</option>
                  <option value="WHOLESALER">Wholesaler</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editFollowUpDate">Follow-up date</label>
                <AdvancedCalendar
                  value={editFormData.followUpDate}
                  onChange={(val) =>
                    setEditFormData({ ...editFormData, followUpDate: val })
                  }
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="editAddress">Address</label>
                <textarea
                  id="editAddress"
                  className="input-control"
                  value={editFormData.address}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, address: event.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="editNotes">Notes</label>
                <textarea
                  id="editNotes"
                  className="input-control"
                  value={editFormData.notes}
                  onChange={(event) =>
                    setEditFormData({ ...editFormData, notes: event.target.value })
                  }
                  rows={3}
                />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={updating}
                >
                  {updating ? 'Updating…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Business Name:</strong> {selectedCustomer.businessName || '-'}</p>
                  <p><strong>GST Number:</strong> {selectedCustomer.gstNumber || '-'}</p>
                  <p><strong>Type:</strong> {selectedCustomer.customerType}</p>
                  <p><strong>Status:</strong> {selectedCustomer.status}</p>
                </div>
                <div>
                  <p><strong>Mobile:</strong> {selectedCustomer.mobile || '-'}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email || '-'}</p>
                  <p><strong>Follow-up:</strong> {selectedCustomer.followUpDate
                    ? new Date(selectedCustomer.followUpDate).toLocaleDateString()
                    : '-'}</p>
                  <p><strong>Created by:</strong> {selectedCustomer.createdBy?.name || '-'}</p>
                </div>
              </div>
              <p><strong>Address:</strong> {selectedCustomer.address || '-'}</p>
              <p><strong>Notes:</strong> {selectedCustomer.notes || '-'}</p>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleEditCustomer}>
                  Edit customer
                </button>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3>Recent notes</h3>
                {selectedCustomer.customerNotes?.length ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Note</th>
                          <th>By</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.customerNotes.map((note: any) => (
                          <tr key={note.id}>
                            <td>{note.note}</td>
                            <td>{note.createdBy?.name || '-'}</td>
                            <td>{new Date(note.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af' }}>No notes yet.</p>
                )}
              </div>
            </>
          )}

          <div style={{ marginTop: '24px' }}>
            <h3>Recent challans</h3>
            {selectedCustomer.challans?.length ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Challan</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.challans.map((challan: any) => (
                      <tr key={challan.id}>
                        <td>{challan.challanNumber}</td>
                        <td>{challan.status}</td>
                        <td>₹{challan.totalAmount.toLocaleString()}</td>
                        <td>{new Date(challan.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#9ca3af' }}>No challans for this customer.</p>
            )}
          </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ marginTop: '24px', animationDelay: '0.3s' }}>
        <h2 style={{ marginBottom: '24px' }}>Add new customer</h2>
        {formError && <GlobalApiError error={formError} />}
        <form onSubmit={handleCreate}>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Customer Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Customer name</label>
                <input
                  id="name"
                  className="input-control"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="businessName">Business name</label>
                <input
                  id="businessName"
                  className="input-control"
                  value={formData.businessName}
                  onChange={(event) =>
                    setFormData({ ...formData, businessName: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="gstNumber">GST Number</label>
                <input
                  id="gstNumber"
                  className="input-control"
                  value={formData.gstNumber}
                  onChange={(event) =>
                    setFormData({ ...formData, gstNumber: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className="input-control"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="mobile">Mobile</label>
                <input
                  id="mobile"
                  className="input-control"
                  value={formData.mobile}
                  onChange={(event) =>
                    setFormData({ ...formData, mobile: event.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Classification</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="customerType">Customer type</label>
                <select
                  id="customerType"
                  className="input-control"
                  value={formData.customerType}
                  onChange={(event) =>
                    setFormData({ ...formData, customerType: event.target.value as 'RETAILER' | 'WHOLESALER' | 'DISTRIBUTOR' })}
                >
                  <option value="RETAILER">Retailer</option>
                  <option value="WHOLESALER">Wholesaler</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className="input-control"
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({ ...formData, status: event.target.value as 'ACTIVE' | 'INACTIVE' | 'LEAD' })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="followUpDate">Follow-up date</label>
                <AdvancedCalendar
                  value={formData.followUpDate}
                  onChange={(val) =>
                    setFormData({ ...formData, followUpDate: val })
                  }
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Address & Notes</h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  className="input-control"
                  value={formData.address}
                  onChange={(event) =>
                    setFormData({ ...formData, address: event.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="input-control"
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData({ ...formData, notes: event.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create customer'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};