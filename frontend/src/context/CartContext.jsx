import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    const data = await cartAPI.getCart();
                    // Map backend structure to frontend structure: { ...productData, quantity }
                    const formattedCart = data.cart.map(item => ({
                        ...item.product,
                        quantity: item.quantity
                    }));
                    setCart(formattedCart);
                } catch (error) {
                    console.error("Failed to load backend cart", error);
                }
            } else {
                try {
                    const storedCart = localStorage.getItem('petShopCart');
                    setCart(storedCart ? JSON.parse(storedCart) : []);
                } catch (error) {
                    console.error("Failed to load cart from local storage", error);
                    setCart([]);
                }
            }
        };
        loadCart();
    }, [isAuthenticated]);

    // Save to local storage only if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('petShopCart', JSON.stringify(cart));
        }
    }, [cart, isAuthenticated]);

    const addToCart = async (product) => {
        // Optimistic UI update
        const quantityToAdd = 1;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantityToAdd }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: quantityToAdd }];
            }
        });

        if (isAuthenticated) {
            try {
                await cartAPI.addToCart(product.id, quantityToAdd);
            } catch (error) {
                console.error("Failed to add to backend cart", error);
                // Ideally rollback state here if failed
            }
        }
    };

    const removeFromCart = async (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));

        if (isAuthenticated) {
            try {
                await cartAPI.removeFromCart(productId);
            } catch (error) {
                console.error("Failed to remove from backend cart", error);
            }
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );

        if (isAuthenticated) {
            try {
                await cartAPI.updateQuantity(productId, quantity);
            } catch (error) {
                console.error("Failed to update quantity in backend cart", error);
            }
        }
    };

    const clearCart = () => {
        setCart([]);
        if (!isAuthenticated) {
            localStorage.removeItem('petShopCart');
        }
        // Note: For authenticated users, clearing usually happens on checkout. 
        // If we want a explicit "clear cart" button that wipes backend, we need an API endpoint for it.
        // For now, this just clears local state.
    };

    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
