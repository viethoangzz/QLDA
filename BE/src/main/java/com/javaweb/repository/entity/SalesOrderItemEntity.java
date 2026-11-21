package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "sales_order_item",
  uniqueConstraints = {
    @UniqueConstraint(columnNames = { "sales_order_id", "product_id" }),
  }
)
public class SalesOrderItemEntity extends BaseEntity {

  @Column(name = "sales_order_id", nullable = false)
  public String salesOrderId;

  @Column(name = "product_id", nullable = false)
  public String productId;

  @Column(name = "quantity", nullable = false)
  public int quantity;

  @Column(
    name = "unit_price_snapshot",
    nullable = false,
    precision = 24,
    scale = 2
  )
  public BigDecimal unitPriceSnapshot;

  @Column(name = "line_total", nullable = false, precision = 24, scale = 2)
  public BigDecimal lineTotal;
}
