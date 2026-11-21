package com.javaweb.controller;

import com.javaweb.repository.entity.UserEntity;
import com.javaweb.service.MdlService;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class MdlController {

  private final MdlService service;

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Khởi tạo controller với dịch vụ nghiệp vụ.
  public MdlController(MdlService service) {
    this.service = service;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra quyền quản trị trước thao tác hạn chế.
  private static void admin(UserEntity u) {
    if (!u.role.equals("ADMIN")) throw new ResponseStatusException(
      HttpStatus.FORBIDDEN,
      "Chỉ quản trị viên được thực hiện"
    );
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đóng gói kết quả vào trường data của phản hồi.
  private Map<String, Object> data(Object value) {
    return Map.of("data", value);
  }

  @GetMapping("/{kind}")
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Tiếp nhận yêu cầu danh sách, tìm kiếm và phân trang theo loại dữ liệu.
  public Object list(
    @PathVariable String kind,
    @RequestParam Map<String, String> q
  ) {
    return service.list(kind, q);
  }

  @GetMapping("/inventory/{kind}")
  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Trả về tồn kho hoặc lịch sử biến động kho theo bộ lọc.
  public Object inventory(
    @PathVariable String kind,
    @RequestParam Map<String, String> q
  ) {
    return service.list("inventory/" + kind, q);
  }

  @GetMapping("/serials/available")
  // Ngày thực hiện: 29/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Lấy serial còn trong kho theo sản phẩm và kho đã chọn.
  public Object available(@RequestParam Map<String, String> query) {
    Map<String, String> q = new HashMap<>(query);
    if (
      !q.containsKey("productId") || !q.containsKey("warehouseId")
    ) throw new ResponseStatusException(
      HttpStatus.BAD_REQUEST,
      "Cần chọn sản phẩm và kho"
    );
    q.put("status", "IN_STOCK");
    return service.list("serials", q);
  }

  @GetMapping("/serials/lookup/{code}")
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Tra cứu thông tin serial theo mã.
  public Object lookup(@PathVariable String code) {
    return data(service.lookup(code));
  }

  @GetMapping("/{kind}/{id}")
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Trả về chi tiết bản ghi theo loại dữ liệu và ID.
  public Object detail(@PathVariable String kind, @PathVariable String id) {
    return data(service.detail(kind, id));
  }

  @PostMapping("/{kind}")
  @ResponseStatus(HttpStatus.CREATED)
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Điều phối tạo dữ liệu, đơn mua, phiếu nhập hoặc đơn bán theo quyền.
  public Object create(
    @PathVariable String kind,
    @RequestBody Map<String, Object> b,
    @RequestAttribute("user") UserEntity u
  ) {
    if (kind.equals("sales-orders")) return data(service.sale(b, u.id));
    admin(u);
    return data(
      switch (kind) {
        case "purchase-orders" -> service.purchase(b, u.id);
        case "goods-receipts" -> service.receive(b, u.id);
        default -> service.save(kind, null, b);
      }
    );
  }

  @PatchMapping("/{kind}/{id}")
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra quyền quản trị và cập nhật bản ghi.
  public Object edit(
    @PathVariable String kind,
    @PathVariable String id,
    @RequestBody Map<String, Object> b,
    @RequestAttribute("user") UserEntity u
  ) {
    admin(u);
    return data(service.save(kind, id, b));
  }

  @DeleteMapping("/products/{id}")
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Ngừng kinh doanh sản phẩm theo quyền quản trị.
  public Object hide(
    @PathVariable String id,
    @RequestAttribute("user") UserEntity u
  ) {
    admin(u);
    return data(service.action("products", id, "deactivate"));
  }

  @PostMapping("/products/{id}/serials")
  @ResponseStatus(HttpStatus.CREATED)
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Đăng ký serial hoặc IMEI cho sản phẩm theo quyền quản trị.
  public Object register(
    @PathVariable String id,
    @RequestBody Map<String, Object> b,
    @RequestAttribute("user") UserEntity u
  ) {
    admin(u);
    return data(service.register(id, b));
  }

  @PostMapping("/{kind}/{id}/{action}")
  @ResponseStatus(HttpStatus.CREATED)
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Điều phối chuyển trạng thái sản phẩm, đơn mua hoặc đơn bán.
  public Object action(
    @PathVariable String kind,
    @PathVariable String id,
    @PathVariable String action,
    @RequestAttribute("user") UserEntity u
  ) {
    if (!kind.equals("sales-orders")) admin(u);
    return data(service.action(kind, id, action));
  }
}
