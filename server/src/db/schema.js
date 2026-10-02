import {
    pgTable,
    pgEnum,
    bigserial,
    bigint,
    varchar,
    text,
    integer,
    time,
    date,
    timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =========================================
// ENUM DEFINITIONS
// =========================================

export const roleTypeEnum = pgEnum('role_type', [
    'MAHASISWA',
    'DOSEN',
    'STAFF',
]);

export const statusRuangTypeEnum = pgEnum('status_ruang_type', [
    'TERSEDIA',
    'DALAM_PERBAIKAN',
]);

export const kondisiTypeEnum = pgEnum('kondisi_type', [
    'NORMAL',
    'RUSAK_RINGAN',
    'RUSAK_BERAT',
]);

export const hariTypeEnum = pgEnum('hari_type', [
    'SENIN',
    'SELASA',
    'RABU',
    'KAMIS',
    'JUMAT',
    'SABTU',
]);

export const statusPengaduanTypeEnum = pgEnum('status_pengaduan_type', [
    'OPEN',
    'VERIFIED',
    'IN_PROGRESS',
    'RESOLVED',
]);

export const prioritasTypeEnum = pgEnum('prioritas_type', [
    'LOW',
    'MEDIUM',
    'HIGH',
]);

export const statusPengajuanTypeEnum = pgEnum('status_pengajuan_type', [
    'PENDING',
    'APPROVED',
    'REJECTED',
]);

// =========================================
// TABLE DEFINITIONS
// =========================================

// 1. Table: users
export const users = pgTable('users', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    nomor_induk: varchar('nomor_induk', { length: 20 }).notNull().unique(),
    nama: varchar('nama', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleTypeEnum('role').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 2. Table: ruang
export const ruang = pgTable('ruang', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    kode_ruang: varchar('kode_ruang', { length: 10 }).notNull().unique(),
    nama_ruang: varchar('nama_ruang', { length: 50 }).notNull(),
    lantai: integer('lantai').notNull(),
    status_ruang: statusRuangTypeEnum('status_ruang').default('TERSEDIA').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 3. Table: fasilitas_ruang
export const fasilitasRuang = pgTable('fasilitas_ruang', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    ruang_id: bigint('ruang_id', { mode: 'number' })
        .notNull()
        .references(() => ruang.id),
    nama_fasilitas: varchar('nama_fasilitas', { length: 100 }).notNull(),
    kategori: varchar('kategori', { length: 50 }),
    jumlah: integer('jumlah').default(1).notNull(),
    kondisi: kondisiTypeEnum('kondisi').default('NORMAL').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 4. Table: mata_kuliah
export const mataKuliah = pgTable('mata_kuliah', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    kode_mk: varchar('kode_mk', { length: 10 }).notNull().unique(),
    nama_mk: varchar('nama_mk', { length: 100 }).notNull(),
    sks: integer('sks').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 5. Table: jadwal
export const jadwal = pgTable('jadwal', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    mata_kuliah_id: bigint('mata_kuliah_id', { mode: 'number' })
        .notNull()
        .references(() => mataKuliah.id),
    dosen_id: bigint('dosen_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    ruang_id: bigint('ruang_id', { mode: 'number' })
        .notNull()
        .references(() => ruang.id),
    kelas: varchar('kelas', { length: 10 }).notNull(),
    hari: hariTypeEnum('hari').notNull(),
    jam_mulai: time('jam_mulai').notNull(),
    jam_selesai: time('jam_selesai').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 6. Table: pengaduan
export const pengaduan = pgTable('pengaduan', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    fasilitas_ruang_id: bigint('fasilitas_ruang_id', { mode: 'number' })
        .notNull()
        .references(() => fasilitasRuang.id),
    mahasiswa_id: bigint('mahasiswa_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    judul: varchar('judul', { length: 150 }).notNull(),
    deskripsi: text('deskripsi').notNull(),
    status: statusPengaduanTypeEnum('status').default('OPEN').notNull(),
    prioritas: prioritasTypeEnum('prioritas').default('MEDIUM').notNull(),
    staff_id: bigint('staff_id', { mode: 'number' }).references(() => users.id),
    catatan_staff: text('catatan_staff'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 7. Table: pengajuan_jadwal
export const pengajuanJadwal = pgTable('pengajuan_jadwal', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    jadwal_id: bigint('jadwal_id', { mode: 'number' })
        .notNull()
        .references(() => jadwal.id),
    dosen_id: bigint('dosen_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    tanggal_baru: date('tanggal_baru').notNull(),
    jam_mulai_baru: time('jam_mulai_baru').notNull(),
    jam_selesai_baru: time('jam_selesai_baru').notNull(),
    ruang_baru_id: bigint('ruang_baru_id', { mode: 'number' }).references(() => ruang.id),
    alasan: text('alasan').notNull(),
    status: statusPengajuanTypeEnum('status').default('PENDING').notNull(),
    staff_id: bigint('staff_id', { mode: 'number' }).references(() => users.id),
    catatan_staff: text('catatan_staff'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// =========================================
// DRIZZLE RELATIONS (Mempermudah Query JOIN)
// =========================================

export const ruangRelations = relations(ruang, ({ many }) => ({
    fasilitas: many(fasilitasRuang),
    jadwal: many(jadwal),
}));

export const fasilitasRuangRelations = relations(fasilitasRuang, ({ one, many }) => ({
    ruang: one(ruang, {
        fields: [fasilitasRuang.ruang_id],
        references: [ruang.id],
    }),
    pengaduan: many(pengaduan),
}));

export const jadwalRelations = relations(jadwal, ({ one, many }) => ({
    mataKuliah: one(mataKuliah, {
        fields: [jadwal.mata_kuliah_id],
        references: [mataKuliah.id],
    }),
    dosen: one(users, {
        fields: [jadwal.dosen_id],
        references: [users.id],
    }),
    ruang: one(ruang, {
        fields: [jadwal.ruang_id],
        references: [ruang.id],
    }),
    pengajuan: many(pengajuanJadwal),
}));

export const pengaduanRelations = relations(pengaduan, ({ one }) => ({
    fasilitas: one(fasilitasRuang, {
        fields: [pengaduan.fasilitas_ruang_id],
        references: [fasilitasRuang.id],
    }),
    mahasiswa: one(users, {
        fields: [pengaduan.mahasiswa_id],
        references: [users.id],
    }),
    staff: one(users, {
        fields: [pengaduan.staff_id],
        references: [users.id],
    }),
}));

export const pengajuanJadwalRelations = relations(pengajuanJadwal, ({ one }) => ({
    jadwal: one(jadwal, {
        fields: [pengajuanJadwal.jadwal_id],
        references: [jadwal.id],
    }),
    dosen: one(users, {
        fields: [pengajuanJadwal.dosen_id],
        references: [users.id],
    }),
    ruangBaru: one(ruang, {
        fields: [pengajuanJadwal.ruang_baru_id],
        references: [ruang.id],
    }),
    staff: one(users, {
        fields: [pengajuanJadwal.staff_id],
        references: [users.id],
    }),
}));