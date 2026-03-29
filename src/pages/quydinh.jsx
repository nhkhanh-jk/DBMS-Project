import TNCLayout from "@/layouts/tnc";

export default function QuyDinhPage() {
  return (
    <TNCLayout>
      <section className="bg-[#080812] min-h-[60vh] py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-black text-white md:text-4xl text-center uppercase">
            <span className="text-[#b11116]">Điều Khoản</span> Sử Dụng &amp; Quy Định
          </h1>
          <div className="bg-[#12121E] border border-white/5 rounded-2xl p-8 space-y-7">
            {[
              { num: 1, title: "Chấp nhận điều khoản", body: "Bằng việc truy cập và sử dụng trang web TNC Cinemas, bạn đồng ý tuân thủ các điều khoản và quy định được liệt kê dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi." },
              { num: 2, title: "Quy định đặt vé trực tuyến", body: "Khách hàng cần đăng nhập tài khoản TNC Member để thực hiện giao dịch mua vé. Vui lòng kiểm tra kỹ thông tin suất chiếu, rạp chiếu, và ghế ngồi trước khi hoàn tất thanh toán. Vé đã mua không thể hoàn trả hay đổi lịch trừ các trường hợp do lỗi nền tảng hoặc phía rạp TNC Cinemas." },
              { num: 3, title: "Chính sách bảo mật", body: "Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Dữ liệu thẻ thanh toán của bạn hoàn toàn được mã hóa và xử lý bởi các đối tác cổng thanh toán uy tín. TNC Cinemas không trực tiếp lưu trữ số thẻ ngân hàng của bạn." },
              { num: 4, title: "Quy định phòng vé và rạp chiếu", body: "Khách hàng vui lòng đến rạp trước 15 phút để lấy vé và mua combo bắp nước. Không mang đồ ăn thức uống từ bên ngoài vào rạp. Trẻ em dưới độ tuổi quy định của phim sẽ không được phép vào rạp, kể cả khi có người lớn đi kèm." },
            ].map(({ num, title, body }) => (
              <div key={num} className="border-b border-white/5 pb-7 last:border-0 last:pb-0">
                <h2 className="text-base font-black text-white mb-2">{num}. {title}</h2>
                <p className="text-sm text-white/50 leading-7">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TNCLayout>
  );
}
