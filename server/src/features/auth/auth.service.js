import { eq, or } from "drizzle-orm"
import { users } from "../../db/schema.js"
import { generateToken } from "../../utils/jwt.js"
import { db } from "../../db/index.js";
import bcrypt from "bcryptjs";

// Service : Register User
export const registerUser = async (newData) => {
    const { nomor_induk, nama, email, password, role } = newData

    // cek email dan no induk sudah terdaftar
    const existingUser = await db
        .select()
        .from(users)
        .where(or(
            eq(users.email, email),
            eq(users.nomor_induk, nomor_induk)
        ))

    if (existingUser.length > 0) {
        throw new Error("Email dan Nomor Induk salah");
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
            role
        })
        .returning({
            id: users.id,
            nomor_induk: users.nomor_induk,
            nama: users.nama,
            email: users.email,
            role: users.role,
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
        throw new Error("Email atau Password salah!");
    }

    // Verifikasi Password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error("Email atau Password salah!");
    }

    // Generate JWT Token
    const token = generateToken({
        id: user.id,
        role: user.role,
        email: user.email
    })
    return {
        user: {
            id: user.id,
            nomor_induk: user.nomor_induk,
            nama: user.nama,
            email: user.email,
            role: user.role
        },
        token,
    }
}