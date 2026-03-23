import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { RadioGroup, Radio } from "@heroui/radio";
import { Link } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";

const provinces = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", 
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", 
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", 
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum"
];

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const years = Array.from({ length: 80 }, (_, i) => (2024 - i).toString());

export default function DangKyPage() {
  const { t } = useTranslation();
  return (
    <TNCLayout>
      <section className="flex min-h-[90vh] items-center justify-center py-10 bg-[#fcfbf7]">
        <Card className="w-full max-w-xl p-4 shadow-xl border-t-4 border-[#b11116]">
          <CardHeader className="flex flex-col items-center pb-0 pt-2 text-center">
            <h1 className="text-2xl font-black text-[#b11116] uppercase tracking-wide">{t("registration")}</h1>
            <p className="text-sm text-default-500">{t("create-account-desc")}</p>
          </CardHeader>
          <CardBody className="overflow-visible py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                isRequired
                label={t("full-name")}
                placeholder={t("fullname-placeholder")}
                type="text"
                variant="bordered"
              />
              <Input
                isRequired
                label={t("phone-number")}
                placeholder={t("phone-placeholder")}
                type="tel"
                variant="bordered"
              />
            </div>
            
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t("birthday")}</p>
                <div className="grid grid-cols-3 gap-2">
                    <Select placeholder={t("day") || "Day"} variant="bordered" aria-label="Ngày sinh">
                        {days.map((d) => (
                            <SelectItem key={d}>{d}</SelectItem>
                        ))}
                    </Select>
                    <Select placeholder={t("month") || "Month"} variant="bordered" aria-label="Tháng sinh">
                        {months.map((m) => (
                            <SelectItem key={m}>{m}</SelectItem>
                        ))}
                    </Select>
                    <Select placeholder={t("year") || "Year"} variant="bordered" aria-label="Năm sinh">
                        {years.map((y) => (
                            <SelectItem key={y}>{y}</SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            <RadioGroup
                label={t("gender")}
                orientation="horizontal"
                color="danger"
                defaultValue="male"
            >
                <Radio value="male">{t("male")}</Radio>
                <Radio value="female">{t("female")}</Radio>
            </RadioGroup>

            <Select
              isRequired
              label={t("address") + " (Tỉnh/Thành phố)"}
              placeholder={t("select-province") || "Select province"}
              variant="bordered"
            >
              {provinces.map((province) => (
                <SelectItem key={province}>
                  {province}
                </SelectItem>
              ))}
            </Select>

            <Input
              isRequired
              label="Email"
              placeholder={t("enter-email") || "Enter email address"}
              type="email"
              variant="bordered"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                isRequired
                label={t("password")}
                placeholder={t("password-placeholder")}
                type="password"
                variant="bordered"
                />
                <Input
                isRequired
                label={t("confirm-password-label")}
                placeholder={t("enter-password")}
                type="password"
                variant="bordered"
                />
            </div>

            <Button className="w-full bg-[#f6c344] font-black text-[#651014] shadow-md mt-4" size="lg">
              {t("register-submit")}
            </Button>
          </CardBody>
          <CardFooter className="flex justify-center pt-0 border-t border-gray-100 mt-4">
            <p className="text-sm text-default-500 pt-4">
              {t("already-have-account")}{" "}
              <Link to="/dangnhap" className="font-semibold text-[#b11116] hover:underline">
                {t("login")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </section>
    </TNCLayout>
  );
}
