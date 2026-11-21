package com.javaweb.repository;

import com.javaweb.repository.entity.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

@Repository
public class MdlRepository {

  @PersistenceContext
  private EntityManager em;

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Tìm entity theo ID, báo lỗi 404 nếu không tồn tại.
  public <T> T get(Class<T> type, String id) {
    T row = em.find(type, id);
    if (row == null) throw new ResponseStatusException(
      HttpStatus.NOT_FOUND,
      "Không tìm thấy dữ liệu"
    );
    return row;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Tìm và khóa ghi entity để bảo vệ giao dịch đồng thời.
  public <T> T lock(Class<T> type, String id) {
    T row = em.find(type, id, LockModeType.PESSIMISTIC_WRITE);
    if (row == null) throw new ResponseStatusException(
      HttpStatus.NOT_FOUND,
      "Không tìm thấy dữ liệu"
    );
    return row;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Lấy toàn bộ bản ghi, sắp xếp theo ngày tạo giảm dần.
  public <T> List<T> all(Class<T> type) {
    return em
      .createQuery(
        "from " + type.getSimpleName() + " order by createdAt desc",
        type
      )
      .getResultList();
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Truy vấn entity theo các trường lọc với tham số được bind.
  public <T> List<T> find(Class<T> type, Map<String, ?> fields) {
    StringBuilder jpql = new StringBuilder(
      "from " + type.getSimpleName() + " where 1=1"
    );
    // Attribute names are internal constants; values always use bound parameters.
    fields.forEach((k, v) ->
      jpql.append(" and ").append(k).append(" = :").append(k)
    );
    TypedQuery<T> q = em.createQuery(jpql.toString(), type);
    fields.forEach(q::setParameter);
    return q.getResultList();
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đưa entity mới vào persistence context để lưu vào cơ sở dữ liệu.
  public <T extends BaseEntity> T add(T row) {
    em.persist(row);
    return row;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Đồng bộ thay đổi đang chờ xuống cơ sở dữ liệu.
  public void flush() {
    em.flush();
  }

}
