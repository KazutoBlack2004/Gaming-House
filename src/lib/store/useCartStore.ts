import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem, ProductVariant } from '@/lib/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity = 1, variant?: ProductVariant | null) => {
        const currentItems = get().items;
        const selectedVariant =
          variant ||
          (product.has_variants && product.variants && product.variants.length > 0
            ? product.variants[0]
            : undefined);

        const cartItemId = selectedVariant
          ? `${product.id}__${selectedVariant.id}`
          : product.id;

        const maxAvailableStock = selectedVariant ? selectedVariant.stock : product.stock;

        const existingItemIndex = currentItems.findIndex(
          (item) => (item.cartItemId || item.product.id) === cartItemId
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingItemIndex].quantity + quantity;
          updatedItems[existingItemIndex].quantity = Math.min(newQty, maxAvailableStock);
          set({ items: updatedItems, isOpen: true });
        } else {
          set({
            items: [
              ...currentItems,
              {
                cartItemId,
                product,
                quantity: Math.min(quantity, maxAvailableStock),
                variantId: selectedVariant?.id,
                variantTitle: selectedVariant?.title,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (cartItemId: string) => {
        set({
          items: get().items.filter(
            (item) => (item.cartItemId || item.product.id) !== cartItemId
          ),
        });
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        const currentItems = get().items;
        const updatedItems = currentItems.map((item) => {
          const id = item.cartItemId || item.product.id;
          if (id === cartItemId) {
            const matchedVariant = item.product.variants?.find(
              (v) => v.id === item.variantId
            );
            const maxStock = matchedVariant ? matchedVariant.stock : item.product.stock;
            return {
              ...item,
              quantity: Math.min(quantity, maxStock),
            };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setIsOpen: (isOpen: boolean) => set({ isOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'ecommerce-template-cart-clp',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
