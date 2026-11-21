package com.javaweb;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import com.fasterxml.jackson.databind.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ModulesTest {

  static final String PASSWORD = System.getenv().getOrDefault(
    "TEST_SEED_PASSWORD",
    UUID.randomUUID().toString()
  );

  @DynamicPropertySource
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Cấu hình cơ sở dữ liệu kiểm thử riêng và mật khẩu tài khoản mẫu.
  static void config(DynamicPropertyRegistry r) {
    String url = System.getenv().getOrDefault(
      "TEST_JDBC_URL",
      "jdbc:h2:mem:mdl_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;NON_KEYWORDS=USER;DB_CLOSE_DELAY=-1"
    );
    if (!url.toLowerCase().contains("test")) throw new IllegalStateException(
      "Tests require an isolated test database"
    );
    r.add("spring.datasource.url", () -> url);
    r.add("spring.datasource.username", () ->
      System.getenv().getOrDefault("TEST_DB_USER", "sa")
    );
    r.add("spring.datasource.password", () ->
      System.getenv().getOrDefault("TEST_DB_PASSWORD", "")
    );
    r.add("app.seed.admin-password", () -> PASSWORD);
    r.add("app.seed.staff-password", () -> PASSWORD);
  }

  @Autowired
  MockMvc mvc;

  @Autowired
  ObjectMapper mapper;

  MockHttpSession admin, staff;
  String prefix, product, warehouse, supplier, category;
  Map<String, Object> productBody;

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Gửi yêu cầu API bằng MockMvc và xác nhận HTTP status mong đợi.
  JsonNode call(
    String method,
    String path,
    Object body,
    MockHttpSession session,
    int status
  ) throws Exception {
    var req = switch (method) {
      case "POST" -> post("/api/v1" + path);
      case "PATCH" -> patch("/api/v1" + path);
      case "DELETE" -> delete("/api/v1" + path);
      default -> get("/api/v1" + path);
    };
    if (session != null) req.session(session);
    if (body != null) req
      .contentType("application/json")
      .content(mapper.writeValueAsBytes(body));
    var res = mvc.perform(req).andReturn().getResponse();
    assertEquals(status, res.getStatus(), res.getContentAsString());
    return mapper.readTree(res.getContentAsString());
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Gửi POST với quyền quản trị và lấy trường data.
  JsonNode postData(String path, Object body) throws Exception {
    return call("POST", path, body, admin, 201).get("data");
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Gửi GET với quyền quản trị và lấy trường data.
  JsonNode getData(String path) throws Exception {
    return call("GET", path, null, admin, 200).get("data");
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Đăng nhập tài khoản kiểm thử và lấy session.
  MockHttpSession login(String email) throws Exception {
    var res = mvc
      .perform(
        post("/api/v1/auth/login")
          .contentType("application/json")
          .content(
            mapper.writeValueAsBytes(
              Map.of("email", email, "password", PASSWORD)
            )
          )
      )
      .andReturn();
    assertEquals(
      201,
      res.getResponse().getStatus(),
      res.getResponse().getContentAsString()
    );
    return (MockHttpSession) res.getRequest().getSession();
  }

  @BeforeEach
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Tạo phiên và dữ liệu độc lập trước mỗi ca kiểm thử.
  void setup() throws Exception {
    prefix = "T-" + UUID.randomUUID().toString().substring(0, 8);
    admin = login("admin@example.local");
    staff = login("staff@example.local");
    category = postData("/categories", Map.of("name", prefix, "slug", prefix))
      .get("id")
      .asText();
    warehouse = postData("/warehouses", Map.of("code", prefix, "name", prefix))
      .get("id")
      .asText();
    supplier = postData("/suppliers", Map.of("code", prefix, "name", prefix))
      .get("id")
      .asText();
    productBody = Map.of(
      "sku",
      prefix,
      "name",
      prefix,
      "brand",
      "Test",
      "categoryId",
      category,
      "unitPrice",
      123456.78,
      "trackingMode",
      "SERIALIZED"
    );
    product = postData("/products", productBody).get("id").asText();
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Tạo và gửi đơn mua cho sản phẩm kiểm thử.
  JsonNode po(int qty, String pid) throws Exception {
    JsonNode po = postData(
      "/purchase-orders",
      Map.of(
        "supplierId",
        supplier,
        "items",
        List.of(Map.of("productId", pid, "orderedQty", qty, "unitCost", 100))
      )
    );
    postData("/purchase-orders/" + po.get("id").asText() + "/submit", Map.of());
    return po;
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Tạo nội dung phiếu nhập với số lượng và danh sách serial.
  Map<String, Object> receipt(JsonNode po, int qty, String... codes) {
    return Map.of(
      "purchaseOrderId",
      po.get("id").asText(),
      "warehouseId",
      warehouse,
      "clientRequestId",
      UUID.randomUUID().toString(),
      "items",
      List.of(
        Map.of(
          "purchaseOrderItemId",
          po.get("items").get(0).get("id").asText(),
          "quantity",
          qty,
          "serials",
          Arrays.stream(codes)
            .map(c -> Map.of("code", c, "kind", "SERIAL"))
            .toList()
        )
      )
    );
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Tạo nội dung đơn bán với sản phẩm, số lượng và ID serial.
  Map<String, Object> sale(String pid, int qty, String... ids) {
    return Map.of(
      "warehouseId",
      warehouse,
      "items",
      List.of(
        Map.of("productId", pid, "quantity", qty, "serialIds", List.of(ids))
      )
    );
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Đọc tồn kho của sản phẩm kiểm thử.
  int stock(String pid) throws Exception {
    JsonNode rows = getData(
      "/inventory/balances?warehouseId=" + warehouse + "&productId=" + pid
    );
    return rows.isEmpty() ? 0 : rows.get(0).get("onHand").asInt();
  }

  @Test
  // Ngày thực hiện: 15/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam + Tạ Việt Hoàng.
  // Chức năng của hàm: Kiểm thử phân quyền và luồng đăng ký serial, nhập kho, bán hàng, cập nhật tồn.
  void endToEndAndPermissions() throws Exception {
    call("GET", "/products", null, null, 401);
    call("POST", "/products", productBody, staff, 403);
    JsonNode registered = postData(
      "/products/" + product + "/serials",
      Map.of(
        "serials",
        List.of(Map.of("code", prefix + "-A", "kind", "SERIAL"))
      )
    );
    assertEquals("REGISTERED", registered.get(0).get("status").asText());
    assertEquals(0, stock(product));
    JsonNode po = po(2, product);
    assertEquals(0, stock(product));
    Map<String, Object> receipt = receipt(po, 2, prefix + "-A", prefix + "-B");
    postData("/goods-receipts", receipt);
    assertEquals(2, stock(product));
    call("POST", "/goods-receipts", receipt, admin, 409);
    String sn = getData("/serials/lookup/" + prefix + "-A")
      .get("id")
      .asText();
    JsonNode so = call(
      "POST",
      "/sales-orders",
      sale(product, 1, sn),
      staff,
      201
    ).get("data");
    assertEquals(2, stock(product));
    assertEquals(123456.78, so.get("total").asDouble(), .001);
    String id = so.get("id").asText();
    call("POST", "/sales-orders/" + id + "/confirm", Map.of(), staff, 201);
    assertEquals(1, stock(product));
    assertEquals(
      "SOLD",
      getData("/serials/" + sn)
        .get("status")
        .asText()
    );
    call("POST", "/sales-orders/" + id + "/confirm", Map.of(), staff, 409);
    call("POST", "/sales-orders/" + id + "/cancel", Map.of(), staff, 409);
    call("POST", "/sales-orders", sale(product, 1, sn), staff, 409);
    call(
      "PATCH",
      "/serials/" + sn,
      Map.of("code", "NEW", "kind", "SERIAL"),
      admin,
      409
    );
    JsonNode ledger = getData("/inventory/movements?productId=" + product);
    assertEquals(2, ledger.size());
    assertEquals(
      1,
      ledger.get(0).get("quantitySigned").asInt() +
        ledger.get(1).get("quantitySigned").asInt()
    );
  }

  @Test
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Kiểm thử dữ liệu không hợp lệ, mã trùng và chuẩn hóa serial.
  void validationAndNormalization() throws Exception {
    call("POST", "/products", productBody, admin, 409);
    Map<String, Object> bad = new HashMap<>(productBody);
    bad.put("unitPrice", -1);
    bad.put("sku", prefix + "-bad");
    call("POST", "/products", bad, admin, 400);
    postData(
      "/products/" + product + "/serials",
      Map.of(
        "serials",
        List.of(
          Map.of("code", " " + prefix.toLowerCase() + " ", "kind", "SERIAL")
        )
      )
    );
    call(
      "POST",
      "/products/" + product + "/serials",
      Map.of("serials", List.of(Map.of("code", prefix, "kind", "SERIAL"))),
      admin,
      409
    );
    call(
      "POST",
      "/products/" + product + "/serials",
      Map.of("serials", List.of(Map.of("code", "0123", "kind", "IMEI"))),
      admin,
      400
    );
    call("GET", "/products?pageSize=101", null, admin, 400);
    call("POST", "/goods-receipts", Map.of(), staff, 403);
    call("POST", "/purchase-orders", Map.of(), staff, 403);
  }

  @Test
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Kiểm thử rollback phiếu nhập khi số lượng hoặc serial không hợp lệ.
  void receiptsRollback() throws Exception {
    JsonNode po = po(2, product);
    call("POST", "/goods-receipts", receipt(po, 2, prefix + "-A"), admin, 400);
    call(
      "POST",
      "/goods-receipts",
      receipt(po, 2, prefix + "-A", prefix + "-A"),
      admin,
      400
    );
    call(
      "POST",
      "/goods-receipts",
      receipt(po, 3, prefix + "-A", prefix + "-B", prefix + "-C"),
      admin,
      409
    );
    assertEquals(0, stock(product));
    postData("/goods-receipts", receipt(po, 1, prefix + "-OLD"));
    assertEquals(
      "PARTIALLY_RECEIVED",
      getData("/purchase-orders/" + po.get("id").asText())
        .get("status")
        .asText()
    );
    JsonNode another = po(2, product);
    call(
      "POST",
      "/goods-receipts",
      receipt(another, 2, prefix + "-NEW", prefix + "-OLD"),
      admin,
      409
    );
    assertEquals(1, stock(product));
    call("GET", "/serials/lookup/" + prefix + "-NEW", null, admin, 404);
    assertEquals(
      0,
      getData("/purchase-orders/" + another.get("id").asText())
        .get("items")
        .get(0)
        .get("receivedQty")
        .asInt()
    );
  }

  @Test
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Kiểm thử hai đơn bán đồng thời không bán trùng cùng một serial.
  void concurrentSales() throws Exception {
    JsonNode po = po(1, product);
    postData("/goods-receipts", receipt(po, 1, prefix + "-S"));
    String sn = getData("/serials/lookup/" + prefix + "-S")
      .get("id")
      .asText();
    String one = postData("/sales-orders", sale(product, 1, sn))
        .get("id")
        .asText(),
      two = postData("/sales-orders", sale(product, 1, sn))
        .get("id")
        .asText();
    ExecutorService pool = Executors.newFixedThreadPool(2);
    try {
      List<Future<Integer>> tasks = pool.invokeAll(
        List.of(
          () -> status("/sales-orders/" + one + "/confirm", Map.of()),
          () -> status("/sales-orders/" + two + "/confirm", Map.of())
        )
      );
      List<Integer> statuses = new ArrayList<>();
      for (var f : tasks) statuses.add(f.get());
      Collections.sort(statuses);
      assertEquals(List.of(201, 409), statuses);
      assertEquals(0, stock(product));
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Kiểm thử nhập đồng thời không vượt số lượng đặt mua.
  void concurrentReceipts() throws Exception {
    JsonNode po = po(1, product);
    ExecutorService pool = Executors.newFixedThreadPool(2);
    try {
      var tasks = pool.invokeAll(
        List.<Callable<Integer>>of(
          () -> status("/goods-receipts", receipt(po, 1, prefix + "-A")),
          () -> status("/goods-receipts", receipt(po, 1, prefix + "-B"))
        )
      );
      List<Integer> statuses = new ArrayList<>();
      for (var f : tasks) statuses.add(f.get());
      Collections.sort(statuses);
      assertEquals(List.of(201, 409), statuses);
      assertEquals(1, stock(product));
    } finally {
      pool.shutdownNow();
    }
  }

  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Gửi POST và trả mã HTTP để kiểm tra giao dịch đồng thời.
  int status(String path, Object body) throws Exception {
    return mvc
      .perform(
        post("/api/v1" + path)
          .session(admin)
          .contentType("application/json")
          .content(mapper.writeValueAsBytes(body))
      )
      .andReturn()
      .getResponse()
      .getStatus();
  }

  @Test
  // Ngày thực hiện: 14/11/2026 (theo kế hoạch).
  // Người thực hiện: Souksakaiy Lothliam.
  // Chức năng của hàm: Kiểm thử hàng BULK, giới hạn tồn và giữ nguyên giá đã chốt trên đơn.
  void bulkAndSnapshot() throws Exception {
    Map<String, Object> body = new HashMap<>(productBody);
    body.put("sku", prefix + "-BULK");
    body.put("trackingMode", "BULK");
    String bulk = postData("/products", body).get("id").asText();
    JsonNode po = po(3, bulk);
    postData("/goods-receipts", receipt(po, 3));
    JsonNode one = postData("/sales-orders", sale(bulk, 2)),
      two = postData("/sales-orders", sale(bulk, 2));
    body.put("unitPrice", 900000);
    call("PATCH", "/products/" + bulk, body, admin, 200);
    postData("/sales-orders/" + one.get("id").asText() + "/confirm", Map.of());
    call(
      "POST",
      "/sales-orders/" + two.get("id").asText() + "/confirm",
      Map.of(),
      admin,
      409
    );
    assertEquals(1, stock(bulk));
    assertEquals(
      "DRAFT",
      getData("/sales-orders/" + two.get("id").asText())
        .get("status")
        .asText()
    );
    assertEquals(
      246913.56,
      getData("/sales-orders/" + one.get("id").asText())
        .get("total")
        .asDouble(),
      .001
    );
  }
}
