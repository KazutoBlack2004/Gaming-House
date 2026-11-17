'use client';

import React, { useState } from 'react';
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
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon, Check } from 'lucide-react';
import { Category } from '@/lib/types';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { WebPImageUploader } from '@/components/admin/WebPImageUploader';

const FIELD_LABEL_CLASS =
  'block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5';
const FIELD_INPUT_CLASS =
  'w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all';

export default function AdminCategoriesPage() {
  const { categories, products, upsertCategory, deleteCategory } = useAdminStore();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [selectedCategory, setSelectedCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedCategory({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      active: true,
    });
    setFormError(null);
    onOpen();
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setFormError(null);
    onOpen();
  };

  const handleSaveCategory = () => {
    setFormError(null);
    if (!selectedCategory.name?.trim() || !selectedCategory.slug?.trim()) {
      setFormError('El nombre y el slug de la categoría son obligatorios.');
      return;
    }

    const categoryToSave: Category = {
      id: selectedCategory.id || 'cat-' + Date.now(),
      name: selectedCategory.name.trim(),
      slug: selectedCategory.slug.trim(),
      description: selectedCategory.description || '',
      image_url: selectedCategory.image_url || '',
      active: selectedCategory.active ?? true,
      created_at: selectedCategory.created_at || new Date().toISOString(),
    };

    upsertCategory(categoryToSave);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Deseas eliminar esta categoría del catálogo?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-slate-900" />
            Gestión de Categorías
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organiza las familias de productos que aparecen en el inicio y en los filtros del catálogo.
          </p>
        </div>

        <Button
          onPress={handleOpenCreate}
          startContent={<Plus className="w-4 h-4" />}
          className="bg-slate-900 text-white font-bold shadow-xs text-xs px-4 rounded-xl"
        >
          Nueva Categoría
        </Button>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <Table
          aria-label="Tabla de categorías"
          shadow="none"
          classNames={{
            wrapper: 'bg-white p-0 shadow-none',
            th: 'bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 border-b border-slate-100',
            td: 'py-4 border-b border-slate-50',
          }}
        >
          <TableHeader>
            <TableColumn>CATEGORÍA</TableColumn>
            <TableColumn>SLUG / URL</TableColumn>
            <TableColumn>PRODUCTOS ASOCIADOS</TableColumn>
            <TableColumn>ESTADO</TableColumn>
            <TableColumn align="end">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay categorías registradas.">
            {categories.map((cat) => {
              const productCount = products.filter(
                (p) => p.category_id === cat.id || p.category?.slug === cat.slug
              ).length;

              return (
                <TableRow key={cat.id} className="hover:bg-slate-50/60 transition">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            Sin foto
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{cat.name}</h5>
                        {cat.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      /{cat.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-800">
                      {productCount} {productCount === 1 ? 'producto' : 'productos'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={cat.active ? 'success' : 'default'}
                      variant="flat"
                      size="sm"
                      className="font-bold text-xs"
                    >
                      {cat.active ? 'Activa' : 'Oculta'}
                    </Chip>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                        onPress={() => handleOpenEdit(cat)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        onPress={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal Estandarizado Crear / Editar Categoría */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent className="bg-white text-slate-900 border border-slate-200/80 shadow-2xl rounded-2xl">
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 border-b border-slate-100 px-6 py-4">
                <span className="font-extrabold text-base text-slate-900">
                  {selectedCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}
                </span>
                <span className="text-xs font-normal text-slate-400">
                  Define el nombre, identificador URL, descripción e imagen de la categoría.
                </span>
              </ModalHeader>

              <ModalBody className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={FIELD_LABEL_CLASS}>
                      Nombre de la Categoría <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Categoría Principal"
                      value={selectedCategory.name || ''}
                      onChange={(e) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          name: e.target.value,
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
                    <label className={FIELD_LABEL_CLASS}>
                      Slug (Identificador en URL) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="categoria-principal"
                      value={selectedCategory.slug || ''}
                      onChange={(e) =>
                        setSelectedCategory({ ...selectedCategory, slug: e.target.value })
                      }
                      className={FIELD_INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className={FIELD_LABEL_CLASS}>Descripción (Opcional)</label>
                  <textarea
                    rows={3}
                    placeholder="Breve descripción de los productos de esta categoría..."
                    value={selectedCategory.description || ''}
                    onChange={(e) =>
                      setSelectedCategory({ ...selectedCategory, description: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
                  />
                </div>

                <WebPImageUploader
                  images={selectedCategory.image_url ? [selectedCategory.image_url] : []}
                  onChange={(imgs) =>
                    setSelectedCategory({ ...selectedCategory, image_url: imgs[0] || '' })
                  }
                  multiple={false}
                  folder="categories"
                  label="Imagen de Portada de la Categoría"
                />

                {/* Estado Activo / Oculto */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory({
                      ...selectedCategory,
                      active: !(selectedCategory.active ?? true),
                    })
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                >
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Categoría activa y visible en la tienda
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Se mostrará en la página de inicio y en los filtros del catálogo
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      selectedCategory.active ?? true
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-300'
                    }`}
                  >
                    {(selectedCategory.active ?? true) && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </ModalBody>

              <ModalFooter className="border-t border-slate-100 px-6 py-4">
                <Button variant="light" onPress={onCloseModal} className="font-bold text-xs">
                  Cancelar
                </Button>
                <Button
                  onPress={handleSaveCategory}
                  className="bg-slate-900 text-white font-bold text-xs px-6 rounded-xl"
                >
                  Guardar Categoría
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
