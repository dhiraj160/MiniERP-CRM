import { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import { GlobalApiError } from '../components/Layout/GlobalApiError';
import { LiquidLoader } from '../components/ui/LiquidLoader';

interface StockMovement {
  id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason?: string;
  createdAt: string;
  product: { name: string; sku: string };
  user: { name: string };
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}


export const StockMovementsPage = () => {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadProducts = async () => {
    try {
      const result = await productsApi.list({ page: 1, limit: 100 });
      setProducts(result.data);
      if (!selectedProduct && result.data.length > 0) {
        setSelectedProduct(result.data[0].id);
      }
    } catch (err) {
      console.error('Unable to load products', err);
    }
  };

  const loadMovements = async () => {
    setLoading(true);
    try {
      const result = await productsApi.listMovements({ page: 1, limit: 25 });
      setMovements(result.data);
    } catch (err) {
      console.error('Unable to load stock movements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct || quantity <= 0) return;
    setSaving(true);
    try {
      await productsApi.recordMovement({
        productId: selectedProduct,
        type,
        quantity,
        reason,
      });
      setReason('');
      setQuantity(1);
      setError(null);
      loadMovements();
    } catch (err: any) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const typeClass = {
    IN: 'badge-in',
    OUT: 'badge-out',
  };

  return (
    <section className="page-container">
      <div className="flex justify-between align-center" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Stock Movements</h1>
        </div>
      </div>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Track inventory changes and manually adjust stock for incoming/ outgoing goods.
      </p>

      <div className="glass-card" style={{ marginBottom: '24px', animationDelay: '0.1s', padding: '16px 20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Record new movement</h3>
        {error && <GlobalApiError error={error} />}
        <form className="form-grid" onSubmit={handleCreate} style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label htmlFor="product">Product</label>
            <select
              id="product"
              className="input-control"
              value={selectedProduct}
              onChange={(event) => setSelectedProduct(event.target.value)}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              className="input-control"
              value={type}
              onChange={(event) => setType(event.target.value as 'IN' | 'OUT')}
            >
              <option value="IN">IN (stock increase)</option>
              <option value="OUT">OUT (stock decrease)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              className="input-control"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              required
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="reason">Reason</label>
            <input
              id="reason"
              className="input-control"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Stock received / Stock dispatched"
            />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Record movement'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ animationDelay: '0.2s', padding: '16px 20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Recent movements</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 0' }}>
                    <LiquidLoader text="Loading stock movements..." />
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state" style={{ padding: '16px' }}>No movements found.</div>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => {
                  const isOut = movement.type === 'OUT';
                  return (
                    <tr 
                      key={movement.id} 
                      style={{ 
                        transition: 'all 0.2s ease',
                        borderLeft: `3px solid ${isOut ? '#f87171' : '#22c55e'}`,
                        background: isOut ? 'linear-gradient(90deg, rgba(239,68,68,0.05) 0%, transparent 100%)' : 'linear-gradient(90deg, rgba(34,197,94,0.05) 0%, transparent 100%)'
                      }}
                    >
                      <td>{movement.product.name}</td>
                      <td>
                        <span className={`badge ${typeClass[movement.type]}`}>
                          {movement.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          color: isOut ? '#f87171' : '#22c55e', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isOut ? '-' : '+'}{movement.quantity}
                        </span>
                      </td>
                      <td>{movement.reason || '-'}</td>
                      <td>{movement.user.name}</td>
                      <td>{new Date(movement.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};