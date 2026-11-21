package com.javaweb.model;

import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class Input {

  public final Map<String, Object> values;

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Khởi tạo dữ liệu đầu vào và từ chối thuộc tính ngoài danh sách cho phép.
  public Input(Map<String, Object> values, String... allowed) {
    this.values = Objects.requireNonNull(values);
    Set<String> keys = Set.of(allowed);
    for (String key : values.keySet())
      if (!keys.contains(key)) bad("Thuộc tính không được phép: " + key);
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Phát sinh lỗi HTTP 400 kèm thông báo kiểm tra dữ liệu.
  public static void bad(String text) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, text);
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đọc chuỗi, cắt khoảng trắng và kiểm tra bắt buộc cùng độ dài tối đa.
  public String text(String key, int max, boolean required) {
    Object v = values.get(key);
    if (v == null) {
      if (required) bad("Thiếu " + key);
      return null;
    }
    if (!(v instanceof String)) bad(key + " phải là chuỗi");
    String s = ((String) v).trim();
    if ((required && s.isEmpty()) || s.length() > max) bad(
      key + " không hợp lệ"
    );
    return s;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đọc ID bắt buộc có độ dài tối đa 36 ký tự.
  public String id(String key) {
    return text(key, 36, true);
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra giá trị chuỗi thuộc tập lựa chọn hợp lệ.
  public String choice(String key, String... options) {
    String s = text(key, 40, true);
    if (!List.of(options).contains(s)) bad(key + " không hợp lệ");
    return s;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đọc số lượng nguyên từ 1 đến 1000000.
  public int qty(String key) {
    BigDecimal n = number(key);
    try {
      int i = n.intValueExact();
      if (i < 1 || i > 1000000) bad(key + " phải từ 1 đến 1000000");
      return i;
    } catch (ArithmeticException e) {
      bad(key + " phải là số nguyên");
      return 0;
    }
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Chuyển giá trị số đầu vào thành BigDecimal.
  public BigDecimal number(String key) {
    Object v = values.get(key);
    if (!(v instanceof Number)) bad(key + " phải là số");
    try {
      return new BigDecimal(v.toString());
    } catch (Exception e) {
      bad(key + " không hợp lệ");
      return BigDecimal.ZERO;
    }
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra giá không âm, giới hạn giá trị và tối đa hai chữ số thập phân.
  public BigDecimal price(String key) {
    BigDecimal n = number(key);
    if (
      n.signum() < 0 ||
      n.scale() > 2 ||
      n.compareTo(new BigDecimal("999999999999")) > 0
    ) bad(key + " phải >= 0, tối đa 2 chữ số thập phân");
    return n;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đọc trạng thái hoạt động dạng boolean, mặc định là true.
  public boolean active() {
    Object v = values.getOrDefault("isActive", true);
    if (!(v instanceof Boolean)) bad("isActive phải là boolean");
    return (Boolean) v;
  }

  @SuppressWarnings("unchecked")
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đọc và kiểm tra danh sách đối tượng đầu vào, tối đa 500 dòng.
  public List<Map<String, Object>> rows(String key, boolean required) {
    Object v = values.get(key);
    if (v == null && !required) return List.of();
    if (!(v instanceof List<?>)) {
      bad("Thiếu danh sách " + key);
      return List.of();
    }
    List<?> list = (List<?>) v;
    if (
      (required && list.isEmpty()) ||
      list.size() > 500 ||
      list.stream().anyMatch(x -> !(x instanceof Map))
    ) bad("Danh sách " + key + " không hợp lệ");
    return (List<Map<String, Object>>) v;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đọc danh sách ID không rỗng và không trùng lặp.
  public List<String> ids(String key) {
    Object v = values.getOrDefault(key, List.of());
    if (!(v instanceof List<?>)) bad(key + " phải là danh sách");
    List<?> list = (List<?>) v;
    if (
      list.size() > 500 ||
      list
        .stream()
        .anyMatch(x -> !(x instanceof String) || ((String) x).isBlank())
    ) bad(key + " không hợp lệ");
    List<String> out = list.stream().map(Object::toString).toList();
    unique(out);
    return out;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Từ chối danh sách có dòng hoặc mã trùng nhau.
  public static void unique(List<String> ids) {
    if (new HashSet<>(ids).size() != ids.size()) bad(
      "Các dòng hoặc mã không được trùng nhau"
    );
  }
}
