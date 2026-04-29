import ManagerLayout from "@/layouts/quanly";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/api";

export default function QuanLyNhanVien() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await apiRequest("/manager/staffs");
            const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
            setStaff(data.map(s => ({
                id: s.id || s._id || s.MaNhanVien || "---",
                name: s.fullName || s.HoTen || s.name || "---",
                role: (s.position || s.ChucVu || "---").toUpperCase(),
                phone: s.phone || s.Sdt || "---",
                status: s.status || (s.isOnline ? "online" : "offline")
            })));
        } catch (err) {
            console.error("Failed to fetch staff list", err);
        } finally {
            setLoading(false);
        }
    };
    fetchStaff();
  }, []);

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white">Quản Lý Nhân Sự</h1>
            <p className="text-white/50 text-sm mt-1">Danh sách nhân viên tại chi nhánh</p>
          </div>
        </div>

        <Card className="bg-[#1e293b] border border-white/5 shadow-2xl">
           <CardBody className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                    <div className="py-20 text-center text-white/20 italic">Đang tải danh sách nhân viên...</div>
                ) : (
                    <table className="w-full text-left text-sm text-white/70">
                    <thead className="bg-black/20 text-xs uppercase font-bold tracking-widest text-white/50 border-b border-white/5">
                        <tr>
                        <th className="px-6 py-4">Mã NV</th>
                        <th className="px-6 py-4">Họ và Tên</th>
                        <th className="px-6 py-4">Vị trí</th>
                        <th className="px-6 py-4">Số điện thoại</th>
                        <th className="px-6 py-4">Trạng thái ca</th>
                        <th className="px-6 py-4 text-right">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {staff.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-white/40">{s.id.toString().slice(-6)}</td>
                            <td className="px-6 py-4 font-black text-white text-base">{s.name}</td>
                            <td className="px-6 py-4 font-bold">{s.role}</td>
                            <td className="px-6 py-4 font-mono">{s.phone}</td>
                            <td className="px-6 py-4">
                            {s.status === "online" || s.status === "active" ? (
                                <Chip size="sm" color="success" variant="flat" className="font-bold">Đang Trực</Chip>
                            ) : (
                                <Chip size="sm" color="default" variant="flat" className="font-bold opacity-50">Nghỉ</Chip>
                            )}
                            </td>
                            <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="light" className="text-white/60 font-bold hover:text-white">Chi tiết</Button>
                            </td>
                        </tr>
                        ))}
                        {staff.length === 0 && (
                            <tr><td colSpan="6" className="py-20 text-center text-white/20 italic">Chưa có nhân viên nào</td></tr>
                        )}
                    </tbody>
                    </table>
                )}
              </div>
           </CardBody>
        </Card>
      </div>
    </ManagerLayout>
  );
}

