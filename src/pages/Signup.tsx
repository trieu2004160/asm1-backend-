import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  GoogleCredentialResponse,
} from "@/lib/google-auth";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.register(email.trim(), password);
      authApi.persistSession(res);
      toast({ title: "Đăng ký thành công" });
      navigate("/");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Đăng ký thất bại",
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
        toast({ title: "Đăng ký Google thành công" });
        navigate("/");
      } catch (error: unknown) {
        const e = error as { response?: { data?: { message?: string } } };
        toast({
          title: "Đăng ký Google thất bại",
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
      if (!clientId) {
        toast({
          title: "Lỗi cấu hình",
          description: "Google Client ID chưa được cấu hình",
          variant: "destructive",
        });
        return;
      }

      await loadGoogleScript();
      initializeGoogleSignIn(clientId, handleGoogleSuccess);

      // Trigger Google Sign-In popup
      if (window.google) {
        window.google.accounts.id.prompt();
      }
    } catch (error) {
      toast({
        title: "Lỗi đăng ký Google",
        description: "Không thể tải Google Sign-In",
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
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/2 hidden md:block">
        <img
          className="h-full w-full object-cover"
          src="https://i.pinimg.com/1200x/8c/e2/71/8ce271ecc9535a6c0726ae8ce93c59f4.jpg"
          alt="leftSideImage"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto">
        <form
          className="w-full max-w-sm flex flex-col items-center justify-center space-y-4"
          onSubmit={onSubmit}
        >
          <h2 className="text-4xl text-gray-900 font-medium">Sign up</h2>
          <p className="text-sm text-gray-500/90 mt-3">
            Create your account to get started
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
              {loading ? "Đang đăng ký..." : "Tiếp tục với Google"}
            </span>
          </button>

          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-gray-300/90"></div>
            <p className="w-full text-nowrap text-sm text-gray-500/90">
              or sign up with email
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
              placeholder="Password (>= 6 characters)"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full pr-6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="mt-8 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-gray-500/90 text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
