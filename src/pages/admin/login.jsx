import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

export default function SuperAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem("tnc_superadmin", "true");
      navigate("/admin");
    } else {
      setError("Tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen bg-[#06102b] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-[#f6c344]/5 rounded-full blur-[128px]"></div>
      </div>
      
      <Card className="w-full max-w-md bg-[#0a1930]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 duration-700">
        <CardHeader className="flex flex-col items-center pt-10 pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#f6c344] to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(246,195,68,0.3)] mb-6 border-4 border-[#06102b]">
            <span className="text-[#06102b] font-black text-3xl tracking-tighter">TNC</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] text-center">System Admin</h2>
          <p className="text-white/40 text-xs tracking-widest mt-2 uppercase font-bold">Quản trị cấp cao</p>
        </CardHeader>
        
        <CardBody className="p-8 pt-2">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <Input
                type="text"
                label="Super Username"
                variant="faded"
                placeholder="Tài khoản quản trị"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                classNames={{
                  label: "text-white/60 font-bold uppercase text-[10px] tracking-widest",
                  input: "text-white font-mono font-bold",
                  inputWrapper: "bg-[#06102b] border-white/10 hover:border-white/30 focus-within:!border-[#f6c344]"
                }}
              />
              <Input
                type="password"
                label="Passcode"
                variant="faded"
                placeholder="Mã truy cập"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{
                   label: "text-white/60 font-bold uppercase text-[10px] tracking-widest",
                  input: "text-white font-mono font-bold",
                  inputWrapper: "bg-[#06102b] border-white/10 hover:border-white/30 focus-within:!border-[#f6c344]"
                }}
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center uppercase tracking-wider">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              size="lg"
              fullWidth
              className="bg-[#f6c344] text-[#06102b] font-black tracking-widest uppercase shadow-[0_4px_20px_rgba(246,195,68,0.2)] hover:shadow-[0_4px_30px_rgba(246,195,68,0.4)] mt-4"
            >
              CẤP QUYỀN TRUY CẬP
            </Button>
            
            <div className="text-center pt-6 border-t border-white/5 mt-8">
              <p className="text-[10px] text-white/30 tracking-widest font-black uppercase">Secured by TNC Tech</p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
