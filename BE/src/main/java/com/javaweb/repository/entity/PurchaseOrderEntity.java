package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "purchase_order",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "code" }) }
)
public class PurchaseOrderEntity extends BaseEntity {

  @Column(name = "code", nullable = false)
  public String code;

  @Column(name = "supplier_id", nullable = false)
  public String supplierId;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "created_by_id", nullable = false)
  public String createdById;
}
