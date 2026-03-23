import TNCLayout from "@/layouts/tnc";
import { Card, CardBody } from "@heroui/card";

export default function GioiThieuPage() {
  return (
    <TNCLayout>
      <section className="mx-auto max-w-4xl px-4 py-14 min-h-[60vh]">
        <h1 className="mb-8 text-3xl font-black md:text-4xl text-center uppercase text-[#b11116]">
          Giới Thiệu TNC Việt Nam
        </h1>
        <Card className="shadow-lg">
          <CardBody className="p-8 prose prose-slate max-w-none space-y-6">
            <p className="text-center text-[#666]">Nội dung giới thiệu về TNC Vietnam đang được cập nhật...</p>
          </CardBody>
        </Card>
      </section>
    </TNCLayout>
  );
}
