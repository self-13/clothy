import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";
import { Plus } from "lucide-react";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const { toast } = useToast();

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "Maximum Limit Reached",
        description: "You may save up to 3 delivery addresses.",
        variant: "destructive",
      });
      return;
    }

    currentEditedId !== null
      ? dispatch(
          editaAddress({
            addressId: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses());
            setCurrentEditedId(null);
            setShowAddForm(false);
            setFormData(initialAddressFormData);
            toast({
              title: "Address updated successfully.",
            });
          }
        })
      : dispatch(
          addNewAddress({
            ...formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddresses());
            setFormData(initialAddressFormData);
            setShowAddForm(false);
            toast({
              title: "New address saved successfully.",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({ addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses());
        toast({
          title: "Address removed.",
        });
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    setCurrentEditedId(getCuurentAddress?._id);
    setShowAddForm(true);
    setFormData({
      ...formData,
      address: getCuurentAddress?.address,
      city: getCuurentAddress?.city,
      phone: getCuurentAddress?.phone,
      pincode: getCuurentAddress?.pincode,
      notes: getCuurentAddress?.notes,
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllAddresses());
  }, [dispatch]);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Existing Addresses */}
      <div>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200/70">
          <div>
            <h3 className="font-serif text-xl text-[#121212]">Saved Delivery Destinations</h3>
            <p className="text-xs text-zinc-500 font-light mt-0.5">
              Choose or manage your shipping locations ({addressList?.length || 0}/3 saved).
            </p>
          </div>
          {!showAddForm && addressList?.length < 3 && (
            <button
              onClick={() => {
                setCurrentEditedId(null);
                setFormData(initialAddressFormData);
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-[#121212] text-white hover:bg-black text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Destination</span>
            </button>
          )}
        </div>

        {addressList && addressList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addressList.map((singleAddressItem) => (
              <AddressCard
                key={singleAddressItem._id}
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white border border-dashed border-zinc-200 rounded-sm">
            <p className="text-xs font-light text-zinc-400 uppercase tracking-widest">
              No delivery addresses saved yet.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal or Inline */}
      {(showAddForm || addressList?.length === 0) && (
        <div className="bg-white border border-zinc-200/80 rounded-sm p-6 sm:p-8 shadow-xs">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-200/60">
            <h3 className="font-serif text-xl text-[#121212]">
              {currentEditedId !== null ? "Edit Delivery Address" : "New Delivery Address"}
            </h3>
            {addressList?.length > 0 && (
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setCurrentEditedId(null);
                }}
                className="text-xs text-zinc-400 hover:text-black font-medium"
              >
                Cancel
              </button>
            )}
          </div>

          <CommonForm
            formControls={addressFormControls}
            formData={formData}
            setFormData={setFormData}
            buttonText={
              currentEditedId !== null ? "Update Destination" : "Save Destination"
            }
            onSubmit={handleManageAddress}
            isBtnDisabled={!isFormValid()}
          />
        </div>
      )}
    </div>
  );
}

export default Address;
