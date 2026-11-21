import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Result } from "antd";
import { Masters, Products, Serials } from "../pages/catalog";
import { Inventory, Orders, Receipts } from "../pages/orders";
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Khai báo đường dẫn đến các màn hình nghiệp vụ.
export default function AppRoutes({ admin }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<Products admin={admin} />} />
      <Route path="/serials" element={<Serials admin={admin} />} />
      <Route
        path="/categories"
        element={<Masters key="categories" kind="categories" admin={admin} />}
      />
      <Route
        path="/suppliers"
        element={<Masters key="suppliers" kind="suppliers" admin={admin} />}
      />
      <Route
        path="/warehouses"
        element={<Masters key="warehouses" kind="warehouses" admin={admin} />}
      />
      <Route
        path="/purchase-orders"
        element={<Orders key="purchase" kind="purchase" admin={admin} />}
      />
      <Route path="/goods-receipts" element={<Receipts admin={admin} />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route
        path="/sales-orders"
        element={<Orders key="sales" kind="sales" admin={admin} />}
      />
      <Route
        path="/admin"
        element={
          <Result
            status={admin ? "success" : "403"}
            title={admin ? "Quyền quản trị" : "Không có quyền truy cập"}
          />
        }
      />
      <Route
        path="*"
        element={<Result status="404" title="Không tìm thấy trang" />}
      />
    </Routes>
  );
}
