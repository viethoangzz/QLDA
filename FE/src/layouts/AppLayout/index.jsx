import React, { useContext } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  App as AntApp,
  Button,
  Layout,
  Menu,
  Space,
  Tag,
  Typography,
} from "antd";
import { Auth } from "../../context/Auth";
import { api } from "../../services/api";
import AppRoutes from "../../routes/index.jsx";
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị bố cục, menu theo module và thao tác đăng xuất.
export default function AppLayout() {
  const { user, setUser } = useContext(Auth);
  const navigate = useNavigate(),
    location = useLocation();
  const { message } = AntApp.useApp();
  if (!user) return <Navigate to="/login" replace />;
  const admin = user.role === "ADMIN";
  const modules = {
    catalog: { tag: "MDL1", name: "Hàng hóa", color: "cyan" },
    purchase: { tag: "MDL2", name: "Mua hàng & Kho", color: "gold" },
    sales: { tag: "MDL3", name: "Bán hàng", color: "geekblue" },
  };
  const menus = [
    {
      key: "catalog",
      type: "group",
      label: "MDL1 · HÀNG HÓA",
      children: [
        { key: "/products", label: "Sản phẩm" },
        { key: "/serials", label: "Serial / IMEI" },
        { key: "/categories", label: "Danh mục" },
      ],
    },
    {
      key: "purchase",
      type: "group",
      label: "MDL2 · MUA HÀNG & KHO",
      children: [
        { key: "/suppliers", label: "Nhà cung cấp" },
        { key: "/purchase-orders", label: "Đơn mua hàng" },
        { key: "/goods-receipts", label: "Phiếu nhập" },
        { key: "/inventory", label: "Tồn kho" },
        { key: "/warehouses", label: "Kho hàng" },
      ],
    },
    {
      key: "sales",
      type: "group",
      label: "MDL3 · BÁN HÀNG",
      children: [{ key: "/sales-orders", label: "Đơn bán hàng" }],
    },
  ];
  const current = menus
    .map((g) => (/* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
       Người thực hiện: Nguyễn Đình Duy.
       Chức năng của hàm: Tìm mục menu tương ứng với đường dẫn hiện tại. */
      { g, item: g.children.find((c) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
       Người thực hiện: Nguyễn Đình Duy.
       Chức năng của hàm: Tìm mục menu tương ứng với đường dẫn hiện tại. */
      c.key === location.pathname) }))
    .find((x) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
       Người thực hiện: Nguyễn Đình Duy.
       Chức năng của hàm: Chọn nhóm menu chứa trang đang mở. */
      x.item);
  const mod = current && modules[current.g.key];
  return (
    <Layout className="app-layout">
      <Layout.Sider breakpoint="lg" collapsedWidth="0" width={245}>
        <div className="brand">
          <span className="brand-mark">ĐM</span>
          <div>
            ĐIỆN MÁY<small>Quản lý vận hành</small>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
             Người thực hiện: Nguyễn Đình Duy.
             Chức năng của hàm: Chuyển đến đường dẫn của mục menu được chọn. */
            navigate(key)}
          items={menus}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="header">
          <Space className="header-title">
            {mod ? (
              <>
                <Tag color={mod.color} style={{ marginInlineEnd: 0 }}>
                  {mod.tag}
                </Tag>
                <Typography.Text type="secondary" className="header-module">
                  {mod.name} /
                </Typography.Text>
                <Typography.Text strong>{current.item.label}</Typography.Text>
              </>
            ) : (
              <Typography.Text strong>Không gian làm việc</Typography.Text>
            )}
          </Space>
          <Space className="header-user">
            <span className="user-email">{user.email}</span>
            <Tag color={admin ? "green" : "default"}>
              {admin ? "Quản trị viên" : "Nhân viên"}
            </Tag>
            <Button
              size="small"
              onClick={async () => {
                // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                // Người thực hiện: Nguyễn Đình Duy.
                // Chức năng của hàm: Gọi API đăng xuất và xóa trạng thái người dùng.

                try {
                  await api("/auth/logout", "POST", {});
                  setUser(null);
                } catch (e) {
                  message.error(e.message);
                }
              }}
            >
              Đăng xuất
            </Button>
          </Space>
        </Layout.Header>
        <Layout.Content className="content">
          <AppRoutes admin={admin} />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
