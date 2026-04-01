import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

export default function StaffLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "nhanvien" && password === "nhanvien") {
      localStorage.setItem("tnc_user", JSON.stringify({ name: "Ngô Minh Khoa", role: "staff", branch: "TNC Vincom Đà Nẵng" }));
      navigate("/nhanvien");
    } else {
      setError("Tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e71a0f]/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#f6c344]/10 rounded-full blur-[128px]"></div>
      </div>

      <Card className="w-full max-w-md bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
        <CardHeader className="flex flex-col items-center pt-8 pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#e71a0f] to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(231,26,15,0.4)] mb-4">
            <span className="text-white font-black text-2xl tracking-tighter">TNC</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest text-center">Đăng Nhập Cổng Nhân Viên</h2>
          <p className="text-white/50 text-sm mt-2">Vui lòng đăng nhập với tài khoản được cấp.</p>
        </CardHeader>

        <CardBody className="p-8 pt-4">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                label="Tên đăng nhập"
                variant="bordered"
                placeholder="Nhập tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                classNames={{
                  label: "text-white/70 font-bold",
                  input: "text-white font-mono",
                  inputWrapper: "border-white/20 hover:border-white/40 focus-within:!border-[#e71a0f]"
                }}
              />
              <Input
                type="password"
                label="Mật khẩu"
                variant="bordered"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{
                  label: "text-white/70 font-bold",
                  input: "text-white font-mono",
                  inputWrapper: "border-white/20 hover:border-white/40 focus-within:!border-[#e71a0f]"
                }}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              className="bg-[#e71a0f] text-white font-black shadow-[0_4px_20px_rgba(231,26,15,0.4)] hover:shadow-[0_4px_30px_rgba(231,26,15,0.6)]"
            >
              ĐĂNG NHẬP HỆ THỐNG
            </Button>

            <div className="text-center pt-4 border-t border-white/10 mt-6">
              <p className="text-xs text-white/40 font-bold">Dành cho nội bộ. Tài khoản test: admin / admin</p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
