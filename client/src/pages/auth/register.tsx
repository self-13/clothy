import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { registerUser } from "@/store/auth-slice";

export default function AuthRegister() {
  const [formData, setFormData] = useState({ userName: "", email: "", password: "" });
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
    if (!formData.userName || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Password validation: 8+ chars, must contain letters & numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Password Constraints",
        description: "Password must be at least 8 characters and include letters and numbers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    dispatch(registerUser(formData) as any)
      .then((result: any) => {
        if (registerUser.fulfilled.match(result)) {
          const payload = result.payload;
          if (payload && payload.success) {
            toast({
              title: payload.message || "Registration successful",
              description: "Please check your email for the verification code.",
            });
            navigate(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
          } else {
            toast({
              title: payload?.message || "Registration failed. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          const errorPayload = result.payload;
          toast({
            title: errorPayload?.message || "Registration failed",
            variant: "destructive",
          });
        }
      })
      .catch((error: any) => {
        console.error("Registration error:", error);
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
          Create Account
        </h2>
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            className="font-bold text-black hover:underline underline-offset-4"
            to="/auth/login"
          >
            Login Here
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Username
          </label>
          <input
            type="text"
            name="userName"
            placeholder="John Doe"
            value={formData.userName}
            onChange={handleInputChange}
            className="w-full h-11 px-5 rounded-full border border-zinc-200 focus:border-black focus:outline-none transition-all duration-300 placeholder:text-zinc-300 text-sm"
            disabled={isLoading}
          />
        </div>

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
          <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Min. 8 characters (Letters & Numbers)"
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
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
