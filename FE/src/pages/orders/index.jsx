import { useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
} from "antd";
import { all, api, date, money } from "../../services/api";
import {
  Heading,
  Listing,
  options,
  required,
  Status,
} from "../../components/Common";
// Ngày thực hiện: 30/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị dòng bán hàng, tồn khả dụng và lựa chọn serial theo kho.
function SalesLine({ form, index, products, warehouseId }) {
  const productId = Form.useWatch(["items", index, "productId"], form);
  const product = products.find((p) => /* Ngày thực hiện: 30/10/2026 (theo kế hoạch).
     Người thực hiện: Nguyễn Đình Duy.
     Chức năng của hàm: Tìm sản phẩm đang được chọn trên dòng bán hàng. */
    p.id === productId);
  const [serials, setSerials] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [stock, setStock] = useState();
  useEffect(() => {
    // Ngày thực hiện: 30/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Tải tồn kho và serial khả dụng khi sản phẩm hoặc kho thay đổi.

    let alive = true;
    setSerials([]);
    setStock(undefined);
    setError("");
    if (!productId || !warehouseId) return;
    setLoading(true);
    Promise.all([
      all("/inventory/balances", { productId, warehouseId }),
      product?.trackingMode === "SERIALIZED"
        ? all("/serials/available", { productId, warehouseId })
        : Promise.resolve([]),
    ])
      .then(([balances, available]) => {
        // Ngày thực hiện: 30/10/2026 (theo kế hoạch).
        // Người thực hiện: Nguyễn Đình Duy.
        // Chức năng của hàm: Cập nhật serial khả dụng và số lượng tồn cho dòng bán hàng.

        if (alive) {
          setSerials(available);
          setStock(balances[0]?.onHand ?? 0);
        }
      })
      .catch((e) => {
        // Ngày thực hiện: 30/10/2026 (theo kế hoạch).
        // Người thực hiện: Nguyễn Đình Duy.
        // Chức năng của hàm: Hiển thị thông báo lỗi của thao tác hiện tại.

        if (alive) setError(e.message);
      })
      .finally(() => {
        // Ngày thực hiện: 30/10/2026 (theo kế hoạch).
        // Người thực hiện: Nguyễn Đình Duy.
        // Chức năng của hàm: Kết thúc trạng thái đang tải khi yêu cầu hoàn tất.

        if (alive) setLoading(false);
      });
    return () => {
      // Ngày thực hiện: 30/10/2026 (theo kế hoạch).
      // Người thực hiện: Nguyễn Đình Duy.
      // Chức năng của hàm: Ngăn cập nhật trạng thái từ yêu cầu cũ khi effect được dọn dẹp.

      alive = false;
    };
  }, [productId, warehouseId, product?.trackingMode]);
  return (
    <>
      {error && <Alert type="error" message={error} />}
      <Form.Item name={[index, "productId"]} label="Sản phẩm" rules={required}>
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Chọn sản phẩm"
          options={options(products, true)}
          onChange={() => {
            // Ngày thực hiện: 30/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Xóa serial đã chọn và đặt số lượng về một khi đổi sản phẩm.

            form.setFieldValue(["items", index, "serialIds"], []);
            form.setFieldValue(["items", index, "quantity"], 1);
          }}
        />
      </Form.Item>
      <Typography.Paragraph type="secondary">
        {product
          ? `Giá: ${money(product.unitPrice)} · Tồn: ${stock ?? "…"}`
          : "Chọn kho và sản phẩm để xem tồn"}
      </Typography.Paragraph>
      <Form.Item name={[index, "quantity"]} label="Số lượng" rules={required}>
        <InputNumber min={1} max={1000000} precision={0} />
      </Form.Item>
      {product?.trackingMode === "SERIALIZED" && (
        <Form.Item
          name={[index, "serialIds"]}
          label="Serial đang trong kho"
          rules={[
            { required: true, message: "Chọn serial" },
            {
              validator: (_, v) =>
                /* Ngày thực hiện: 30/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Kiểm tra số serial được chọn bằng số lượng bán. */
                v?.length === form.getFieldValue(["items", index, "quantity"])
                  ? Promise.resolve()
                  : Promise.reject(new Error("Số mã phải bằng số lượng")),
            },
          ]}
        >
          <Select
            mode="multiple"
            loading={loading}
            disabled={!warehouseId}
            options={serials.map((s) => (/* Ngày thực hiện: 30/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Chuyển serial thành lựa chọn gồm ID và mã. */
              { value: s.id, label: s.code }))}
            placeholder="Chọn đúng số lượng mã"
          />
        </Form.Item>
      )}
    </>
  );
}
// Ngày thực hiện: 22/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Quản lý danh sách, tạo và chuyển trạng thái đơn mua hoặc đơn bán.
export function Orders({ kind, admin }) {
  const purchase = kind === "purchase",
    path = purchase ? "/purchase-orders" : "/sales-orders",
    title = purchase ? "Đơn mua hàng" : "Đơn bán hàng";
  const [products, setProducts] = useState([]),
    [suppliers, setSuppliers] = useState([]),
    [warehouses, setWarehouses] = useState([]),
    [open, setOpen] = useState(false),
    [detail, setDetail] = useState(null),
    [status, setStatus] = useState(),
    [refresh, setRefresh] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [detailBusy, setDetailBusy] = useState(false);
  const [form] = Form.useForm();
  const warehouseId = Form.useWatch("warehouseId", form);
  const { message } = App.useApp();
  // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Tải sản phẩm, nhà cung cấp và kho đang hoạt động cho biểu mẫu đơn hàng.
  const loadRefs = () =>
    Promise.all([
      all("/products", { active: "true" }),
      all("/suppliers", { active: "true" }),
      all("/warehouses", { active: "true" }),
    ]).then(([p, s, w]) => {
      // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
      // Người thực hiện: Nguyễn Đình Duy.
      // Chức năng của hàm: Cập nhật sản phẩm, nhà cung cấp và kho dùng trong biểu mẫu.

      setProducts(p);
      setSuppliers(s);
      setWarehouses(w);
    });
  // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Tải và mở chi tiết đơn hàng theo ID.
  const show = async (id) => {
    setDetailBusy(true);
    try {
      setDetail(await api(`${path}/${id}`));
    } catch (e) {
      message.error(e.message);
    } finally {
      setDetailBusy(false);
    }
  };
  // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Gửi thao tác chuyển trạng thái đơn và cập nhật danh sách.
  const action = async (action) => {
    setBusy(true);
    try {
      setDetail(await api(`${path}/${detail.id}/${action}`, "POST", {}));
      setRefresh((v) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
        v + 1);
      message.success("Đã cập nhật đơn");
    } catch (e) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Heading
        title={title}
        description={
          purchase
            ? "Lập đơn mua → gửi đơn → nhận hàng từng phần hoặc toàn bộ."
            : "Đơn nháp giữ nguyên tồn kho. Xác nhận đơn để xuất hàng."
        }
        action={
          (!purchase || admin) && (
            <Button
              type="primary"
              onClick={async () => {
                // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                // Người thực hiện: Nguyễn Đình Duy.
                // Chức năng của hàm: Tải dữ liệu tham chiếu và mở biểu mẫu tạo đơn nháp.

                try {
                  await loadRefs();
                  form.resetFields();
                  form.setFieldsValue({
                    items: [
                      purchase
                        ? { orderedQty: 1, unitCost: 0 }
                        : { quantity: 1, serialIds: [] },
                    ],
                  });
                  setError("");
                  setOpen(true);
                } catch (e) {
                  message.error(e.message);
                }
              }}
            >
              Tạo đơn {purchase ? "mua" : "bán"}
            </Button>
          )
        }
      />
      <Listing
        path={path}
        refresh={refresh}
        filters={{ status }}
        toolbar={
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Trạng thái"
            onChange={setStatus}
            options={(purchase
              ? [
                  "DRAFT",
                  "ORDERED",
                  "PARTIALLY_RECEIVED",
                  "RECEIVED",
                  "CANCELLED",
                ]
              : ["DRAFT", "CONFIRMED", "CANCELLED"]
            ).map((value) => (/* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Tạo lựa chọn lọc đơn hàng theo trạng thái. */
              { value, label: <Status value={value} /> }))}
          />
        }
        columns={[
          {
            title: "Mã đơn",
            render: (_, r) => (
              /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị liên kết mở chi tiết bản ghi trong bảng. */
              <Button
                type="link"
                loading={detailBusy}
                onClick={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Tải và hiển thị chi tiết đơn hàng được chọn. */
                  show(r.id)}
              >
                {r.code}
              </Button>
            ),
          },
          {
            title: purchase ? "Nhà cung cấp" : "Khách hàng",
            render: (_, r) =>
              /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị nhà cung cấp hoặc tên khách hàng trong bảng. */
              purchase ? r.supplier.name : r.customerName || "Khách lẻ",
          },
          ...(!purchase
            ? [
                {
                  title: "Kho",
                  render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị tên kho trong bảng. */
                    r.warehouse.name,
                },
                {
                  title: "Tổng tiền",
                  render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị giá trị tiền đã định dạng trong bảng. */
                    money(r.total),
                },
              ]
            : []),
          {
            title: "Trạng thái",
            render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị nhãn trạng thái trong bảng. */
              <Status value={r.status} />,
          },
          {
            title: "Ngày tạo",
            render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị thời điểm đã định dạng trong bảng. */
              date(r.createdAt),
          },
        ]}
      />
      <Modal
        width={820}
        title={`Tạo đơn ${purchase ? "mua" : "bán"}`}
        open={open}
        onCancel={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng biểu mẫu đang mở. */
          setOpen(false)}
        onOk={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Kích hoạt kiểm tra và gửi biểu mẫu. */
          form.submit()}
        confirmLoading={busy}
        okText="Lưu đơn nháp"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (b) => {
            // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Gửi đơn nháp, mở chi tiết và làm mới danh sách đơn.

            setBusy(true);
            setError("");
            try {
              const r = await api(path, "POST", b);
              setOpen(false);
              setDetail(r);
              setRefresh((v) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                v + 1);
              message.success("Đã tạo đơn nháp");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && <Alert type="error" message={error} />}{" "}
          {purchase ? (
            <Form.Item name="supplierId" label="Nhà cung cấp" rules={required}>
              <Select
                placeholder="Chọn nhà cung cấp"
                options={options(suppliers, true)}
              />
            </Form.Item>
          ) : (
            <>
              <Form.Item name="warehouseId" label="Kho xuất" rules={required}>
                <Select
                  placeholder="Chọn kho xuất"
                  options={options(warehouses, true)}
                  onChange={() => {
                    // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                    // Người thực hiện: Nguyễn Đình Duy.
                    // Chức năng của hàm: Xóa lựa chọn serial trên các dòng khi đổi kho xuất.

                    const items = form.getFieldValue("items") ?? [];
                    form.setFieldsValue({
                      items: items.map((i) => (/* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                         Người thực hiện: Nguyễn Đình Duy.
                         Chức năng của hàm: Giữ thông tin dòng hàng và xóa danh sách serial đã chọn. */
                        { ...i, serialIds: [] })),
                    });
                  }}
                />
              </Form.Item>
              <div className="form-grid">
                <Form.Item name="customerName" label="Tên khách hàng">
                  <Input maxLength={160} />
                </Form.Item>
                <Form.Item name="customerPhone" label="Điện thoại">
                  <Input maxLength={30} />
                </Form.Item>
              </div>
            </>
          )}
          <Form.List
            name="items"
            rules={[
              {
                validator: (_, items) =>
                  /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Kiểm tra đơn hàng có ít nhất một dòng sản phẩm. */
                  items?.length
                    ? Promise.resolve()
                    : Promise.reject(new Error("Cần ít nhất một dòng hàng")),
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị danh sách dòng hàng cùng thao tác thêm và xóa. */
              <>
                <Form.ErrorList errors={errors} />
                {fields.map((field) => (
                  /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Hiển thị biểu mẫu sản phẩm, số lượng và giá của từng dòng. */
                  <Card
                    size="small"
                    className="line-card"
                    key={field.key}
                    title={`Dòng ${field.name + 1}`}
                    extra={
                      <Button
                        danger
                        size="small"
                        onClick={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                           Người thực hiện: Nguyễn Đình Duy.
                           Chức năng của hàm: Xóa dòng hàng được chọn khỏi biểu mẫu. */
                          remove(field.name)}
                      >
                        Bỏ dòng
                      </Button>
                    }
                  >
                    {purchase ? (
                      <>
                        <Form.Item
                          name={[field.name, "productId"]}
                          label="Sản phẩm"
                          rules={required}
                        >
                          <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Chọn sản phẩm"
                            options={options(products, true)}
                          />
                        </Form.Item>
                        <div className="form-grid">
                          <Form.Item
                            name={[field.name, "orderedQty"]}
                            label="Số lượng đặt"
                            rules={required}
                          >
                            <InputNumber min={1} max={1000000} precision={0} />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "unitCost"]}
                            label="Giá nhập (VNĐ)"
                            rules={required}
                          >
                            <InputNumber
                              min={0}
                              max={999999999999}
                              precision={2}
                            />
                          </Form.Item>
                        </div>
                      </>
                    ) : (
                      <SalesLine
                        form={form}
                        index={field.name}
                        products={products}
                        warehouseId={warehouseId}
                      />
                    )}
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Thêm dòng hàng với giá trị mặc định theo loại đơn. */
                    add(
                      purchase
                        ? { orderedQty: 1, unitCost: 0 }
                        : { quantity: 1, serialIds: [] },
                    )
                  }
                >
                  Thêm dòng hàng
                </Button>
              </>
            )}
          </Form.List>
          {!purchase && (
            <Alert
              type="info"
              message="Giá và tổng tiền được máy chủ chốt khi lưu đơn. Đơn nháp chưa giữ chỗ serial."
            />
          )}
        </Form>
      </Modal>
      <Drawer
        width={900}
        title={detail?.code}
        open={!!detail}
        onClose={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng khung chi tiết bản ghi. */
          setDetail(null)}
      >
        {detail && (
          <>
            <Descriptions
              column={2}
              items={[
                {
                  key: "status",
                  label: "Trạng thái",
                  children: <Status value={detail.status} />,
                },
                {
                  key: "date",
                  label: "Ngày tạo",
                  children: date(detail.createdAt),
                },
                {
                  key: "partner",
                  label: purchase ? "Nhà cung cấp" : "Khách hàng",
                  children: purchase
                    ? detail.supplier.name
                    : detail.customerName || "Khách lẻ",
                },
                ...(!purchase
                  ? [
                      {
                        key: "total",
                        label: "Tổng tiền",
                        children: money(detail.total),
                      },
                      {
                        key: "warehouse",
                        label: "Kho xuất",
                        children: detail.warehouse.name,
                      },
                    ]
                  : []),
              ]}
            />
            <Table
              rowKey="id"
              pagination={false}
              dataSource={detail.items}
              scroll={{ x: 650 }}
              columns={[
                {
                  title: "Sản phẩm",
                  render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị tên sản phẩm trong bảng. */
                    r.product.name,
                },
                {
                  title: "Số lượng",
                  dataIndex: purchase ? "orderedQty" : "quantity",
                },
                ...(purchase
                  ? [
                      { title: "Đã nhận", dataIndex: "receivedQty" },
                      {
                        title: "Còn lại",
                        render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                           Người thực hiện: Nguyễn Đình Duy.
                           Chức năng của hàm: Hiển thị số lượng hàng còn chưa nhận trong bảng. */
                          r.orderedQty - r.receivedQty,
                      },
                    ]
                  : [
                      {
                        title: "Serial",
                        render: (_, r) =>
                          /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                           Người thực hiện: Nguyễn Đình Duy.
                           Chức năng của hàm: Hiển thị danh sách mã serial trong bảng. */
                          r.serials
                            .map((s) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                               Người thực hiện: Nguyễn Đình Duy.
                               Chức năng của hàm: Lấy mã serial được gắn với dòng bán hàng. */
                              s.productSerial.code)
                            .join(", ") || "—",
                      },
                    ]),
                {
                  title: "Đơn giá",
                  render: (_, r) =>
                    /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị giá trị tiền đã định dạng trong bảng. */
                    money(purchase ? r.unitCost : r.unitPriceSnapshot),
                },
              ]}
            />
            {detail.status === "DRAFT" && (!purchase || admin) && (
              <Space className="toolbar">
                <Popconfirm
                  title={
                    purchase
                      ? "Gửi đơn mua này?"
                      : "Xác nhận bán và trừ tồn kho?"
                  }
                  onConfirm={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Gửi đơn mua hoặc xác nhận đơn bán tùy loại đơn. */
                    action(purchase ? "submit" : "confirm")}
                >
                  <Button type="primary" loading={busy}>
                    {purchase ? "Gửi đơn mua" : "Xác nhận bán"}
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Hủy đơn nháp này?"
                  onConfirm={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Gửi yêu cầu hủy đơn nháp. */
                    action("cancel")}
                >
                  <Button danger loading={busy}>
                    Hủy đơn
                  </Button>
                </Popconfirm>
              </Space>
            )}
            {purchase &&
              ["ORDERED", "PARTIALLY_RECEIVED"].includes(detail.status) && (
                <Alert
                  type="info"
                  message="Vào Phiếu nhập → Tạo phiếu nhập và chọn đơn này để nhận hàng."
                />
              )}
            {purchase && detail.receipts?.length > 0 && (
              <>
                <Typography.Title level={4}>Các lần nhập hàng</Typography.Title>
                {detail.receipts.map((r) => (
                  /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Hiển thị mã phiếu nhập, kho và thời gian nhận hàng. */
                  <p key={r.id}>
                    {r.code} · {r.warehouse.name} · {date(r.receivedAt)}
                  </p>
                ))}
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
// Ngày thực hiện: 22/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị lịch sử, chi tiết và biểu mẫu nhập hàng theo đơn mua.
export function Receipts({ admin }) {
  const [open, setOpen] = useState(false),
    [orders, setOrders] = useState([]),
    [warehouses, setWarehouses] = useState([]),
    [selected, setSelected] = useState(null),
    [detail, setDetail] = useState(null),
    [refresh, setRefresh] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [form] = Form.useForm();
  const { message } = App.useApp();
  // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Tải đơn mua chưa nhận đủ và kho, rồi mở biểu mẫu nhập hàng.
  const start = async () => {
    try {
      const [a, b, w] = await Promise.all([
        all("/purchase-orders", { status: "ORDERED" }),
        all("/purchase-orders", { status: "PARTIALLY_RECEIVED" }),
        all("/warehouses", { active: "true" }),
      ]);
      setOrders([...a, ...b]);
      setWarehouses(w);
      setSelected(null);
      form.resetFields();
      form.setFieldsValue({ clientRequestId: crypto.randomUUID() });
      setError("");
      setOpen(true);
    } catch (e) {
      message.error(e.message);
    }
  };
  return (
    <>
      <Heading
        title="Phiếu nhập"
        description="Nhận hàng theo đơn mua. Mỗi phiếu nhập cập nhật tồn kho và lịch sử trong một giao dịch."
        action={
          admin && (
            <Button type="primary" onClick={start}>
              Tạo phiếu nhập
            </Button>
          )
        }
      />
      <Listing
        path="/goods-receipts"
        refresh={refresh}
        columns={[
          {
            title: "Mã phiếu",
            render: (_, r) => (
              /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị liên kết mở chi tiết bản ghi trong bảng. */
              <Button type="link" onClick={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Mở khung chi tiết của bản ghi được chọn. */
                setDetail(r)}>
                {r.code}
              </Button>
            ),
          },
          {
            title: "Đơn mua",
            render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị mã đơn mua trong bảng. */
              r.purchaseOrder.code,
          },
          { title: "Kho", render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
             Người thực hiện: Nguyễn Đình Duy.
             Chức năng của hàm: Hiển thị tên kho trong bảng. */
            r.warehouse.name },
          {
            title: "Ngày nhập",
            render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị thời điểm đã định dạng trong bảng. */
              date(r.receivedAt),
          },
        ]}
      />
      <Modal
        title="Tạo phiếu nhập"
        width={820}
        open={open}
        onCancel={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng biểu mẫu đang mở. */
          setOpen(false)}
        onOk={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Kích hoạt kiểm tra và gửi biểu mẫu. */
          form.submit()}
        okText="Nhập kho"
        confirmLoading={busy}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (b) => {
            // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Kiểm tra các dòng nhập và gửi phiếu nhận hàng lên API.

            setBusy(true);
            setError("");
            try {
              const items = selected.items
                .map((i) => {
                  // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                  // Người thực hiện: Nguyễn Đình Duy.
                  // Chức năng của hàm: Chuyển dòng biểu mẫu thành số lượng nhận và danh sách serial hợp lệ.

                  const value = b.lines?.[i.id] ?? {};
                  const serials = (value.codes ?? "")
                    .split(/\r?\n/)
                    .map((s) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Loại bỏ khoảng trắng đầu cuối của mã nhập vào. */
                      s.trim())
                    .filter(Boolean)
                    .map((code) => (/* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Tạo đối tượng serial với mã và loại mã được chọn. */
                      {
                      code,
                      kind: value.kind ?? "SERIAL",
                    }));
                  if (
                    value.quantity > 0 &&
                    i.product.trackingMode === "SERIALIZED" &&
                    serials.length !== value.quantity
                  )
                    throw new Error(
                      `${i.product.name}: số mã phải bằng số lượng nhận`,
                    );
                  return {
                    purchaseOrderItemId: i.id,
                    quantity: value.quantity ?? 0,
                    ...(i.product.trackingMode === "SERIALIZED"
                      ? { serials }
                      : {}),
                  };
                })
                .filter((i) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Chỉ giữ dòng có số lượng nhận lớn hơn không. */
                  i.quantity > 0);
              if (!items.length)
                throw new Error("Nhập số lượng cho ít nhất một dòng hàng");
              const r = await api("/goods-receipts", "POST", {
                purchaseOrderId: b.purchaseOrderId,
                warehouseId: b.warehouseId,
                clientRequestId: b.clientRequestId,
                items,
              });
              setOpen(false);
              setDetail(r);
              setRefresh((v) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                v + 1);
              message.success("Nhập kho thành công");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && <Alert type="error" message={error} />}
          <Form.Item name="clientRequestId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="purchaseOrderId"
            label="Đơn mua còn hàng chưa nhận"
            rules={required}
          >
            <Select
              options={orders.map((r) => (/* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tạo lựa chọn đơn mua với mã đơn và tên nhà cung cấp. */
                {
                value: r.id,
                label: `${r.code} · ${r.supplier.name}`,
              }))}
              onChange={(id) => {
                // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                // Người thực hiện: Nguyễn Đình Duy.
                // Chức năng của hàm: Chọn đơn mua và khởi tạo dữ liệu nhập cho từng dòng.

                const order = orders.find((r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Tìm đơn mua khớp ID được chọn. */
                  r.id === id);
                setSelected(order);
                form.setFieldsValue({
                  lines: Object.fromEntries(
                    order.items.map((i) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Khởi tạo số lượng nhận bằng không và thông tin serial trống. */
                      [
                      i.id,
                      { quantity: 0, kind: "SERIAL", codes: "" },
                    ]),
                  ),
                });
              }}
            />
          </Form.Item>
          <Form.Item name="warehouseId" label="Kho nhận" rules={required}>
            <Select
              placeholder="Chọn kho nhận"
              options={options(warehouses, true)}
            />
          </Form.Item>
          {selected?.items
            .filter((i) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Chỉ giữ các dòng đơn mua chưa nhận đủ số lượng. */
              i.receivedQty < i.orderedQty)
            .map((i) => (
              /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị biểu mẫu nhập số lượng và serial của dòng còn thiếu. */
              <Card
                key={i.id}
                size="small"
                className="line-card"
                title={`${i.product.name} · còn ${i.orderedQty - i.receivedQty}/${i.orderedQty}`}
              >
                <Form.Item
                  name={["lines", i.id, "quantity"]}
                  label="Số lượng nhận (0 để bỏ qua)"
                >
                  <InputNumber
                    min={0}
                    max={i.orderedQty - i.receivedQty}
                    precision={0}
                  />
                </Form.Item>
                {i.product.trackingMode === "SERIALIZED" && (
                  <>
                    <Form.Item name={["lines", i.id, "kind"]} label="Loại mã">
                      <Select
                        options={[
                          { value: "SERIAL", label: "Serial" },
                          { value: "IMEI", label: "IMEI" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      name={["lines", i.id, "codes"]}
                      label="Mỗi dòng một mã (đã đăng ký hoặc mã mới)"
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </>
                )}
              </Card>
            ))}
        </Form>
      </Modal>
      <Drawer
        width={850}
        title={detail?.code}
        open={!!detail}
        onClose={() => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng khung chi tiết bản ghi. */
          setDetail(null)}
      >
        {detail && (
          <>
            <Descriptions
              items={[
                {
                  key: "po",
                  label: "Đơn mua",
                  children: detail.purchaseOrder.code,
                },
                {
                  key: "warehouse",
                  label: "Kho",
                  children: detail.warehouse.name,
                },
                {
                  key: "date",
                  label: "Ngày nhận",
                  children: date(detail.receivedAt),
                },
              ]}
            />
            <Table
              rowKey="id"
              pagination={false}
              dataSource={detail.items}
              columns={[
                {
                  title: "Sản phẩm",
                  render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị tên sản phẩm của dòng nhập trong bảng. */
                    r.purchaseOrderItem.product.name,
                },
                { title: "Số lượng", dataIndex: "quantity" },
                {
                  title: "Giá nhập",
                  render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị giá trị tiền đã định dạng trong bảng. */
                    money(r.unitCost),
                },
                {
                  title: "Serial",
                  render: (_, r) =>
                    /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị danh sách mã serial trong bảng. */
                    r.serials.map((s) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Lấy mã của serial trong phiếu nhập. */
                      s.code).join(", ") || "—",
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
// Ngày thực hiện: 22/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị tồn kho và lịch sử nhập xuất, cho phép lọc theo kho.
export function Inventory() {
  const [warehouses, setWarehouses] = useState([]),
    [warehouseId, setWarehouseId] = useState();
  const { message } = App.useApp();
  useEffect(() => {
    // Ngày thực hiện: 22/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Tải danh sách kho cho bộ lọc tồn kho.

    all("/warehouses")
      .then(setWarehouses)
      .catch((e) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Hiển thị thông báo lỗi của thao tác hiện tại. */
        message.error(e.message));
  }, [message]);
  return (
    <>
      <Heading
        title="Tồn kho"
        description="Số lượng hiện có theo kho và sổ lịch sử nhập/xuất."
      />
      <Select
        allowClear
        placeholder="Tất cả kho"
        options={options(warehouses, true)}
        style={{ width: 280, marginBottom: 20 }}
        onChange={setWarehouseId}
      />
      <Tabs
        items={[
          {
            key: "balances",
            label: "Tồn hiện tại",
            children: (
              <Listing
                path="/inventory/balances"
                filters={{ warehouseId }}
                columns={[
                  {
                    title: "SKU",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị SKU sản phẩm trong bảng. */
                      r.product.sku,
                  },
                  {
                    title: "Sản phẩm",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị tên sản phẩm trong bảng. */
                      r.product.name,
                  },
                  {
                    title: "Kho",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị tên kho trong bảng. */
                      r.warehouse.name,
                  },
                  { title: "Tồn", dataIndex: "onHand" },
                  {
                    title: "Quản lý",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị nhãn trạng thái trong bảng. */
                      <Status value={r.product.trackingMode} />,
                  },
                ]}
              />
            ),
          },
          {
            key: "movements",
            label: "Lịch sử nhập / xuất",
            children: (
              <Listing
                path="/inventory/movements"
                filters={{ warehouseId }}
                columns={[
                  {
                    title: "Thời gian",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị thời điểm đã định dạng trong bảng. */
                      date(r.createdAt),
                  },
                  {
                    title: "Sản phẩm",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị tên sản phẩm trong bảng. */
                      r.product.name,
                  },
                  {
                    title: "Kho",
                    render: (_, r) => /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị tên kho trong bảng. */
                      r.warehouse.name,
                  },
                  {
                    title: "Nghiệp vụ",
                    render: (_, r) =>
                      /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị các thao tác cho bản ghi trong bảng. */
                      r.type === "RECEIPT" ? "Nhập hàng" : "Bán hàng",
                  },
                  {
                    title: "Biến động",
                    render: (_, r) => (
                      /* Ngày thực hiện: 22/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Hiển thị số lượng biến động với màu và dấu nhập xuất trong bảng. */
                      <Typography.Text
                        type={r.quantitySigned > 0 ? "success" : "danger"}
                      >
                        {r.quantitySigned > 0 ? "+" : ""}
                        {r.quantitySigned}
                      </Typography.Text>
                    ),
                  },
                  { title: "ID chứng từ", dataIndex: "referenceId" },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  );
}
