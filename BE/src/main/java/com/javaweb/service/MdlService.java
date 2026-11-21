package com.javaweb.service;

import java.util.*;

public interface MdlService {
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Lọc, tìm kiếm, sắp xếp và phân trang danh sách dữ liệu.
  Map<String, Object> list(String kind, Map<String, String> query);
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Tìm bản ghi theo ID và trả về dữ liệu chi tiết.
  Object detail(String kind, String id);
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Thêm hoặc sửa danh mục, sản phẩm, nhà cung cấp, kho và serial.
  Object save(String kind, String id, Map<String, Object> body);
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Đăng ký danh sách serial không trùng cho sản phẩm quản lý theo mã.
  Object register(String productId, Map<String, Object> body);
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Tra cứu serial bằng mã đã chuẩn hóa.
  Object lookup(String code);
  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Tạo đơn mua nháp và các dòng sản phẩm, số lượng, giá nhập.
  Object purchase(Map<String, Object> body, String userId);
  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Nhận hàng theo đơn mua, ghi serial, tăng tồn và cập nhật trạng thái đơn.
  Object receive(Map<String, Object> body, String userId);
  // Ngày thực hiện: 29/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Tạo đơn bán nháp, kiểm tra tồn và serial, chốt giá và tính tổng tiền.
  Object sale(Map<String, Object> body, String userId);
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Chuyển trạng thái sản phẩm hoặc đơn hàng; trừ tồn và đánh dấu serial khi xác nhận bán.
  Object action(String kind, String id, String action);
}
