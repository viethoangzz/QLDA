package com.javaweb.controlleradvice;

import jakarta.persistence.PessimisticLockException;
import java.util.Map;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiErrors {

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Tạo phản hồi lỗi thống nhất gồm mã và thông báo theo HTTP status.
  private ResponseEntity<?> error(int status, String message) {
    String code = Map.of(
      400,
      "BAD_REQUEST",
      401,
      "UNAUTHORIZED",
      403,
      "FORBIDDEN",
      404,
      "NOT_FOUND",
      409,
      "CONFLICT"
    ).getOrDefault(status, "INTERNAL_ERROR");
    return ResponseEntity.status(status).body(
      Map.of("error", Map.of("code", code, "message", message))
    );
  }

  @ExceptionHandler(ResponseStatusException.class)
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Chuyển ResponseStatusException thành phản hồi lỗi API.
  public ResponseEntity<?> status(ResponseStatusException e) {
    return error(
      e.getStatusCode().value(),
      e.getReason() == null ? "Yêu cầu không hợp lệ" : e.getReason()
    );
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Trả lỗi 409 khi dữ liệu trùng hoặc vi phạm ràng buộc.
  public ResponseEntity<?> duplicate(Exception e) {
    return error(409, "Mã đã tồn tại hoặc dữ liệu vi phạm ràng buộc nghiệp vụ");
  }

  @ExceptionHandler({
    CannotAcquireLockException.class,
    PessimisticLockException.class,
    org.springframework.orm.ObjectOptimisticLockingFailureException.class,
  })
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Trả lỗi 409 khi khóa hoặc phiên bản dữ liệu bị xung đột.
  public ResponseEntity<?> concurrency(Exception e) {
    return error(409, "Dữ liệu vừa thay đổi. Vui lòng tải lại và thử lại");
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    IllegalArgumentException.class,
  })
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Trả lỗi 400 khi nội dung yêu cầu không hợp lệ.
  public ResponseEntity<?> invalid(Exception e) {
    return error(400, "Dữ liệu đầu vào không hợp lệ");
  }

  @ExceptionHandler(Exception.class)
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Ghi log lỗi chưa xử lý và trả thông báo lỗi hệ thống 500.
  public ResponseEntity<?> unknown(Exception e) {
    org.slf4j.LoggerFactory.getLogger(ApiErrors.class).error(
      "API failure: {}",
      e.getClass().getSimpleName()
    );
    return error(500, "Lỗi hệ thống");
  }
}
