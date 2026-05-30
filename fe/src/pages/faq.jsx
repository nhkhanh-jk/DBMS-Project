import TNCLayout from "@/layouts/tnc";
import { Card, CardBody } from "@heroui/card";

export default function FAQPage() {
  return (
    <TNCLayout>
      <section className="mx-auto max-w-4xl px-4 py-14 min-h-[60vh]">
        <h1 className="mb-8 text-3xl font-black md:text-4xl text-center uppercase text-[#b11116]">
          Câu Hỏi Thường Gặp (FAQ)
        </h1>
        <Card className="shadow-lg">
          <CardBody className="p-8 prose prose-slate max-w-none space-y-6">
            <p className="text-center text-[#666]">Danh sách các câu hỏi thường gặp liên quan đến việc đặt vé, thay đổi vé, và sử dụng thẻ thành viên.</p>
          </CardBody>
        </Card>
      </section>
    </TNCLayout>
  );
}
