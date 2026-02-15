# Test Admin Account

## การสมัครสมาชิก Admin

1. ไปที่ http://localhost:3000/register
2. สมัครสมาชิกด้วยข้อมูลต่อไปนี้:
   - **Email:** admin@example.com
   - **Password:** admin123456
   - **Name:** Admin User

3. หลังจากสมัครสำเร็จ จะต้องแก้ไขบัญชีให้เป็น admin (เปลี่ยน role เป็น 'admin')

## วิธีการเปลี่ยน Role เป็น Admin

### Option 1: ผ่าน MongoDB

ให้ใช้ MongoDB Compass หรือ MongoDB Atlas เพื่อแก้ไข:

```
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: ผ่าน Next.js API (สร้าง endpoint ชั่วคราว)

คุณสามารถสร้าง endpoint `/api/admin/setup` เพื่อตั้งค่า admin อัตโนมัติ

## ฟีเจอร์ Admin ที่พร้อมใช้งาน

✅ **Admin Dashboard** (`/admin`)
- แสดงสถิติ (รวมงานวิจัย, รอการประเมิน, เสร็จสิ้น, รวมการประเมิน)
- อัปโหลดงานวิจัย PDF
- ดูรายการงานวิจัยทั้งหมด
- ดูไฟล์และรายละเอียดของแต่ละงานวิจัย

✅ **API Protection**
- POST `/api/papers` ตรวจสอบ role = 'admin' แล้ว
- Reviewer ไม่สามารถอัปโหลดงานวิจัยได้

## ลองทดสอบ

1. สมัครสมาชิก → เข้าสู่ระบบ → บันทึก user ID
2. เปลี่ยน role เป็น 'admin' ในฐานข้อมูล
3. ออกจากระบบแล้วเข้าสู่ระบบใหม่
4. ไปที่ `/admin` → ควรจะเห็น Admin Dashboard
5. ลองอัปโหลดไฟล์ PDF
