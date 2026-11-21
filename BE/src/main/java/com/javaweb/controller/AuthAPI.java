package com.javaweb.controller;

import com.javaweb.model.Input;
import com.javaweb.repository.MdlRepository;
import com.javaweb.repository.entity.UserEntity;
import jakarta.servlet.http.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthAPI {

  private final MdlRepository db;

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Khởi tạo API xác thực với repository người dùng.
  public AuthAPI(MdlRepository db) {
    this.db = db;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Trả về ID, email và vai trò người dùng, không đưa mật khẩu vào phản hồi.
  private Map<String, Object> publicUser(UserEntity u) {
    return Map.of("data", Map.of("id", u.id, "email", u.email, "role", u.role));
  }

  @PostMapping("/login")
  @ResponseStatus(HttpStatus.CREATED)
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra tài khoản, mật khẩu và tạo phiên đăng nhập mới.
  public Object login(
    @RequestBody Map<String, Object> body,
    HttpServletRequest request
  ) {
    Input in = new Input(body, "email", "password");
    String email = in.text("email", 254, true).toLowerCase(Locale.ROOT),
      password = in.text("password", 128, true);
    password = (String) body.get("password");
    if (!email.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")) Input.bad(
      "Email không hợp lệ"
    );
    List<UserEntity> rows = db.find(UserEntity.class, Map.of("email", email));
    UserEntity u = rows.isEmpty() ? null : rows.get(0);
    if (
      u == null ||
      !u.isActive ||
      !new BCryptPasswordEncoder().matches(password, u.passwordHash)
    ) throw new ResponseStatusException(
      HttpStatus.UNAUTHORIZED,
      "Email hoặc mật khẩu không đúng"
    );
    if (request.getSession(false) != null) request
      .getSession(false)
      .invalidate();
    request.getSession(true).setAttribute("userId", u.id);
    return publicUser(u);
  }

  @GetMapping("/me")
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Trả về thông tin người dùng của phiên hiện tại.
  public Object me(@RequestAttribute("user") UserEntity u) {
    return publicUser(u);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.CREATED)
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Hủy phiên đăng nhập và xóa cookie JSESSIONID.
  public Object logout(
    HttpServletRequest request,
    HttpServletResponse response
  ) {
    if (request.getSession(false) != null) request
      .getSession(false)
      .invalidate();
    Cookie cookie = new Cookie("JSESSIONID", "");
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    cookie.setMaxAge(0);
    response.addCookie(cookie);
    return Map.of("data", Map.of("loggedOut", true));
  }
}
