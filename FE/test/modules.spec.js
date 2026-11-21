import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("FE React + BE Spring: nhập 2 → bán 1 → tồn 1", async ({ page }) => {
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Kiểm thử giao diện nhập hai, bán một, tồn một và trạng thái serial cùng phân quyền.

  page.on("requestfailed", (r) =>
    /* Ngày thực hiện: 15/11/2026 (theo kế hoạch).
     Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
     Chức năng của hàm: Ghi thông tin request thất bại trong quá trình kiểm thử. */
    console.log("REQUEST FAILED", r.url(), r.failure()),
  );
  page.on("console", (m) => {
    // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
    // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
    // Chức năng của hàm: Ghi lỗi console của trình duyệt để chẩn đoán kiểm thử.

    if (m.type() === "error") console.log("BROWSER", m.text());
  });
  const prefix = "UI-" + randomUUID().slice(0, 8).toUpperCase();
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Đăng nhập trên trình duyệt và kiểm tra màn hình sản phẩm.
  const login = async (email) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page
      .getByLabel("Mật khẩu", { exact: true })
      .fill(process.env.SEED_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Sản phẩm", exact: true }),
    ).toBeVisible();
  };
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Chọn giá trị trong danh sách Ant Design theo nhãn.
  const select = async (label, value) => {
    await page.getByLabel(label, { exact: true }).click();
    await page
      .locator(".ant-select-dropdown:visible")
      .getByText(value, { exact: true })
      .click();
  };
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Bấm nút Đồng ý của hộp thoại hiện tại.
  const ok = () =>
    page
      .getByRole("dialog")
      .getByRole("button", { name: "Đồng ý", exact: true })
      .click();
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Đóng khung chi tiết đang mở.
  const close = () =>
    page.locator(".ant-drawer:visible .ant-drawer-close").click();
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Xác nhận thao tác trong Popconfirm.
  const confirm = () =>
    page
      .locator(".ant-popconfirm:visible")
      .getByRole("button", { name: "Đồng ý", exact: true })
      .click();
  await login("admin@example.local");
  await page
    .getByRole("button", { name: "Thêm sản phẩm", exact: true })
    .click();
  await page.getByLabel("SKU", { exact: true }).fill(prefix);
  await page
    .getByLabel("Tên sản phẩm", { exact: true })
    .fill(prefix + " laptop");
  await page.getByLabel("Hãng", { exact: true }).fill("Demo");
  await select("Danh mục", "Điện tử");
  await page.getByLabel("Giá bán (VNĐ)", { exact: true }).fill("15000000");
  await ok();
  await expect(page.locator(".ant-modal")).toBeHidden();
  await page
    .getByRole("menuitem", { name: "Đơn mua hàng", exact: true })
    .click();
  await page.getByRole("button", { name: "Tạo đơn mua", exact: true }).click();
  await select("Nhà cung cấp", "NCC-01 · Nhà cung cấp demo");
  await select("Sản phẩm", prefix + " · " + prefix + " laptop");
  await page.getByLabel("Số lượng đặt", { exact: true }).fill("2");
  await page.getByLabel("Giá nhập (VNĐ)", { exact: true }).fill("10000000");
  await page.getByRole("button", { name: "Lưu đơn nháp", exact: true }).click();
  await expect(page.locator(".ant-modal")).toBeHidden();
  const drawer = page.locator(".ant-drawer:visible");
  const po = await drawer.locator(".ant-drawer-title").innerText();
  await drawer
    .getByRole("button", { name: "Gửi đơn mua", exact: true })
    .click();
  await confirm();
  await expect(drawer.getByText("Đã đặt", { exact: true })).toBeVisible();
  await close();
  await page.getByRole("menuitem", { name: "Phiếu nhập", exact: true }).click();
  await page
    .getByRole("button", { name: "Tạo phiếu nhập", exact: true })
    .click();
  await select("Đơn mua còn hàng chưa nhận", po + " · Nhà cung cấp demo");
  await select("Kho nhận", "KHO-HN · Kho Hà Nội");
  await page
    .getByLabel("Số lượng nhận (0 để bỏ qua)", { exact: true })
    .fill("2");
  await page
    .getByLabel("Mỗi dòng một mã (đã đăng ký hoặc mã mới)", { exact: true })
    .fill(prefix + "-A\n" + prefix + "-B");
  await page.getByRole("button", { name: "Nhập kho", exact: true }).click();
  await expect(page.locator(".ant-modal")).toBeHidden();
  await expect(
    page
      .locator(".ant-drawer:visible")
      .getByText(prefix + "-A, " + prefix + "-B", { exact: true }),
  ).toBeVisible();
  await close();
  await page.getByRole("menuitem", { name: "Tồn kho", exact: true }).click();
  await page.getByPlaceholder("Tìm kiếm…").fill(prefix);
  await page.getByPlaceholder("Tìm kiếm…").press("Enter");
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: prefix })
      .getByRole("cell", { name: "2", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await login("staff@example.local");
  await expect(
    page.getByRole("button", { name: "Thêm sản phẩm", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("menuitem", { name: "Đơn bán hàng", exact: true })
    .click();
  await page.getByRole("button", { name: "Tạo đơn bán", exact: true }).click();
  await select("Kho xuất", "KHO-HN · Kho Hà Nội");
  await select("Sản phẩm", prefix + " · " + prefix + " laptop");
  await select("Serial đang trong kho", prefix + "-A");
  await page
    .getByRole("dialog")
    .getByText("Tạo đơn bán", { exact: true })
    .click();
  await page.getByRole("button", { name: "Lưu đơn nháp", exact: true }).click();
  await expect(page.locator(".ant-modal")).toBeHidden();
  await page.getByRole("button", { name: "Xác nhận bán", exact: true }).click();
  await confirm();
  await expect(
    page
      .locator(".ant-drawer:visible")
      .getByText("Đã xác nhận", { exact: true }),
  ).toBeVisible();
  await close();
  await page.getByRole("menuitem", { name: "Tồn kho", exact: true }).click();
  await page.getByPlaceholder("Tìm kiếm…").fill(prefix);
  await page.getByPlaceholder("Tìm kiếm…").press("Enter");
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: prefix })
      .getByRole("cell", { name: "1", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/inventory-preview.png", fullPage: true });
  await page
    .getByRole("menuitem", { name: "Serial / IMEI", exact: true })
    .click();
  await page.getByPlaceholder("Tìm kiếm…").fill(prefix);
  await page.getByPlaceholder("Tìm kiếm…").press("Enter");
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: prefix + "-A" })
      .getByText("Đã bán", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: prefix + "-B" })
      .getByText("Trong kho", { exact: true }),
  ).toBeVisible();
});
