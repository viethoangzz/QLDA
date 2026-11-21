package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@MappedSuperclass
public abstract class BaseEntity {

  @Id
  @Column(length = 36)
  public String id = UUID.randomUUID().toString();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  @Column(nullable = false)
  public Instant updatedAt = Instant.now();

  @PreUpdate
  // Ngày thực hiện: 29/09/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak.
  // Chức năng của hàm: Cập nhật thời điểm sửa đổi trước khi entity được cập nhật.
  public void touch() {
    updatedAt = Instant.now();
  }
}
