package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "sales_order_item_serial",
  uniqueConstraints = {
    @UniqueConstraint(
      columnNames = { "sales_order_item_id", "product_serial_id" }
    ),
  }
)
public class SalesOrderItemSerialEntity extends BaseEntity {

  @Column(name = "sales_order_item_id", nullable = false)
  public String salesOrderItemId;

  @Column(name = "product_serial_id", nullable = false)
  public String productSerialId;
}
