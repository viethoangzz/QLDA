-- MySQL 8 / H2-compatible schema. No destructive reset.
CREATE TABLE user (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  email varchar(255) not null,
  password_hash varchar(255) not null,
  role varchar(255) not null,
  is_active boolean not null,
  unique (email)
);
CREATE TABLE category (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  name varchar(255) not null,
  slug varchar(255) not null,
  unique (slug)
);
CREATE TABLE product (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  sku varchar(255) not null,
  name varchar(255) not null,
  brand varchar(255) not null,
  category_id varchar(255) not null,
  unit_price decimal(24,2) not null,
  tracking_mode varchar(255) not null,
  is_active boolean not null,
  unique (sku)
);
CREATE TABLE product_serial (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  product_id varchar(255) not null,
  code varchar(255) not null,
  normalized_code varchar(255) not null,
  kind varchar(255) not null,
  status varchar(255) not null,
  warehouse_id varchar(255),
  receipt_item_id varchar(255),
  sold_at timestamp(6),
  unique (normalized_code)
);
CREATE TABLE supplier (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  code varchar(255) not null,
  name varchar(255) not null,
  phone varchar(255),
  email varchar(255),
  address varchar(500),
  is_active boolean not null,
  unique (code)
);
CREATE TABLE warehouse (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  code varchar(255) not null,
  name varchar(255) not null,
  is_active boolean not null,
  unique (code)
);
CREATE TABLE purchase_order (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  code varchar(255) not null,
  supplier_id varchar(255) not null,
  status varchar(255) not null,
  created_by_id varchar(255) not null,
  unique (code)
);
CREATE TABLE purchase_order_item (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  purchase_order_id varchar(255) not null,
  product_id varchar(255) not null,
  ordered_qty integer not null,
  received_qty integer not null,
  unit_cost decimal(24,2) not null,
  unique (purchase_order_id, product_id)
);
CREATE TABLE goods_receipt (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  code varchar(255) not null,
  client_request_id varchar(255) not null,
  purchase_order_id varchar(255) not null,
  warehouse_id varchar(255) not null,
  created_by_id varchar(255) not null,
  received_at timestamp(6) not null,
  unique (code),
  unique (client_request_id)
);
CREATE TABLE goods_receipt_item (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  receipt_id varchar(255) not null,
  purchase_order_item_id varchar(255) not null,
  quantity integer not null,
  unit_cost decimal(24,2) not null
);
CREATE TABLE inventory_balance (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  warehouse_id varchar(255) not null,
  product_id varchar(255) not null,
  on_hand integer not null,
  unique (warehouse_id, product_id)
);
CREATE TABLE stock_movement (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  warehouse_id varchar(255) not null,
  product_id varchar(255) not null,
  type varchar(255) not null,
  quantity_signed integer not null,
  reference_id varchar(255) not null
);
CREATE TABLE sales_order (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  code varchar(255) not null,
  warehouse_id varchar(255) not null,
  customer_name varchar(255),
  customer_phone varchar(255),
  status varchar(255) not null,
  subtotal decimal(24,2) not null,
  total decimal(24,2) not null,
  created_by_id varchar(255) not null,
  confirmed_at timestamp(6),
  unique (code)
);
CREATE TABLE sales_order_item (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  sales_order_id varchar(255) not null,
  product_id varchar(255) not null,
  quantity integer not null,
  unit_price_snapshot decimal(24,2) not null,
  line_total decimal(24,2) not null,
  unique (sales_order_id, product_id)
);
CREATE TABLE sales_order_item_serial (
  id varchar(36) primary key,
  created_at timestamp(6) not null,
  updated_at timestamp(6) not null,
  sales_order_item_id varchar(255) not null,
  product_serial_id varchar(255) not null,
  unique (sales_order_item_id, product_serial_id)
);
ALTER TABLE product ADD CONSTRAINT fk_product_category_id FOREIGN KEY (category_id) REFERENCES category(id);
ALTER TABLE product_serial ADD CONSTRAINT fk_product_serial_product_id FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE product_serial ADD CONSTRAINT fk_product_serial_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse(id);
ALTER TABLE product_serial ADD CONSTRAINT fk_product_serial_receipt_item_id FOREIGN KEY (receipt_item_id) REFERENCES goods_receipt_item(id);
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_created_by_id FOREIGN KEY (created_by_id) REFERENCES user(id);
ALTER TABLE purchase_order_item ADD CONSTRAINT fk_purchase_order_item_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE purchase_order_item ADD CONSTRAINT fk_purchase_order_item_product_id FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE goods_receipt ADD CONSTRAINT fk_goods_receipt_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE goods_receipt ADD CONSTRAINT fk_goods_receipt_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse(id);
ALTER TABLE goods_receipt ADD CONSTRAINT fk_goods_receipt_created_by_id FOREIGN KEY (created_by_id) REFERENCES user(id);
ALTER TABLE goods_receipt_item ADD CONSTRAINT fk_goods_receipt_item_receipt_id FOREIGN KEY (receipt_id) REFERENCES goods_receipt(id);
ALTER TABLE goods_receipt_item ADD CONSTRAINT fk_goods_receipt_item_purchase_order_item_id FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_item(id);
ALTER TABLE inventory_balance ADD CONSTRAINT fk_inventory_balance_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse(id);
ALTER TABLE inventory_balance ADD CONSTRAINT fk_inventory_balance_product_id FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE stock_movement ADD CONSTRAINT fk_stock_movement_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse(id);
ALTER TABLE stock_movement ADD CONSTRAINT fk_stock_movement_product_id FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE sales_order ADD CONSTRAINT fk_sales_order_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouse(id);
ALTER TABLE sales_order ADD CONSTRAINT fk_sales_order_created_by_id FOREIGN KEY (created_by_id) REFERENCES user(id);
ALTER TABLE sales_order_item ADD CONSTRAINT fk_sales_order_item_sales_order_id FOREIGN KEY (sales_order_id) REFERENCES sales_order(id);
ALTER TABLE sales_order_item ADD CONSTRAINT fk_sales_order_item_product_id FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE sales_order_item_serial ADD CONSTRAINT fk_sales_order_item_serial_sales_order_item_id FOREIGN KEY (sales_order_item_id) REFERENCES sales_order_item(id);
ALTER TABLE sales_order_item_serial ADD CONSTRAINT fk_sales_order_item_serial_product_serial_id FOREIGN KEY (product_serial_id) REFERENCES product_serial(id);
ALTER TABLE product ADD CONSTRAINT ck_product CHECK (unit_price >= 0);
ALTER TABLE purchase_order_item ADD CONSTRAINT ck_purchase_order_item CHECK (ordered_qty > 0 AND received_qty >= 0 AND received_qty <= ordered_qty AND unit_cost >= 0);
ALTER TABLE goods_receipt_item ADD CONSTRAINT ck_goods_receipt_item CHECK (quantity > 0 AND unit_cost >= 0);
ALTER TABLE inventory_balance ADD CONSTRAINT ck_inventory_balance CHECK (on_hand >= 0);
ALTER TABLE sales_order_item ADD CONSTRAINT ck_sales_order_item CHECK (quantity > 0 AND unit_price_snapshot >= 0 AND line_total = quantity * unit_price_snapshot);
ALTER TABLE sales_order ADD CONSTRAINT ck_sales_order CHECK (total >= 0 AND subtotal = total);
ALTER TABLE stock_movement ADD CONSTRAINT ck_stock_movement CHECK ((type = 'RECEIPT' AND quantity_signed > 0) OR (type = 'SALE' AND quantity_signed < 0));
CREATE INDEX idx_serial_lookup ON product_serial(product_id,status,warehouse_id);
