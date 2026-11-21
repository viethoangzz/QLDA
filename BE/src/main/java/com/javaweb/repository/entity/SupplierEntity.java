package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "supplier",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "code" }) }
)
public class SupplierEntity extends BaseEntity {

  @Column(name = "code", nullable = false)
  public String code;

  @Column(name = "name", nullable = false)
  public String name;

  @Column(name = "phone", nullable = true)
  public String phone;

  @Column(name = "email", nullable = true)
  public String email;

  @Column(name = "address", nullable = true)
  public String address;

  @Column(name = "is_active", nullable = false)
  public boolean isActive = true;
}
