import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

export default function ManagerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "quanly" && password === "quanly") {
      localStorage.setItem("tnc_manager", "true");
      navigate("/quanly");
    } else {
      setError("Tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#ea580c]/10 rounded-full blur-[128px]"></div>
      </div>
      
      <Card className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 duration-700">
        <CardHeader className="flex flex-col items-center pt-10 pb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#ea580c] to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.3)] mb-6 border-4 border-[#020617]">
            <span className="text-white font-black text-3xl tracking-tighter">TNC</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] text-center">Quản Lý Chi Nhánh</h2>
          <p className="text-white/40 text-xs tracking-widest mt-2 uppercase font-bold">Manager Portal</p>
        </CardHeader>
        
        <CardBody className="p-8 pt-2">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <Input
                type="text"
                label="Định danh quản lý"
                variant="faded"
                placeholder="Tài khoản quản lý (quanly)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                classNames={{
                  label: "text-white/60 font-bold uppercase text-[10px] tracking-widest",
                  input: "text-white font-mono font-bold",
                  inputWrapper: "bg-[#020617] border-white/10 hover:border-white/30 focus-within:!border-[#ea580c]"
                }}
              />
              <Input
                type="password"
                label="Mã truy cập"
                variant="faded"
                placeholder="Mật khẩu (quanly)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{
                  label: "text-white/60 font-bold uppercase text-[10px] tracking-widest",
                  input: "text-white font-mono font-bold",
                  inputWrapper: "bg-[#020617] border-white/10 hover:border-white/30 focus-within:!border-[#ea580c]"
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
              className="bg-[#ea580c] text-white font-black tracking-widest uppercase shadow-[0_4px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_4px_30px_rgba(234,88,12,0.5)] mt-4"
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
