package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "sales_order",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "code" }) }
)
public class SalesOrderEntity extends BaseEntity {

  @Column(name = "code", nullable = false)
  public String code;

  @Column(name = "warehouse_id", nullable = false)
  public String warehouseId;

  @Column(name = "customer_name", nullable = true)
  public String customerName;

  @Column(name = "customer_phone", nullable = true)
  public String customerPhone;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "subtotal", nullable = false, precision = 24, scale = 2)
  public BigDecimal subtotal;

  @Column(name = "total", nullable = false, precision = 24, scale = 2)
  public BigDecimal total;

  @Column(name = "created_by_id", nullable = false)
  public String createdById;

  @Column(name = "confirmed_at", nullable = true)
  public Instant confirmedAt;
}
