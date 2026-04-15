<?php
$conn = new mysqli("localhost", "root", "", "lao_lottery_pro");
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }
$conn->set_charset("utf8mb4");

// Insert Animals
$animals = [
  [1,'ປານ້ອຍ','01,41,81','ສັດນ້ຳ','water_drop'],
  [2,'ຫອຍ','02,42,82','ສັດນ້ຳ','waves'],
  [3,'ຫ່ານ','03,43,83','ສັດບົກ','emoji_nature'],
  [4,'ນົກຍຸງ','04,44,84','ສັດບົກ','pets'],
  [5,'ສິງ','05,45,85','ສັດບົກ','cruelty_free'],
  [6,'ເສືອ','06,46,86','ສັດບົກ','agriculture'],
  [7,'ໝູ','07,47,87','ສັດບົກ','agriculture'],
  [8,'ກະຕ່າຍ','08,48,88','ສັດບົກ','cruelty_free'],
  [9,'ຄວາຍ','09,49,89','ສັດບົກ','cruelty_free'],
  [10,'ນາກນ້ຳ','10,50,90','ສັດບົກ','cruelty_free'],
  [11,'ໝາ','11,51,91','ສັດນ້ຳ','water_drop'],
  [12,'ມ້າ','12,52,92','ສັດນ້ອຍ','bug_report'],
  [13,'ຊ້າງ','13,53,93','ສັດຟ້າ','flutter_dash'],
  [14,'ແມວ','14,54,94','ສັດບົກ','skateboarding'],
  [15,'ໜູ','15,55,95','ສັດບົກ','cruelty_free'],
  [16,'ເຜີ້ງ','16,56,96','ສັດເລືອຍ','pest_control'],
  [17,'ນົກຍາງ','17,57,97','ສັດນ້ຳ','water_drop'],
  [18,'ແມວປ່າ','18,58,98','ສັດນ້ຳ','water_drop'],
  [19,'ກະເບື້ອ','19,59,99','ສັດນ້ຳ','water_drop'],
  [20,'ຂີເຂັບ','20,60,00','ສັດນ້ຳ','water_drop'],
  [21,'ນົກແອ່ນ','21,61','ອື່ນໆ','egg'],
  [22,'ນົກກາງແກ','22,62','ສັດນ້ອຍ','bug_report'],
  [23,'ລິງ','23,63','ສັດນ້ອຍ','bug_report'],
  [24,'ກົບ','24,64','ສັດນ້ຳ','water_drop'],
  [25,'ແຫຼວ','25,65','ສັດຟ້າ','flutter_dash'],
  [26,'ນາກບິນ','26,66','ສັດຟ້າ','flutter_dash'],
  [27,'ເຕົ່າ','27,67','ສັດຟ້າ','flutter_dash'],
  [28,'ໄກ່','28,68','ສັດຟ້າ','flutter_dash'],
  [29,'ອ່ຽນ','29,69','ສັດບົກ','forest'],
  [30,'ປາໃຫຍ່','30,70','ອື່ນໆ','eco'],
  [31,'ກຸ້ງ','31,71','ອື່ນໆ','paid'],
  [32,'ງູ','32,72','ສັດນ້ຳ','water_drop'],
  [33,'ແມງມຸມ','33,73','ອື່ນໆ','delete'],
  [34,'ກວາງ','34,74','ອື່ນໆ','directions_boat'],
  [35,'ແບ້','35,75','ອື່ນໆ','hardware'],
  [36,'ເຫງັນ','36,76','ອື່ນໆ','sports_soccer'],
  [37,'ຫຼິ່ນ','37,77','ອື່ນໆ','local_fire_department'],
  [38,'ເໝັ້ນ','38,78','ອື່ນໆ','star'],
  [39,'ກະປູ','39,79','ອື່ນໆ','dark_mode'],
  [40,'ນົກອິນຊີ','40,80','ອື່ນໆ','wb_sunny']
];
$conn->query("SET FOREIGN_KEY_CHECKS=0;");
$conn->query("TRUNCATE TABLE animals;");
$stmt = $conn->prepare("INSERT INTO animals (animal_id, animal_name_lao, animal_numbers, category, image_url) VALUES (?, ?, ?, ?, ?)");
foreach ($animals as $a) {
  $stmt->bind_param("issss", $a[0], $a[1], $a[2], $a[3], $a[4]);
  $stmt->execute();
}
$stmt->close();

$conn->query("TRUNCATE TABLE lottery_types");
$conn->query("INSERT INTO lottery_types (type_id, type_name, description) VALUES (1, 'ຫວຍພັດທະນາ', 'ຫວຍລັດຖະບານລາວ ອອກທຸກວັນ ຈັນ - ສຸກ')");

$conn->query("SET FOREIGN_KEY_CHECKS=0;");
$conn->query("TRUNCATE TABLE draw_results_detail;");
$conn->query("TRUNCATE TABLE lottery_draws;");
$conn->query("SET FOREIGN_KEY_CHECKS=1;");

$draws = [
  ['draw_number'=>201, 'draw_date'=>'2024-05-16', 'full_result'=>'423789', 'res'=>['6'=>'423789','5'=>'23789','4'=>'3789','3'=>'789','2'=>'89'], 'animal'=>9],
  ['draw_number'=>200, 'draw_date'=>'2024-05-02', 'full_result'=>'156322', 'res'=>['6'=>'156322','5'=>'56322','4'=>'6322','3'=>'322','2'=>'22'], 'animal'=>22],
  ['draw_number'=>199, 'draw_date'=>'2024-04-16', 'full_result'=>'074155', 'res'=>['6'=>'074155','5'=>'74155','4'=>'4155','3'=>'155','2'=>'55'], 'animal'=>15],
  ['draw_number'=>198, 'draw_date'=>'2024-04-02', 'full_result'=>'891200', 'res'=>['6'=>'891200','5'=>'91200','4'=>'1200','3'=>'200','2'=>'00'], 'animal'=>20],
  ['draw_number'=>197, 'draw_date'=>'2024-03-16', 'full_result'=>'324507', 'res'=>['6'=>'324507','5'=>'24507','4'=>'4507','3'=>'507','2'=>'07'], 'animal'=>7],
  ['draw_number'=>196, 'draw_date'=>'2024-03-02', 'full_result'=>'619843', 'res'=>['6'=>'619843','5'=>'19843','4'=>'9843','3'=>'843','2'=>'43'], 'animal'=>3],
  ['draw_number'=>195, 'draw_date'=>'2024-02-16', 'full_result'=>'502871', 'res'=>['6'=>'502871','5'=>'02871','4'=>'2871','3'=>'871','2'=>'71'], 'animal'=>31],
  ['draw_number'=>194, 'draw_date'=>'2024-02-02', 'full_result'=>'748236', 'res'=>['6'=>'748236','5'=>'48236','4'=>'8236','3'=>'236','2'=>'36'], 'animal'=>36]
];

$stmt_draw = $conn->prepare("INSERT INTO lottery_draws (type_id, draw_number, draw_date, full_result, status) VALUES (1, ?, ?, ?, 'published')");
$stmt_detail = $conn->prepare("INSERT INTO draw_results_detail (draw_id, prize_type, result_value, animal_id) VALUES (?, ?, ?, ?)");

foreach ($draws as $d) {
  $stmt_draw->bind_param("iss", $d['draw_number'], $d['draw_date'], $d['full_result']);
  $stmt_draw->execute();
  $draw_id = $stmt_draw->insert_id;
  
  foreach($d['res'] as $len => $val) {
    if ($len == 6) $ptype = "6_digits";
    if ($len == 5) $ptype = "5_digits";
    if ($len == 4) $ptype = "4_digits";
    if ($len == 3) $ptype = "3_digits";
    if ($len == 2) $ptype = "2_digits";
    $aid = ($len == 2) ? $d['animal'] : null;
    $stmt_detail->bind_param("issi", $draw_id, $ptype, $val, $aid);
    $stmt_detail->execute();
  }
}
$stmt_draw->close();
$stmt_detail->close();
$conn->close();
echo "Data seeded successfully!";
?>
