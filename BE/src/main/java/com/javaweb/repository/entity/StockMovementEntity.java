package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "stock_movement", uniqueConstraints = {})
public class StockMovementEntity extends BaseEntity {

  @Column(name = "warehouse_id", nullable = false)
  public String warehouseId;

  @Column(name = "product_id", nullable = false)
  public String productId;

  @Column(name = "type", nullable = false)
  public String type;

  @Column(name = "quantity_signed", nullable = false)
  public int quantitySigned;

  @Column(name = "reference_id", nullable = false)
  public String referenceId;
}
