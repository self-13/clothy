import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls, phoneLoginFormControls } from "@/config";
import { phoneLogin } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState = {
  phoneNumber: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {},
      });
    }
  }, []);

  function onPasswordLoginSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    dispatch(phoneLogin({ ...formData, isOtpLogin: false })).then((result) => {
      if (result.payload?.success) {
        toast({
          title: result.payload?.message || "Login successful",
        });
        navigate("/shop/home");
      } else {
        toast({
          title: result.payload?.message || "Login failed",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    });
  }

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
        title: "OTP sent successfully.",
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
      
      dispatch(phoneLogin({ phoneNumber: formData.phoneNumber, isOtpLogin: true }))
        .then((result) => {
          if (result.payload?.success) {
            toast({ title: "Logged in successfully!" });
            navigate("/shop/home");
          } else {
            toast({
              title: result.payload?.message || "Login failed",
              variant: "destructive",
            });
          }
        });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast({
        title: "Invalid OTP.",
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
          {showOtpInput ? "Verify OTP" : "Sign in to your account"}
        </h1>
        <p className="mt-2">
          Don't have an account
          <Link
            className="font-bold ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      {!showOtpInput ? (
        <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="otp">OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="password">
            <CommonForm
              formControls={loginFormControls}
              buttonText="Sign In"
              formData={formData}
              setFormData={setFormData}
              onSubmit={onPasswordLoginSubmit}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="otp">
            <CommonForm
              formControls={phoneLoginFormControls}
              buttonText="Send OTP"
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSendOtp}
              isLoading={isLoading}
            />
          </TabsContent>
          <div id="recaptcha-container"></div>
        </Tabs>
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
            {isLoading ? "Verifying..." : "Verify & Login"}
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
    </div>
  );
}

export default AuthLogin;
