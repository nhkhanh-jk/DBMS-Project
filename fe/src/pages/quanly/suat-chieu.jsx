import { useState, useRef } from "react";
import ManagerLayout from "@/layouts/quanly";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

const INIT_SHOWTIMES = [
  { id: 1, movie: "QUỶ NHẬP TRÀNG 2", room: "Phòng 1", time: "19:00", date: "23/03/2026", format: "2D", status: "sap_chieu" },
  { id: 2, movie: "CÚ NHẢY KỲ DIỆU", room: "Phòng 2", time: "14:00", date: "23/03/2026", format: "2D", status: "dang_chieu" },
  { id: 3, movie: "SIÊU TRỘM QUYẾT CHIẾN", room: "Phòng 3", time: "21:30", date: "23/03/2026", format: "IMAX", status: "sap_chieu" },
];

const MOCK_EXCEL_IMPORTED = [
  ...INIT_SHOWTIMES,
  { id: 4, movie: "THOÁT KHỎI TẬN THẾ", room: "Phòng 1", time: "09:00", date: "24/03/2026", format: "3D", status: "sap_chieu" },
  { id: 5, movie: "ĐÊM NGÀY XA MẸ", room: "Phòng 2", time: "11:15", date: "24/03/2026", format: "2D", status: "sap_chieu" },
  { id: 6, movie: "QUỶ NHẬP TRÀNG 3", room: "Phòng 3", time: "20:00", date: "24/03/2026", format: "IMAX", status: "sap_chieu" },
];

export default function QuanLySuatChieu() {
  const [showtimes, setShowtimes] = useState(INIT_SHOWTIMES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate Excel parsing
    setIsUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setShowtimes(MOCK_EXCEL_IMPORTED);
    }, 2000);
  };

  const STATUS_MAP = {
    dang_chieu: { label: "Đang Chiếu", color: "success" },
    sap_chieu:  { label: "Sắp Chiếu", color: "warning" },
    da_chieu:   { label: "Đã Chiếu", color: "default" },
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Quản Lý Suất Chiếu</h1>
            <p className="text-white/50 text-sm mt-1">Hệ thống phân bổ lịch chiếu tại chi nhánh</p>
          </div>
          
          <Button 
            className="bg-[#ea580c] text-white font-black"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
          >
            {isUploading ? "Đang xử lý..." : "📥 TẢI LÊN LỊCH CHIẾU (EXCEL)"}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileChange}
          />
        </div>

        {uploadSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-sm tracking-widest flex items-center gap-3">
             <span className="text-xl">✅</span> CẬP NHẬT THÀNH CÔNG: Đã đọc được 3 suất chiếu từ file Excel và thêm vào hệ thống.
          </div>
        )}

        <Card className="bg-[#1e293b] border border-white/5 shadow-2xl">
           <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/70">
                  <thead className="bg-black/20 text-xs uppercase font-bold tracking-widest text-white/50 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Mã Ca</th>
                      <th className="px-6 py-4">Tên Phim</th>
                      <th className="px-6 py-4">Phòng</th>
                      <th className="px-6 py-4">Ngày Chiếu</th>
                      <th className="px-6 py-4">Giờ</th>
                      <th className="px-6 py-4">Định dạng</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {showtimes.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white/40">#{s.id}</td>
                        <td className="px-6 py-4 font-black text-white text-base">{s.movie}</td>
                        <td className="px-6 py-4 font-bold">{s.room}</td>
                        <td className="px-6 py-4 font-mono">{s.date}</td>
                        <td className="px-6 py-4 font-black text-[#ea580c]">{s.time}</td>
                        <td className="px-6 py-4">
                           <Chip size="sm" variant="flat" className="bg-white/10 text-white font-bold block w-fit">
                             {s.format}
                           </Chip>
                        </td>
                        <td className="px-6 py-4">
                           <Chip size="sm" color={STATUS_MAP[s.status].color} variant="dot" className="border-none bg-transparent">
                              {STATUS_MAP[s.status].label}
                           </Chip>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button size="sm" variant="light" className="text-white/60 font-bold hover:text-white">Sửa</Button>
                           <Button size="sm" variant="light" className="text-red-400 font-bold hover:text-red-500">Xóa</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </CardBody>
        </Card>
      </div>
    </ManagerLayout>
  );
}
