import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";
import adminDashboardSlice from "./admin/dashboard-slice";
import adminCouponSlice from "./admin/coupon-slice";
import adminUserSlice from "./admin/user-slice";

import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import shopCouponSlice from "./shop/coupon-slice";
import commonFeatureSlice from "./common-slice";
import wishlistReducer from "./shop/wishlist-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,
    adminDashboard: adminDashboardSlice,
    adminCoupons: adminCouponSlice,
    adminUser: adminUserSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    shopCoupons: shopCouponSlice,

    commonFeature: commonFeatureSlice,

    wishlist: wishlistReducer,
  },
});

export default store;
