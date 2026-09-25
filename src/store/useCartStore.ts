import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, weight: string) => void;
  updateQuantity: (id: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id && i.weight === item.weight);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.weight === item.weight ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
        });
      },
      removeItem: (id, weight) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.weight === weight)),
        }));
      },
      updateQuantity: (id, weight, quantity) => {
        set((state) => {
          if (quantity === 0) {
            return {
              items: state.items.filter((i) => !(i.id === id && i.weight === weight)),
            };
          }
          return {
            items: state.items.map((i) => (i.id === id && i.weight === weight ? { ...i, quantity } : i)),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'gaon-pure-cart',
    }
  )
);
