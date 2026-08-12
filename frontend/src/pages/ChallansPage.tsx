import { useEffect, useMemo, useState } from 'react';
import { challansApi } from '../api/challans';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import { GlobalApiError } from '../components/Layout/GlobalApiError';
import { LiquidLoader } from '../components/ui/LiquidLoader';

interface CustomerOption {
  id: string;
  name: string;
  businessName?: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  price: number;
}

interface ChallanRow {
  id: string;
  challanNumber: string;
  status: string;
  customer: { name: string; businessName?: string };
  totalAmount: number;
  createdAt: string;
}

interface LineItem {
  productId: string;
  quantity: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  lineTotal: number;
}

export const ChallansPage = () => {
  const [challans, setChallans] = useState<ChallanRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'DRAFT' | 'CONFIRMED'>('DRAFT');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const isFormDirty = items.length > 0;
  useUnsavedChanges(isFormDirty);

  const loadChallans = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 20 };
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (search) params.search = search;
      const response = await challansApi.list(params);
      setChallans(response.data);
    } catch (err) {
      console.error('Unable to load challans', err);
      setChallans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const result = await customersApi.list({ page: 1, limit: 50 });
      setCustomers(result.data);
      if (!selectedCustomer && result.data.length) {
        setSelectedCustomer(result.data[0].id);
      }
    } catch (err) {
      console.error('Unable to load customers', err);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await productsApi.list({ page: 1, limit: 100 });
      setProducts(result.data);
      if (!selectedProductId && result.data.length) {
        setSelectedProductId(result.data[0].id);
      }
    } catch (err) {
      console.error('Unable to load products', err);
    }
  };

  useEffect(() => {
    loadChallans();
    loadCustomers();
    loadProducts();
  }, []);
  useEffect(() => {
    loadChallans();
  }, [filterStatus, search]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId),
    [products, selectedProductId]
  );

  const addItem = () => {
    if (!selectedProductId || quantity <= 0 || !selectedProduct) return;
    setItems((current) => {
      const existing = current.find((item) => item.productId === selectedProductId);
      if (existing) {
        return current.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + quantity, lineTotal: (item.quantity + quantity) * item.unitPrice }
            : item
        );
      }
      return [
        ...current,
        {
          productId: selectedProductId,
          quantity,
          productName: selectedProduct.name,
          productSku: selectedProduct.sku,
          unitPrice: selectedProduct.price,
          lineTotal: quantity * selectedProduct.price,
        },
      ];
    });
    setQuantity(1);
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCustomer || items.length === 0) {
      setError('Choose customer and at least one product');
      return;
    }

    // Calculate totals
    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('Product not found');
      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
        productName: product.name,
        productSku: product.sku,
      };
    });

    setError(null);
    setSaving(true);
    try {
      await challansApi.create({
        customerId: selectedCustomer,
        status: selectedStatus,
        items: processedItems,
      });
      setItems([]);
      setQuantity(1);
      setSaving(false);
      loadChallans();
    } catch (err: any) {
      setError(err);
      setSaving(false);
    }
  };

  const handleConfirm = async (challanId: string) => {
    // Show confirmation dialog
    if (!window.confirm('Confirm this challan? Stock will be updated after successful confirmation.')) {
      return;
    }

    setError(null);
    setConfirmingId(challanId);
    try {
      await challansApi.confirm(challanId);
      setConfirmedId(challanId);
      await loadChallans();
      setTimeout(() => setConfirmedId(null), 2000); // clear animation class
    } catch (err: any) {
      setError(err);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = async (challanId: string) => {
    try {
      await challansApi.cancel(challanId);
      loadChallans();
    } catch (err: any) {
      console.error('Unable to cancel challan', err);
    }
  };

  return (
    <section className="page-container">
      <div className="flex justify-between align-center mb-20">
        <div>
          <h1>Sales Challans</h1>
          <p style={{ color: '#9ca3af' }}>Create draft or confirmed challans and manage outstanding sales.</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', animationDelay: '0.1s' }}>
        <h2 style={{ marginBottom: '24px' }}>Create new challan</h2>
        {error && <GlobalApiError error={error} />}
        <form onSubmit={handleCreate}>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Customer Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="customer">Customer</label>
                <select
                  id="customer"
                  className="input-control"
                  value={selectedCustomer}
                  onChange={(event) => setSelectedCustomer(event.target.value)}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.businessName || customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Save as</label>
                <select
                  id="status"
                  className="input-control"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value as 'DRAFT' | 'CONFIRMED'
                    )
                  }
                >
                  <option value="DRAFT">Draft (stock not reduced)</option>
                  <option value="CONFIRMED">Confirmed (stock will be reduced)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Products</h3>
            <div className="flex gap-10 align-center" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
                <label htmlFor="product">Product</label>
                <select
                  id="product"
                  className="input-control"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.currentStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  className="input-control"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, alignSelf: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addItem}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Summary</h3>
            {items.length > 0 && (
              <div className="table-container" style={{ marginTop: '0' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <tr key={item.productId}>
                          <td>{product?.name || 'Unknown'}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.unitPrice.toFixed(2)}</td>
                          <td>₹{item.lineTotal.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link"
                              onClick={() => removeItem(item.productId)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create challan'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ animationDelay: '0.3s', padding: '16px 20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Search existing challans</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <input
            className="input-control"
            style={{ width: '100%', padding: '10px 14px' }}
            placeholder="Search challans or customers"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="input-control"
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(
                  event.target.value as 'ALL' | 'DRAFT' | 'CONFIRMED' | 'CANCELLED'
                )
              }
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 0' }}>
                    <LiquidLoader text="Loading challans..." />
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state" style={{ padding: '16px' }}>No challans found.</div>
                  </td>
                </tr>
              ) : (
                challans.map((challan) => (
                  <tr 
                    key={challan.id} 
                    className={confirmedId === challan.id ? 'success-flash' : ''}
                    style={{ transition: 'background-color 0.15s ease' }}
                  >
                    <td>{challan.challanNumber}</td>
                    <td>{challan.customer.businessName || challan.customer.name}</td>
                    <td>
                      <span className={`badge badge-${challan.status.toLowerCase()}`}>
                        {challan.status}
                      </span>
                    </td>
                    <td>₹{challan.totalAmount.toLocaleString()}</td>
                    <td>{new Date(challan.createdAt).toLocaleDateString()}</td>
                    <td>
                      {challan.status === 'DRAFT' ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleConfirm(challan.id)}
                          disabled={confirmingId === challan.id}
                        >
                          {confirmingId === challan.id ? 'Confirming...' : 'Confirm'}
                        </button>
                      ) : challan.status === 'CONFIRMED' ? (
                        <button
                          className="btn btn-primary"
                          disabled
                          style={{ opacity: 0.6 }}
                        >
                          Confirmed
                        </button>
                      ) : null}
                      
                      {challan.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-danger"
                          style={{ marginLeft: '8px' }}
                          onClick={() => handleCancel(challan.id)}
                          disabled={confirmingId === challan.id}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};