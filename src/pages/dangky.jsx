import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Link } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/utils/api";

export default function DangKyPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!form.fullName || !form.phone || !form.email || !form.password) {
      setError("Vui lòng nhập đủ thông tin bắt buộc.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      setSuccess("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
      setForm({ fullName: "", phone: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TNCLayout>
      <section className="flex min-h-[90vh] items-center justify-center py-10 bg-[#fcfbf7]">
        <Card className="w-full max-w-xl p-4 shadow-xl border-t-4 border-[#b11116]">
          <CardHeader className="flex flex-col items-center pb-0 pt-2 text-center">
            <h1 className="text-2xl font-black text-[#b11116] uppercase tracking-wide">{t("registration")}</h1>
            <p className="text-sm text-default-500">{t("create-account-desc")}</p>
          </CardHeader>
          <CardBody className="overflow-visible py-6 space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 text-sm rounded-sm border border-red-200 font-medium">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 text-sm rounded-sm border border-green-200 font-medium">{success}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input isRequired label={t("full-name")} value={form.fullName} onValueChange={(v) => onChange("fullName", v)} variant="bordered" />
              <Input isRequired label={t("phone-number")} value={form.phone} onValueChange={(v) => onChange("phone", v)} type="tel" variant="bordered" />
            </div>
            <Input isRequired label="Email" value={form.email} onValueChange={(v) => onChange("email", v)} type="email" variant="bordered" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input isRequired label={t("password")} value={form.password} onValueChange={(v) => onChange("password", v)} type="password" variant="bordered" />
              <Input isRequired label={t("confirm-password-label")} value={form.confirmPassword} onValueChange={(v) => onChange("confirmPassword", v)} type="password" variant="bordered" />
            </div>
            <Button className="w-full bg-[#f6c344] font-black text-[#651014] shadow-md mt-4" size="lg" isLoading={loading} onClick={handleRegister}>
              {t("register-submit")}
            </Button>
          </CardBody>
          <CardFooter className="flex justify-center pt-0 border-t border-gray-100 mt-4">
            <p className="text-sm text-default-500 pt-4">
              {t("already-have-account")}{" "}
              <Link to="/dangnhap" className="font-semibold text-[#b11116] hover:underline">
                {t("login")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </section>
    </TNCLayout>
  );
}
