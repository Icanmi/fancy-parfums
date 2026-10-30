import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { RiArrowLeftLine } from 'react-icons/ri'
import {
  getAdminBrandById,
  createAdminBrand,
  updateAdminBrand,
} from '../../services/adminProductService'
import { useAdminData } from '../../context/AdminDataContext'
import AdminImageUpload from '../../components/admin/AdminImageUpload'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminBrandFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { reloadBrands } = useAdminData() || {}
  const [loadingBrand, setLoadingBrand] = useState(isEdit)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      origin: '',
      logoUrl: '',
      logoText: '',
      featured: true,
    },
  })

  const nameValue = watch('name')

  // Auto-slugify on create
  useEffect(() => {
    if (!isEdit) {
      setValue('slug', slugify(nameValue || ''))
      setValue('logoText', (nameValue || '').toUpperCase().substring(0, 8))
    }
  }, [nameValue, isEdit, setValue])

  // Load brand details if editing
  useEffect(() => {
    if (!isEdit) return
    let mounted = true
    async function loadBrand() {
      setLoadingBrand(true)
      try {
        const brand = await getAdminBrandById(id)
        if (!brand) {
          toast.error('Brand not found.')
          navigate('/admin/brands')
          return
        }
        if (mounted) {
          reset({
            name: brand.name || '',
            slug: brand.slug || '',
            description: brand.description || '',
            origin: brand.origin || '',
            logoUrl: brand.logo_url || '',
            logoText: (brand.name || '').toUpperCase().substring(0, 8),
            featured: brand.is_active !== false,
          })
        }
      } catch (err) {
        console.error('Failed to load brand:', err)
        toast.error('Failed to load brand.')
        navigate('/admin/brands')
      } finally {
        if (mounted) setLoadingBrand(false)
      }
    }
    loadBrand()
    return () => { mounted = false }
  }, [id, isEdit, navigate, reset])

  async function onSubmit(data) {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      origin: data.origin,
      logo_url: data.logoUrl,
      is_active: Boolean(data.featured),
    }

    try {
      if (isEdit) {
        await updateAdminBrand(id, payload)
        toast.success('Brand updated successfully!')
      } else {
        await createAdminBrand(payload)
        toast.success('Brand created successfully!')
      }
      if (typeof reloadBrands === 'function') {
        await reloadBrands()
      }
      navigate('/admin/brands')
    } catch (err) {
      console.error('Save brand failed:', err)
      const message = err?.response?.data?.error || err.message || 'Failed to save brand.'
      toast.error(message)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white'
  const labelCls = 'block text-xs font-semibold text-[#0A0A0A] mb-1 uppercase tracking-wider'

  if (loadingBrand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B6B88]">Loading brand…</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/brands" className="text-[#6B6B88] hover:text-[#0A0A0A] transition-colors no-underline">
          <RiArrowLeftLine size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>
            {isEdit ? 'Edit Brand' : 'Add Brand'}
          </h1>
          <p className="text-xs text-[#6B6B88] mt-0.5">
            {isEdit ? `Editing brand ID: ${id}` : 'Saved to Neon database via Express API'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-sm p-6 space-y-5" style={{ border: '1px solid #ede9e0' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Brand Name *</label>
              <input {...register('name', { required: 'Name is required' })} className={inputCls} placeholder="e.g. Christian Dior" />
              {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input {...register('slug', { required: 'Slug is required' })} className={inputCls} placeholder="christian-dior" />
              {errors.slug && <p className="text-xs text-red-500 mt-0.5">{errors.slug.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Origin</label>
              <input {...register('origin')} className={inputCls} placeholder="e.g. Paris, France" />
            </div>
            <div>
              <label className={labelCls}>Logo Text (display)</label>
              <input {...register('logoText')} className={inputCls} placeholder="DIOR" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea {...register('description')} rows={3} className={`${inputCls} resize-none`} placeholder="Brand story…" />
          </div>
          <div>
            <AdminImageUpload
              label="Brand Logo"
              value={watch('logoUrl')}
              onChange={(val) => setValue('logoUrl', val, { shouldDirty: true })}
              placeholderUrl="/images/brand-logo.jpg"
              helperText="Upload JPG, PNG, WEBP, or SVG logo"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-[#D4AF37]" />
            <span className="text-sm font-medium text-[#0A0A0A]">Active Brand (visible in store)</span>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <Link to="/admin/brands" className="px-5 py-2.5 text-xs font-semibold border border-gray-300 rounded-sm hover:bg-[#F5F3EE] transition-colors no-underline text-[#0A0A0A]">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold rounded-sm uppercase tracking-widest disabled:opacity-50"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            {isSubmitting ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Brand')}
          </button>
        </div>
      </form>
    </div>
  )
}
