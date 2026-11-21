import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { query, request } from "../../services/api";
export const labels = {
  REGISTERED: "Đã đăng ký",
  IN_STOCK: "Trong kho",
  SOLD: "Đã bán",
  DRAFT: "Nháp",
  ORDERED: "Đã đặt",
  PARTIALLY_RECEIVED: "Nhận một phần",
  RECEIVED: "Đã nhận đủ",
  CANCELLED: "Đã hủy",
  CONFIRMED: "Đã xác nhận",
  SERIALIZED: "Theo Serial/IMEI",
  BULK: "Theo số lượng",
};
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị nhãn và màu tương ứng với trạng thái nghiệp vụ.
export const Status = ({ value }) => (
  <Tag
    color={
      ["IN_STOCK", "RECEIVED", "CONFIRMED"].includes(value)
        ? "green"
        : ["CANCELLED", "SOLD"].includes(value)
          ? "default"
          : "blue"
    }
  >
    {labels[value] ?? value}
  </Tag>
);
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị nhãn hoạt động hoặc ngừng hoạt động.
export const Active = ({ value, on = "Đang bán", off = "Ngừng" }) => (
  <Tag color={value ? "green" : "default"}>{value ? on : off}</Tag>
);
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị tiêu đề, mô tả và thao tác của trang.
export function Heading({ title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <Typography.Title level={2}>{title}</Typography.Title>
        <Typography.Text type="secondary">{description}</Typography.Text>
      </div>
      {action}
    </div>
  );
}
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Tải và hiển thị bảng dữ liệu có tìm kiếm, lọc và phân trang.
export function Listing({ path, columns, filters = {}, refresh = 0, toolbar }) {
  const [rows, setRows] = useState([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(20),
    [q, setQ] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Đưa danh sách về trang đầu khi thay đổi bộ lọc hoặc tìm kiếm.

    setPage(1);
  }, [filterKey, q]);
  useEffect(() => {
    // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Tải trang dữ liệu theo bộ lọc và quản lý trạng thái tải.

    let alive = true;
    setBusy(true);
    setError("");
    request(`${path}?${query({ ...JSON.parse(filterKey), page, pageSize, q })}`)
      .then((r) => {
        // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
        // Người thực hiện: Nguyễn Đình Duy.
        // Chức năng của hàm: Cập nhật các dòng và tổng số bản ghi khi component còn tồn tại.

        if (alive) {
          setRows(r.data);
          setTotal(r.meta.total);
        }
      })
      .catch((e) => {
        // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
        // Người thực hiện: Nguyễn Đình Duy.
        // Chức năng của hàm: Hiển thị thông báo lỗi của thao tác hiện tại.

        if (alive) setError(e.message);
      })
      .finally(() => {
        // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
        // Người thực hiện: Nguyễn Đình Duy.
        // Chức năng của hàm: Kết thúc trạng thái đang tải khi yêu cầu hoàn tất.

        if (alive) setBusy(false);
      });
    return () => {
      // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
      // Người thực hiện: Nguyễn Đình Duy.
      // Chức năng của hàm: Ngăn cập nhật trạng thái từ yêu cầu cũ sau khi effect được dọn dẹp.

      alive = false;
    };
  }, [path, filterKey, page, pageSize, q, refresh, retry]);
  return (
    <Card>
      <Space wrap className="toolbar">
        <Input.Search
          aria-label="Tìm kiếm"
          placeholder="Tìm kiếm…"
          allowClear
          onSearch={setQ}
          style={{ width: 280 }}
        />
        {toolbar}
        <Button onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Yêu cầu tải lại bảng dữ liệu. */
          setRetry((v) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Yêu cầu tải lại bảng dữ liệu. */
          v + 1)}>Tải lại</Button>
      </Space>
      {error && <Alert type="error" showIcon message={error} />}
      <Table
        rowKey="id"
        loading={busy}
        dataSource={rows}
        columns={columns}
        scroll={{ x: 800 }}
        locale={{ emptyText: "Chưa có dữ liệu" }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
             Người thực hiện: Nguyễn Đình Duy.
             Chức năng của hàm: Hiển thị tổng số kết quả tìm được. */
            `${t} kết quả`,
          onChange: (p, s) => {
            // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Cập nhật trang hiện tại và số bản ghi mỗi trang.

            setPage(p);
            setPageSize(s);
          },
        }}
      />
    </Card>
  );
}
export const required = [
  { required: true, message: "Vui lòng nhập thông tin" },
];
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Chuyển danh sách bản ghi thành lựa chọn có ID và nhãn.
export const options = (rows, code = false) =>
  rows.map((r) => (/* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
     Người thực hiện: Nguyễn Đình Duy.
     Chức năng của hàm: Tạo lựa chọn gồm ID và nhãn tên hoặc mã kèm tên. */
    {
    value: r.id,
    label: code ? `${r.sku ?? r.code} · ${r.name}` : r.name,
  }));
