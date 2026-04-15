CREATE DATABASE IF NOT EXISTS lao_lottery_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lao_lottery_pro;

-- 1. ຕາຕະລາງເກັບຂໍ້ມູນຜູ້ໃຊ້ (Users)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'staff', 'member') DEFAULT 'member',
    email VARCHAR(100),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. ຕາຕະລາງນາມສັດ (Animals - ຂໍ້ມູນຄົງທີ່ 40 ຊະນິດ)
CREATE TABLE animals (
    animal_id INT PRIMARY KEY,           -- ID 1-40
    animal_name_lao VARCHAR(50) NOT NULL,
    animal_numbers TEXT NOT NULL,         -- ເກັບເລກປະຈຳສັດ (ເຊັ່ນ: 01, 41, 81)
    image_url VARCHAR(255),               -- URL ຮູບພາບສັດ
    category VARCHAR(50)                  -- ປະເພດສັດ (ສັດບົກ, ສັດນ້ຳ, etc.)
) ENGINE=InnoDB;

-- 3. ຕາຕະລາງປະເພດຫວຍ (Lottery Types)
-- ຮອງຮັບຫວຍຫຼາຍປະເພດ ເຊັ່ນ: ຫວຍນາມສັດ, ຫວຍດີຈີຕອນ
CREATE TABLE lottery_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,      -- ເຊັ່ນ: ຫວຍພັດທະນາ, ຫວຍນາມສັດ
    description TEXT
) ENGINE=InnoDB;

-- 4. ຕາຕະລາງງວດຫວຍ (Lottery Draws)
CREATE TABLE lottery_draws (
    draw_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT,
    draw_number INT NOT NULL,              -- ງວດທີ
    draw_date DATE NOT NULL,               -- ວັນທີອອກຫວຍ
    full_result VARCHAR(6),                -- ເລກທີ່ອອກ 6 ຕົວ (ເກັບເປັນ String ເພື່ອຮັກສາເລກ 0 ທາງໜ້າ)
    status ENUM('pending', 'published') DEFAULT 'pending',
    created_by INT,                        -- ໃຜເປັນຄົນປ້ອນຂໍ້ມູນ
    FOREIGN KEY (type_id) REFERENCES lottery_types(type_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 5. ຕາຕະລາງແຍກລາງວັນ ແລະ ນາມສັດ (Draw Results Mapping)
-- ຕາຕະລາງນີ້ສຳຄັນທີ່ສຸດໃນການເຮັດ "ສະຖິຕິ"
CREATE TABLE draw_results_detail (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    draw_id INT,
    prize_type ENUM('6_digits', '5_digits', '4_digits', '3_digits', '2_digits') NOT NULL,
    result_value VARCHAR(6) NOT NULL,      -- ເກັບຕົວເລກທີ່ຖືກ
    animal_id INT NULL,                    -- ຖ້າເປັນເລກ 2 ຕົວ ຈະ Link ຫາ ID ສັດ
    FOREIGN KEY (draw_id) REFERENCES lottery_draws(draw_id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
) ENGINE=InnoDB;

-- 6. ຕາຕະລາງການເຂົ້າລະບົບ (User Logs)
CREATE TABLE user_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),                   -- ເຊັ່ນ: 'Login', 'Update Result'
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- INDEXES ເພື່ອໃຫ້ Query ສະຖິຕິໄດ້ໄວຂຶ້ນ (Optimization)
-- ---------------------------------------------------------
CREATE INDEX idx_draw_date ON lottery_draws(draw_date);
CREATE INDEX idx_result_value ON draw_results_detail(result_value);