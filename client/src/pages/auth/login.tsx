import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from "@/store/auth-slice";

export default function AuthLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    dispatch(loginUser(formData) as any)
      .then((result: any) => {
        if (loginUser.fulfilled.match(result)) {
          const payload = result.payload;
          if (payload && payload.success) {
            toast({
              title: payload.message || "Welcome back.",
            });
            navigate("/");
          } else {
            toast({
              title: payload?.message || "Invalid credentials. Please verify your details.",
              variant: "destructive",
            });
          }
        } else {
          const errorPayload = result.payload;
          toast({
            title: errorPayload?.message || "Authentication failed.",
            variant: "destructive",
          });
        }
      })
      .catch((error: any) => {
        console.error("Login error:", error);
        toast({
          title: "An unexpected error occurred.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full space-y-6 font-sans text-[#121212]">
      <div className="space-y-1.5 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#121212] font-normal">
          Member Sign In
        </h2>
        <p className="text-xs text-zinc-500 font-light">
          New to Luxeridge?{" "}
          <Link
            className="font-medium text-black underline underline-offset-4 hover:text-zinc-600"
            to="/auth/register"
          >
            Create an Account
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full h-11 px-3.5 rounded-sm border border-zinc-300 bg-[#FAF9F6] text-xs font-normal text-[#121212] focus:border-black focus:bg-white focus:outline-none transition-colors placeholder:text-zinc-400"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 block">
              Password
            </label>
            <Link
              className="text-[11px] text-zinc-400 hover:text-black underline underline-offset-2 transition-colors"
              to="/auth/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full h-11 px-3.5 rounded-sm border border-zinc-300 bg-[#FAF9F6] text-xs font-normal text-[#121212] focus:border-black focus:bg-white focus:outline-none transition-colors placeholder:text-zinc-400"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#121212] text-white hover:bg-black disabled:opacity-40 transition-all active:scale-[0.98] rounded-sm text-xs font-semibold uppercase tracking-[0.16em] mt-6"
        >
          {isLoading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
