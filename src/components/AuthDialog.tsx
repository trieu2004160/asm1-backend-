import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { authApi, AuthUser } from "@/lib/api";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
}

export function AuthDialog({
  isOpen,
  onClose,
  onAuthenticated,
}: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? authApi.login : authApi.register;
      const resp = await fn(email, password);
      authApi.persistSession(resp);
      onAuthenticated(resp.user);
      onClose();
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-up">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mật khẩu (>= 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 btn-fashion"
                disabled={loading}
              >
                {loading
                  ? "Đang xử lý..."
                  : mode === "login"
                  ? "Đăng nhập"
                  : "Đăng ký"}
              </Button>
            </div>
          </form>
          <div className="text-sm text-center mt-4">
            {mode === "login" ? (
              <button className="underline" onClick={() => setMode("register")}>
                Chưa có tài khoản? Đăng ký
              </button>
            ) : (
              <button className="underline" onClick={() => setMode("login")}>
                Đã có tài khoản? Đăng nhập
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
