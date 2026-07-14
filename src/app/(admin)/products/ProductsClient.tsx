'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Tag,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  EyeOff,
  Eye,
  Check,
  FolderPlus,
  ShoppingBag
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  position: number
  is_active: boolean
}

interface Product {
  id: string
  category_id: string | null
  title: string
  description: string | null
  price: number
  images: string[]
  is_available: boolean
  position: number
}

interface ProductsClientProps {
  store: {
    id: string
    name: string
  }
  initialCategories: Category[]
  initialProducts: Product[]
}

export default function ProductsClient({ store, initialCategories, initialProducts }: ProductsClientProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Estados Categorías
  const [newCatName, setNewCatName] = useState('')
  const [loadingCat, setLoadingCat] = useState(false)

  // Estados Producto (Modal Crear/Editar)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) // null significa Crear Nuevo
  
  // Campos del Formulario de Producto
  const [prodTitle, setProdTitle] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCatId, setProdCatId] = useState('')
  const [prodImageUrl, setProdImageUrl] = useState('')
  const [prodAvailable, setProdAvailable] = useState(true)
  const [loadingProd, setLoadingProd] = useState(false)

  const supabase = createClient()

  // ----------------------------------------------------
  // GESTIÓN DE CATEGORÍAS
  // ----------------------------------------------------
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    setLoadingCat(true)
    const slug = newCatName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // La nueva posición será el máximo actual + 1
    const maxPosition = categories.reduce((max, cat) => cat.position > max ? cat.position : max, 0)

    const { data, error } = await supabase
      .from('categories')
      .insert({
        store_id: store.id,
        name: newCatName.trim(),
        slug,
        position: maxPosition + 1,
        is_active: true
      })
      .select()
      .single()

    if (!error && data) {
      setCategories((prev) => [...prev, data])
      setNewCatName('')
    }
    setLoadingCat(false)
  }

  const handleToggleCategoryActive = async (catId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', catId)

    if (!error) {
      setCategories((prev) => prev.map((cat) => cat.id === catId ? { ...cat, is_active: !currentStatus } : cat))
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', catId)

    if (!error) {
      setCategories((prev) => prev.filter((cat) => cat.id !== catId))
    }
  }

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const currentCat = categories[index]
    const swapCat = categories[targetIndex]

    // Intercambiar posiciones en la base de datos
    const { error: err1 } = await supabase
      .from('categories')
      .update({ position: swapCat.position })
      .eq('id', currentCat.id)

    const { error: err2 } = await supabase
      .from('categories')
      .update({ position: currentCat.position })
      .eq('id', swapCat.id)

    if (!err1 && !err2) {
      setCategories((prev) => {
        const copy = [...prev]
        const tempPos = currentCat.position
        currentCat.position = swapCat.position
        swapCat.position = tempPos
        copy[index] = swapCat
        copy[targetIndex] = currentCat
        return copy
      })
    }
  }

  // ----------------------------------------------------
  // GESTIÓN DE PRODUCTOS
  // ----------------------------------------------------
  const handleOpenProductModal = (product: Product | null) => {
    setSelectedProduct(product)
    if (product) {
      setProdTitle(product.title)
      setProdDesc(product.description || '')
      setProdPrice(product.price.toString())
      setProdCatId(product.category_id || '')
      setProdImageUrl(product.images[0] || '')
      setProdAvailable(product.is_available)
    } else {
      setProdTitle('')
      setProdDesc('')
      setProdPrice('')
      setProdCatId(categories[0]?.id || '')
      setProdImageUrl('')
      setProdAvailable(true)
    }
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodTitle.trim() || !prodPrice) return

    setLoadingProd(true)
    const imagesArray = prodImageUrl.trim() ? [prodImageUrl.trim()] : []

    if (selectedProduct) {
      // Modificar Producto
      const { data, error } = await supabase
        .from('products')
        .update({
          title: prodTitle.trim(),
          description: prodDesc.trim() || null,
          price: parseFloat(prodPrice),
          category_id: prodCatId || null,
          images: imagesArray,
          is_available: prodAvailable,
        })
        .eq('id', selectedProduct.id)
        .select()
        .single()

      if (!error && data) {
        setProducts((prev) => prev.map((p) => p.id === selectedProduct.id ? data : p))
        setIsProductModalOpen(false)
      }
    } else {
      // Crear Nuevo Producto
      const maxPosition = products.reduce((max, prod) => prod.position > max ? prod.position : max, 0)
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          store_id: store.id,
          title: prodTitle.trim(),
          description: prodDesc.trim() || null,
          price: parseFloat(prodPrice),
          category_id: prodCatId || null,
          images: imagesArray,
          is_available: prodAvailable,
          position: maxPosition + 1,
        })
        .select()
        .single()

      if (!error && data) {
        setProducts((prev) => [...prev, data])
        setIsProductModalOpen(false)
      }
    }
    setLoadingProd(false)
  }

  const handleToggleProductAvailable = async (prodId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', prodId)

    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === prodId ? { ...p, is_available: !currentStatus } : p))
    }
  }

  const handleDeleteProduct = async (prodId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', prodId)

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== prodId))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Catálogo e Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">Crea y ordena tus categorías y productos del catálogo digital.</p>
        </div>
        
        {/* Selector de Pestaña */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'products' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeTab === 'categories' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Categorías
          </button>
        </div>
      </div>

      {/* PESTAÑA: PRODUCTOS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Todos los productos</h3>
            <Button
              onClick={() => handleOpenProductModal(null)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </Button>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
            {products.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <div className="font-bold text-sm text-slate-700">No hay productos creados</div>
                <p className="text-xs text-slate-500 mt-1">Haz clic en "Nuevo Producto" para añadir el primero.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Imagen</th>
                      <th className="px-6 py-4">Nombre del Producto</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4 text-right">Precio</th>
                      <th className="px-6 py-4 text-center">Disponible</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'Sin categoría'
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-10 h-10 rounded-md object-cover border border-slate-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3 font-bold text-slate-900">{product.title}</td>
                          <td className="px-6 py-3 text-xs font-medium text-slate-500">{categoryName}</td>
                          <td className="px-6 py-3 font-bold text-slate-900 text-right">{formatCurrency(product.price)}</td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => handleToggleProductAvailable(product.id, product.is_available)}
                              className={`p-1.5 rounded-full transition-colors ${
                                product.is_available 
                                  ? 'text-emerald-600 hover:bg-emerald-50' 
                                  : 'text-slate-400 hover:bg-slate-50'
                              }`}
                              title={product.is_available ? 'Disponible' : 'No disponible'}
                            >
                              {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-6 py-3 text-center flex justify-center items-center gap-2">
                            <Button
                              onClick={() => handleOpenProductModal(product)}
                              variant="ghost"
                              className="h-8 px-2 text-slate-600 hover:bg-slate-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              variant="ghost"
                              className="h-8 px-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: CATEGORÍAS */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creador de Categorías */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 h-fit space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Nueva Categoría</h3>
              <p className="text-xs text-slate-500">Añade secciones para estructurar el catálogo.</p>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre de Categoría
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej. Hamburguesas, Bebidas"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loadingCat}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{loadingCat ? 'Guardando...' : 'Crear Categoría'}</span>
              </Button>
            </form>
          </div>

          {/* Listado y Reordenamiento */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Posiciones y Roles</h3>
              <p className="text-xs text-slate-500">Usa las flechas para reordenar la aparición visual en la tienda móvil.</p>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-100 rounded-lg">
                <Tag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <div className="font-bold text-sm text-slate-700">No hay categorías</div>
                <p className="text-xs text-slate-500 mt-1">Usa el panel de la izquierda para registrar la primera.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map((cat, index) => {
                  const itemsCount = products.filter((p) => p.category_id === cat.id).length
                  return (
                    <div key={cat.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950">{cat.name}</span>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                            {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">Slug: /{cat.slug}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botones de posición */}
                        <div className="flex items-center border border-slate-200 rounded-md">
                          <button
                            onClick={() => handleMoveCategory(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="border-l border-slate-200 h-6" />
                          <button
                            onClick={() => handleMoveCategory(index, 'down')}
                            disabled={index === categories.length - 1}
                            className="p-1.5 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Visibilidad */}
                        <button
                          onClick={() => handleToggleCategoryActive(cat.id, cat.is_active)}
                          className={`p-1.5 rounded-md border ${
                            cat.is_active 
                              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                              : 'text-slate-400 bg-slate-50 border-slate-200'
                          }`}
                          title={cat.is_active ? 'Visible' : 'Oculto'}
                        >
                          {cat.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Borrar */}
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md"
                          title="Eliminar Categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal / Dialog de Producto (Crear / Editar) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-900 text-base">
                {selectedProduct ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Ej. Pizza Muzzarella, Coca-Cola 1.5L"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Ej. Deliciosa pizza con salsa de tomate natural y queso fundido."
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="9.90"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Sin Categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="url"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod_avail"
                  checked={prodAvailable}
                  onChange={(e) => setProdAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="prod_avail" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Producto disponible para la venta inmediata
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 text-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loadingProd}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{loadingProd ? 'Guardando...' : 'Guardar Producto'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
