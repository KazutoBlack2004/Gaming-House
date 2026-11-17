'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import {
  Plus,
  Minus,
  Edit,
  Trash2,
  Layers,
  Image as ImageIcon,
  Search,
  Star,
  X,
  ChevronDown,
  Check,
  Percent,
} from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { SITE_CONFIG, formatPrice } from '@/lib/constants';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { WebPImageUploader } from '@/components/admin/WebPImageUploader';

const FIELD_LABEL_CLASS =
  'block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5';
const FIELD_INPUT_CLASS =
  'w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all';

const DISCOUNT_PRESETS = [10, 15, 20, 30, 40, 50];

export default function AdminProductsPage() {
  const {
    products,
    categories,
    upsertProduct,
    deleteProduct,
    adjustStock,
    applyProductDiscount,
  } = useAdminStore();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'low-stock'>('all');

  const [selectedProduct, setSelectedProduct] = useState<Partial<Product>>({
    title: '',
    slug: '',
    sku: '',
    category_id: '',
    price: 0,
    compare_at_price: undefined,
    stock: 0,
    description: '',
    featured: false,
    active: true,
    has_variants: false,
    variants: [],
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !(p.sku && p.sku.toLowerCase().includes(q)) &&
        !p.slug.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        categoryFilter !== 'all' &&
        p.category_id !== categoryFilter &&
        p.category?.id !== categoryFilter
      ) {
        return false;
      }
      if (statusFilter === 'active' && !p.active) return false;
      if (statusFilter === 'draft' && p.active) return false;
      if (statusFilter === 'low-stock' && p.stock > 10) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const handleOpenCreate = () => {
    setSelectedProduct({
      title: '',
      slug: '',
      sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
      category_id: categories[0]?.id || '',
      price: 0,
      compare_at_price: undefined,
      stock: 10,
      description: '',
      featured: false,
      active: true,
      has_variants: false,
      variants: [],
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    });
    setNewImageUrl('');
    setFormError(null);
    onOpen();
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct({
      ...product,
      category_id: product.category_id || product.category?.id || categories[0]?.id || '',
    });
    setNewImageUrl('');
    setFormError(null);
    onOpen();
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const currentImgs = selectedProduct.images || [];
    setSelectedProduct({
      ...selectedProduct,
      images: [...currentImgs, newImageUrl.trim()],
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const currentImgs = selectedProduct.images || [];
    setSelectedProduct({
      ...selectedProduct,
      images: currentImgs.filter((_, idx) => idx !== index),
    });
  };

  const handleAddVariant = () => {
    const currentVariants = selectedProduct.variants || [];
    setSelectedProduct({
      ...selectedProduct,
      variants: [
        ...currentVariants,
        {
          id: 'v-' + Date.now(),
          title: 'Opción ' + (currentVariants.length + 1),
          stock: 5,
          attributes: {},
        },
      ],
    });
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...(selectedProduct.variants || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProduct({ ...selectedProduct, variants: updated });
  };

  const handleRemoveVariant = (index: number) => {
    const updated = (selectedProduct.variants || []).filter((_, idx) => idx !== index);
    setSelectedProduct({ ...selectedProduct, variants: updated });
  };

  const handleSaveProduct = () => {
    setFormError(null);

    if (!selectedProduct.title?.trim() || !selectedProduct.slug?.trim()) {
      setFormError('Por favor completa el título y el slug del producto.');
      return;
    }

    const productToSave: Product = {
      id: selectedProduct.id || 'p-' + Date.now(),
      category_id: selectedProduct.category_id || categories[0]?.id,
      title: selectedProduct.title.trim(),
      slug: selectedProduct.slug.trim(),
      sku: selectedProduct.sku?.trim() || undefined,
      description: selectedProduct.description || '',
      price: Number(selectedProduct.price) || 0,
      compare_at_price: selectedProduct.compare_at_price
        ? Number(selectedProduct.compare_at_price)
        : undefined,
      stock: Number(selectedProduct.stock) || 0,
      images:
        selectedProduct.images && selectedProduct.images.length > 0
          ? selectedProduct.images
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
      featured: Boolean(selectedProduct.featured),
      active: selectedProduct.active ?? true,
      has_variants: Boolean(selectedProduct.has_variants),
      variants: selectedProduct.variants || [],
      created_at: selectedProduct.created_at || new Date().toISOString(),
    };

    upsertProduct(productToSave);
    onClose();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del catálogo?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Productos e Inventario
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administra precios, ofertas, fotos de galería, variantes y existencias en tiempo real.
          </p>
        </div>

        <Button
          onPress={handleOpenCreate}
          startContent={<Plus className="w-4 h-4" />}
          className="bg-slate-900 text-white font-bold shadow-xs text-xs px-4 rounded-xl"
        >
          Nuevo Producto
        </Button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-1 max-w-md bg-slate-50 border border-slate-200 focus-within:border-slate-900 focus-within:bg-white rounded-xl px-3.5 h-10 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none h-10 pl-3.5 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Activos' },
              { id: 'low-stock', label: 'Bajo Stock' },
              { id: 'draft', label: 'Borradores' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <Table
          aria-label="Tabla de gestión de productos"
          shadow="none"
          classNames={{
            wrapper: 'bg-white p-0 shadow-none',
            th: 'bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 border-b border-slate-100',
            td: 'py-4 border-b border-slate-50',
          }}
        >
          <TableHeader>
            <TableColumn>PRODUCTO</TableColumn>
            <TableColumn>CATEGORÍA</TableColumn>
            <TableColumn>PRECIO / OFERTA</TableColumn>
            <TableColumn>CONTROL DE STOCK</TableColumn>
            <TableColumn>VARIANTES</TableColumn>
            <TableColumn>ESTADO</TableColumn>
            <TableColumn align="end">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No se encontraron productos con los filtros seleccionados.">
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-slate-50/60 transition">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/150'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-slate-900 text-sm">{product.title}</h5>
                        {product.featured && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {product.sku ? `${product.sku} • ` : ''}/{product.slug}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {product.category?.name ||
                      categories.find((c) => c.id === product.category_id)?.name ||
                      'Sin categoría'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>

                    {/* Selector Rápido de Descuento de Temporada en Tabla */}
                    <div className="flex items-center gap-1">
                      {[15, 30, 50].map((pct) => {
                        const currentDiscount =
                          product.compare_at_price && product.compare_at_price > product.price
                            ? Math.round(
                                ((product.compare_at_price - product.price) /
                                  product.compare_at_price) *
                                  100
                              )
                            : 0;
                        const isActivePct = currentDiscount === pct;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() =>
                              applyProductDiscount(product.id, isActivePct ? null : pct)
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition-colors ${
                              isActivePct
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title={`Aplicar ${pct}% de descuento`}
                          >
                            -{pct}%
                          </button>
                        );
                      })}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <button
                          type="button"
                          onClick={() => applyProductDiscount(product.id, null)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:text-slate-700"
                          title="Quitar oferta"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustStock(product.id, -1)}
                      className="w-6 h-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600"
                      title="Restar 1 unidad"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      className={`font-black text-xs min-w-12 text-center ${
                        product.stock === 0
                          ? 'text-rose-600'
                          : product.stock <= 10
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {product.stock} un.
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStock(product.id, 1)}
                      className="w-6 h-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600"
                      title="Sumar 1 unidad"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  {product.has_variants && product.variants && product.variants.length > 0 ? (
                    <Chip
                      size="sm"
                      variant="flat"
                      startContent={<Layers className="w-3 h-3" />}
                      className="font-semibold text-xs bg-slate-100 text-slate-700"
                    >
                      {product.variants.length} opciones
                    </Chip>
                  ) : (
                    <span className="text-xs text-slate-400">Estándar</span>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    color={product.active ? 'success' : 'default'}
                    variant="flat"
                    size="sm"
                    className="font-bold text-xs"
                  >
                    {product.active ? 'Activo' : 'Borrador'}
                  </Chip>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                      onPress={() => handleOpenEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      onPress={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Estandarizado para Crear / Editar Producto */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent className="bg-white text-slate-900 border border-slate-200/80 shadow-2xl rounded-2xl">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 border-b border-slate-100 px-6 py-4">
                <span className="font-extrabold text-base text-slate-900">
                  {selectedProduct.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  Completa la información general, precios, inventario e imágenes del artículo.
                </span>
              </ModalHeader>

              <ModalBody className="p-6 space-y-5">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* Fila 1: Título y SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={FIELD_LABEL_CLASS}>
                      Título del Producto <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Producto de Ejemplo"
                      value={selectedProduct.title || ''}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          title: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, ''),
                        })
                      }
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={FIELD_LABEL_CLASS}>Código SKU</label>
                    <input
                      type="text"
                      placeholder="SKU-001"
                      value={selectedProduct.sku || ''}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, sku: e.target.value })
                      }
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Fila 2: Slug y Categoría (100% Alineados) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={FIELD_LABEL_CLASS}>
                      Slug Único (URL) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="producto-de-ejemplo"
                      value={selectedProduct.slug || ''}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, slug: e.target.value })
                      }
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={FIELD_LABEL_CLASS}>Categoría</label>
                    <div className="relative">
                      <select
                        value={selectedProduct.category_id || ''}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, category_id: e.target.value })
                        }
                        className={`${FIELD_INPUT_CLASS} appearance-none pr-9 cursor-pointer`}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Fila 3: Precio Venta, Precio Anterior y Stock (100% Alineados) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={FIELD_LABEL_CLASS}>
                      Precio Venta ({SITE_CONFIG.currencySymbol}){' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={selectedProduct.price ?? ''}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          price: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0,
                        })
                      }
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={FIELD_LABEL_CLASS}>
                      Precio Anterior ({SITE_CONFIG.currencySymbol})
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Opcional (Oferta)"
                      value={selectedProduct.compare_at_price ?? ''}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9.]/g, '');
                        setSelectedProduct({
                          ...selectedProduct,
                          compare_at_price: clean ? parseFloat(clean) : undefined,
                        });
                      }}
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={FIELD_LABEL_CLASS}>
                      Stock Disponible <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={selectedProduct.stock ?? 0}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          stock: parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0,
                        })
                      }
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Bloque de Descuento Rápido de Temporada dentro del Modal */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-rose-500" />
                      Aplicar Descuento de Temporada / Liquidación
                    </span>
                    {selectedProduct.compare_at_price &&
                      selectedProduct.compare_at_price > (selectedProduct.price || 0) && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProduct({
                              ...selectedProduct,
                              price: selectedProduct.compare_at_price,
                              compare_at_price: undefined,
                            })
                          }
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Restaurar precio normal
                        </button>
                      )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {DISCOUNT_PRESETS.map((pct) => {
                      const basePrice =
                        selectedProduct.compare_at_price &&
                        selectedProduct.compare_at_price > (selectedProduct.price || 0)
                          ? selectedProduct.compare_at_price
                          : selectedProduct.price || 0;
                      const currentPct =
                        selectedProduct.compare_at_price &&
                        selectedProduct.compare_at_price > (selectedProduct.price || 0)
                          ? Math.round(
                              ((selectedProduct.compare_at_price - (selectedProduct.price || 0)) /
                                selectedProduct.compare_at_price) *
                                100
                            )
                          : 0;
                      const isSelected = currentPct === pct;

                      return (
                        <button
                          key={pct}
                          type="button"
                          disabled={basePrice <= 0}
                          onClick={() => {
                            if (basePrice <= 0) return;
                            const discounted = Math.round(basePrice * (1 - pct / 100));
                            setSelectedProduct({
                              ...selectedProduct,
                              compare_at_price: basePrice,
                              price: discounted,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all disabled:opacity-40 ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          -{pct}% OFF
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fila 4: Descripción (Sin bordes internos dobles) */}
                <div>
                  <label className={FIELD_LABEL_CLASS}>
                    Descripción del Producto <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe las características principales y detalles del artículo..."
                    value={selectedProduct.description || ''}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, description: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
                  />
                </div>

                {/* Fila 5: Galería de Imágenes con Conversión Automática a .webp */}
                <WebPImageUploader
                  images={selectedProduct.images || []}
                  onChange={(imgs) => setSelectedProduct({ ...selectedProduct, images: imgs })}
                  multiple={true}
                  folder="products"
                  label="Galería de Imágenes del Producto"
                />

                {/* Fila 6: Opciones de Visibilidad y Destacado (Tarjetas seleccionables limpias) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProduct({
                        ...selectedProduct,
                        active: !(selectedProduct.active ?? true),
                      })
                    }
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Producto Activo
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Visible en el catálogo público
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        selectedProduct.active ?? true
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-300'
                      }`}
                    >
                      {(selectedProduct.active ?? true) && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProduct({
                        ...selectedProduct,
                        featured: !selectedProduct.featured,
                      })
                    }
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Destacar en Inicio
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Aparece en productos principales
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        selectedProduct.featured
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-300'
                      }`}
                    >
                      {selectedProduct.featured && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                </div>

                {/* Fila 7: Variantes del Producto */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        Variantes u Opciones del Producto
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Habilita distintas versiones u opciones para este artículo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProduct({
                          ...selectedProduct,
                          has_variants: !selectedProduct.has_variants,
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedProduct.has_variants
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {selectedProduct.has_variants ? 'Habilitado' : 'Habilitar'}
                    </button>
                  </div>

                  {selectedProduct.has_variants && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-200/70">
                      {(selectedProduct.variants || []).map((variant, index) => (
                        <div key={variant.id || index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nombre de la opción (ej: Versión Estándar)"
                            value={variant.title}
                            onChange={(e) => handleUpdateVariant(index, 'title', e.target.value)}
                            className="flex-1 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-slate-900"
                          />
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Stock"
                            value={variant.stock}
                            onChange={(e) =>
                              handleUpdateVariant(
                                index,
                                'stock',
                                parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                              )
                            }
                            className="w-24 h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <Button
                        size="sm"
                        variant="flat"
                        onPress={handleAddVariant}
                        startContent={<Plus className="w-3.5 h-3.5" />}
                        className="font-bold text-xs bg-white border border-slate-200 text-slate-800 rounded-xl"
                      >
                        Añadir Opción
                      </Button>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-slate-100 px-6 py-4">
                <Button variant="light" onPress={onCloseModal} className="font-bold text-xs">
                  Cancelar
                </Button>
                <Button
                  onPress={handleSaveProduct}
                  className="bg-slate-900 text-white font-bold text-xs px-6 rounded-xl"
                >
                  Guardar Producto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
