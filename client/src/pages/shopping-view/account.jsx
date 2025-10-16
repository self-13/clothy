import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import ShoppingWishlist from "@/components/shopping-view/wishlist";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

function ShoppingAccount() {
  const { productDetails } = useSelector((state) => state.shopProducts);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
          alt="Account background"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Tabs defaultValue="orders" className="w-full">
              {/* Improved Tabs List */}
              <div className="border-b border-gray-200">
                <TabsList className="w-full h-auto bg-transparent p-0 flex flex-nowrap overflow-x-auto sm:overflow-visible scrollbar-hide">
                  <TabsTrigger
                    value="orders"
                    className="flex-1 sm:flex-none px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-gray-900 transition-colors duration-200 data-[state=active]:bg-transparent bg-transparent"
                  >
                    My Orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="wishlist"
                    className="flex-1 sm:flex-none px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-gray-900 transition-colors duration-200 data-[state=active]:bg-transparent bg-transparent"
                  >
                    Wishlist
                  </TabsTrigger>
                  <TabsTrigger
                    value="address"
                    className="flex-1 sm:flex-none px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-gray-900 transition-colors duration-200 data-[state=active]:bg-transparent bg-transparent"
                  >
                    My Addresses
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <TabsContent value="orders" className="mt-0">
                  <ShoppingOrders />
                </TabsContent>
                <TabsContent value="wishlist" className="mt-0">
                  <ShoppingWishlist />
                </TabsContent>
                <TabsContent value="address" className="mt-0">
                  <Address />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingAccount;
