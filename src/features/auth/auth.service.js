import { eq, or } from "drizzle-orm"
import { kelas, users } from "../../db/schema.js"
import { generateToken } from "../../utils/jwt.js"
import { db } from "../../db/index.js";
import bcrypt from "bcryptjs";
import { throwError } from "../../utils/error.utils.js";

// Service : Register User
export const registerUser = async (newData) => {
    const { nomor_induk, nama, email, password, role, kelas_id } = newData

    // cek email dan no induk sudah terdaftar
    const existingUser = await db
        .select()
        .from(users)
        .where(or(
            eq(users.email, email),
            eq(users.nomor_induk, nomor_induk)
        ))

    if (existingUser.length > 0) {
        throwError("Email dan Nomor Induk sudah terdaftar", 400);
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)

    // insert ke database
    const [newUser] = await db
        .insert(users)
        .values({
            nomor_induk,
            nama,
            email,
            password: hashPassword,
            role,
            kelas_id
        })
        .returning({
            id: users.id,
            nomor_induk: users.nomor_induk,
            nama: users.nama,
            email: users.email,
            role: users.role,
            kelas: users.kelas_id
        })

    return newUser;
}

//Service : Login User
export const loginUser = async (email, password) => {
    //cari user berdasarkan email
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

    if (!user) {
        throwError("Email atau Password salah!", 401);
    }

    // Verifikasi Password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throwError("Email atau Password salah!", 401);
    }

    // Generate JWT Token
    const token = generateToken({
        id: user.id,
        role: user.role,
        email: user.email,
        kelas: user.kelas_id
    })
    return {
        user: {
            id: user.id,
            nomor_induk: user.nomor_induk,
            nama: user.nama,
            email: user.email,
            role: user.role,
            kelas: user.kelas_id
        },
        token,
    }
}

// Service : Get Current User
export const getCurrentUser = async (userId) => {
    const [user] = await db
        .select({
            id: users.id,
            nomor_induk: users.nomor_induk,
            nama: users.nama,
            email: users.email,
            role: users.role,
            kelas: users.kelas_id
        })
        .from(users)
        .where(eq(users.id, userId))

    if (!user) {
        throwError('User tidak ditemukan', 404)
    }

    return user
}
