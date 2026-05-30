import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { RadioGroup, Radio } from "@heroui/radio";
import { Link, useNavigate } from "react-router-dom";
import TNCLayout from "@/layouts/tnc";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";

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
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("male");
  const [province, setProvince] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [errors, setErrors] = useState({});

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = i18n.language === "vi-VN" ? "Vui lòng nhập họ và tên." : "Please enter your full name.";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = i18n.language === "vi-VN" ? "Vui lòng nhập số điện thoại." : "Please enter your phone number.";
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = i18n.language === "vi-VN" ? "Số điện thoại phải có 10 chữ số." : "Phone number must be 10 digits.";
    }

    if (!day || !month || !year) {
      newErrors.birthday = i18n.language === "vi-VN" ? "Vui lòng chọn đầy đủ ngày, tháng, năm sinh." : "Please select your full date of birth.";
    }

    if (!email.trim()) {
      newErrors.email = i18n.language === "vi-VN" ? "Vui lòng nhập email." : "Please enter email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      if (!email.includes("@")) {
        newErrors.email = i18n.language === "vi-VN"
          ? `Vui lòng bao gồm '@' trong địa chỉ email. '${email}' bị thiếu '@'.`
          : `Please include an '@' in the email address. '${email}' is missing an '@'.`;
      } else {
        newErrors.email = i18n.language === "vi-VN" ? "Địa chỉ email không hợp lệ." : "Invalid email address.";
      }
    }

    if (!password) {
      newErrors.password = i18n.language === "vi-VN" ? "Vui lòng nhập mật khẩu." : "Please enter password.";
    } else if (password.length < 6) {
      newErrors.password = i18n.language === "vi-VN" ? "Mật khẩu phải tối thiểu 6 ký tự." : "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = i18n.language === "vi-VN" ? "Vui lòng xác nhận mật khẩu." : "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = i18n.language === "vi-VN" ? "Mật khẩu xác nhận không khớp." : "Confirm password does not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setApiError("");
      try {
        const dateOfBirth = day && month && year ? `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}` : undefined;
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          password,
          gender,
          dateOfBirth,
        });
        const msg = i18n.language === "vi-VN" ? "Đăng ký thành công! Vui lòng đăng nhập." : "Registration successful! Please log in.";
        alert(msg);
        navigate("/dangnhap");
      } catch (err) {
        const msg = err.response?.data?.error || (i18n.language === "vi-VN" ? "Đăng ký thất bại. Vui lòng thử lại." : "Registration failed. Please try again.");
        setApiError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <TNCLayout>
      <section className="flex min-h-[90vh] items-center justify-center py-10 bg-[#fcfbf7]">
        <Card className="w-full max-w-xl p-4 shadow-xl border-t-4 border-[#b11116]">
          <CardHeader className="flex flex-col items-center pb-0 pt-2 text-center">
            <h1 className="text-2xl font-black text-[#b11116] uppercase tracking-wide">{t("registration")}</h1>
            <p className="text-sm text-default-500">{t("create-account-desc")}</p>
          </CardHeader>
          <CardBody className="overflow-visible py-6">
            <form noValidate onSubmit={handleRegister} className="space-y-6">
              {apiError && (
                <div className="bg-red-50 text-red-600 p-3 text-sm rounded-sm border border-red-200 font-medium">
                  {apiError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label={t("full-name")}
                  placeholder={t("fullname-placeholder")}
                  type="text"
                  variant="bordered"
                  value={fullName}
                  onValueChange={setFullName}
                  isInvalid={!!errors.fullName}
                  errorMessage={errors.fullName}
                />
                <Input
                  isRequired
                  label={t("phone-number")}
                  placeholder={t("phone-placeholder")}
                  type="tel"
                  variant="bordered"
                  value={phoneNumber}
                  onValueChange={setPhoneNumber}
                  isInvalid={!!errors.phoneNumber}
                  errorMessage={errors.phoneNumber}
                />
              </div>
              
              <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {t("birthday")} <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                      <Select 
                        placeholder={t("day") || "Day"} 
                        variant="bordered" 
                        aria-label={t("day")}
                        selectedKeys={day ? [day] : []}
                        onSelectionChange={(keys) => setDay(Array.from(keys)[0])}
                        isInvalid={!!errors.birthday}
                      >
                          {days.map((d) => (
                              <SelectItem key={d}>{d}</SelectItem>
                          ))}
                      </Select>
                      <Select 
                        placeholder={t("month") || "Month"} 
                        variant="bordered" 
                        aria-label={t("month")}
                        selectedKeys={month ? [month] : []}
                        onSelectionChange={(keys) => setMonth(Array.from(keys)[0])}
                        isInvalid={!!errors.birthday}
                      >
                          {months.map((m) => (
                              <SelectItem key={m}>{m}</SelectItem>
                          ))}
                      </Select>
                      <Select 
                        placeholder={t("year") || "Year"} 
                        variant="bordered" 
                        aria-label={t("year")}
                        selectedKeys={year ? [year] : []}
                        onSelectionChange={(keys) => setYear(Array.from(keys)[0])}
                        isInvalid={!!errors.birthday}
                      >
                          {years.map((y) => (
                              <SelectItem key={y}>{y}</SelectItem>
                          ))}
                      </Select>
                  </div>
                  {errors.birthday && (
                    <p className="text-xs text-[#f31260] font-medium mt-1">
                      {errors.birthday}
                    </p>
                  )}
              </div>

              <RadioGroup
                  label={t("gender")}
                  orientation="horizontal"
                  color="danger"
                  value={gender}
                  onValueChange={setGender}
              >
                  <Radio value="male">{t("male")}</Radio>
                  <Radio value="female">{t("female")}</Radio>
              </RadioGroup>

              <Select
                isRequired
                label={t("address") + (i18n.language === "vi-VN" ? " (Tỉnh/Thành phố)" : " (Province/City)")}
                placeholder={t("select-province") || "Select province"}
                variant="bordered"
                selectedKeys={province ? [province] : []}
                onSelectionChange={(keys) => setProvince(Array.from(keys)[0])}
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
                type="text"
                variant="bordered"
                value={email}
                onValueChange={setEmail}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    isRequired
                    label={t("password")}
                    placeholder={t("password-placeholder")}
                    type="password"
                    variant="bordered"
                    value={password}
                    onValueChange={setPassword}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                  />
                  <Input
                    isRequired
                    label={t("confirm-password-label")}
                    placeholder={t("enter-password")}
                    type="password"
                    variant="bordered"
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                  />
              </div>

              <Button type="submit" isLoading={loading} className="w-full bg-[#f6c344] font-black text-[#651014] shadow-md mt-4" size="lg">
                {t("register-submit")}
              </Button>
            </form>
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
