package com.javaweb.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaweb.model.Input;
import com.javaweb.repository.MdlRepository;
import com.javaweb.repository.entity.*;
import com.javaweb.service.MdlService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(
  isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED
)
public class MdlServiceImpl implements MdlService {

  private final MdlRepository db;
  private final ObjectMapper mapper;

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Khởi tạo dịch vụ với repository và bộ chuyển đổi dữ liệu.
  public MdlServiceImpl(MdlRepository db, ObjectMapper mapper) {
    this.db = db;
    this.mapper = mapper;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Báo lỗi HTTP 409 khi dữ liệu xung đột quy tắc nghiệp vụ.
  private static void conflict(String message) {
    throw new ResponseStatusException(HttpStatus.CONFLICT, message);
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Sinh mã chứng từ theo tiền tố và UUID rút gọn.
  private static String code(String prefix) {
    return (
      prefix +
      "-" +
      UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT)
    );
  }

  private static final Map<String, Class<? extends BaseEntity>> TYPES =
    Map.ofEntries(
      Map.entry("categories", CategoryEntity.class),
      Map.entry("products", ProductEntity.class),
      Map.entry("serials", ProductSerialEntity.class),
      Map.entry("suppliers", SupplierEntity.class),
      Map.entry("warehouses", WarehouseEntity.class),
      Map.entry("purchase-orders", PurchaseOrderEntity.class),
      Map.entry("goods-receipts", GoodsReceiptEntity.class),
      Map.entry("inventory/balances", InventoryBalanceEntity.class),
      Map.entry("inventory/movements", StockMovementEntity.class),
      Map.entry("sales-orders", SalesOrderEntity.class)
    );

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Ánh xạ loại API sang lớp entity và từ chối loại không hỗ trợ.
  private Class<? extends BaseEntity> type(String kind) {
    Class<? extends BaseEntity> t = TYPES.get(kind);
    if (t == null) throw new ResponseStatusException(
      HttpStatus.NOT_FOUND,
      "Không tìm thấy API"
    );
    return t;
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Chuyển đối tượng thành bản đồ dữ liệu để tạo phản hồi.
  private Map<String, Object> plain(Object row) {
    return mapper.convertValue(
      row,
      new TypeReference<LinkedHashMap<String, Object>>() {}
    );
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Lấy bản ghi đầu tiên khớp điều kiện hoặc trả về null.
  private <T> T first(Class<T> type, Map<String, ?> where) {
    List<T> list = db.find(type, where);
    return list.isEmpty() ? null : list.get(0);
  }

  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Bổ sung dữ liệu liên quan vào chi tiết sản phẩm, kho và chứng từ.
  private Map<String, Object> view(BaseEntity row) {
    Map<String, Object> out = plain(row);
    if (row instanceof ProductEntity p) out.put(
      "category",
      db.get(CategoryEntity.class, p.categoryId)
    );
    if (row instanceof ProductSerialEntity s) {
      out.put("product", db.get(ProductEntity.class, s.productId));
      out.put(
        "warehouse",
        s.warehouseId == null
          ? null
          : db.get(WarehouseEntity.class, s.warehouseId)
      );
    }
    if (row instanceof PurchaseOrderEntity p) {
      out.put("supplier", db.get(SupplierEntity.class, p.supplierId));
      out.put(
        "items",
        db
          .find(PurchaseOrderItemEntity.class, Map.of("purchaseOrderId", p.id))
          .stream()
          .map(this::view)
          .toList()
      );
      out.put(
        "receipts",
        db
          .find(GoodsReceiptEntity.class, Map.of("purchaseOrderId", p.id))
          .stream()
          .map(r -> {
            Map<String, Object> m = plain(r);
            m.put("warehouse", db.get(WarehouseEntity.class, r.warehouseId));
            return m;
          })
          .toList()
      );
    }
    if (row instanceof PurchaseOrderItemEntity i) out.put(
      "product",
      db.get(ProductEntity.class, i.productId)
    );
    if (row instanceof GoodsReceiptEntity r) {
      out.put("warehouse", db.get(WarehouseEntity.class, r.warehouseId));
      out.put(
        "purchaseOrder",
        db.get(PurchaseOrderEntity.class, r.purchaseOrderId)
      );
      out.put(
        "items",
        db
          .find(GoodsReceiptItemEntity.class, Map.of("receiptId", r.id))
          .stream()
          .map(this::view)
          .toList()
      );
    }
    if (row instanceof GoodsReceiptItemEntity i) {
      out.put(
        "purchaseOrderItem",
        view(db.get(PurchaseOrderItemEntity.class, i.purchaseOrderItemId))
      );
      out.put(
        "serials",
        db.find(ProductSerialEntity.class, Map.of("receiptItemId", i.id))
      );
    }
    if (row instanceof InventoryBalanceEntity b) {
      out.put("product", db.get(ProductEntity.class, b.productId));
      out.put("warehouse", db.get(WarehouseEntity.class, b.warehouseId));
    }
    if (row instanceof StockMovementEntity m) {
      out.put("product", db.get(ProductEntity.class, m.productId));
      out.put("warehouse", db.get(WarehouseEntity.class, m.warehouseId));
    }
    if (row instanceof SalesOrderEntity s) {
      out.put("warehouse", db.get(WarehouseEntity.class, s.warehouseId));
      out.put(
        "items",
        db
          .find(SalesOrderItemEntity.class, Map.of("salesOrderId", s.id))
          .stream()
          .map(this::view)
          .toList()
      );
    }
    if (row instanceof SalesOrderItemEntity i) {
      out.put("product", db.get(ProductEntity.class, i.productId));
      out.put(
        "serials",
        db
          .find(
            SalesOrderItemSerialEntity.class,
            Map.of("salesOrderItemId", i.id)
          )
          .stream()
          .map(s -> {
            Map<String, Object> m = plain(s);
            m.put(
              "productSerial",
              db.get(ProductSerialEntity.class, s.productSerialId)
            );
            return m;
          })
          .toList()
      );
    }
    return out;
  }

  @Override
  @Transactional(readOnly = true)
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Tìm bản ghi theo ID và trả về dữ liệu chi tiết.
  public Object detail(String kind, String id) {
    return view(db.get(type(kind), id));
  }

  @Override
  @Transactional(readOnly = true)
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Lọc, tìm kiếm, sắp xếp và phân trang danh sách dữ liệu.
  public Map<String, Object> list(String kind, Map<String, String> q) {
    int page = positive(q.getOrDefault("page", "1"), 1000000),
      size = positive(q.getOrDefault("pageSize", "20"), 100);
    String needle = q
      .getOrDefault("q", q.getOrDefault("code", ""))
      .trim()
      .toLowerCase(Locale.ROOT);
    List<Map<String, Object>> rows = db
      .all(type(kind))
      .stream()
      .map(this::view)
      .filter(r -> {
        for (String key : List.of(
          "productId",
          "warehouseId",
          "categoryId",
          "status",
          "trackingMode"
        ))
          if (
            q.containsKey(key) && !q.get(key).equals(r.get(key))
          ) return false;
        if (
          q.containsKey("active") &&
          !q.get("active").equals(String.valueOf(r.get("isActive")))
        ) return false;
        if (needle.isEmpty()) return true;
        String text = List.of("name", "sku", "code", "brand", "customerName")
          .stream()
          .map(k -> String.valueOf(r.getOrDefault(k, "")))
          .collect(Collectors.joining(" "));
        if (r.get("product") instanceof ProductEntity p) text +=
          " " + p.name + " " + p.sku;
        return text.toLowerCase(Locale.ROOT).contains(needle);
      })
      .collect(Collectors.toCollection(ArrayList::new));
    if ("asc".equals(q.get("sort"))) Collections.reverse(rows);
    int start = Math.min(rows.size(), (page - 1) * size),
      end = Math.min(rows.size(), start + size);
    return Map.of(
      "data",
      rows.subList(start, end),
      "meta",
      Map.of("total", rows.size(), "page", page, "pageSize", size)
    );
  }

  // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Kiểm tra tham số phân trang là số nguyên dương trong giới hạn.
  private int positive(String value, int max) {
    try {
      int v = Integer.parseInt(value);
      if (v < 1 || v > max) Input.bad("Tham số phân trang không hợp lệ");
      return v;
    } catch (NumberFormatException e) {
      Input.bad("Tham số phân trang không hợp lệ");
      return 1;
    }
  }

  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Loại bỏ khoảng trắng đầu cuối và chuẩn hóa mã thành chữ hoa.
  private String normalized(String text) {
    return text.trim().toUpperCase(Locale.ROOT);
  }

  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Kiểm tra mã serial và định dạng IMEI gồm 15 chữ số.
  private Input serialInput(Map<String, Object> b) {
    Input in = new Input(b, "code", "kind");
    String c = in.text("code", 120, true);
    String k = in.choice("kind", "SERIAL", "IMEI");
    if (k.equals("IMEI") && !c.matches("[0-9]{15}")) Input.bad(
      "IMEI phải gồm 15 chữ số"
    );
    return in;
  }

  @Override
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Thêm hoặc sửa danh mục, sản phẩm, nhà cung cấp, kho và serial.
  public Object save(String kind, String id, Map<String, Object> b) {
    BaseEntity result;
    switch (kind) {
      case "categories" -> {
        Input in = new Input(b, "name", "slug");
        CategoryEntity r =
          id == null ? new CategoryEntity() : db.lock(CategoryEntity.class, id);
        r.name = in.text("name", 160, true);
        r.slug = in.text("slug", 80, true);
        result = r;
      }
      case "products" -> {
        Input in = new Input(
          b,
          "sku",
          "name",
          "brand",
          "categoryId",
          "unitPrice",
          "trackingMode",
          "isActive"
        );
        ProductEntity r =
          id == null ? new ProductEntity() : db.lock(ProductEntity.class, id);
        String mode = in.choice("trackingMode", "SERIALIZED", "BULK");
        if (
          id != null &&
          !r.trackingMode.equals(mode) &&
          (!db
            .find(ProductSerialEntity.class, Map.of("productId", id))
            .isEmpty() ||
            !db
              .find(PurchaseOrderItemEntity.class, Map.of("productId", id))
              .isEmpty() ||
            !db
              .find(SalesOrderItemEntity.class, Map.of("productId", id))
              .isEmpty())
        ) conflict("Không đổi kiểu quản lý khi đã có serial hoặc giao dịch");
        r.sku = normalized(in.text("sku", 80, true));
        r.name = in.text("name", 160, true);
        r.brand = in.text("brand", 80, true);
        r.categoryId = in.id("categoryId");
        db.get(CategoryEntity.class, r.categoryId);
        r.unitPrice = in.price("unitPrice");
        r.trackingMode = mode;
        r.isActive = in.active();
        result = r;
      }
      case "suppliers" -> {
        Input in = new Input(
          b,
          "code",
          "name",
          "phone",
          "email",
          "address",
          "isActive"
        );
        SupplierEntity r =
          id == null ? new SupplierEntity() : db.lock(SupplierEntity.class, id);
        r.code = normalized(in.text("code", 80, true));
        r.name = in.text("name", 160, true);
        r.phone = in.text("phone", 30, false);
        r.email = in.text("email", 254, false);
        if (
          r.email != null &&
          !r.email.isEmpty() &&
          !r.email.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")
        ) Input.bad("Email không hợp lệ");
        r.address = in.text("address", 500, false);
        r.isActive = in.active();
        result = r;
      }
      case "warehouses" -> {
        Input in = new Input(b, "code", "name", "isActive");
        WarehouseEntity r =
          id == null
            ? new WarehouseEntity()
            : db.lock(WarehouseEntity.class, id);
        r.code = normalized(in.text("code", 80, true));
        r.name = in.text("name", 160, true);
        r.isActive = in.active();
        result = r;
      }
      case "serials" -> {
        if (id == null) Input.bad("Đăng ký serial qua sản phẩm");
        Input in = serialInput(b);
        ProductSerialEntity r = db.lock(ProductSerialEntity.class, id);
        if (!r.status.equals("REGISTERED")) conflict(
          "Chỉ sửa mã còn REGISTERED"
        );
        r.code = normalized(in.text("code", 120, true));
        r.normalizedCode = r.code;
        r.kind = in.choice("kind", "SERIAL", "IMEI");
        result = r;
      }
      default -> throw new ResponseStatusException(
        HttpStatus.NOT_FOUND,
        "Không hỗ trợ thao tác"
      );
    }
    if (id == null) db.add(result);
    db.flush();
    return view(result);
  }

  @Override
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Đăng ký danh sách serial không trùng cho sản phẩm quản lý theo mã.
  public Object register(String productId, Map<String, Object> b) {
    ProductEntity p = db.lock(ProductEntity.class, productId);
    if (!p.isActive || !p.trackingMode.equals("SERIALIZED")) Input.bad(
      "Chỉ đăng ký serial cho sản phẩm SERIALIZED đang bán"
    );
    Input in = new Input(b, "serials");
    List<Map<String, Object>> rows = in.rows("serials", true);
    List<ProductSerialEntity> result = new ArrayList<>();
    Set<String> codes = new HashSet<>();
    for (Map<String, Object> row : rows) {
      Input s = serialInput(row);
      String c = normalized(s.text("code", 120, true));
      if (!codes.add(c)) Input.bad("Danh sách có mã trùng");
      if (
        first(ProductSerialEntity.class, Map.of("normalizedCode", c)) != null
      ) conflict("Serial đã tồn tại");
      ProductSerialEntity r = new ProductSerialEntity();
      r.productId = p.id;
      r.code = c;
      r.normalizedCode = c;
      r.kind = s.choice("kind", "SERIAL", "IMEI");
      r.status = "REGISTERED";
      db.add(r);
      result.add(r);
    }
    db.flush();
    return result.stream().map(this::view).toList();
  }

  @Override
  @Transactional(readOnly = true)
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng.
  // Chức năng của hàm: Tra cứu serial bằng mã đã chuẩn hóa.
  public Object lookup(String code) {
    ProductSerialEntity s = first(
      ProductSerialEntity.class,
      Map.of("normalizedCode", normalized(code))
    );
    if (s == null) throw new ResponseStatusException(
      HttpStatus.NOT_FOUND,
      "Không tìm thấy serial"
    );
    return view(s);
  }

  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Khóa sản phẩm theo thứ tự ID ổn định để xử lý giao dịch đồng thời.
  private void lockProducts(List<String> ids) {
    ids
      .stream()
      .distinct()
      .sorted()
      .forEach(id -> db.lock(ProductEntity.class, id));
  }

  @Override
  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Tạo đơn mua nháp và các dòng sản phẩm, số lượng, giá nhập.
  public Object purchase(Map<String, Object> b, String userId) {
    Input in = new Input(b, "supplierId", "items");
    SupplierEntity supplier = db.get(SupplierEntity.class, in.id("supplierId"));
    if (!supplier.isActive) Input.bad("Nhà cung cấp đã ngừng hoạt động");
    List<Map<String, Object>> rows = in.rows("items", true);
    List<String> ids = rows
      .stream()
      .map(r ->
        new Input(r, "productId", "orderedQty", "unitCost").id("productId")
      )
      .toList();
    Input.unique(ids);
    lockProducts(ids);
    PurchaseOrderEntity po = new PurchaseOrderEntity();
    po.code = code("PO");
    po.supplierId = supplier.id;
    po.status = "DRAFT";
    po.createdById = userId;
    db.add(po);
    for (Map<String, Object> row : rows) {
      Input i = new Input(row, "productId", "orderedQty", "unitCost");
      ProductEntity p = db.get(ProductEntity.class, i.id("productId"));
      if (!p.isActive) Input.bad("Sản phẩm đã ngừng kinh doanh");
      PurchaseOrderItemEntity item = new PurchaseOrderItemEntity();
      item.purchaseOrderId = po.id;
      item.productId = p.id;
      item.orderedQty = i.qty("orderedQty");
      item.unitCost = i.price("unitCost");
      db.add(item);
    }
    db.flush();
    return view(po);
  }

  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Tra cứu số dư tồn của một sản phẩm tại một kho.
  private InventoryBalanceEntity balance(String warehouseId, String productId) {
    return first(
      InventoryBalanceEntity.class,
      Map.of("warehouseId", warehouseId, "productId", productId)
    );
  }

  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Ghi nhận biến động nhập hoặc xuất kho gắn với chứng từ.
  private void movement(
    String warehouseId,
    String productId,
    String type,
    int quantity,
    String ref
  ) {
    StockMovementEntity m = new StockMovementEntity();
    m.warehouseId = warehouseId;
    m.productId = productId;
    m.type = type;
    m.quantitySigned = quantity;
    m.referenceId = ref;
    db.add(m);
  }

  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Đối chiếu tồn kho với số serial đang ở trạng thái IN_STOCK.
  private void checkBalance(ProductEntity p, String warehouseId) {
    db.flush();
    if (p.trackingMode.equals("SERIALIZED")) {
      int count = db
        .find(
          ProductSerialEntity.class,
          Map.of(
            "productId",
            p.id,
            "warehouseId",
            warehouseId,
            "status",
            "IN_STOCK"
          )
        )
        .size();
      InventoryBalanceEntity b = balance(warehouseId, p.id);
      if (count != (b == null ? 0 : b.onHand)) conflict(
        "Tồn và số serial chưa nhất quán"
      );
    }
  }

  @Override
  // Ngày thực hiện: 21/10/2026 (theo kế hoạch).
  // Người thực hiện: Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Nhận hàng theo đơn mua, ghi serial, tăng tồn và cập nhật trạng thái đơn.
  public Object receive(Map<String, Object> b, String userId) {
    Input in = new Input(
      b,
      "purchaseOrderId",
      "warehouseId",
      "clientRequestId",
      "items"
    );
    String key = in.text("clientRequestId", 100, true);
    if (key.length() < 8) Input.bad("Mã yêu cầu quá ngắn");
    if (
      first(GoodsReceiptEntity.class, Map.of("clientRequestId", key)) != null
    ) conflict("Yêu cầu đã xử lý");
    PurchaseOrderEntity po = db.lock(
      PurchaseOrderEntity.class,
      in.id("purchaseOrderId")
    );
    if (!List.of("ORDERED", "PARTIALLY_RECEIVED").contains(po.status)) conflict(
      "Đơn mua chưa gửi hoặc đã nhận đủ"
    );
    WarehouseEntity w = db.get(WarehouseEntity.class, in.id("warehouseId"));
    if (!w.isActive) Input.bad("Kho đã ngừng hoạt động");
    List<Map<String, Object>> rows = in.rows("items", true);
    List<String> itemIds = rows
      .stream()
      .map(r ->
        new Input(r, "purchaseOrderItemId", "quantity", "serials").id(
          "purchaseOrderItemId"
        )
      )
      .toList();
    Input.unique(itemIds);
    List<PurchaseOrderItemEntity> poItems = db.find(
      PurchaseOrderItemEntity.class,
      Map.of("purchaseOrderId", po.id)
    );
    lockProducts(
      poItems
        .stream()
        .map(i -> i.productId)
        .toList()
    );
    GoodsReceiptEntity gr = new GoodsReceiptEntity();
    gr.code = code("GR");
    gr.clientRequestId = key;
    gr.purchaseOrderId = po.id;
    gr.warehouseId = w.id;
    gr.createdById = userId;
    gr.receivedAt = Instant.now();
    db.add(gr);
    for (Map<String, Object> row : rows) {
      Input i = new Input(row, "purchaseOrderItemId", "quantity", "serials");
      PurchaseOrderItemEntity pi = poItems
        .stream()
        .filter(x -> x.id.equals(i.id("purchaseOrderItemId")))
        .findFirst()
        .orElseThrow(() ->
          new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Dòng hàng không thuộc đơn mua"
          )
        );
      int qty = i.qty("quantity");
      if (qty > pi.orderedQty - pi.receivedQty) conflict(
        "Nhập vượt số lượng còn lại"
      );
      ProductEntity p = db.get(ProductEntity.class, pi.productId);
      List<Map<String, Object>> serials = i.rows("serials", false);
      if (
        p.trackingMode.equals("SERIALIZED")
          ? serials.size() != qty
          : !serials.isEmpty()
      ) Input.bad("Số serial phải khớp số lượng; BULK không có serial");
      GoodsReceiptItemEntity ri = new GoodsReceiptItemEntity();
      ri.receiptId = gr.id;
      ri.purchaseOrderItemId = pi.id;
      ri.quantity = qty;
      ri.unitCost = pi.unitCost;
      db.add(ri);
      Set<String> codes = new HashSet<>();
      for (Map<String, Object> rowSerial : serials) {
        Input si = serialInput(rowSerial);
        String c = normalized(si.text("code", 120, true)),
          kind = si.choice("kind", "SERIAL", "IMEI");
        if (!codes.add(c)) Input.bad("Mã trong phiếu bị trùng");
        ProductSerialEntity s = first(
          ProductSerialEntity.class,
          Map.of("normalizedCode", c)
        );
        if (s == null) {
          s = new ProductSerialEntity();
          s.productId = p.id;
          s.code = c;
          s.normalizedCode = c;
          s.kind = kind;
          s.status = "REGISTERED";
          db.add(s);
        } else {
          s = db.lock(ProductSerialEntity.class, s.id);
          if (
            !s.productId.equals(p.id) ||
            !s.kind.equals(kind) ||
            !s.status.equals("REGISTERED")
          ) conflict("Serial đã nhập/bán hoặc khác sản phẩm/loại mã");
        }
        s.status = "IN_STOCK";
        s.warehouseId = w.id;
        s.receiptItemId = ri.id;
      }
      pi.receivedQty += qty;
      InventoryBalanceEntity bal = balance(w.id, p.id);
      if (bal == null) {
        bal = new InventoryBalanceEntity();
        bal.productId = p.id;
        bal.warehouseId = w.id;
        db.add(bal);
      }
      bal.onHand += qty;
      movement(w.id, p.id, "RECEIPT", qty, gr.id);
      checkBalance(p, w.id);
    }
    po.status = poItems.stream().allMatch(i -> i.receivedQty == i.orderedQty)
      ? "RECEIVED"
      : "PARTIALLY_RECEIVED";
    db.flush();
    return view(gr);
  }

  @Override
  // Ngày thực hiện: 29/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Minh Quang.
  // Chức năng của hàm: Tạo đơn bán nháp, kiểm tra tồn và serial, chốt giá và tính tổng tiền.
  public Object sale(Map<String, Object> b, String userId) {
    Input in = new Input(
      b,
      "warehouseId",
      "customerName",
      "customerPhone",
      "items"
    );
    WarehouseEntity w = db.get(WarehouseEntity.class, in.id("warehouseId"));
    if (!w.isActive) Input.bad("Kho đã ngừng hoạt động");
    List<Map<String, Object>> rows = in.rows("items", true);
    List<String> ids = rows
      .stream()
      .map(r ->
        new Input(r, "productId", "quantity", "serialIds").id("productId")
      )
      .toList();
    Input.unique(ids);
    lockProducts(ids);
    SalesOrderEntity so = new SalesOrderEntity();
    so.code = code("SO");
    so.warehouseId = w.id;
    so.customerName = in.text("customerName", 160, false);
    so.customerPhone = in.text("customerPhone", 30, false);
    so.status = "DRAFT";
    so.createdById = userId;
    so.total = BigDecimal.ZERO;
    so.subtotal = BigDecimal.ZERO;
    db.add(so);
    for (Map<String, Object> row : rows) {
      Input i = new Input(row, "productId", "quantity", "serialIds");
      ProductEntity p = db.get(ProductEntity.class, i.id("productId"));
      if (!p.isActive) Input.bad("Sản phẩm đã ngừng kinh doanh");
      int qty = i.qty("quantity");
      List<String> serialIds = i.ids("serialIds");
      if (
        p.trackingMode.equals("SERIALIZED")
          ? serialIds.size() != qty
          : !serialIds.isEmpty()
      ) Input.bad("Số lượng serial không hợp lệ");
      InventoryBalanceEntity bal = balance(w.id, p.id);
      if (bal == null || bal.onHand < qty) conflict("Không đủ tồn kho");
      SalesOrderItemEntity item = new SalesOrderItemEntity();
      item.salesOrderId = so.id;
      item.productId = p.id;
      item.quantity = qty;
      item.unitPriceSnapshot = p.unitPrice;
      item.lineTotal = p.unitPrice.multiply(BigDecimal.valueOf(qty));
      db.add(item);
      so.total = so.total.add(item.lineTotal);
      for (String sid : serialIds) {
        ProductSerialEntity s = db.get(ProductSerialEntity.class, sid);
        if (
          !s.status.equals("IN_STOCK") ||
          !p.id.equals(s.productId) ||
          !w.id.equals(s.warehouseId)
        ) conflict("Serial không còn trong đúng kho/sản phẩm");
        SalesOrderItemSerialEntity selected = new SalesOrderItemSerialEntity();
        selected.salesOrderItemId = item.id;
        selected.productSerialId = sid;
        db.add(selected);
      }
    }
    so.subtotal = so.total;
    db.flush();
    return view(so);
  }

  @Override
  // Ngày thực hiện: 13/10/2026 (theo kế hoạch).
  // Người thực hiện: Tạ Việt Hoàng + Khomkitsak Kamphoutthasak + Tạ Minh Quang.
  // Chức năng của hàm: Chuyển trạng thái sản phẩm hoặc đơn hàng; trừ tồn và đánh dấu serial khi xác nhận bán.
  public Object action(String kind, String id, String action) {
    if (kind.equals("products") && action.equals("deactivate")) {
      ProductEntity p = db.lock(ProductEntity.class, id);
      p.isActive = false;
      return view(p);
    }
    if (kind.equals("purchase-orders")) {
      PurchaseOrderEntity po = db.lock(PurchaseOrderEntity.class, id);
      if (!po.status.equals("DRAFT")) conflict("Chỉ gửi hoặc hủy đơn DRAFT");
      if (!List.of("submit", "cancel").contains(action)) Input.bad(
        "Thao tác không hợp lệ"
      );
      po.status = action.equals("submit") ? "ORDERED" : "CANCELLED";
      return view(po);
    }
    if (
      !kind.equals("sales-orders") ||
      !List.of("confirm", "cancel").contains(action)
    ) Input.bad("Thao tác không hợp lệ");
    SalesOrderEntity so = db.lock(SalesOrderEntity.class, id);
    if (!so.status.equals("DRAFT")) conflict("Chỉ xác nhận hoặc hủy đơn DRAFT");
    if (action.equals("cancel")) {
      so.status = "CANCELLED";
      return view(so);
    }
    if (!db.get(WarehouseEntity.class, so.warehouseId).isActive) conflict(
      "Kho ngừng hoạt động"
    );
    List<SalesOrderItemEntity> items = db.find(
      SalesOrderItemEntity.class,
      Map.of("salesOrderId", so.id)
    );
    lockProducts(
      items
        .stream()
        .map(i -> i.productId)
        .toList()
    );
    for (SalesOrderItemEntity i : items) {
      ProductEntity p = db.get(ProductEntity.class, i.productId);
      if (!p.isActive) conflict("Sản phẩm ngừng kinh doanh");
      List<SalesOrderItemSerialEntity> serials = db.find(
        SalesOrderItemSerialEntity.class,
        Map.of("salesOrderItemId", i.id)
      );
      if (p.trackingMode.equals("SERIALIZED")) {
        if (serials.size() != i.quantity) conflict("Số serial không khớp");
        for (SalesOrderItemSerialEntity selected : serials) {
          ProductSerialEntity s = db.lock(
            ProductSerialEntity.class,
            selected.productSerialId
          );
          if (
            !s.status.equals("IN_STOCK") ||
            !s.productId.equals(p.id) ||
            !so.warehouseId.equals(s.warehouseId)
          ) conflict("Serial đã bán hoặc không còn trong kho");
          s.status = "SOLD";
          s.soldAt = Instant.now();
        }
      }
      InventoryBalanceEntity bal = balance(so.warehouseId, p.id);
      if (bal == null || bal.onHand < i.quantity) conflict("Không đủ tồn kho");
      bal.onHand -= i.quantity;
      movement(so.warehouseId, p.id, "SALE", -i.quantity, so.id);
      checkBalance(p, so.warehouseId);
    }
    so.status = "CONFIRMED";
    so.confirmedAt = Instant.now();
    db.flush();
    return view(so);
  }
}
