import { useEffect, useState } from "react";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
} from "antd";
import { all, api, money } from "../../services/api";
import {
  Active,
  Heading,
  Listing,
  options,
  required,
  Status,
} from "../../components/Common";
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Quản lý danh mục, nhà cung cấp và kho bằng biểu mẫu dùng chung.
export function Masters({ kind, admin }) {
  const title = {
    categories: "Danh mục",
    suppliers: "Nhà cung cấp",
    warehouses: "Kho hàng",
  }[kind];
  const [edit, setEdit] = useState(null),
    [refresh, setRefresh] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [form] = Form.useForm();
  const { message } = App.useApp();
  // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Đặt lại biểu mẫu và mở dữ liệu cần thêm hoặc chỉnh sửa.
  const open = (row = { isActive: true }) => {
    form.resetFields();
    form.setFieldsValue(row);
    setError("");
    setEdit(row);
  };
  return (
    <>
      <Heading
        title={title}
        description="Quản lý thông tin dùng chung trong các giao dịch."
        action={
          admin && (
            <Button type="primary" onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Mở biểu mẫu thêm bản ghi mới. */
              open()}>
              Thêm {title.toLowerCase()}
            </Button>
          )
        }
      />
      <Listing
        path={`/${kind}`}
        refresh={refresh}
        columns={[
          { title: "Mã", dataIndex: kind === "categories" ? "slug" : "code" },
          { title: "Tên", dataIndex: "name" },
          ...(kind === "suppliers"
            ? [
                { title: "Điện thoại", dataIndex: "phone" },
                { title: "Email", dataIndex: "email" },
              ]
            : []),
          ...(kind !== "categories"
            ? [
                {
                  title: "Hoạt động",
                  render: (_, r) => (
                    /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị trạng thái hoạt động trong bảng. */
                    <Active value={r.isActive} on="Hoạt động" off="Ngừng" />
                  ),
                },
              ]
            : []),
          ...(admin
            ? [
                {
                  title: "Thao tác",
                  render: (_, r) => (
                    /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị các thao tác cho bản ghi trong bảng. */
                    <Button size="small" onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                       Người thực hiện: Nguyễn Đình Duy.
                       Chức năng của hàm: Mở biểu mẫu chỉnh sửa bản ghi được chọn. */
                      open(r)}>
                      Sửa
                    </Button>
                  ),
                },
              ]
            : []),
        ]}
      />
      <Modal
        title={`${edit?.id ? "Sửa" : "Thêm"} ${title.toLowerCase()}`}
        open={!!edit}
        onCancel={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng biểu mẫu đang mở. */
          setEdit(null)}
        onOk={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Kích hoạt kiểm tra và gửi biểu mẫu. */
          form.submit()}
        confirmLoading={busy}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (b) => {
            // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Lưu danh mục, nhà cung cấp hoặc kho và tải lại danh sách.

            setBusy(true);
            setError("");
            try {
              await api(
                `/${kind}${edit?.id ? `/${edit.id}` : ""}`,
                edit?.id ? "PATCH" : "POST",
                b,
              );
              setEdit(null);
              setRefresh((v) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                v + 1);
              message.success("Đã lưu");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && <Alert type="error" message={error} />}
          <Form.Item
            name={kind === "categories" ? "slug" : "code"}
            label="Mã"
            rules={required}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={required}>
            <Input maxLength={160} />
          </Form.Item>
          {kind === "suppliers" && (
            <>
              <Form.Item name="phone" label="Điện thoại">
                <Input maxLength={30} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
                normalize={(v) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                   Người thực hiện: Nguyễn Đình Duy.
                   Chức năng của hàm: Chuyển email rỗng thành giá trị không xác định. */
                  v || undefined}
              >
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea maxLength={500} />
              </Form.Item>
            </>
          )}
          {kind !== "categories" && (
            <Form.Item
              name="isActive"
              label="Hoạt động"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị, lọc, thêm sửa và ngừng kinh doanh sản phẩm.
export function Products({ admin }) {
  const [categories, setCategories] = useState([]),
    [edit, setEdit] = useState(null),
    [detail, setDetail] = useState(null),
    [categoryId, setCategoryId] = useState(),
    [active, setActive] = useState(),
    [refresh, setRefresh] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  useEffect(() => {
    // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Tải danh mục sản phẩm cho bộ lọc và biểu mẫu.

    all("/categories")
      .then(setCategories)
      .catch((e) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Hiển thị thông báo lỗi của thao tác hiện tại. */
        message.error(e.message));
  }, [message]);
  // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Đặt lại biểu mẫu và mở dữ liệu cần thêm hoặc chỉnh sửa.
  const open = (
    r = { trackingMode: "SERIALIZED", isActive: true, unitPrice: 0 },
  ) => {
    form.resetFields();
    form.setFieldsValue({ ...r, unitPrice: Number(r.unitPrice) });
    setError("");
    setEdit(r);
  };
  return (
    <>
      <Heading
        title="Sản phẩm"
        description="Danh mục hàng hóa, giá bán và phương thức quản lý tồn kho."
        action={
          admin && (
            <Button type="primary" onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Mở biểu mẫu thêm bản ghi mới. */
              open()}>
              Thêm sản phẩm
            </Button>
          )
        }
      />
      <Listing
        path="/products"
        refresh={refresh}
        filters={{ categoryId, active }}
        toolbar={
          <>
            <Select
              allowClear
              placeholder="Danh mục"
              options={options(categories)}
              onChange={setCategoryId}
              style={{ width: 180 }}
            />
            <Select
              allowClear
              placeholder="Hoạt động"
              options={[
                { value: "true", label: "Đang kinh doanh" },
                { value: "false", label: "Ngừng kinh doanh" },
              ]}
              onChange={setActive}
              style={{ width: 180 }}
            />
          </>
        }
        columns={[
          { title: "SKU", dataIndex: "sku" },
          {
            title: "Tên sản phẩm",
            render: (_, r) => (
              /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị liên kết mở chi tiết bản ghi trong bảng. */
              <Button type="link" onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Mở khung chi tiết của bản ghi được chọn. */
                setDetail(r)}>
                {r.name}
              </Button>
            ),
          },
          {
            title: "Danh mục",
            render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị tên danh mục trong bảng. */
              r.category.name,
          },
          { title: "Hãng", dataIndex: "brand" },
          {
            title: "Giá bán",
            render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị giá trị tiền đã định dạng trong bảng. */
              money(r.unitPrice),
          },
          {
            title: "Quản lý",
            render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị nhãn trạng thái trong bảng. */
              <Status value={r.trackingMode} />,
          },
          {
            title: "Kinh doanh",
            render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị trạng thái hoạt động trong bảng. */
              <Active value={r.isActive} />,
          },
          ...(admin
            ? [
                {
                  title: "Thao tác",
                  render: (_, r) => (
                    /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                    <Space>
                      <Button size="small" onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                         Người thực hiện: Nguyễn Đình Duy.
                         Chức năng của hàm: Mở biểu mẫu chỉnh sửa bản ghi được chọn. */
                        open(r)}>
                      Sửa
                    </Button>
                      {r.isActive && (
                        <Popconfirm
                          title="Ngừng kinh doanh sản phẩm này?"
                          onConfirm={async () => {
                            // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                            // Người thực hiện: Nguyễn Đình Duy.
                            // Chức năng của hàm: Gọi API ngừng bán sản phẩm và làm mới danh sách.

                            try {
                              await api(`/products/${r.id}`, "DELETE");
                              setRefresh((v) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                                 Người thực hiện: Nguyễn Đình Duy.
                                 Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                                v + 1);
                            } catch (e) {
                              message.error(e.message);
                            }
                          }}
                        >
                          <Button size="small" danger type="text">
                            Ngừng bán
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />
      <Modal
        title={edit?.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={!!edit}
        onCancel={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng biểu mẫu đang mở. */
          setEdit(null)}
        onOk={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Kích hoạt kiểm tra và gửi biểu mẫu. */
          form.submit()}
        confirmLoading={busy}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (b) => {
            // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Gửi dữ liệu thêm hoặc sửa sản phẩm và thông báo kết quả.

            setBusy(true);
            setError("");
            try {
              await api(
                `/products${edit?.id ? `/${edit.id}` : ""}`,
                edit?.id ? "PATCH" : "POST",
                b,
              );
              setEdit(null);
              setRefresh((v) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                v + 1);
              message.success("Đã lưu sản phẩm");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && <Alert type="error" message={error} />}
          <Form.Item name="sku" label="SKU" rules={required}>
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item name="name" label="Tên sản phẩm" rules={required}>
            <Input maxLength={160} />
          </Form.Item>
          <Form.Item name="brand" label="Hãng" rules={required}>
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={required}>
            <Select
              options={options(categories)}
              placeholder="Chọn danh mục (tạo ở MDL1 · Danh mục nếu chưa có)"
            />
          </Form.Item>
          <Form.Item name="unitPrice" label="Giá bán (VNĐ)" rules={required}>
            <InputNumber
              min={0}
              max={999999999999}
              precision={2}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="trackingMode" label="Quản lý" rules={required}>
            <Select
              options={[
                { value: "SERIALIZED", label: "Theo Serial/IMEI" },
                { value: "BULK", label: "Theo số lượng" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Đang kinh doanh"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title={detail?.name}
        open={!!detail}
        onClose={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng khung chi tiết bản ghi. */
          setDetail(null)}
        width={760}
      >
        {detail && (
          <>
            <Descriptions
              column={2}
              items={[
                { key: "sku", label: "SKU", children: detail.sku },
                {
                  key: "price",
                  label: "Giá bán",
                  children: money(detail.unitPrice),
                },
                { key: "brand", label: "Hãng", children: detail.brand },
                {
                  key: "mode",
                  label: "Quản lý",
                  children: <Status value={detail.trackingMode} />,
                },
              ]}
            />
            <Listing
              path="/serials"
              filters={{ productId: detail.id }}
              columns={[
                { title: "Mã", dataIndex: "code" },
                {
                  title: "Trạng thái",
                  render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị nhãn trạng thái trong bảng. */
                    <Status value={r.status} />,
                },
                {
                  title: "Kho",
                  render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị tên kho hoặc dấu trống trong bảng. */
                    r.warehouse?.name ?? "—",
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
// Ngày thực hiện: 14/10/2026 (theo kế hoạch).
// Người thực hiện: Nguyễn Đình Duy.
// Chức năng của hàm: Hiển thị, lọc, đăng ký và chỉnh sửa serial hoặc IMEI.
export function Serials({ admin }) {
  const [products, setProducts] = useState([]),
    [edit, setEdit] = useState(null),
    [status, setStatus] = useState(),
    [productId, setProductId] = useState(),
    [refresh, setRefresh] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [form] = Form.useForm();
  const { message } = App.useApp();
  useEffect(() => {
    // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
    // Người thực hiện: Nguyễn Đình Duy.
    // Chức năng của hàm: Tải sản phẩm quản lý theo serial cho biểu mẫu đăng ký mã.

    all("/products", { trackingMode: "SERIALIZED" })
      .then(setProducts)
      .catch((e) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
         Người thực hiện: Nguyễn Đình Duy.
         Chức năng của hàm: Hiển thị thông báo lỗi của thao tác hiện tại. */
        message.error(e.message));
  }, [message]);
  // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
  // Người thực hiện: Nguyễn Đình Duy.
  // Chức năng của hàm: Đặt lại biểu mẫu và mở dữ liệu cần thêm hoặc chỉnh sửa.
  const open = (r = { kind: "SERIAL" }) => {
    form.resetFields();
    form.setFieldsValue(r);
    setEdit(r);
    setError("");
  };
  return (
    <>
      <Heading
        title="Serial / IMEI"
        description="Đăng ký mã chưa làm tăng tồn. Serial được đưa vào kho bằng phiếu nhập."
        action={
          admin && (
            <Button type="primary" onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Mở biểu mẫu thêm bản ghi mới. */
              open()}>
              Đăng ký serial
            </Button>
          )
        }
      />
      <Listing
        path="/serials"
        refresh={refresh}
        filters={{ status, productId }}
        toolbar={
          <>
            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: 160 }}
              onChange={setStatus}
              options={["REGISTERED", "IN_STOCK", "SOLD"].map((value) => (/* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tạo lựa chọn lọc theo trạng thái serial. */
                {
                value,
                label: <Status value={value} />,
              }))}
            />
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Sản phẩm"
              style={{ width: 240 }}
              options={options(products, true)}
              onChange={setProductId}
            />
          </>
        }
        columns={[
          { title: "Mã", dataIndex: "code" },
          { title: "Loại", dataIndex: "kind" },
          { title: "Sản phẩm", render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
             Người thực hiện: Nguyễn Đình Duy.
             Chức năng của hàm: Hiển thị tên sản phẩm trong bảng. */
            r.product.name },
          {
            title: "Trạng thái",
            render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị nhãn trạng thái trong bảng. */
              <Status value={r.status} />,
          },
          {
            title: "Kho",
            render: (_, r) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
               Người thực hiện: Nguyễn Đình Duy.
               Chức năng của hàm: Hiển thị tên kho hoặc dấu trống trong bảng. */
              r.warehouse?.name ?? "—",
          },
          ...(admin
            ? [
                {
                  title: "Thao tác",
                  render: (_, r) =>
                    /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Hiển thị các thao tác cho bản ghi trong bảng. */
                    r.status === "REGISTERED" && (
                      <Button onClick={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                         Người thực hiện: Nguyễn Đình Duy.
                         Chức năng của hàm: Mở biểu mẫu chỉnh sửa bản ghi được chọn. */
                        open(r)}>Sửa mã</Button>
                    ),
                },
              ]
            : []),
        ]}
      />
      <Modal
        title={edit?.id ? "Sửa mã" : "Đăng ký serial"}
        open={!!edit}
        onCancel={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Đóng biểu mẫu đang mở. */
          setEdit(null)}
        onOk={() => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
           Người thực hiện: Nguyễn Đình Duy.
           Chức năng của hàm: Kích hoạt kiểm tra và gửi biểu mẫu. */
          form.submit()}
        confirmLoading={busy}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (b) => {
            // Ngày thực hiện: 14/10/2026 (theo kế hoạch).
            // Người thực hiện: Nguyễn Đình Duy.
            // Chức năng của hàm: Lưu mã đã sửa hoặc đăng ký danh sách serial mới sau khi kiểm tra trùng.

            setBusy(true);
            setError("");
            try {
              if (edit?.id)
                await api(`/serials/${edit.id}`, "PATCH", {
                  code: b.code,
                  kind: b.kind,
                });
              else {
                const codes = b.codes
                  .split(/\r?\n/)
                  .map((s) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Loại bỏ khoảng trắng đầu cuối của mã nhập vào. */
                    s.trim())
                  .filter(Boolean);
                if (
                  !codes.length ||
                  new Set(codes.map((s) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Chuẩn hóa mã thành chữ hoa để kiểm tra trùng. */
                    s.toUpperCase())).size !==
                    codes.length
                )
                  throw new Error("Danh sách mã rỗng hoặc có mã trùng");
                await api(`/products/${b.productId}/serials`, "POST", {
                  serials: codes.map((code) => (/* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Tạo đối tượng mã và loại serial từ dữ liệu biểu mẫu. */
                    {
                    code,
                    kind: b.kind,
                  })),
                });
              }
              setEdit(null);
              setRefresh((v) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                 Người thực hiện: Nguyễn Đình Duy.
                 Chức năng của hàm: Tăng bộ đếm để kích hoạt tải lại dữ liệu. */
                v + 1);
              message.success("Đã lưu serial");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && <Alert type="error" message={error} />}{" "}
          {!edit?.id && (
            <Form.Item name="productId" label="Sản phẩm" rules={required}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Chọn sản phẩm"
                options={options(
                  products.filter((p) => /* Ngày thực hiện: 14/10/2026 (theo kế hoạch).
                     Người thực hiện: Nguyễn Đình Duy.
                     Chức năng của hàm: Chỉ giữ sản phẩm đang hoạt động để đăng ký serial. */
                    p.isActive),
                  true,
                )}
              />
            </Form.Item>
          )}
          <Form.Item name="kind" label="Loại mã" rules={required}>
            <Select
              options={[
                { value: "SERIAL", label: "Serial" },
                { value: "IMEI", label: "IMEI (15 chữ số)" },
              ]}
            />
          </Form.Item>
          {edit?.id ? (
            <Form.Item name="code" label="Mã" rules={required}>
              <Input maxLength={120} />
            </Form.Item>
          ) : (
            <Form.Item
              name="codes"
              label="Danh sách mã — mỗi dòng một mã"
              rules={required}
            >
              <Input.TextArea rows={7} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
