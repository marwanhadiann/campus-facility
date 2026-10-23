import { and, eq, ilike, or, desc } from "drizzle-orm"
import { db } from "../../db/index.js"
import { users, kelas } from "../../db/schema.js"
import { throwError } from '../../utils/error.utils.js'
import bcrypt from "bcryptjs"

// Mengambil seluruh data user dengan filter role dan pencarian
export const getUsersFiltered = async (filter) => {
    const { role, search, kelas_id, page = 1, limit = 10 } = filter;
    
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];

    if (role) {
        conditions.push(eq(users.role, role.toUpperCase()));
    }

    if(kelas_id && role === 'MAHASISWA') {
        conditions.push(eq(users.kelas_id, Number(kelas_id)))
    }

    if (search) {
        conditions.push(
            or(
                ilike(users.nama, `%${search}%`),
                ilike(users.nomor_induk, `%${search}%`),
                ilike(users.email, `%${search}%`)
            )
        );
    }

    // Query data users tanpa password, di-join dengan tabel kelas
    const dataList = await db
        .select({
            id: users.id,
            nomor_induk: users.nomor_induk,
            nama: users.nama,
            email: users.email,
            role: users.role,
            kelas_id: users.kelas_id,
            nama_kelas: kelas.nama_kelas,
            created_at: users.created_at
        })
        .from(users)
        .leftJoin(kelas, eq(users.kelas_id, kelas.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(Number(limit))
        .offset(offset)
        .orderBy(desc(users.created_at));

    return dataList;
}

// Mengambil detail spesifik satu user berdasarkan ID
export const getUserById = async (id) => {
    const [user] = await db
        .select({
            id: users.id,
            nomor_induk: users.nomor_induk,
            nama: users.nama,
            email: users.email,
            role: users.role,
            kelas_id: users.kelas_id,
            nama_kelas: kelas.nama_kelas,
            created_at: users.created_at
        })
        .from(users)
        .leftJoin(kelas, eq(users.kelas_id, kelas.id))
        .where(eq(users.id, Number(id)));

    if (!user) throwError('Data pengguna tidak ditemukan', 404);

    return user;
}

// Update data pengguna (Khusus staff)
export const updateUser = async (id, payload) => {
    const { nomor_induk, nama, email, role, kelas_id, password } = payload;
    
    // Pastikan user eksis dan ambil data lainnya
    const existingUser = await getUserById(id);

    // Cek apakah nomor induk yang baru sudah dipakai orang lain
    if (nomor_induk && nomor_induk !== existingUser.nomor_induk) {
        const [checkDuplicate] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.nomor_induk, nomor_induk));
            
        if (checkDuplicate) {
            throwError('Nomor Induk tersebut sudah digunakan oleh pengguna lain', 400);
        }
    }
    
    const updateData = {
        nomor_induk,
        nama,
        email,
        role,
        kelas_id,
        updated_at: new Date()
    };

    // Logika ubah password jika diinputkan
    if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
    }

    const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, Number(id)))
        .returning({
            id: users.id,
            nomor_induk: users.nomor_induk,
            nama: users.nama,
            email: users.email,
            role: users.role,
            kelas_id: users.kelas_id
        });

    return updated;
}

// Hapus data pengguna (Khusus staff)
export const deleteUser = async (id) => {
    // Pastikan user eksis
    await getUserById(id);

    const [deleted] = await db
        .delete(users)
        .where(eq(users.id, Number(id)))
        .returning({
            id: users.id,
            nama: users.nama
        });

    return deleted;
}