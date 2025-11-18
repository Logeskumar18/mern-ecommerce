import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user, token } = useContext(AuthContext);

  // Load from localStorage initially
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        setCartItems([]);
      }
    }
  }, []);

  // Sync with server when user logs in
  useEffect(() => {
    if (user && token && !syncing) {
      syncWithServer();
    }
  }, [user, token]);

  // Save to localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync local cart with server
  const syncWithServer = async () => {
    if (!user || !token || syncing) return;
    
    setSyncing(true);
    setLoading(true);
    
    try {
      // First, get server cart
      const getRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const getData = await getRes.json();
      
      if (getData.success) {
        const serverCartItems = getData.cart.items;
        
        // If user has local cart items, sync them with server
        if (cartItems.length > 0) {
          const syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ localCartItems: cartItems })
          });
          
          const syncData = await syncRes.json();
          if (syncData.success) {
            setCartItems(syncData.cart.items);
          }
        } else {
          // No local items, use server cart
          setCartItems(serverCartItems);
        }
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Add product with specific quantity
  const addToCart = async (product, quantity = 1, variations = []) => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.finalPrice || product.price,
      images: product.images,
      category: product.category,
      stock: product.stock,
      variations: variations,
      quantity: quantity
    };

    if (user && token) {
      // Add to server cart
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product._id,
            quantity,
            variations
          })
        });
        
        const data = await res.json();
        if (data.success) {
          setCartItems(data.cart.items);
        }
      } catch (error) {
        console.error("Error adding to server cart:", error);
        // Fall back to local cart
        addToLocalCart(cartItem);
      } finally {
        setLoading(false);
      }
    } else {
      // Add to local cart
      addToLocalCart(cartItem);
    }
  };

  const addToLocalCart = (cartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(item => 
        item._id === cartItem._id && 
        JSON.stringify(item.variations) === JSON.stringify(cartItem.variations)
      );
      
      if (existingIndex > -1) {
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + cartItem.quantity }
            : item
        );
      } else {
        return [...prev, cartItem];
      }
    });
  };

  // Remove product
  const removeFromCart = async (itemId) => {
    if (user && token) {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/item/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (data.success) {
          setCartItems(data.cart.items);
        }
      } catch (error) {
        console.error("Error removing from server cart:", error);
        removeFromLocalCart(itemId);
      } finally {
        setLoading(false);
      }
    } else {
      removeFromLocalCart(itemId);
    }
  };

  const removeFromLocalCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (user && token) {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/item/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        
        const data = await res.json();
        if (data.success) {
          setCartItems(data.cart.items);
        }
      } catch (error) {
        console.error("Error updating server cart:", error);
        updateLocalQuantity(itemId, newQuantity);
      } finally {
        setLoading(false);
      }
    } else {
      updateLocalQuantity(itemId, newQuantity);
    }
  };

  const updateLocalQuantity = (productId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = async () => {
    if (user && token) {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/clear`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (data.success) {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error clearing server cart:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems([]);
    }
  };

  // Get totals
  const totalAmount = Array.isArray(cartItems) 
    ? cartItems.reduce((acc, item) => {
        const itemPrice = item.priceAtTime || item.price || 0;
        const quantity = item.quantity || 1;
        return acc + (itemPrice * quantity);
      }, 0)
    : 0;

  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalAmount,
        totalItems,
        loading,
        syncWithServer
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
