package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "purchase_order_item",
  uniqueConstraints = {
    @UniqueConstraint(columnNames = { "purchase_order_id", "product_id" }),
  }
)
public class PurchaseOrderItemEntity extends BaseEntity {

  @Column(name = "purchase_order_id", nullable = false)
  public String purchaseOrderId;

  @Column(name = "product_id", nullable = false)
  public String productId;

  @Column(name = "ordered_qty", nullable = false)
  public int orderedQty;

  @Column(name = "received_qty", nullable = false)
  public int receivedQty;

  @Column(name = "unit_cost", nullable = false, precision = 24, scale = 2)
  public BigDecimal unitCost;
}
