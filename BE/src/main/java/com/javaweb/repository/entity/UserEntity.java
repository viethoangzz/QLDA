package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "user",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "email" }) }
)
public class UserEntity extends BaseEntity {

  @Column(name = "email", nullable = false)
  public String email;

  @Column(name = "password_hash", nullable = false)
  public String passwordHash;

  @Column(name = "role", nullable = false)
  public String role;

  @Column(name = "is_active", nullable = false)
  public boolean isActive = true;
}
