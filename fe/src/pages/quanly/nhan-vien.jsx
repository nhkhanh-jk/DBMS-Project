import ManagerLayout from "@/layouts/quanly";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

const MOCK_STAFF = [
  { id: "NV-102", name: "Nguyễn Văn Tuấn", role: "Trưởng Ca", phone: "0901234567", status: "online" },
  { id: "NV-108", name: "Trần Thu Hà", role: "Bán Vé", phone: "0912345678", status: "online" },
  { id: "NV-115", name: "Lê Minh Phát", role: "Soát Vé", phone: "0923456789", status: "offline" },
  { id: "NV-120", name: "Phạm Thị Bích", role: "Bán Vé", phone: "0934567890", status: "online" },
  { id: "NV-132", name: "Hoàng Đức Anh", role: "Soát Vé", phone: "0945678901", status: "offline" },
];

export default function QuanLyNhanVien() {
  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white">Quản Lý Nhân Sự</h1>
            <p className="text-white/50 text-sm mt-1">Danh sách nhân viên tại TNC Vincom Đà Nẵng</p>
          </div>
          <Button className="bg-[#ea580c] text-white font-black">
             + THÊM NHÂN VIÊN
          </Button>
        </div>

        <Card className="bg-[#1e293b] border border-white/5 shadow-2xl">
           <CardBody className="p-0">
              <div className="overflow-x-auto">
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
                    {MOCK_STAFF.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white/40">{s.id}</td>
                        <td className="px-6 py-4 font-black text-white text-base">{s.name}</td>
                        <td className="px-6 py-4 font-bold">{s.role}</td>
                        <td className="px-6 py-4 font-mono">{s.phone}</td>
                        <td className="px-6 py-4">
                           {s.status === "online" ? (
                             <Chip size="sm" color="success" variant="flat" className="font-bold">Đang Trực</Chip>
                           ) : (
                             <Chip size="sm" color="default" variant="flat" className="font-bold opacity-50">Nghỉ</Chip>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button size="sm" variant="light" className="text-white/60 font-bold hover:text-white">Sửa Chỗ</Button>
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
