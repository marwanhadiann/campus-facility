import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './index.js'; // Adjust path ke instance Drizzle DB kamu
import { users } from './schema.js'; // Adjust path ke schema Drizzle kamu
import { eq } from 'drizzle-orm';

const seedStaff = async () => {
    try {
        console.log('🌱 Memulai proses seeding akun Staff...');

        const defaultEmail = 'staff@kampus.ac.id';
        const defaultNomorInduk = 'STF-001';

        // 1. Cek apakah akun Staff ini sudah pernah dibuat sebelumnya
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, defaultEmail));

        if (existingUser.length > 0) {
            console.log('⚠️ Akun Staff sudah ada di database. Seeding dilewati.');
            process.exit(0);
        }

        // 2. Hash password default
        const rawPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // 3. Insert data akun Staff pertama
        await db.insert(users).values({
            nomor_induk: defaultNomorInduk,
            nama: 'Staff Admin Kampus',
            email: defaultEmail,
            password: hashedPassword,
            role: 'STAFF',
        });

        console.log('✅ Seeding berhasil! Akun Staff pertama berhasil dibuat:');
        console.log(`   Email: ${defaultEmail}`);
        console.log(`   Password: ${rawPassword}`);
        console.log(`   Role: STAFF`);
    } catch (error) {
        console.error('❌ Gagal melakukan seeding:', error);
    } finally {
        // Tutup koneksi process
        process.exit(0);
    }
};

// Jalankan fungsi seeder
seedStaff();