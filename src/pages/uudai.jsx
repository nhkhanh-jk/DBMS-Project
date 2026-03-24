import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

export default function UuDaiPage() {
  const { t } = useTranslation();
  const offers = [
    {
      title: t("offer-1-title"),
      desc: t("offer-1-desc"),
    },
    {
      title: t("offer-2-title"),
      desc: t("offer-2-desc"),
    },
    {
      title: t("offer-3-title"),
      desc: t("offer-3-desc"),
    },
  ];

  return (
    <TNCLayout>
      {/* Offers List */}
      <section className="mx-auto max-w-7xl px-4 py-14 min-h-[50vh]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#b11116]">{t("promotions")}</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl text-[#222]">{t("promotions")} & {t("offer").toLowerCase()}</h2>
          </div>
          <Button className="font-bold text-[#b11116]" variant="light">
            {t("view-all")}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {offers.map((offer, index) => (
            <Card
              key={offer.title}
              className="rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-black/5"
            >
              <CardBody className="p-0">
                <div className="mb-5 inline-flex w-fit rounded-full bg-[#f6c344] px-4 py-1 text-xs font-black text-[#651014]">
                  {t("offer").toUpperCase()} {index + 1}
                </div>
                <h3 className="text-2xl font-black leading-tight text-[#222]">{offer.title}</h3>
                <p className="mt-3 leading-7 text-[#666]">{offer.desc}</p>
                <Button
                  className="mt-6 border border-[#b11116] font-bold text-[#b11116] transition hover:bg-[#b11116] hover:text-white"
                  radius="full"
                  variant="bordered"
                >
                  {t("details-view")}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </TNCLayout>
  );
}
