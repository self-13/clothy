import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    dispatch(loginUser(formData))
      .then((result) => {
        // Check if the action was fulfilled or rejected
        if (loginUser.fulfilled.match(result)) {
          const payload = result.payload;
          
          if (payload && payload.success) {
            toast({
              title: payload.message || "Login successful",
            });
            navigate("/");
          } else {
            toast({
              title: payload?.message || "Login failed. Please try again.",
              variant: "destructive",
            });
          }
        } else if (loginUser.rejected.match(result)) {
          // Handle rejected action - the payload contains the error response
          const errorPayload = result.payload;
          toast({
            title: errorPayload?.message || "Login failed",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
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
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account
          <Link
            className="font-bold ml-2 text-primary hover:underline "
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
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

export default AuthLogin;
