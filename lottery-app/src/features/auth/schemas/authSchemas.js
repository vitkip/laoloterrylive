import { z } from 'zod';

const LAO_PHONE_RE = /^(\+856|0)[2-9]\d{7,9}$/;
const USERNAME_RE  = /^[a-zA-Z0-9_]+$/;
const HAS_UPPER    = /[A-Z]/;
const HAS_LOWER    = /[a-z]/;
const HAS_NUMBER   = /[0-9]/;
const HAS_SPECIAL  = /[^A-Za-z0-9]/;

const passwordRules = z
  .string()
  .min(8, 'ຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ')
  .refine(v => HAS_UPPER.test(v),   'ຕ້ອງມີໂຕໃຫຍ່ (A-Z) ຢ່າງໜ້ອຍ 1 ຕົວ')
  .refine(v => HAS_LOWER.test(v),   'ຕ້ອງມີໂຕນ້ອຍ (a-z) ຢ່າງໜ້ອຍ 1 ຕົວ')
  .refine(v => HAS_NUMBER.test(v),  'ຕ້ອງມີຕົວເລກ (0-9) ຢ່າງໜ້ອຍ 1 ຕົວ')
  .refine(v => HAS_SPECIAL.test(v), 'ຕ້ອງມີໂຕພິເສດ (!@#$%...) ຢ່າງໜ້ອຍ 1 ຕົວ');

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4,  'Username ຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ')
      .max(20, 'Username ຕ້ອງບໍ່ເກີນ 20 ຕົວອັກສອນ')
      .regex(USERNAME_RE, 'Username ໃຊ້ໄດ້ສະເພາະ a-z, A-Z, 0-9, _'),
    full_name: z
      .string()
      .min(2,   'ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ')
      .max(100, 'ຊື່ຍາວເກີນໄປ'),
    email: z
      .string()
      .min(1, 'ກະລຸນາປ້ອນ Email')
      .email('ຮູບແບບ Email ບໍ່ຖືກຕ້ອງ'),
    phone_number: z
      .string()
      .optional()
      .refine(v => !v || LAO_PHONE_RE.test(v), 'ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ (ຕ.ຢ. 020XXXXXXXX)'),
    password:         passwordRules,
    confirm_password: z.string().min(1, 'ກະລຸນາຢືນຢັນລະຫັດຜ່ານ'),
  })
  .refine(d => d.password === d.confirm_password, {
    message: 'ລະຫັດຜ່ານບໍ່ຕົງກັນ',
    path:    ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'ກະລຸນາປ້ອນ Email').email('ຮູບແບບ Email ບໍ່ຖືກຕ້ອງ'),
});

export const resetPasswordSchema = z
  .object({
    password:         passwordRules,
    confirm_password: z.string().min(1, 'ກະລຸນາຢືນຢັນລະຫັດຜ່ານ'),
  })
  .refine(d => d.password === d.confirm_password, {
    message: 'ລະຫັດຜ່ານບໍ່ຕົງກັນ',
    path:    ['confirm_password'],
  });
