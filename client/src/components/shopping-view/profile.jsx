import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { User, Lock, Mail, ShieldCheck } from "lucide-react";

function Profile() {
  const { user, isLoading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      toast({ title: "Current password is required to save changes", variant: "destructive" });
      return;
    }

    const { email, ...payload } = formData;
    dispatch(updateProfile(payload)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Profile details updated successfully." });
        setFormData({ ...formData, currentPassword: "", newPassword: "" });
      } else {
        toast({ title: data?.payload?.message || "Profile update failed.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-4 font-sans">
      <div className="bg-white border border-zinc-200/80 rounded-sm p-6 sm:p-10 shadow-xs">
        
        {/* Header */}
        <div className="border-b border-zinc-200/70 pb-6 mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
            Personal Information
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#121212] font-normal">
            Account & Security Settings
          </h2>
          <p className="text-xs text-zinc-500 font-light mt-1">
            Manage your personal profile name and access credentials.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 rounded-sm border border-zinc-300 bg-[#FAF9F6] text-xs font-normal text-[#121212] focus:border-black focus:bg-white focus:outline-none transition-colors"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Email Identifier</span>
                </label>
                <input
                  type="email"
                  className="w-full h-11 px-3.5 rounded-sm border border-zinc-200 bg-zinc-100/70 text-xs text-zinc-500 cursor-not-allowed select-none"
                  value={formData.email}
                  disabled
                />
                <span className="text-[10px] text-zinc-400 block pt-0.5">Primary identifier cannot be modified.</span>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-zinc-200/70 pt-8 space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#121212]">
                  Update Password
                </h3>
                <p className="text-xs text-zinc-500 font-light mt-0.5">
                  Enter your current password to authorize security updates.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Current Password <span className="text-rose-600">*</span></span>
                  </label>
                  <input
                    type="password"
                    placeholder="Required to confirm changes"
                    className="w-full h-11 px-3.5 rounded-sm border border-zinc-300 bg-[#FAF9F6] text-xs text-[#121212] focus:border-black focus:bg-white focus:outline-none transition-colors placeholder:text-zinc-400"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>New Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to retain current password"
                    className="w-full h-11 px-3.5 rounded-sm border border-zinc-300 bg-[#FAF9F6] text-xs text-[#121212] focus:border-black focus:bg-white focus:outline-none transition-colors placeholder:text-zinc-400"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 h-11 bg-[#121212] hover:bg-black text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? "Saving Updates..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
