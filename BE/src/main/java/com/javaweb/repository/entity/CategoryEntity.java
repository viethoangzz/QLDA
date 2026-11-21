package com.javaweb.repository.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
  name = "category",
  uniqueConstraints = { @UniqueConstraint(columnNames = { "slug" }) }
)
public class CategoryEntity extends BaseEntity {

  @Column(name = "name", nullable = false)
  public String name;

  @Column(name = "slug", nullable = false)
  public String slug;
}
