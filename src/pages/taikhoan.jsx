import { useEffect, useState } from "react";
import TNCLayout from "@/layouts/tnc";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { apiRequest } from "@/utils/api";

export default function TaiKhoanPage() {
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiRequest("/users/profile")
      .then((res) => {
        const p = res?.data || res?.user || res;
        setProfile({ fullName: p.fullName || p.name || "", email: p.email || "", phone: p.phone || p.phoneNumber || "" });
      })
      .catch((e) => setMessage(e.message || "Không tải được hồ sơ"))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setMessage("");
    try {
      await apiRequest("/users/profile", { method: "PUT", body: JSON.stringify(profile) });
      setMessage("Cập nhật hồ sơ thành công.");
    } catch (e) {
      setMessage(e.message || "Cập nhật thất bại.");
    }
  };

  return (
    <TNCLayout>
      <section className="bg-[#fcfbf7] min-h-screen py-10">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-black mb-6">Tài khoản</h2>
          {message && <div className="mb-4 p-3 bg-white border border-gray-200">{message}</div>}
          <div className="space-y-4 bg-white border border-gray-200 p-6">
            <Input label="Họ tên" value={profile.fullName} onValueChange={(v) => setProfile((p) => ({ ...p, fullName: v }))} isDisabled={loading} />
            <Input label="Email" value={profile.email} isDisabled />
            <Input label="Số điện thoại" value={profile.phone} onValueChange={(v) => setProfile((p) => ({ ...p, phone: v }))} isDisabled={loading} />
            <Button className="bg-[#b11116] text-white" onClick={saveProfile} isDisabled={loading}>Lưu thông tin</Button>
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
