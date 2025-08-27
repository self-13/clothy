import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { forgotPasswordFormControls } from "@/config";
import { forgotPassword } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const initialState = {
  email: "",
};

function AuthForgotPassword() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(forgotPassword(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <CommonForm
        formControls={forgotPasswordFormControls}
        buttonText={"Send Reset Link"}
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

export default AuthForgotPassword;