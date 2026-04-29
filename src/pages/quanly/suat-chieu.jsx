import { useState, useEffect, useRef } from "react";
import ManagerLayout from "@/layouts/quanly";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { apiRequest } from "@/utils/api";

export default function QuanLySuatChieu() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/manager/showtimes");
      const data = Array.isArray(res) ? res : (res?.items || res?.data || []);
      
      setShowtimes(data.map(s => {
        const startTimeStr = s.startTime || s.ThoiGianBatDau || s.GioBatDau;
        
        let dateVal = "---";
        let timeVal = "---";

        if (startTimeStr) {
            const dt = new Date(startTimeStr);
            if (!isNaN(dt.getTime())) {
                dateVal = dt.toLocaleDateString("vi-VN");
                timeVal = dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            } else {
                timeVal = startTimeStr;
            }
        }

        return {
            id: s._id || s.id || s.MaSuat || s.MaSuatChieu,
            movie: s.movieTitle || s.TenPhim || s.movie?.title || "---",
            room: s.roomName || s.TenPhong || s.room?.name || "---",
            date: dateVal,
            time: timeVal,
            format: s.format || s.DinhDang || "2D",
            status: (s.status || s.TrangThai || "SAP_CHIEU").toLowerCase()
        };
      }));
    } catch (err) {
      console.error("Failed to fetch showtimes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiRequest("/manager/showtimes/import", {
        method: "POST",
        body: formData,
        headers: {
          // Content-Type is automatically set by browser for FormData
          "Content-Type": undefined, 
        }
      });

      setIsUploading(false);
      setUploadSuccess(true);
      fetchShowtimes();
    } catch (err) {
      alert("Tải lên thất bại: " + err.message);
      setIsUploading(false);
    }
  };

  const STATUS_MAP = {
    dang_chieu: { label: "Đang Chiếu", color: "success" },
    sap_chieu:  { label: "Sắp Chiếu", color: "warning" },
    da_chieu:   { label: "Đã Chiếu", color: "default" },
    active:     { label: "Hoạt động", color: "success" },
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
             <span className="text-xl">✅</span> CẬP NHẬT THÀNH CÔNG: Lịch chiếu đã được đồng bộ với hệ thống.
          </div>
        )}

        <Card className="bg-[#1e293b] border border-white/5 shadow-2xl">
           <CardBody className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                    <div className="py-20 text-center text-white/20 italic">Đang tải lịch chiếu...</div>
                ) : (
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
                            <td className="px-6 py-4 font-mono font-bold text-white/40">#{s.id?.slice(-4) || s.id}</td>
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
                            <Chip size="sm" color={STATUS_MAP[s.status]?.color || "default"} variant="dot" className="border-none bg-transparent">
                                {STATUS_MAP[s.status]?.label || s.status}
                            </Chip>
                            </td>
                            <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="light" className="text-white/60 font-bold hover:text-white">Sửa</Button>
                            <Button size="sm" variant="light" className="text-red-400 font-bold hover:text-red-500">Xóa</Button>
                            </td>
                        </tr>
                        ))}
                        {showtimes.length === 0 && (
                            <tr><td colSpan="8" className="py-20 text-center text-white/20 italic">Chưa có suất chiếu nào được tạo</td></tr>
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

