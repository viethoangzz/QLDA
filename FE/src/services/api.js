// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Gửi HTTP request kèm cookie phiên, đọc JSON và xử lý lỗi API.
export async function request(path, method = "GET", body) {
  const response = await fetch(`/api/v1${path}`, {
    credentials: "include",
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login")
      window.dispatchEvent(new Event("session-expired"));
    throw new Error(
      [result.error?.message ?? "Không thể thực hiện yêu cầu"]
        .flat()
        .join(", "),
    );
  }
  return result;
}
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Gửi yêu cầu API và trả về trường data.
export async function api(path, method = "GET", body) {
  return (await request(path, method, body)).data;
}
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Mã hóa các tham số có giá trị thành chuỗi truy vấn URL.
export const query = (params) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Loại bỏ tham số truy vấn rỗng, null hoặc undefined. */
        v !== undefined && v !== null && v !== "")
      .map(([k, v]) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Chuyển giá trị tham số truy vấn thành chuỗi. */
        [k, String(v)]),
  ).toString();
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Tải lần lượt các trang API để lấy toàn bộ bản ghi.
export async function all(path, params = {}) {
  const rows = [];
  let page = 1;
  for (;;) {
    const r = await request(
      `${path}?${query({ ...params, page, pageSize: 100 })}`,
    );
    rows.push(...r.data);
    if (rows.length >= r.meta.total) return rows;
    page++;
  }
}
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Định dạng giá trị tiền theo VND và quy ước tiếng Việt.
export const money = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(v ?? 0),
  );
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Định dạng ngày giờ theo múi giờ Việt Nam.
export const date = (v) =>
  v
    ? new Date(v)
        .toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", "")
    : "—";
