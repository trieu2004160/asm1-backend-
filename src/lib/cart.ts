// Define CartItem interface locally to avoid circular imports
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

const CART_STORAGE_KEY = "tc_cart";

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export const cartUtils = {
  // Get cart from localStorage
  getCart: (): CartState => {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsed = JSON.parse(cartData);
        return {
          items: parsed.items || [],
          totalItems: parsed.totalItems || 0,
          totalAmount: parsed.totalAmount || 0,
        };
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
  },

  // Save cart to localStorage
  saveCart: (cart: CartState): void => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  },

  // Add item to cart
  addItem: (product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  }, quantity: number = 1): CartState => {
    const cart = cartUtils.getCart();
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === product._id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    cartUtils.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateItemQuantity: (productId: string, quantity: number): CartState => {
    const cart = cartUtils.getCart();
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      // Recalculate totals
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      cart.totalAmount = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      cartUtils.saveCart(cart);
    }

    return cart;
  },

  // Remove item from cart
  removeItem: (productId: string): CartState => {
    const cart = cartUtils.getCart();
    cart.items = cart.items.filter(item => item.productId !== productId);

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    cartUtils.saveCart(cart);
    return cart;
  },

  // Clear entire cart
  clearCart: (): CartState => {
    const emptyCart = {
      items: [],
      totalItems: 0,
      totalAmount: 0,
    };
    cartUtils.saveCart(emptyCart);
    return emptyCart;
  },

  // Get item count for a specific product
  getItemQuantity: (productId: string): number => {
    const cart = cartUtils.getCart();
    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  },

  // Check if product is in cart
  isInCart: (productId: string): boolean => {
    const cart = cartUtils.getCart();
    return cart.items.some(item => item.productId === productId);
  },
};
