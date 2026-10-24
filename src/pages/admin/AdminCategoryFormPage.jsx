import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiArrowLeftLine } from 'react-icons/ri'
import {
  getAdminCategoryById,
  createAdminCategory,
  updateAdminCategory,
} from '../../services/adminProductService'
import { useAdminData } from '../../context/AdminDataContext'
import AdminImageUpload from '../../components/admin/AdminImageUpload'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminCategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { reloadCategories } = useAdminData() || {}
  const [loadingCategory, setLoadingCategory] = useState(isEdit)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
      is_active: true,
    },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (!isEdit) setValue('slug', slugify(nameValue || ''))
  }, [nameValue, isEdit, setValue])

  useEffect(() => {
    if (!isEdit) return
    let mounted = true
    async function loadCategory() {
      setLoadingCategory(true)
      try {
        const cat = await getAdminCategoryById(id)
        if (!cat) {
          toast.error('Category not found.')
          navigate('/admin/categories')
          return
        }
        if (mounted) {
          reset({
            name: cat.name || '',
            slug: cat.slug || '',
            description: cat.description || '',
            image: cat.image_url || cat.image || '',
            is_active: cat.is_active !== false,
          })
        }
      } catch (err) {
        console.error('Failed to load category:', err)
        toast.error('Failed to load category.')
        navigate('/admin/categories')
      } finally {
        if (mounted) setLoadingCategory(false)
      }
    }
    loadCategory()
    return () => { mounted = false }
  }, [id, isEdit, navigate, reset])

  async function onSubmit(data) {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      image_url: data.image,
      is_active: Boolean(data.is_active),
    }

    try {
      if (isEdit) {
        await updateAdminCategory(id, payload)
        toast.success('Category updated in Supabase!')
      } else {
        await createAdminCategory(payload)
        toast.success('Category created in Supabase!')
      }
      if (typeof reloadCategories === 'function') {
        await reloadCategories()
      }
      navigate('/admin/categories')
    } catch (err) {
      console.error('Save category failed:', err)
      const message = err?.response?.data?.error || err.message || 'Failed to save category.'
      toast.error(message)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white'
  const labelCls = 'block text-xs font-semibold text-[#0A0A0A] mb-1 uppercase tracking-wider'

  if (loadingCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B6B88]">Loading category…</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/categories" className="text-[#6B6B88] hover:text-[#0A0A0A] transition-colors no-underline">
          <RiArrowLeftLine size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h1>
          <p className="text-xs text-[#6B6B88] mt-0.5">
            {isEdit ? `Editing category ID: ${id}` : 'Persisted directly to Supabase via Express API'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-sm p-6 space-y-5" style={{ border: '1px solid #ede9e0' }}>
          <div>
            <label className={labelCls}>Name *</label>
            <input {...register('name', { required: 'Name is required' })} className={inputCls} placeholder="e.g. Designer Fragrances" />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input {...register('slug', { required: 'Slug is required' })} className={inputCls} placeholder="designer-fragrances" />
            {errors.slug && <p className="text-xs text-red-500 mt-0.5">{errors.slug.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea {...register('description')} rows={3} className={`${inputCls} resize-none`} placeholder="Short description…" />
          </div>
          <div>
            <AdminImageUpload
              label="Category Image"
              value={watch('image')}
              onChange={(val) => setValue('image', val, { shouldDirty: true })}
              placeholderUrl="/images/category.jpg"
              helperText="Upload JPG, PNG, WEBP from your folder or paste a URL"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-[#D4AF37]" />
            <span className="text-sm font-medium text-[#0A0A0A]">Active</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <Link to="/admin/categories" className="px-5 py-2.5 text-xs font-semibold border border-gray-300 rounded-sm hover:bg-[#F5F3EE] transition-colors no-underline text-[#0A0A0A]">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold rounded-sm uppercase tracking-widest disabled:opacity-50"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            {isSubmitting ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  )
}
