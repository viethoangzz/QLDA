package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "goods_receipt",
  uniqueConstraints = {
    @UniqueConstraint(columnNames = { "code" }),
    @UniqueConstraint(columnNames = { "client_request_id" }),
  }
)
public class GoodsReceiptEntity extends BaseEntity {

  @Column(name = "code", nullable = false)
  public String code;

  @Column(name = "client_request_id", nullable = false)
  public String clientRequestId;

  @Column(name = "purchase_order_id", nullable = false)
  public String purchaseOrderId;

  @Column(name = "warehouse_id", nullable = false)
  public String warehouseId;

  @Column(name = "created_by_id", nullable = false)
  public String createdById;

  @Column(name = "received_at", nullable = false)
  public Instant receivedAt;
}
