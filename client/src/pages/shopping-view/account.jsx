import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import ShoppingWishlist from "@/components/shopping-view/wishlist";
import Profile from "@/components/shopping-view/profile";
import Footer from "@/components/shopping-view/footer";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

function ShoppingAccount() {
  const { productDetails } = useSelector((state) => state.shopProducts);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans pt-20">
      
      {/* Header Banner */}
      <div className="bg-[#FAF9F6] border-b border-zinc-200/80 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-2">
            Client Sanctuary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#121212] font-normal">
            Account Overview & Orders
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-6xl">
        <div className="bg-white rounded-sm border border-zinc-200/80 shadow-xs overflow-hidden">
          <Tabs defaultValue="profile" className="w-full">
            {/* Tabs List */}
            <div className="border-b border-zinc-200/70 bg-[#FAF9F6]">
              <TabsList className="w-full h-auto bg-transparent p-0 flex flex-nowrap overflow-x-auto scrollbar-none">
                <TabsTrigger
                  value="profile"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-zinc-500 hover:text-black transition-colors rounded-none bg-transparent data-[state=active]:bg-white"
                >
                  Profile Details
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-zinc-500 hover:text-black transition-colors rounded-none bg-transparent data-[state=active]:bg-white"
                >
                  Order History
                </TabsTrigger>
                <TabsTrigger
                  value="wishlist"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-zinc-500 hover:text-black transition-colors rounded-none bg-transparent data-[state=active]:bg-white"
                >
                  Saved Wishlist
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-zinc-500 hover:text-black transition-colors rounded-none bg-transparent data-[state=active]:bg-white"
                >
                  Delivery Addresses
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              <TabsContent value="profile" className="mt-0">
                <Profile />
              </TabsContent>
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

      <Footer />
    </div>
  );
}

export default ShoppingAccount;
