
package com.javaweb.config;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.javaweb.repository.MdlRepository;
import com.javaweb.repository.entity.CategoryEntity;
import com.javaweb.repository.entity.SupplierEntity;
import com.javaweb.repository.entity.UserEntity;
import com.javaweb.repository.entity.WarehouseEntity;

@Component
public class DemoSeed implements ApplicationRunner {

    private final MdlRepository db;
    private final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    @Value("${app.seed.admin-password:}")
    private String adminPassword;

    @Value("${app.seed.staff-password:}")
    private String staffPassword;

    // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
    // Người thực hiện: Tạ Minh Quang.
    // Chức năng của hàm: Khởi tạo bộ nạp dữ liệu demo với repository.
    public DemoSeed(MdlRepository db) {
        this.db = db;
    }

    @Override
    @Transactional
    // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
    // Người thực hiện: Tạ Minh Quang.
    // Chức năng của hàm: Kiểm tra mật khẩu và tạo tài khoản, danh mục, kho, nhà cung cấp cho demo.
    public void run(ApplicationArguments args) {

        if (adminPassword.length() < 12 ||
            staffPassword.length() < 12) {
            throw new IllegalStateException(
                "Mat khau phai co it nhat 12 ky tu"
            );
        }

        resetAccount(
            "admin@example.local",
            "ADMIN",
            adminPassword
        );

        resetAccount(
            "staff@example.local",
            "EMPLOYEE",
            staffPassword
        );

        // Du lieu demo ban dau
        if (db.find(CategoryEntity.class,
                Map.of("slug", "dien-tu")).isEmpty()) {
            CategoryEntity c = new CategoryEntity();
            c.name = "Điện tử";
            c.slug = "dien-tu";
            db.add(c);
        }

        if (db.find(WarehouseEntity.class,
                Map.of("code", "KHO-HN")).isEmpty()) {
            WarehouseEntity w = new WarehouseEntity();
            w.code = "KHO-HN";
            w.name = "Kho Hà Nội";
            db.add(w);
        }

        if (db.find(SupplierEntity.class,
                Map.of("code", "NCC-01")).isEmpty()) {
            SupplierEntity s = new SupplierEntity();
            s.code = "NCC-01";
            s.name = "Nhà cung cấp demo";
            db.add(s);
        }

        db.flush();

        System.out.println("=============================");
        System.out.println("DEMO ACCOUNTS READY");
        System.out.println("Admin: admin@example.local");
        System.out.println("Staff: staff@example.local");
        System.out.println("=============================");
    }

    // Ngày thực hiện: 06/10/2026 (theo kế hoạch).
    // Người thực hiện: Tạ Minh Quang.
    // Chức năng của hàm: Tạo hoặc cập nhật tài khoản demo, vai trò và mật khẩu BCrypt.
    private void resetAccount(
        String email,
        String role,
        String password
    ) {
        List<UserEntity> users = db.find(
            UserEntity.class,
            Map.of("email", email)
        );

        UserEntity user;

        if (users.isEmpty()) {
            user = new UserEntity();
            user.email = email;
            user.role = role;
            user.passwordHash = encoder.encode(password);
            user.isActive = true;
            db.add(user);

            System.out.println(
                "Created demo account: " + email
            );
        } else {
            user = users.get(0);
            user.role = role;
            user.isActive = true;

            if (!encoder.matches(
                    password, user.passwordHash)) {
                user.passwordHash =
                    encoder.encode(password);
                System.out.println(
                    "Updated demo password: " + email
                );
            }
        }
    }
}
