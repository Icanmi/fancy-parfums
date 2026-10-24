import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiArrowLeftLine, RiRefreshLine } from 'react-icons/ri'
import {
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  getAdminCategories,
  getAdminBrands,
} from '../../services/adminProductService'
import AdminImageUpload from '../../components/admin/AdminImageUpload'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [refreshingMeta, setRefreshingMeta] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEdit)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '', slug: '', description: '', price: '', compareAtPrice: '',
      brand_id: '', category_id: '', gender: 'Unisex', fragranceFamily: '',
      concentration: 'Eau de Parfum', size: '', stockQuantity: 0,
      sku: '', image: '', isFeatured: false, isActive: true,
    },
  })

  const nameValue = watch('name')
  const imageValue = watch('image')

  // Auto-generate slug from name on create
  useEffect(() => {
    if (!isEdit) setValue('slug', slugify(nameValue || ''))
  }, [nameValue, isEdit, setValue])

  const refreshMeta = async (notify = true) => {
    setRefreshingMeta(true)
    try {
      const [dbBrands, dbCats] = await Promise.all([
        getAdminBrands(),
        getAdminCategories(),
      ])
      setBrands(dbBrands || [])
      setCategories(dbCats || [])
      if (notify) toast.success('Brands & categories refreshed from database!')
    } catch (err) {
      console.error('Failed to load brands/categories:', err)
      if (notify) toast.error('Could not refresh brands/categories. Is the server running?')
    } finally {
      setRefreshingMeta(false)
      setLoadingMeta(false)
    }
  }

  // Load brands + categories from live API on mount
  useEffect(() => {
    refreshMeta(false)
  }, [])

  // Load existing product data for edit mode
  useEffect(() => {
    if (!isEdit) return
    let mounted = true
    async function loadProduct() {
      setLoadingProduct(true)
      try {
        const p = await getAdminProductById(id)
        if (!p) {
          toast.error('Product not found.')
          navigate('/admin/products')
          return
        }
        if (mounted) {
          reset({
            name: p.name || '',
            slug: p.slug || '',
            description: p.description || '',
            price: p.price || '',
            compareAtPrice: p.compare_at_price || '',
            brand_id: p.brand_id || '',
            category_id: p.category_id || '',
            gender: p.gender || 'Unisex',
            fragranceFamily: p.fragrance_family || '',
            concentration: p.concentration || 'Eau de Parfum',
            size: p.size || p.default_size || '',
            stockQuantity: p.stock_quantity ?? 0,
            sku: p.sku || '',
            image: p.image_url || '',
            isFeatured: p.is_featured || false,
            isActive: p.is_active !== false,
          })
        }
      } catch (err) {
        console.error('Failed to load product:', err)
        toast.error('Failed to load product.')
        navigate('/admin/products')
      } finally {
        if (mounted) setLoadingProduct(false)
      }
    }
    loadProduct()
    return () => { mounted = false }
  }, [id, isEdit, navigate, reset])

  async function onSubmit(data) {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Number(data.price),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
      brand_id: data.brand_id || null,
      category_id: data.category_id || null,
      gender: data.gender,
      fragranceFamily: data.fragranceFamily,
      concentration: data.concentration,
      size: data.size,
      stockQuantity: Number(data.stockQuantity),
      sku: data.sku,
      image: data.image,
      isFeatured: Boolean(data.isFeatured),
      isActive: Boolean(data.isActive),
    }

    try {
      if (isEdit) {
        await updateAdminProduct(id, payload)
        toast.success('Product updated in Supabase!')
      } else {
        await createAdminProduct(payload)
        toast.success('Product created in Supabase!')
      }
      navigate('/admin/products')
    } catch (err) {
      console.error('Save failed:', err)
      const message = err?.response?.data?.error || err.message || 'Failed to save product.'
      toast.error(message)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white'
  const labelCls = 'block text-xs font-semibold text-[#0A0A0A] mb-1 uppercase tracking-wider'
  const errorCls = 'text-xs text-red-500 mt-0.5'

  if (loadingProduct || loadingMeta) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B6B88]">
          {loadingProduct ? 'Loading product…' : 'Loading form data…'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-[#6B6B88] hover:text-[#0A0A0A] transition-colors no-underline">
          <RiArrowLeftLine size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-xs text-[#6B6B88] mt-0.5">
            {isEdit ? `Editing product ID: ${id}` : 'Saved directly to Supabase via Express API'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-sm p-6" style={{ border: '1px solid #ede9e0' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B6B88] mb-5">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelCls}>Name *</label>
              <input {...register('name', { required: 'Name is required' })} className={inputCls} placeholder="e.g. Sauvage Eau de Parfum" />
              {errors.name && <p className={errorCls}>{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input {...register('slug', { required: 'Slug is required' })} className={inputCls} placeholder="sauvage-eau-de-parfum" />
              {errors.slug && <p className={errorCls}>{errors.slug.message}</p>}
            </div>
            <div>
              <label className={labelCls}>SKU</label>
              <input {...register('sku')} className={inputCls} placeholder="SKU-001 (auto-generated if blank)" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea {...register('description')} rows={4} className={`${inputCls} resize-none`} placeholder="Product description…" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-sm p-6" style={{ border: '1px solid #ede9e0' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B6B88] mb-5">Pricing & Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Price (₦) *</label>
              <input type="number" min={0} {...register('price', { required: 'Price is required', min: { value: 1, message: 'Must be > 0' } })} className={inputCls} placeholder="65000" />
              {errors.price && <p className={errorCls}>{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Compare At Price (₦)</label>
              <input type="number" min={0} {...register('compareAtPrice')} className={inputCls} placeholder="75000" />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity *</label>
              <input type="number" min={0} {...register('stockQuantity', { required: 'Stock is required' })} className={inputCls} placeholder="0" />
              {errors.stockQuantity && <p className={errorCls}>{errors.stockQuantity.message}</p>}
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-sm p-6" style={{ border: '1px solid #ede9e0' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B6B88] mb-5">Classification</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Brand *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => refreshMeta(true)}
                    disabled={refreshingMeta}
                    className="text-[11px] text-[#6B6B88] hover:text-[#D4AF37] flex items-center gap-1 transition-colors disabled:opacity-50"
                    title="Refresh brand list"
                  >
                    <RiRefreshLine size={12} className={refreshingMeta ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  <Link
                    to="/admin/brands/new"
                    target="_blank"
                    className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
                  >
                    + Add Brand
                  </Link>
                </div>
              </div>
              <select {...register('brand_id', { required: 'Brand is required' })} className={inputCls}>
                <option value="">Select brand…</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.brand_id && <p className={errorCls}>{errors.brand_id.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls}>Category *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => refreshMeta(true)}
                    disabled={refreshingMeta}
                    className="text-[11px] text-[#6B6B88] hover:text-[#D4AF37] flex items-center gap-1 transition-colors disabled:opacity-50"
                    title="Refresh category list"
                  >
                    <RiRefreshLine size={12} className={refreshingMeta ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  <Link
                    to="/admin/categories/new"
                    target="_blank"
                    className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
                  >
                    + Add Category
                  </Link>
                </div>
              </div>
              <select {...register('category_id', { required: 'Category is required' })} className={inputCls}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className={errorCls}>{errors.category_id.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <select {...register('gender')} className={inputCls}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Concentration</label>
              <select {...register('concentration')} className={inputCls}>
                {['Eau de Parfum', 'Eau de Toilette', 'Parfum', 'Eau de Cologne', 'Body Mist'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Fragrance Family</label>
              <input {...register('fragranceFamily')} className={inputCls} placeholder="e.g. Aromatic Fougère" />
            </div>
            <div>
              <label className={labelCls}>Default Size</label>
              <input {...register('size')} className={inputCls} placeholder="e.g. 100ml" />
            </div>
          </div>
        </div>

        {/* Media & Settings */}
        <div className="bg-white rounded-sm p-6" style={{ border: '1px solid #ede9e0' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B6B88] mb-5">Media & Settings</h2>
          <div className="grid grid-cols-1 gap-5">
            <AdminImageUpload
              label="Product Image"
              value={imageValue}
              onChange={(val) => setValue('image', val, { shouldDirty: true })}
              placeholderUrl="/images/product.jpg"
              helperText="Upload JPG, PNG, WEBP from your folder or paste a URL"
            />
            <div className="flex gap-8 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 accent-[#D4AF37]" />
                <span className="text-sm font-medium text-[#0A0A0A]">Featured product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-[#D4AF37]" />
                <span className="text-sm font-medium text-[#0A0A0A]">Active (visible in store)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 text-xs font-semibold border border-gray-300 rounded-sm hover:bg-[#F5F3EE] transition-colors no-underline text-[#0A0A0A]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold rounded-sm transition-colors uppercase tracking-widest disabled:opacity-60 flex items-center gap-2"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            {isSubmitting && (
              <span className="w-3 h-3 border border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
            )}
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
