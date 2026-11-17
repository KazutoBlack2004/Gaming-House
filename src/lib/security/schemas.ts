import { z } from 'zod';

// Esquema de Checkout (Sin registro de usuario)
export const CheckoutSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre es demasiado largo' }),
  email: z
    .string()
    .email({ message: 'Debe ingresar un correo electrónico válido' }),
  phone: z
    .string()
    .min(6, { message: 'Debe ingresar un número telefónico válido' }),
  street: z
    .string()
    .min(5, { message: 'La dirección debe ser detallada' }),
  city: z
    .string()
    .min(2, { message: 'Debe ingresar la ciudad' }),
  state: z
    .string()
    .min(2, { message: 'Debe ingresar la provincia o estado' }),
  zipCode: z
    .string()
    .min(3, { message: 'Debe ingresar el código postal' }),
  notes: z.string().optional(),
  paymentMethod: z.enum(['webpay', 'flow', 'mercadopago', 'stripe'], {
    errorMap: () => ({ message: 'Seleccione un método de pago válido' }),
  }),
});

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;

// Esquema de Login de Administrador
export const AdminLoginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Debe ingresar un correo electrónico administrativo válido' }),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
});

export type AdminLoginFormData = z.infer<typeof AdminLoginSchema>;

// Esquema de Producto (Creación y Edición Admin)
export const ProductFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug es obligatorio'),
  description: z.string().min(10, 'La descripción debe ser detallada'),
  category_id: z.string().uuid('Debe seleccionar una categoría válida').optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  compare_at_price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  sku: z.string().optional(),
  images: z.array(z.string().url('URL de imagen no válida')).min(1, 'Debe incluir al menos 1 imagen'),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof ProductFormSchema>;
