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
        title: "Validation Error",
        description: "Please fill in all fields",
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
              title: payload.message || "Welcome back!",
            });
            navigate("/");
          } else {
            toast({
              title: payload?.message || "Login failed. Please check credentials.",
              variant: "destructive",
            });
          }
        } else {
          const errorPayload = result.payload;
          toast({
            title: errorPayload?.message || "Login failed",
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
    <div className="w-full space-y-6 font-spaceGrotesk text-[#333]">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold uppercase tracking-tight text-black">
          Welcome Back
        </h2>
        <p className="text-sm text-zinc-400">
          New here?{" "}
          <Link
            className="font-bold text-black hover:underline underline-offset-4"
            to="/auth/register"
          >
            Create an Account
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full h-11 px-5 rounded-full border border-zinc-200 focus:border-black focus:outline-none transition-all duration-300 placeholder:text-zinc-300 text-sm"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Password
            </label>
            <Link
              className="text-[10px] font-bold text-zinc-300 hover:text-black transition-colors"
              to="/auth/forgot-password"
            >
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full h-11 px-5 rounded-full border border-zinc-200 focus:border-black focus:outline-none transition-all duration-300 placeholder:text-zinc-300 text-sm"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 transition-all rounded-full font-bold uppercase tracking-widest text-xs shadow-md mt-6"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
