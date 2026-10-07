import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartStall, setCartStall] = useState(() => {
    const saved = localStorage.getItem('campusbite_cart_stall');
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('campusbite_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal conflict state when adding from another stall
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingItemToAdd, setPendingItemToAdd] = useState(null);

  useEffect(() => {
    if (cartStall) {
      localStorage.setItem('campusbite_cart_stall', JSON.stringify(cartStall));
    } else {
      localStorage.removeItem('campusbite_cart_stall');
    }
  }, [cartStall]);

  useEffect(() => {
    localStorage.setItem('campusbite_cart_items', JSON.stringify(items));
  }, [items]);

  // Requirement 11: One-stall Cart Enforcement
  const addToCart = (food, stall) => {
    // If cart has items and they belong to another stall
    if (cartStall && cartStall.id !== stall.id && items.length > 0) {
      setPendingItemToAdd({ food, stall });
      setConflictModalOpen(true);
      return;
    }

    // Set active stall
    if (!cartStall || items.length === 0) {
      setCartStall({
        id: stall.id,
        name: stall.name,
        location: stall.location
      });
    }

    // Add or increment item
    setItems(prevItems => {
      const existing = prevItems.find(i => i.food.id === food.id);
      if (existing) {
        return prevItems.map(i =>
          i.food.id === food.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { food, quantity: 1 }];
    });
  };

  // Resolve conflict: Clear Cart & Add Item
  const confirmClearAndAdd = () => {
    if (!pendingItemToAdd) return;
    const { food, stall } = pendingItemToAdd;
    setCartStall({
      id: stall.id,
      name: stall.name,
      location: stall.location
    });
    setItems([{ food, quantity: 1 }]);
    setPendingItemToAdd(null);
    setConflictModalOpen(false);
  };

  // Resolve conflict: Cancel
  const cancelConflict = () => {
    setPendingItemToAdd(null);
    setConflictModalOpen(false);
  };

  const updateQuantity = (foodId, delta) => {
    setItems(prevItems => {
      const updated = prevItems
        .map(i => {
          if (i.food.id === foodId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);

      if (updated.length === 0) {
        setCartStall(null);
      }
      return updated;
    });
  };

  const removeItem = (foodId) => {
    setItems(prevItems => {
      const updated = prevItems.filter(i => i.food.id !== foodId);
      if (updated.length === 0) {
        setCartStall(null);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCartStall(null);
  };

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + (i.food.price * i.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartStall,
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        totalAmount,
        isDrawerOpen,
        setIsDrawerOpen,
        conflictModalOpen,
        pendingItemToAdd,
        confirmClearAndAdd,
        cancelConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
