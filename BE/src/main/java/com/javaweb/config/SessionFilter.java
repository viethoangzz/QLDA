package com.javaweb.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaweb.repository.MdlRepository;
import com.javaweb.repository.entity.UserEntity;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SessionFilter extends OncePerRequestFilter {

  private final MdlRepository db;
  private final ObjectMapper mapper;

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Khởi tạo bộ lọc phiên với repository và bộ chuyển đổi JSON.
  public SessionFilter(MdlRepository db, ObjectMapper mapper) {
    this.db = db;
    this.mapper = mapper;
  }

  @Override
  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra phiên và tài khoản, gắn người dùng vào request hoặc trả lỗi 401.
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain chain
  ) throws ServletException, IOException {
    String path = request.getRequestURI();
    if (
      !path.startsWith("/api/v1/") ||
      path.equals("/api/v1/auth/login") ||
      path.equals("/api/v1/auth/logout")
    ) {
      chain.doFilter(request, response);
      return;
    }
    HttpSession session = request.getSession(false);
    UserEntity user = null;
    if (
      session != null && session.getAttribute("userId") instanceof String id
    ) {
      try {
        user = db.get(UserEntity.class, id);
      } catch (
        org.springframework.web.server.ResponseStatusException ignored
      ) {}
    }
    if (user == null || !user.isActive) {
      response.setStatus(401);
      response.setContentType("application/json;charset=UTF-8");
      mapper.writeValue(
        response.getWriter(),
        Map.of(
          "error",
          Map.of("code", "UNAUTHORIZED", "message", "Vui lòng đăng nhập")
        )
      );
      return;
    }
    request.setAttribute("user", user);
    chain.doFilter(request, response);
  }
}
