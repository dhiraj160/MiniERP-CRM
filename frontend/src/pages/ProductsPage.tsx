import { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { GlobalApiError } from '../components/Layout/GlobalApiError';
import { LiquidLoader } from '../components/ui/LiquidLoader';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
  category: { id: string; name: string };
  isActive: boolean;
}

interface ProductsPageProps {
  initialLowStock?: boolean;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ initialLowStock = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStock);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: 0,
    currentStock: 0,
    minimumStock: 10,
    warehouse: '',
  });
  const [error, setError] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormState, setEditFormState] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: 0,
    currentStock: 0,
    minimumStock: 10,
    warehouse: '',
  });
  const [updating, setUpdating] = useState(false);

  const isFormDirty = formState.name !== '' || formState.sku !== '';
  useUnsavedChanges(isFormDirty || editMode);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { search, page, limit: 10 };
      if (lowStockOnly) params.lowStock = 'true';
      const result = await productsApi.list(params);
      setProducts(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('loadProducts error', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await productsApi.listCategories();
      setCategories(result.data);
    } catch (err) {
      console.error('Unable to load categories', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, page, lowStockOnly]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadProductDetails = async (id: string) => {
    setSelectedProductId(id);
    setProductError(null);
    setProductLoading(true);
    try {
      const result = await productsApi.getById(id);
      setSelectedProduct(result.data);
      setEditFormState({
        name: result.data.name || '',
        sku: result.data.sku || '',
        categoryId: result.data.category?.id || '',
        price: result.data.price || 0,
        currentStock: result.data.currentStock || 0,
        minimumStock: result.data.minimumStock || 10,
        warehouse: result.data.warehouse || '',
      });
      setEditMode(false);
    } catch (err: any) {
      setProductError(err?.response?.data?.message || 'Unable to load product details');
      setSelectedProduct(null);
    } finally {
      setProductLoading(false);
    }
  };

  const handleSelectProduct = (id: string) => {
    loadProductDetails(id);
  };

  const handleEditProduct = () => setEditMode(true);

  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedProductId) {
      loadProductDetails(selectedProductId);
    }
  };

  const handleUpdateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProductId) return;
    setUpdating(true);
    try {
      await productsApi.update(selectedProductId, {
        ...editFormState,
        price: Number(editFormState.price),
        currentStock: Number(editFormState.currentStock),
        minimumStock: Number(editFormState.minimumStock),
      });
      await loadProductDetails(selectedProductId);
      loadProducts();
    } catch (err: any) {
      setProductError(err);
    } finally {
      setProductLoading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    // Client validation: SKU must be unique-looking, price > 0, stock >= 0
    if (!formState.sku.trim()) {
      setError('SKU is required');
      setSaving(false);
      return;
    }

    if (formState.price <= 0) {
      setError('Price must be greater than zero');
      setSaving(false);
      return;
    }

    if (formState.currentStock < 0) {
      setError('Current stock cannot be negative');
      setSaving(false);
      return;
    }

    try {
      await productsApi.create({
        ...formState,
        price: Number(formState.price),
        currentStock: Number(formState.currentStock),
        minimumStock: Number(formState.minimumStock),
      });
      setFormState({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        price: 0,
        currentStock: 0,
        minimumStock: 10,
        warehouse: '',
      });
      loadProducts();
    } catch (err: any) {
      setError(err);
      setSaving(false);
    }
  };

  return (
    <section className="page-container">
      <div className="flex justify-between align-center" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Products</h1>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setLowStockOnly((current) => !current)}
        >
          {lowStockOnly ? 'Show all products' : 'Show low stock only'}
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', animationDelay: '0.1s', padding: '16px 20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Search products</h3>
        <div style={{ marginBottom: '16px' }}>
          <input
            className="input-control"
            style={{ width: '100%', padding: '10px 14px' }}
            placeholder="Search products by name or SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Warehouse</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 0' }}>
                    <LiquidLoader text="Loading products..." />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state" style={{ padding: '16px' }}>No products found.</div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} style={{ transition: 'background-color 0.15s ease' }}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category?.name || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ 
                            fontWeight: 600, 
                            color: product.currentStock <= product.minimumStock ? '#f87171' : '#22c55e'
                          }}>
                            {product.currentStock}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Min: {product.minimumStock}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${Math.min((product.currentStock / Math.max(product.minimumStock * 2, 1)) * 100, 100)}%`,
                            backgroundColor: product.currentStock <= product.minimumStock ? '#f87171' : '#22c55e',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td>{product.warehouse}</td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-link"
                        onClick={() => handleSelectProduct(product.id)}
                        aria-label="View product"
                      >
                        View
                      </button>
                      <button
                        className="btn btn-link"
                        onClick={() => {
                          handleSelectProduct(product.id);
                          setEditMode(true);
                        }}
                        aria-label="Edit product"
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
        >
          Previous
        </button>
        <span style={{ alignSelf: 'center' }}>Page {page} / {totalPages}</span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      {selectedProduct && (
        <div className="profile-sheet-overlay" onClick={() => {
          setSelectedProductId(null);
          setSelectedProduct(null);
        }}>
          <div className="profile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="profile-sheet-header">
              <h2 style={{ margin: 0 }}>Product details</h2>
              <button className="btn btn-secondary" onClick={() => {
                setSelectedProductId(null);
                setSelectedProduct(null);
              }}>
                Close
              </button>
            </div>
            <div className="profile-sheet-content">

          {productError && <GlobalApiError error={productError} />}
          
          {productLoading ? (
            <LiquidLoader text="Loading product details..." />
          ) : editMode ? (
            <form onSubmit={handleUpdateProduct} className="form-grid">
              <div className="form-group">
                <label htmlFor="editName">Name</label>
                <input
                  id="editName"
                  className="input-control"
                  value={editFormState.name}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, name: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editSku">SKU</label>
                <input
                  id="editSku"
                  className="input-control"
                  value={editFormState.sku}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, sku: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editCategory">Category</label>
                <select
                  id="editCategory"
                  className="input-control"
                  value={editFormState.categoryId}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, categoryId: event.target.value })}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editWarehouse">Warehouse</label>
                <input
                  id="editWarehouse"
                  className="input-control"
                  value={editFormState.warehouse}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, warehouse: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPrice">Price</label>
                <input
                  id="editPrice"
                  className="input-control"
                  type="number"
                  value={editFormState.price}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, price: Number(event.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editCurrentStock">Current stock</label>
                <input
                  id="editCurrentStock"
                  className="input-control"
                  type="number"
                  value={editFormState.currentStock}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, currentStock: Number(event.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editMinimumStock">Minimum stock</label>
                <input
                  id="editMinimumStock"
                  className="input-control"
                  type="number"
                  value={editFormState.minimumStock}
                  onChange={(event) =>
                    setEditFormState({ ...editFormState, minimumStock: Number(event.target.value) })}
                  required
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
                  {updating ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <p><strong>Name:</strong> {selectedProduct.name}</p>
                  <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                  <p><strong>Category:</strong> {selectedProduct.category?.name || '-'}</p>
                  <p><strong>Warehouse:</strong> {selectedProduct.warehouse || '-'}</p>
                </div>
                <div>
                  <p><strong>Price:</strong> ₹{selectedProduct.price?.toFixed(2)}</p>
                  <p><strong>Stock:</strong> {selectedProduct.currentStock}</p>
                  <p><strong>Minimum stock:</strong> {selectedProduct.minimumStock}</p>
                  <p><strong>Created:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <button className="btn btn-primary" onClick={handleEditProduct}>
                  Edit product
                </button>
              </div>
              <div>
                <h3>Recent stock movements</h3>
                {selectedProduct.stockMovements?.length ? (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Reason</th>
                          <th>User</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProduct.stockMovements.map((movement: any) => (
                          <tr key={movement.id}>
                            <td>{movement.type}</td>
                            <td>{movement.quantity}</td>
                            <td>{movement.reason || '-'}</td>
                            <td>{movement.user?.name || '-'}</td>
                            <td>{new Date(movement.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af' }}>No stock movements recorded for this product yet.</p>
                )}
              </div>
            </>
          )}
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ marginBottom: '24px' }}>Add product</h2>
        {error && <GlobalApiError error={error} />}
        <form onSubmit={handleCreate}>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Product Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Product name</label>
                <input
                  id="name"
                  className="input-control"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState({ ...formState, name: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU</label>
                <input
                  id="sku"
                  className="input-control"
                  value={formState.sku}
                  onChange={(event) =>
                    setFormState({ ...formState, sku: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="categoryId">Category</label>
                <select
                  id="categoryId"
                  className="input-control"
                  value={formState.categoryId}
                  onChange={(event) =>
                    setFormState({ ...formState, categoryId: event.target.value })}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  className="input-control"
                  type="number"
                  value={formState.price}
                  onChange={(event) =>
                    setFormState({ ...formState, price: Number(event.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>Stock Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="currentStock">Current stock</label>
                <input
                  id="currentStock"
                  className="input-control"
                  type="number"
                  value={formState.currentStock}
                  onChange={(event) =>
                    setFormState({ ...formState, currentStock: Number(event.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="minimumStock">Minimum stock</label>
                <input
                  id="minimumStock"
                  className="input-control"
                  type="number"
                  value={formState.minimumStock}
                  onChange={(event) =>
                    setFormState({ ...formState, minimumStock: Number(event.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="warehouse">Warehouse</label>
                <input
                  id="warehouse"
                  className="input-control"
                  value={formState.warehouse}
                  onChange={(event) =>
                    setFormState({ ...formState, warehouse: event.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};