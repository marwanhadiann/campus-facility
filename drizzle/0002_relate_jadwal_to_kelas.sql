BEGIN;

INSERT INTO kelas (nama_kelas)
SELECT DISTINCT btrim(jadwal.kelas)
FROM jadwal
WHERE btrim(jadwal.kelas) <> ''
ON CONFLICT (nama_kelas) DO NOTHING;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM jadwal WHERE btrim(kelas) = '') THEN
        RAISE EXCEPTION 'Jadwal has blank kelas values; clean them before migration';
    END IF;
END $$;

ALTER TABLE jadwal ADD COLUMN kelas_id bigint;

UPDATE jadwal
SET kelas_id = kelas.id
FROM kelas
WHERE kelas.nama_kelas = btrim(jadwal.kelas);

ALTER TABLE jadwal ALTER COLUMN kelas_id SET NOT NULL;
ALTER TABLE jadwal ADD CONSTRAINT jadwal_kelas_id_kelas_id_fk
    FOREIGN KEY (kelas_id) REFERENCES kelas(id);
CREATE INDEX jadwal_kelas_id_idx ON jadwal (kelas_id);
ALTER TABLE jadwal DROP COLUMN kelas;

COMMIT;
