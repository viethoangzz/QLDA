package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "goods_receipt_item", uniqueConstraints = {})
public class GoodsReceiptItemEntity extends BaseEntity {

  @Column(name = "receipt_id", nullable = false)
  public String receiptId;

  @Column(name = "purchase_order_item_id", nullable = false)
  public String purchaseOrderItemId;

  @Column(name = "quantity", nullable = false)
  public int quantity;

  @Column(name = "unit_cost", nullable = false, precision = 24, scale = 2)
  public BigDecimal unitCost;
}
