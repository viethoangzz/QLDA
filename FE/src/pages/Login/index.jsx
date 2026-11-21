import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Tag, Typography } from "antd";
import { Auth } from "../../context/Auth";
import { api } from "../../services/api";
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị biểu mẫu đăng nhập và chuyển trang khi đã xác thực.
export default function Login() {
  const { user, setUser } = useContext(Auth);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (user) return <Navigate to="/products" replace />;
  return (
    <main className="login">
      <div className="login-intro">
        <Tag color="blue">ĐIỆN MÁY • QUẢN LÝ NỘI BỘ</Tag>
        <h1>
          Quản lý hàng hóa.
          <br />
          Theo dõi từng serial.
        </h1>
        <p>Sản phẩm, mua hàng và bán hàng trong cùng một hệ thống.</p>
      </div>
      <Card className="login-card">
        <Typography.Title level={2}>Đăng nhập</Typography.Title>
        <Typography.Paragraph type="secondary">
          Sử dụng tài khoản được quản trị viên cấp.
        </Typography.Paragraph>
        {error && <Alert type="error" showIcon message={error} />}
        <Form
          layout="vertical"
          onFinish={async (b) => {
            // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Gửi thông tin đăng nhập, lưu người dùng và hiển thị lỗi nếu có.

            setBusy(true);
            setError("");
            try {
              setUser(await api("/auth/login", "POST", b));
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={busy} block>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </main>
  );
}
