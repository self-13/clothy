import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { resetPasswordFormControls } from "@/config";
import { resetPassword } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";

const initialState = {
  newPassword: "",
  confirmPassword: "",
};

function AuthResetPassword() {
  const [formData, setFormData] = useState(initialState);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid reset link",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  function onSubmit(event) {
    event.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    dispatch(resetPassword({ token, newPassword: formData.newPassword })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        // Redirect to login after successful password reset
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Invalid Reset Link
        </h1>
        <p className="text-sm text-muted-foreground">
          The password reset link is invalid or has expired.
        </p>
        <Link
          className="font-medium text-primary hover:underline"
          to="/auth/forgot-password"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>
      <CommonForm
        formControls={resetPasswordFormControls}
        buttonText={"Reset Password"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary hover:underline"
            to="/auth/login"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthResetPassword;