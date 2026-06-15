declare module "@/store/auth-slice" {
  export const registerUser: any;
  export const loginUser: any;
  export const logoutUser: any;
  export const checkAuth: any;
  export const verifyOTP: any;
  export const resendOTP: any;
  export const forgotPassword: any;
  export const resetPassword: any;
  export const updateProfile: any;
  export const setUser: any;
  export const restoreSession: any;
  const reducer: any;
  export default reducer;
}

declare module "@/store/shop/cart-slice" {
  export const addToCart: any;
  export const fetchCartItems: any;
  export const deleteCartItem: any;
  export const updateCartQuantity: any;
  const reducer: any;
  export default reducer;
}

declare module "@/store/shop/products-slice" {
  export const fetchAllFilteredProducts: any;
  export const fetchProductDetails: any;
  export const resetProductDetails: any;
  const reducer: any;
  export default reducer;
}

declare module "@/store/shop/review-slice" {
  export const addReview: any;
  export const getReviews: any;
  const reducer: any;
  export default reducer;
}

declare module "@/store/shop/wishlist-slice" {
  export const addToWishlist: any;
  export const removeFromWishlist: any;
  export const checkProductInWishlist: any;
  const reducer: any;
  export default reducer;
}

declare module "@/store/common-slice" {
  export const getFeatureImages: any;
  const reducer: any;
  export default reducer;
}
