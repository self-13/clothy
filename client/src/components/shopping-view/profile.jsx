import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      toast({ title: "Current password is required", variant: "destructive" });
      return;
    }

    const { email, ...payload } = formData;
    dispatch(updateProfile(payload)).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Profile updated successfully" });
        setFormData({ ...formData, currentPassword: "", newPassword: "" });
      } else {
        toast({ title: data?.payload?.message || "Update failed", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="rounded-none border-t-4 border-black border-x-0 border-b-0 shadow-sm bg-white">
        <CardHeader className="border-b border-zinc-100 pb-6">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-black" /> Account Security
          </CardTitle>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Manage your credentials and personal information</p>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> User Name
                  </label>
                  <Input
                    className="rounded-none border-2 border-zinc-200 focus:border-black h-12 font-bold"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 opacity-60 cursor-not-allowed">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1 cursor-not-allowed">
                    <Mail className="w-3 h-3" /> Email Address <Lock className="w-2.5 h-2.5 text-zinc-400" />
                  </label>
                  <Input
                    className="rounded-none border-2 border-zinc-200 bg-zinc-50 h-12 font-bold cursor-not-allowed pointer-events-none"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Primary login identifier cannot be modified</p>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-8 mt-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-6">Security Credentials</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Current Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Required to confirm changes"
                      className="rounded-none border-2 border-zinc-200 focus:border-black h-12 font-bold italic"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="rounded-none border-2 border-zinc-200 focus:border-black h-12 font-bold italic"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-black hover:bg-zinc-800 text-white rounded-none font-black uppercase tracking-widest text-lg transition-all duration-300 shadow-lg shadow-black/10"
            >
              {isLoading ? "Synchronizing..." : "Update Credentials"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-zinc-50 border-l-4 border-zinc-200">
          <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tighter">
            Note: Changing your credentials will synchronize across all your authenticated devices immediately. 
            Ensure your new password contains a mixture of alpha-numeric characters for maximum structural integrity.
          </p>
      </div>
    </div>
  );
}

export default Profile;
