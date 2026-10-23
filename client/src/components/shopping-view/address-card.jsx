import { Check, Edit2, Trash2, MapPin } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  const isSelected = selectedId?._id === addressInfo?._id;

  return (
    <div
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer rounded-sm p-5 transition-all duration-200 font-sans border flex flex-col justify-between ${
        isSelected
          ? "border-[#121212] bg-[#FAF9F6] shadow-xs ring-1 ring-[#121212]"
          : "border-zinc-200/80 bg-white hover:border-zinc-400"
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200/60">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#121212]">
              {addressInfo?.city}
            </span>
          </div>
          {isSelected && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
              <Check className="w-3 h-3" /> Selected
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-zinc-600 font-light leading-relaxed">
          <p className="font-medium text-[#121212]">{addressInfo?.address}</p>
          <p>{addressInfo?.city}, PIN: {addressInfo?.pincode}</p>
          <p className="pt-1 text-[11px] text-zinc-400 font-normal">Contact: {addressInfo?.phone}</p>
          {addressInfo?.notes && (
            <p className="text-[11px] text-zinc-500 italic pt-1">"{addressInfo?.notes}"</p>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-zinc-200/60 flex items-center justify-end gap-3 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditAddress(addressInfo);
          }}
          className="text-zinc-500 hover:text-black font-medium transition-colors flex items-center gap-1"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
          className="text-zinc-400 hover:text-rose-600 font-medium transition-colors flex items-center gap-1 ml-2"
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      </div>
    </div>
  );
}

export default AddressCard;
