import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { phoneLogin } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  }, []);

  async function handleSendOtp(event) {
    if (event) event.preventDefault();
    setIsLoading(true);

    if (!formData.phoneNumber.startsWith("+")) {
      toast({
        title: "Please enter phone number with country code (e.g. +91...)",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formData.phoneNumber,
        appVerifier
      );
      setVerificationId(confirmationResult);
      setShowOtpInput(true);
      toast({
        title: "OTP sent successfully to your phone number.",
      });
    } catch (error) {
      console.error("SMS Error:", error);
      toast({
        title: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await verificationId.confirm(otp);
      
      // OTP verified, now complete registration on backend
      dispatch(phoneLogin({ ...formData, isOtpLogin: true }))
        .then((result) => {
          if (result.payload?.success) {
            toast({
              title: "Registration successful!",
            });
            navigate("/shop/home");
          } else {
            toast({
              title: result.payload?.message || "Registration failed",
              variant: "destructive",
            });
          }
        });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast({
        title: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {showOtpInput ? "Verify OTP" : "Create new account"}
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

      {!showOtpInput ? (
        <>
          <CommonForm
            formControls={registerFormControls}
            buttonText="Send OTP"
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSendOtp}
            isLoading={isLoading}
          />
          <div id="recaptcha-container"></div>
        </>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label>Enter OTP</Label>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify & Register"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowOtpInput(false)}
          >
            Back
          </Button>
        </form>
      )}

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
