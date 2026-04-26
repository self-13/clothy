import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD_ydjZPsKyDzLtzx0esZxnhkNkoBa43EU",
  authDomain: "clothy-cfca3.firebaseapp.com",
  projectId: "clothy-cfca3",
  storageBucket: "clothy-cfca3.firebasestorage.app",
  messagingSenderId: "1007051337258",
  appId: "1:1007051337258:web:ba05d63ee82faa5ee6dd53",
  measurementId: "G-H6WKT17FEK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export default app;
