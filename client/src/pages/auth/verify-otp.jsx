import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { otpFormControls } from "@/config";
import { verifyOTP, resendOTP } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const initialState = {
  email: "",
  otp: "",
};

function AuthVerifyOTP() {
  const [formData, setFormData] = useState(initialState);
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get("email");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (emailFromParams) {
      setFormData(prev => ({ ...prev, email: emailFromParams }));
    }
  }, [emailFromParams]);

  function onSubmit(event) {
    event.preventDefault();
    
    if (formData.otp.length !== 6) {
      toast({
        title: "OTP must be 6 digits",
        variant: "destructive",
      });
      return;
    }

    dispatch(verifyOTP(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  const handleResendOTP = () => {
    if (formData.email) {
      dispatch(resendOTP({ email: formData.email })).then((data) => {
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
    } else {
      toast({
        title: "Please enter your email first",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verify Your Email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the OTP sent to your email address
        </p>
      </div>
      <CommonForm
        formControls={otpFormControls}
        buttonText={"Verify OTP"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive the OTP?{" "}
          <button
            className="font-medium text-primary hover:underline"
            onClick={handleResendOTP}
          >
            Resend OTP
          </button>
        </p>
        <p className="mt-2">
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

export default AuthVerifyOTP;
