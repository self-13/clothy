import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    // Password validation: 8+ chars, must contain letters & numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      toast({
        title:
          "Password must be at least 8 characters and include letters and numbers.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    dispatch(registerUser(formData))
      .then((result) => {
        // Check if the action was fulfilled or rejected
        if (registerUser.fulfilled.match(result)) {
          const payload = result.payload;

          if (payload && payload.success) {
            toast({
              title: payload.message || "Registration successful",
              description: "Please check your email for the verification code.",
            });
            navigate(
              `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
            );
          } else {
            toast({
              title:
                payload?.message || "Registration failed. Please try again.",
              variant: "destructive",
            });
          }
        } else if (registerUser.rejected.match(result)) {
          // Handle rejected action - the payload contains the error response
          const errorPayload = result.payload;
          toast({
            title: errorPayload?.message || "Registration failed",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        toast({
          title: "An unexpected error occurred.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-bold ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText="Sign Up"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary hover:underline"
            to="/auth/forgot-password"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthRegister;
