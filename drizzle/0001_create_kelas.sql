CREATE TABLE "kelas" (
    "id" bigserial PRIMARY KEY NOT NULL,
    "nama_kelas" varchar(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "kelas_nama_kelas_unique" UNIQUE("nama_kelas")
);
