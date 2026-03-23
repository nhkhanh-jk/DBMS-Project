import TNCLayout from "@/layouts/tnc";
import { Card, CardBody } from "@heroui/card";

export default function LienHePage() {
  return (
    <TNCLayout>
      <section className="mx-auto max-w-4xl px-4 py-14 min-h-[60vh]">
        <h1 className="mb-8 text-3xl font-black md:text-4xl text-center uppercase text-[#b11116]">
          Liên Hệ TNC
        </h1>
        <Card className="shadow-lg">
          <CardBody className="p-8 prose prose-slate max-w-none space-y-6">
            <p className="text-center text-[#666]">Thông tin liên hệ các cụm rạp và văn phòng đại diện đang được lên hệ thống.</p>
          </CardBody>
        </Card>
      </section>
    </TNCLayout>
  );
}
