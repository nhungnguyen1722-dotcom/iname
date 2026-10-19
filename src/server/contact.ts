"use server";

import { z } from "zod";
import { sql } from "@/lib/db";

const schema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên từ 2 ký tự.").max(255),
  phone: z.string().trim().regex(/^[0-9+\s().-]{9,16}$/, "Số điện thoại chưa hợp lệ, vui lòng nhập 9 đến 11 chữ số."),
  email: z.string().trim().email("Email chưa hợp lệ.").optional().or(z.literal("")),
  companyName: z.string().trim().max(255).optional(),
  service: z.string().trim().min(1, "Vui lòng chọn dịch vụ bạn quan tâm.").max(255),
  packageName: z.string().trim().max(255).optional(),
  message: z.string().trim().max(4000).optional(),
  sourcePath: z.string().trim().max(180).optional(),
  website: z.string().optional(),
});

export type ContactState = { ok: boolean; message: string };

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (String(formData.get("website") || "").trim()) {
    return { ok: true, message: "Đã gửi yêu cầu. Chuyên viên Iname sẽ liên hệ với bạn trong giờ làm việc." };
  }
  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    companyName: formData.get("companyName") || "",
    service: formData.get("service"),
    packageName: formData.get("packageName") || "",
    message: formData.get("message") || "",
    sourcePath: formData.get("sourcePath") || "",
    website: formData.get("website") || "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || "Dữ liệu chưa hợp lệ." };
  }
  const data = parsed.data;
  const digits = data.phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 11) {
    return { ok: false, message: "Số điện thoại chưa hợp lệ, vui lòng nhập 9 đến 11 chữ số." };
  }
  const recent = await sql<{ id: number }>(
    `SELECT id FROM contact_requests
     WHERE phone = $1 AND created_at > NOW() - INTERVAL '60 seconds'
     LIMIT 1`,
    [data.phone.trim()],
  );
  if (recent.length) {
    return { ok: false, message: "Yêu cầu vừa được gửi. Vui lòng đợi một phút trước khi gửi lại." };
  }
  try {
    await sql(
      `INSERT INTO contact_requests
        (full_name, phone, email, company_name, service, package_name, message, source_path, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'new')`,
      [
        data.fullName,
        data.phone.trim(),
        data.email || null,
        data.companyName || null,
        data.service,
        data.packageName || null,
        data.message || null,
        data.sourcePath || null,
      ],
    );
  } catch {
    return { ok: false, message: "Không gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline để được hỗ trợ ngay." };
  }
  return { ok: true, message: "Đã gửi yêu cầu. Chuyên viên Iname sẽ liên hệ với bạn trong giờ làm việc." };
}
