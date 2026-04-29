import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { apiRequest, persistAuth } from "@/utils/api";

export default function ManagerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/manager/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      persistAuth(response, { username, role: "QUANLY" });
      localStorage.setItem("tnc_manager", "true");
      navigate("/quanly");
    } catch (err) {
      setError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4"><Card className="w-full max-w-md"><CardHeader><h2>Manager Portal</h2></CardHeader><CardBody><form onSubmit={handleLogin} className="space-y-4"><Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} /><Input type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />{error && <div className="text-red-500 text-sm">{error}</div>}<Button type="submit" isLoading={loading} fullWidth>Đăng nhập</Button></form></CardBody></Card></div>;
}
