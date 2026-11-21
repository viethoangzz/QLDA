package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "warehouse",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "code" }) }
)
public class WarehouseEntity extends BaseEntity {

  @Column(name = "code", nullable = false)
  public String code;

  @Column(name = "name", nullable = false)
  public String name;

  @Column(name = "is_active", nullable = false)
  public boolean isActive = true;
}
