import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";
import { api } from "./services/api";
import { Auth } from "./context/Auth";
import Login from "./pages/Login/index.jsx";
import AppLayout from "./layouts/AppLayout";
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Khởi tạo trạng thái đăng nhập và định tuyến ứng dụng.
export default function App() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Khôi phục người dùng từ phiên và đăng ký sự kiện hết phiên.

    // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Xóa người dùng khi phiên đăng nhập hết hạn.
    const expire = () => setUser(null);
    window.addEventListener("session-expired", expire);
    api("/auth/me")
      .then(setUser)
      .catch(() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Xóa thông tin người dùng khỏi trạng thái đăng nhập. */
        setUser(null))
      .finally(() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Kết thúc trạng thái đang tải khi yêu cầu hoàn tất. */
        setLoading(false));
    return () => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
       Người thực hiện: Nguyễn Đình Duy.
       Chức năng của hàm: Gỡ sự kiện hết phiên khi component bị hủy. */
      window.removeEventListener("session-expired", expire);
  }, []);
  if (loading)
    return (
      <div className="login">
        <Spin size="large" />
      </div>
    );
  return (
    <Auth.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<AppLayout />} />
      </Routes>
    </Auth.Provider>
  );
}
