package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "inventory_balance",
  uniqueConstraints = {
    @UniqueConstraint(columnNames = { "warehouse_id", "product_id" }),
  }
)
public class InventoryBalanceEntity extends BaseEntity {

  @Column(name = "warehouse_id", nullable = false)
  public String warehouseId;

  @Column(name = "product_id", nullable = false)
  public String productId;

  @Column(name = "on_hand", nullable = false)
  public int onHand;
}
