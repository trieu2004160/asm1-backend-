import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="min-w-fit flex-col border bg-white px-6 py-14 shadow-md rounded-[4px]">
        <div className="mb-8 flex justify-center">
          <img
            className="w-24"
            src="https://assets.leetcode.com/static_assets/public/webpack_bundles/images/logo.c36eaf5e6.svg"
            alt="logo"
          />
        </div>
        <form className="flex flex-col text-sm rounded-md" onSubmit={onSubmit}>
          <input
            className="mb-5 rounded-[4px] border p-3 hover:outline-none focus:outline-none hover:border-yellow-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded-[4px] p-3 hover:outline-none focus:outline-none hover:border-yellow-500"
            type="password"
            placeholder="Password (>= 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            className="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 duration-300"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Sign up"}
          </button>
        </form>
        <div className="mt-5 flex justify-between text-sm text-gray-600">
          <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
