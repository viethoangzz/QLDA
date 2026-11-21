package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "product",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "sku" }) }
)
public class ProductEntity extends BaseEntity {

  @Column(name = "sku", nullable = false)
  public String sku;

  @Column(name = "name", nullable = false)
  public String name;

  @Column(name = "brand", nullable = false)
  public String brand;

  @Column(name = "category_id", nullable = false)
  public String categoryId;

  @Column(name = "unit_price", nullable = false, precision = 24, scale = 2)
  public BigDecimal unitPrice;

  @Column(name = "tracking_mode", nullable = false)
  public String trackingMode;

  @Column(name = "is_active", nullable = false)
  public boolean isActive = true;
}
