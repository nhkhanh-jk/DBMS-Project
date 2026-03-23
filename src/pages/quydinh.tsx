import TNCLayout from "@/layouts/tnc";
import { Card, CardBody } from "@heroui/card";

export default function QuyDinhPage() {
  return (
    <TNCLayout>
      <section className="mx-auto max-w-4xl px-4 py-14 min-h-[60vh]">
        <h1 className="mb-8 text-3xl font-black text-[#222] md:text-4xl text-center uppercase text-[#b11116]">
          Điều Khoản Sử Dụng & Quy Định
        </h1>
        <Card className="shadow-lg">
          <CardBody className="p-8 prose prose-slate max-w-none space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#222]">1. Chấp nhận điều khoản</h2>
              <p className="mt-2 text-[#666] leading-relaxed">
                Bằng việc truy cập và sử dụng trang web TNC Cinemas, bạn đồng ý tuân thủ các điều khoản và quy định được liệt kê dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-[#222]">2. Quy định đặt vé trực tuyến</h2>
              <p className="mt-2 text-[#666] leading-relaxed">
                Khách hàng cần đăng nhập tài khoản TNC Member để thực hiện giao dịch mua vé. Vui lòng kiểm tra kỹ thông tin suất chiếu, rạp chiếu, và ghế ngồi trước khi hoàn tất thanh toán. Vé đã mua không thể hoàn trả hay đổi lịch trừ các trường hợp do lỗi nền tảng hoặc phía rạp TNC Cinemas.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#222]">3. Chính sách bảo mật</h2>
              <p className="mt-2 text-[#666] leading-relaxed">
                Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Dữ liệu thẻ thanh toán của bạn hoàn toàn được mã hóa và xử lý bởi các đối tác cổng thanh toán uy tín. TNC Cinemas không trực tiếp lưu trữ số thẻ ngân hàng của bạn.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#222]">4. Quy định phòng vé và rạp chiếu</h2>
              <p className="mt-2 text-[#666] leading-relaxed">
                Khách hàng vui lòng đến rạp trước 15 phút để lấy vé và mua combo bắp nước. Không mang đồ ăn thức uống từ bên ngoài vào rạp. Trẻ em dưới độ tuổi quy định của phim sẽ không được phép vào rạp, kể cả khi có người lớn đi kèm (tuân thủ luật điện ảnh hiện hành).
              </p>
            </div>
          </CardBody>
        </Card>
      </section>
    </TNCLayout>
  );
}
