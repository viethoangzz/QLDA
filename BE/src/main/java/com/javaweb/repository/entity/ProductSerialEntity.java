package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "product_serial",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "normalized_code" }) }
)
public class ProductSerialEntity extends BaseEntity {

  @Column(name = "product_id", nullable = false)
  public String productId;

  @Column(name = "code", nullable = false)
  public String code;

  @Column(name = "normalized_code", nullable = false)
  public String normalizedCode;

  @Column(name = "kind", nullable = false)
  public String kind;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "warehouse_id", nullable = true)
  public String warehouseId;

  @Column(name = "receipt_item_id", nullable = true)
  public String receiptItemId;

  @Column(name = "sold_at", nullable = true)
  public Instant soldAt;
}
