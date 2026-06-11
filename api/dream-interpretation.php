<?php
/**
 * dream-interpretation.php — ຕໍາລາຄວາມຝັນ ດ້ວຍ AI Claude + RAG (ຂໍ້ມູນ Lao lottery)
 * POST /api/dream-interpretation.php
 * Body: {"dream": "ຝັນເຫັນ..."}
 */
require_once __DIR__ . '/config.php';

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedOrigin = in_array($origin, ALLOWED_ORIGINS, true) ? $origin : ALLOWED_ORIGINS[0];
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (empty(ANTHROPIC_API_KEY) || str_starts_with(ANTHROPIC_API_KEY, 'sk-ant-api03-xxx')) {
    http_response_code(500);
    echo json_encode(['error' => 'Anthropic API key ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ. ໃສ່ key ໃນ api/.env']);
    exit();
}

$body = json_decode(file_get_contents('php://input'), true);
$dream = trim($body['dream'] ?? '');

if (empty($dream)) {
    http_response_code(400);
    echo json_encode(['error' => 'ກະລຸນາໃສ່ຄວາມຝັນທີ່ຕ້ອງການຕີຄວາມ']);
    exit();
}

if (mb_strlen($dream) > 1000) {
    http_response_code(400);
    echo json_encode(['error' => 'ຂໍ້ຄວາມຍາວເກີນໄປ (ສູງສຸດ 1000 ຕົວອັກສອນ)']);
    exit();
}

// ════════════════════════════════════════════════════════════════════
// ຂໍ້ມູນຕໍາລາ Lao lottery (ດຽວກັນກັບ src/data/dreams.js)
// ໃຊ້ inject ໃສ່ Claude ເປັນ context ສະເພາະ (RAG approach)
// ════════════════════════════════════════════════════════════════════
$laoLotteryDreams = [
    // ══════════════════════════ ນາມສັດທັງ 40 (ຕົງກັບ DB) ══════════════════════════
    ['keywords' => ['ປານ້ອຍ', 'ປາ', 'ຫາປາ', 'ປານິນ', 'ລອຍປາ'], 'numbers' => '01,41,81', 'meaning' => 'ຈະໄດ້ໂຊກລາບ ໄດ້ເງິນໄດ້ທອງ ຫຼື ມີຂ່າວດີ'],
    ['keywords' => ['ຫອຍ', 'ຫອຍນ້ຳ', 'ຫອຍທາກ', 'ຫອຍຂາ'], 'numbers' => '02,42,82', 'meaning' => 'ຈະໄດ້ຮັບສິ່ງດີຊ້າໆ ແຕ່ໝັ້ນທຽງ ອົດທົນລໍຖ້າຜົນ'],
    ['keywords' => ['ຫ່ານ', 'ຫ່ານບິນ', 'ຝູງຫ່ານ'], 'numbers' => '03,43,83', 'meaning' => 'ຈະໄດ້ຂ່າວດີຈາກຄົນຮັກ ຫຼື ໂຊກດີກ່ຽວກັບຊັບສິນ'],
    ['keywords' => ['ນົກຍຸງ', 'ຍຸງ', 'ຫາງຍຸງ', 'ຂົນຍຸງ'], 'numbers' => '04,44,84', 'meaning' => 'ຄວາມງາມ ຄວາມໂດດເດັ່ນ ຈະໄດ້ຮັບການຍ້ອງຍໍ ແລະ ໂຊກດີ'],
    ['keywords' => ['ສິງ', 'ສິງໂຕ', 'ລາຊາສິງ', 'ເຫັນສິງ'], 'numbers' => '05,45,85', 'meaning' => 'ຈະໄດ້ຮັບຄວາມຊ່ວຍເຫຼືອຈາກຜູ້ໃຫຍ່ ຄວາມເຂັ້ມແຂງ ໂຊກໃຫຍ່'],
    ['keywords' => ['ເສືອ', 'ເສືອໄລ່', 'ເສືອດຳ', 'ເສືອໃຫຍ່'], 'numbers' => '06,46,86', 'meaning' => 'ລະວັງຜູ້ມີອຳນາດ ຫຼື ຄົນທີ່ເໜືອກວ່າຈະສ້າງບັນຫາໃຫ້'],
    ['keywords' => ['ໝູ', 'ເລັ້ຽງໝູ', 'ໝູນ້ອຍ', 'ໝູໃຫຍ່', 'ໝູວ່ອງ'], 'numbers' => '07,47,87', 'meaning' => 'ຈະໄດ້ໂຊກລາບ ຄວາມອຸດົມສົມບູນ ຈະໄດ້ຮັບຊັບສິນ'],
    ['keywords' => ['ກະຕ່າຍ', 'ຕ່າຍ', 'ກະຕ່າຍວ່ອງ', 'ກະຕ່າຍໂດດ'], 'numbers' => '08,48,88', 'meaning' => 'ຈະໄດ້ໂຊກໄວ ໂດຍບໍ່ຄາດຄິດ ຄວາມວ່ອງໄວໃນການຕັດສິນໃຈ'],
    ['keywords' => ['ຄວາຍ', 'ຄວາຍແລ່ນໄລ່', 'ຂີ່ຄວາຍ', 'ຄວາຍຕ່ວ'], 'numbers' => '09,49,89', 'meaning' => 'ຕ້ອງໃຊ້ຄວາມອົດທົນ ຈຶ່ງຈະຜ່ານອຸປະສັກໄປໄດ້'],
    ['keywords' => ['ນາກນ້ຳ', 'ນາກ', 'ນາກຫາປາ', 'ນາກລ່ຽນ'], 'numbers' => '10,50,90', 'meaning' => 'ຈະໄດ້ໂຊກດີກ່ຽວກັບນ້ຳ ຫຼື ການຄ້າ ຊີວິດຈະດີຂຶ້ນ'],
    ['keywords' => ['ໝາ', 'ໝາກັດ', 'ໝາເຫົ່າ', 'ໝາແລ່ນໄລ່'], 'numbers' => '11,51,91', 'meaning' => 'ລະວັງມີປາກສຽງ ກັບໝູ່ເພື່ອນ ຫຼື ຄົນໃກ້ຊິດ'],
    ['keywords' => ['ມ້າ', 'ຂີ່ມ້າ', 'ແລ່ນມ້າ', 'ມ້ານ້ອຍ', 'ມ້າໂດດ'], 'numbers' => '12,52,92', 'meaning' => 'ຈະໄດ້ໂຊກດີໃນການເດີນທາງ ຫຼື ຄວາມກ້າວໜ້າໃນອາຊີບ'],
    ['keywords' => ['ຊ້າງ', 'ຂີ່ຊ້າງ', 'ຊ້າງນ້ອຍ', 'ເຫັນຊ້າງ', 'ຊ້າງໃຫຍ່'], 'numbers' => '13,53,93', 'meaning' => 'ຈະໄດ້ຮັບການຊ່ວຍເຫຼືອຈາກຜູ້ໃຫຍ່ ຫຼື ເລື່ອນຕຳແໜ່ງ'],
    ['keywords' => ['ແມວ', 'ແມວເຂົ້າບ້ານ', 'ລ້ຽງແມວ', 'ແມວດຳ', 'ແມວຮ້ອງ'], 'numbers' => '14,54,94', 'meaning' => 'ຈະມີຄົນເອົາຂອງມາໃຫ້ ຫຼື ໄດ້ໂຊກລາບເລັກໜ້ອຍ'],
    ['keywords' => ['ໜູ', 'ໜູຫ້ອງ', 'ໜູໃຫຍ່', 'ໜູວ່ອງ', 'ຈັບໜູ'], 'numbers' => '15,55,95', 'meaning' => 'ລະວັງຄົນຫຼອກ ຫຼື ຈະໄດ້ໂຊກຈາກສິ່ງທີ່ຄາດບໍ່ຮອດ'],
    ['keywords' => ['ເຜີ້ງ', 'ຮັງເຜີ້ງ', 'ຝູງເຜີ້ງ', 'ຖືກເຜີ້ງຕໍ່', 'ນ້ຳເຜີ້ງ'], 'numbers' => '16,56,96', 'meaning' => 'ຈະໄດ້ຜົນດີຈາກຄວາມຂຍັນ ຄວາມຮ່ວມມື ໂຊກດີໃນທຸລະກິດ'],
    ['keywords' => ['ນົກຍາງ', 'ຍາງ', 'ນົກຍາງຂາວ', 'ຍາງຂາວ', 'ຍາງບິນ'], 'numbers' => '17,57,97', 'meaning' => 'ຄວາມສງ່າ ຄວາມສະອາດ ຈະໄດ້ຂ່າວດີ ຊີວິດຈະດີຂຶ້ນ'],
    ['keywords' => ['ແມວປ່າ', 'ເສືອດາວ', 'ສັດຄ້າຍແມວ', 'ແມວໃຫຍ່'], 'numbers' => '18,58,98', 'meaning' => 'ລະວັງຄົນທີ່ຈ້ອງ ຫຼື ສ່ຽງຕໍ່ຄວາມຫຍຸ້ງຍາກ ຈາກຄົນໃກ້ຊິດ'],
    ['keywords' => ['ກະເບື້ອ', 'ນົກກາ', 'ກາ', 'ຝູງກາ', 'ກາດຳ'], 'numbers' => '19,59,99', 'meaning' => 'ຈະໄດ້ຮັບຂ່າວສຳຄັນ ລະວັງສ່ຽງ ຈາກທາງໄກ'],
    ['keywords' => ['ຂີເຂັບ', 'ແມງຂີເຂັບ', 'ດ້ວງ', 'ແມງດ້ວງ'], 'numbers' => '20,60,00', 'meaning' => 'ຈະໄດ້ຮັບໂຊກທີ່ຄາດບໍ່ຮອດ ຈາກທາງທີ່ບໍ່ຄາດຄິດ'],
    ['keywords' => ['ນົກແອ່ນ', 'ແອ່ນ', 'ນົກ', 'ຝູງນົກ', 'ນົກບິນ'], 'numbers' => '21,61', 'meaning' => 'ຈະໄດ້ຍິນຂ່າວດີຈາກທາງໄກ ຫຼື ໄດ້ຮັບໂຊກດີ ໄດ້ທ່ອງທ່ຽວ'],
    ['keywords' => ['ນົກກາງແກ', 'ກາງແກ', 'ຮ້ອງກາງແກ'], 'numbers' => '22,62', 'meaning' => 'ຈະໄດ້ຍິນຂ່າວດີຈາກທາງໄກ ຫຼື ແຂກມາຢາມ'],
    ['keywords' => ['ລິງ', 'ກ້ວາ', 'ຝູງລິງ', 'ລິງດຳ', 'ລິງໂດດ'], 'numbers' => '23,63', 'meaning' => 'ຈະໄດ້ໂຊກດີ ແຕ່ລະວັງຄົນໂກງ ລະວັງຄວາມທະນົງຕົວ'],
    ['keywords' => ['ກົບ', 'ອ້ຶງ', 'ກົບຮ້ອງ', 'ຈັບກົບ', 'ໂດດກົບ'], 'numbers' => '24,64', 'meaning' => 'ຈະໄດ້ໂຊກດີ ຊີວິດຈະດີຂຶ້ນ ໄດ້ເງິນ ທຸລະກິດຈະຄ່ອງ'],
    ['keywords' => ['ແຫຼວ', 'ໂຕງ', 'ຈ້ວນ', 'ສາລາ', 'ຈິ້ງຈົກໃຫຍ່'], 'numbers' => '25,65', 'meaning' => 'ລະວັງຄວາມຫຍຸ້ງຍາກ ຫຼື ຈະໄດ້ໂຊກຈາກສິ່ງທີ່ຄາດບໍ່ຮອດ'],
    ['keywords' => ['ນາກບິນ', 'ກະຮອກ', 'ກະຮອກບິນ', 'ສັດບິນ'], 'numbers' => '26,66', 'meaning' => 'ຈະໄດ້ໂຊກດີ ຈະໄດ້ລາຍໄດ້ໃໝ່ ຫຼື ແຫຼ່ງເງິນໃໝ່'],
    ['keywords' => ['ເຕົ່າ', 'ຈັບເຕົ່າ', 'ເຕົ່ານ້ຳ', 'ເຕົ່າໃຫຍ່'], 'numbers' => '27,67', 'meaning' => 'ອາຍຸຍືນຍາວ, ຄົນປ່ວຍຈະຫາຍ ແລະ ມີໂຊກລາບ'],
    ['keywords' => ['ໄກ່', 'ໄດ້ກິນໄກ່', 'ປາດຄໍໄກ່', 'ໄກ່ຕ່ວ', 'ຄ່ຽງໄກ່'], 'numbers' => '28,68', 'meaning' => 'ຈະໄດ້ຮັບຊັບ ຫຼື ມີງານລາບລື່ນດີ'],
    ['keywords' => ['ອ່ຽນ', 'ປາດຸກ', 'ປານາ', 'ອ່ຽນໃຫຍ່', 'ຈັບອ່ຽນ'], 'numbers' => '29,69', 'meaning' => 'ຈະໄດ້ໂຊກດີ ໄດ້ເງິນໄດ້ທອງ ໂດຍສະເພາະຈາກທາງນ້ຳ'],
    ['keywords' => ['ປາໃຫຍ່', 'ປາບິກ', 'ປາຄໍ່', 'ປາຍາວ', 'ປາຍັກ'], 'numbers' => '30,70', 'meaning' => 'ຈະໄດ້ຮັບຜົນກຳໄລຈາກການຄ້າ ຫຼື ໄດ້ໂຊກກ້ອນໃຫຍ່'],
    ['keywords' => ['ກຸ້ງ', 'ກຸ້ງຍ່າ', 'ກຸ້ງໃຫຍ່', 'ຈັບກຸ້ງ', 'ກຸ້ງທະເລ'], 'numbers' => '31,71', 'meaning' => 'ຈະໄດ້ໂຊກດີ ສຸຂະພາບດີ ໄດ້ຮັບໝາກຜົນຈາກການງານ'],
    ['keywords' => ['ງູ', 'ງູເຫົ່າ', 'ງູໃຫຍ່', 'ງູກັດ', 'ງູລອຍນ້ຳ'], 'numbers' => '32,72', 'meaning' => 'ຈະມີຄົນລຸ່ນເກ່ານ້ອຍມາພົວພັນ ຫຼື ຈະໄດ້ພົບຄູ່ຄອງ'],
    ['keywords' => ['ແມງມຸມ', 'ໃຍແມງມຸມ', 'ຖືກໃຍ', 'ເຫັນໃຍ'], 'numbers' => '33,73', 'meaning' => 'ລະວັງຄົນຫຼວງ ຫຼື ຈະໄດ້ຮັບຂ່າວດີທີ່ຄາດບໍ່ຮອດ'],
    ['keywords' => ['ກວາງ', 'ກວາງວ່ອງ', 'ເຫັນກວາງ', 'ກວາງປ່າ', 'ກວາງໂດດ'], 'numbers' => '34,74', 'meaning' => 'ຄວາມງາມ ຄວາມດີ ຈະໄດ້ຮັບໂຊກດີ ຈະມີຄວາມຈະເລີນ'],
    ['keywords' => ['ແບ້', 'ຝູງແບ້', 'ເລັ້ຽງແບ້', 'ແບ້ນ້ອຍ', 'ແບ້ໂດດ'], 'numbers' => '35,75', 'meaning' => 'ຈະໄດ້ໂຊກດີ ອົດທົນ ໄດ້ຮັບສິ່ງທີ່ຕ້ອງການ'],
    ['keywords' => ['ເຫງັນ', 'ທາກ', 'ສັດດູດເລືອດ', 'ເຫງັນຕ່ວ'], 'numbers' => '36,76', 'meaning' => 'ຈະໄດ້ໂຊກດີຈາກທາງນ້ຳ ຫຼື ທ່ຽງດ້ານການຄ້າ'],
    ['keywords' => ['ຫຼິ່ນ', 'ກະຮອກໃຫຍ່', 'ຫຼ້ຳ', 'ສັດໃນຕົ້ນໄມ້ໃຫຍ່'], 'numbers' => '37,77', 'meaning' => 'ຈະໄດ້ສຳຮອງ ໂຊກດີ ຊີວິດຈະມີຄວາມໝັ້ຄົງ'],
    ['keywords' => ['ເໝັ້ນ', 'ໝ້ານ', 'ສັດຄ້າຍໝາ', 'ໝາໄນ'], 'numbers' => '38,78', 'meaning' => 'ຈະໄດ້ໂຊກດີ ຄວາມກ້າວໜ້າ ການຄ້າດີ ຊີວິດຈະດີ'],
    ['keywords' => ['ກະປູ', 'ປູ', 'ຈັບປູ', 'ປູທະເລ', 'ປູໃຫຍ່'], 'numbers' => '39,79', 'meaning' => 'ຈະໄດ້ໂຊກດີຈາກທາງນ້ຳ ຫຼື ໄດ້ຊັບ ຊີວິດຈະດີຂຶ້ນ'],
    ['keywords' => ['ນົກອິນຊີ', 'ອິນທີ', 'ນົກໃຫຍ່', 'ອີ່ນ', 'ນົກຫວ່ານ'], 'numbers' => '40,80', 'meaning' => 'ຄວາມສູງ ຄວາມຍິ່ງໃຫຍ່ ຈະໄດ້ຮັບໂຊກດີ ກ້າວຂຶ້ນສູ່ຕຳແໜ່ງໃໝ່'],
    // ທຳມະຊາດ
    ['keywords' => ['ໄຟ', 'ໄຟໄໝ້', 'ຄວາມຮ້ອນ', 'ໄຟໄໝ້ບ້ານ'], 'numbers' => '04,44,43', 'meaning' => 'ຈະມີເລື່ອງຮ້ອນໃຈ, ເສຍຊັບ ຫຼື ຜິດຖຽງກັນໃນຄອບຄົວ'],
    ['keywords' => ['ນ້ຳ', 'ນ້ຳຖ້ວມ', 'ຝົນຕົກ', 'ລອຍນ້ຳ', 'ນ້ຳໄຫຼ'], 'numbers' => '02,22', 'meaning' => 'ຄວາມຮົ່ມເຢັນເປັນສຸກ, ຖ້ານ້ຳຂຸ່ນມົວ ຈະມີເລື່ອງທຸກໃຈ'],
    ['keywords' => ['ພະຍຸ', 'ລົມພາຍຸ', 'ຕົ້ນໄມ້ລົ້ມ'], 'numbers' => '89,39', 'meaning' => 'ລະວັງການປ່ຽນແປງກະທັນຫັນໃນໜ້າທີ່ການງານ'],
    ['keywords' => ['ດິນ', 'ແຜ່ນດິນໄຫວ', 'ດິນເຈື່ອນ'], 'numbers' => '09,08', 'meaning' => 'ຄວາມໝັ້ນຄົງອາດມີບັນຫາ, ຄວນລະວັງການລົງທຶນ'],
    // ຄົນ ແລະ ຮ່າງກາຍ
    ['keywords' => ['ຄົນຕາຍ', 'ງານສົບ', 'ໂລງສົບ', 'ຜີ', 'ຜີຫຼອກ'], 'numbers' => '04,44,14,40', 'meaning' => 'ຈະໝົດເຄາະ, ຖ້າປ່ວຍຈະຫາຍ ຫຼື ໄດ້ໂຊກລາບໃຫຍ່'],
    ['keywords' => ['ເລືອດ', 'ເລືອດອອກ', 'ເຫັນເລືອດ'], 'numbers' => '08,04,88', 'meaning' => 'ອາດເສຍເງິນ ຫຼື ເຈັບປ່ວຍ ແຕ່ຖ້າເລືອດອອກຫຼາຍຈະໄດ້ໂຊກ'],
    ['keywords' => ['ແຂ້ວ', 'ແຂ້ວຫຼຸດ', 'ແຂ້ວຫັກ', 'ຖອນແຂ້ວ'], 'numbers' => '03,33,39', 'meaning' => 'ແຂ້ວເທິງຫຼຸດ: ຍາດຜູ້ໃຫຍ່ຈະມີເຄາະ, ແຂ້ວລຸ່ມຫຼຸດ: ຍາດຜູ້ນ້ອຍຈະມີເຄາະ'],
    ['keywords' => ['ຜົມ', 'ຜົມລົ່ນ', 'ຕັດຜົມ'], 'numbers' => '05,15,55', 'meaning' => 'ຈະປົດເປື້ອງຄວາມທຸກໃຈໄດ້ ແຕ່ລະວັງບັນຫາສຸຂະພາບ'],
    ['keywords' => ['ເກີດລູກ', 'ເດັກນ້ອຍ', 'ອູ້ມເດັກ', 'ຄົນທ້ອງ'], 'numbers' => '11,10,12', 'meaning' => 'ຈະມີສິ່ງໃໝ່ໆເຂົ້າມາໃນຊີວິດ, ໂຄງການໃໝ່ຈະປະສົບຜົນສຳເລັດ'],
    ['keywords' => ['ພະ', 'ພະສົງ', 'ໄຫວ້ພະ', 'ວັດ'], 'numbers' => '09,89,99', 'meaning' => 'ຈະມີຄວາມສຸກຄວາມຈະເລີນ, ສິ່ງສັກສິດຄຸ້ມຄອງ'],
    // ສິ່ງຂອງ
    ['keywords' => ['ເງິນ', 'ໄດ້ເງິນ', 'ເງິນຄຳ', 'ທອງ', 'ໄດ້ສາຍຄໍທອງ'], 'numbers' => '28,68,88', 'meaning' => 'ຈະມີໂຊກລາບເຂົ້າກະເປົາ ຕ້ອງລະວັງການໃຊ້ຈ່າຍ'],
    ['keywords' => ['ແຫວນ', 'ໄດ້ແຫວນ', 'ໃສ່ແຫວນ'], 'numbers' => '00,08', 'meaning' => 'ຈະໄດ້ພົບເນື້ອຄູ່ ຫຼື ໄດ້ຮັບຂ່າວດີຈາກຄົນຮັກ'],
    ['keywords' => ['ລົດ', 'ຂີ່ລົດ', 'ລົດຕຳກັນ', 'ລົດເສຍ'], 'numbers' => '04,40,44', 'meaning' => 'ການເດີນທາງຈະປອດໄພ, ຖ້າຝັນລົດຕຳໃຫ້ຊື້ເລກຖະບຽນລົດ'],
    ['keywords' => ['ເຮືອ', 'ຂີ່ເຮືອ', 'ຂ້າມເຮືອ'], 'numbers' => '05,50', 'meaning' => 'ໜ້າທີ່ການງານຈະກ້າວໜ້າ, ຊີວິດຈະຄ່ອຍໆດີຂຶ້ນ'],
    ['keywords' => ['ເຄື່ອງນຸ່ງໃໝ່', 'ໃສ່ຊຸດໃໝ່', 'ຊື້ເສື້ອ'], 'numbers' => '77,78,79', 'meaning' => 'ຈະໄດ້ຮັບຂ່າວດີກ່ຽວກັບການງານ ຫຼື ການເລື່ອນຕຳແໜ່ງ'],
];

// ════════════════════════════════════════════════════════════════════
// RAG: ຄົ້ນຫາ keyword ທີ່ match ໃນຄຳຖາມ
// ════════════════════════════════════════════════════════════════════
function findMatchingDreams(string $dreamText, array $dreamData): array
{
    $matches = [];
    foreach ($dreamData as $entry) {
        foreach ($entry['keywords'] as $kw) {
            if (mb_strpos($dreamText, $kw) !== false) {
                $matches[] = $entry;
                break; // ຢ່າ duplicate ແຖວດຽວກັນ
            }
        }
    }
    return $matches;
}

$matchedDreams = findMatchingDreams($dream, $laoLotteryDreams);

// ════════════════════════════════════════════════════════════════════
// PATH A — ມີຂໍ້ມູນໃນ DB: ສົ່ງຄືນຂໍ້ມູນໂດຍກົງ ບໍ່ໂທ AI
// ════════════════════════════════════════════════════════════════════
if (!empty($matchedDreams)) {
    $allNumbers = [];
    $meanings   = [];
    $sources    = [];

    foreach ($matchedDreams as $m) {
        foreach (explode(',', $m['numbers']) as $n) {
            $n = trim($n);
            if ($n !== '' && !in_array($n, $allNumbers)) {
                $allNumbers[] = $n;
            }
        }
        $meanings[] = $m['meaning'];
        $sources[]  = implode('/', array_slice($m['keywords'], 0, 2));
    }

    // ເລກ 2 ຕົວ → integer (00 = 0, 01 = 1, ...)
    $numbersInt = array_map('intval', $allNumbers);

    $combinedMeaning = implode(' · ', array_unique($meanings));
    $sourceList      = implode(', ', $sources);
    $explanation     = "ຕີຄວາມຕາມຕໍາລາຄວາມຝັນລາວ ຈາກ: {$sourceList} — ເລກດັ່ງກ່າວເປັນນາມສັດ/ສັນຍາລັກທີ່ທ່ານຝັນ";

    echo json_encode([
        'meaning'     => $combinedMeaning,
        'numbers'     => array_slice($numbersInt, 0, 5),
        'explanation' => $explanation,
        'from_db'     => count($matchedDreams),
        'source'      => 'database',
    ]);
    exit();
}

// ════════════════════════════════════════════════════════════════════
// PATH B — ບໍ່ມີໃນ DB: ໂທ AI ຕີຄວາມໄດ້ເສລີ ແຕ່ຕ້ອງສອດຄ່ອງ
// ════════════════════════════════════════════════════════════════════
$systemPrompt = "ທ່ານແມ່ນ ຜູ້ຊ່ຽວຊານຕໍາລາຄວາມຝັນ ສຳລັບສະຫຼາກລາວ."
    . "\nໜ້າທີ່: ຕີຄວາມໝາຍຄວາມຝັນ ແລະ ແນະນຳ 3-5 ເລກໂຊກດີ (00-99)."
    . "\nໃຊ້ຄວາມຮູ້ຕໍາລາຄວາມຝັນລາວ/ໄທ ໃນການວິເຄາະ ເລກຕ້ອງສອດຄ່ອງກັບຄວາມໝາຍ."
    . "\n\nຕອບເປັນ JSON (ບໍ່ຕ້ອງມີ markdown):"
    . "\n{\"meaning\": \"ຄວາມໝາຍ...\", \"numbers\": [12, 34, 56], \"explanation\": \"ເຫດຜົນ...\"}"
    . "\nຕອບເປັນພາສາລາວ ສະເໝີ.";

// ════════════════════════════════════════════════════════════════════
// Call Claude API
// ════════════════════════════════════════════════════════════════════
$requestData = [
    'model' => 'claude-haiku-4-5',
    'max_tokens' => 1024,
    'system' => $systemPrompt,
    'messages' => [
        ['role' => 'user', 'content' => "ຝັນເຫັນ: " . $dream],
    ],
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($requestData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(503);
    echo json_encode(['error' => 'ບໍ່ສາມາດເຊື່ອມຕໍ່ AI ໄດ້: ' . $curlError]);
    exit();
}

$data = json_decode($response, true);

if ($httpCode !== 200) {
    http_response_code(502);
    $errMsg = $data['error']['message'] ?? 'ຜິດພາດ API';
    echo json_encode(['error' => 'Claude API error: ' . $errMsg]);
    exit();
}

// Extract text from Claude response
$text = '';
foreach ($data['content'] as $block) {
    if ($block['type'] === 'text') {
        $text = $block['text'];
        break;
    }
}

// Strip markdown fences if present
$text = preg_replace('/^```(?:json)?\s*/m', '', $text);
$text = preg_replace('/\s*```$/m', '', $text);
$parsed = json_decode(trim($text), true);

if (!$parsed || !isset($parsed['numbers'])) {
    echo json_encode(['meaning' => $text, 'numbers' => [], 'explanation' => '']);
    exit();
}

echo json_encode([
    'meaning' => $parsed['meaning'] ?? '',
    'numbers' => array_slice((array) ($parsed['numbers'] ?? []), 0, 5),
    'explanation' => $parsed['explanation'] ?? '',
    'from_db' => count($matchedDreams), // debug: ຈຳນວນ entry ທີ່ match
]);
