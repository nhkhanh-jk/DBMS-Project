import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Link, useNavigate } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";

export default function DangNhapPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError(t("login-error") || "Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const profile = await login({
        username: identifier,
        email: identifier,
        password,
      });
      // Redirect based on role
      if (profile.role === "ADMIN") {
        localStorage.setItem("tnc_superadmin", "1");
        navigate("/admin");
      } else if (profile.role === "NHANVIEN") {
        localStorage.setItem("tnc_user", JSON.stringify({ ...profile, role: "staff" }));
        navigate("/nhanvien");
      } else {
        navigate("/thanhvien");
      }
    } catch (err) {
      const msg = err.response?.data?.error || t("login-error") || "Sai tài khoản hoặc mật khẩu.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <TNCLayout>
      <section className="relative flex min-h-[70vh] items-center justify-center py-10 bg-[#fcfbf7]">
        <Card className="w-full max-w-md p-4 shadow-xl border-t-4 border-[#b11116]">
          <CardHeader className="flex flex-col items-center pb-0 pt-2 text-center">
            <h1 className="text-2xl font-black text-[#b11116] uppercase tracking-wide">{t("login")}</h1>
            <p className="text-sm text-default-500">{t("access-tnc-account")}</p>
          </CardHeader>
          <CardBody className="overflow-visible py-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 text-sm rounded-sm border border-red-200 font-medium">
                {error}
              </div>
            )}
            <Input
              isRequired
              label={t("email-phone")}
              placeholder={t("enter-email-phone")}
              value={identifier}
              onValueChange={setIdentifier}
              onKeyDown={handleKeyDown}
              variant="bordered"
            />
            <Input
              isRequired
              label={t("password")}
              placeholder={t("enter-password")}
              type="password"
              value={password}
              onValueChange={setPassword}
              onKeyDown={handleKeyDown}
              variant="bordered"
            />
            <div className="flex justify-end">
              <Link to="#" className="text-sm font-semibold text-[#b11116] hover:underline">
                {t("forgot-password")}
              </Link>
            </div>
            <Button
              className="w-full bg-[#b11116] font-black text-white shadow-md hover:brightness-110"
              onClick={handleLogin}
              isLoading={loading}
              size="lg"
            >
              {t("login")}
            </Button>
          </CardBody>
          <CardFooter className="flex justify-center flex-col gap-2 pt-0 border-t border-gray-100 mt-4">
            <p className="text-sm text-default-500 pt-4">
              {t("no-account")}{" "}
              <Link to="/dangky" className="font-semibold text-[#b11116] hover:underline">
                {t("register-now")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </section>
    </TNCLayout>
  );
}
