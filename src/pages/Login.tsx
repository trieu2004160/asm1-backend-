import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  GoogleCredentialResponse,
} from "@/lib/google-auth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.login(email.trim(), password);
      authApi.persistSession(res);
      toast({ title: "Đăng nhập thành công" });
      navigate("/");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Đăng nhập thất bại",
        description:
          e?.response?.data?.message || "Vui lòng kiểm tra thông tin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        setLoading(true);
        const res = await authApi.googleLogin(response.credential);
        authApi.persistSession(res);
        toast({ title: "Đăng nhập Google thành công" });
        navigate("/");
      } catch (error: unknown) {
        const e = error as { response?: { data?: { message?: string } } };
        toast({
          title: "Đăng nhập Google thất bại",
          description: e?.response?.data?.message || "Có lỗi xảy ra",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [navigate, toast]
  );

  const handleGoogleSignIn = async () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log("Google Client ID:", clientId); // Debug log

      if (!clientId || clientId === "your_google_client_id_here") {
        toast({
          title: "Lỗi cấu hình",
          description: "Google Client ID chưa được cấu hình đúng",
          variant: "destructive",
        });
        return;
      }

      console.log("Loading Google Script..."); // Debug log
      await loadGoogleScript();
      console.log("Initializing Google Sign-In..."); // Debug log
      initializeGoogleSignIn(clientId, handleGoogleSuccess);

      // Trigger Google Sign-In popup
      if (window.google) {
        console.log("Prompting Google Sign-In..."); // Debug log
        window.google.accounts.id.prompt();
      } else {
        throw new Error("Google Identity Services not available");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error); // Debug log
      toast({
        title: "Lỗi đăng nhập Google",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tải Google Sign-In",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load Google Script on component mount
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      loadGoogleScript()
        .then(() => {
          initializeGoogleSignIn(clientId, handleGoogleSuccess);
        })
        .catch(() => {
          console.error("Failed to load Google Sign-In");
        });
    }
  }, [handleGoogleSuccess]);

  return (
    <div className="flex  w-full">
      <div className="w-full hidden md:inline-block">
        <img
          className="h-[800px] w-full object-cover"
          src="https://i.pinimg.com/1200x/8c/e2/71/8ce271ecc9535a6c0726ae8ce93c59f4.jpg"
          alt="leftSideImage"
        />
      </div>

      <div className="w-full flex flex-col items-center justify-center">
        <form
          className="md:w-96 w-80 flex flex-col items-center justify-center"
          onSubmit={onSubmit}
        >
          <h2 className="text-4xl text-gray-900 font-medium">Sign in</h2>
          <p className="text-sm text-gray-500/90 mt-3">
            Welcome back! Please sign in to continue
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full hover:bg-gray-500/20 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <img
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
              alt="googleLogo"
              className="mr-2"
            />
            <span className="text-gray-700 text-sm font-medium">
              {loading ? "Đang đăng nhập..." : "Tiếp tục với Google"}
            </span>
          </button>

          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-gray-300/90"></div>
            <p className="w-full text-nowrap text-sm text-gray-500/90">
              or sign in with email
            </p>
            <div className="w-full h-px bg-gray-300/90"></div>
          </div>

          <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              width="16"
              height="11"
              viewBox="0 0 16 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full pr-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              width="13"
              height="17"
              viewBox="0 0 13 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full pr-6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
            <div className="flex items-center gap-2">
              <input
                className="h-5 w-5"
                type="checkbox"
                id="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm" htmlFor="checkbox">
                Remember me
              </label>
            </div>
            <a className="text-sm underline hover:text-gray-700" href="#">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-gray-500/90 text-sm mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
