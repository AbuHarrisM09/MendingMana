const bcrypt = require("bcrypt");
const { query, pool } = require("../config/db");

const SALT_ROUNDS = 10;

function buildSeedUsers() {
  return [
    {
      fullName: process.env.SEED_ADMIN_NAME || "Administrator MendingMana",
      username: process.env.SEED_ADMIN_USERNAME || "admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@mendingmana.local",
      password: process.env.SEED_ADMIN_PASSWORD || "Admin12345!",
      roleName: "admin",
      isVerified: true,
    },
    {
      fullName: process.env.SEED_MEMBER_NAME || "Member MendingMana",
      username: process.env.SEED_MEMBER_USERNAME || "member",
      email: process.env.SEED_MEMBER_EMAIL || "member@mendingmana.local",
      password: process.env.SEED_MEMBER_PASSWORD || "Member12345!",
      roleName: "member",
      isVerified: true,
    },
    {
      fullName: process.env.SEED_MEMBER_NAME || "Admin Harris",
      username: process.env.SEED_MEMBER_USERNAME || "harris",
      email: process.env.SEED_MEMBER_EMAIL || "harris@mendingmana.local",
      password: process.env.SEED_MEMBER_PASSWORD || "harris12345!",
      roleName: "admin",
      isVerified: true,
    },
  ];
}

async function getRoleIdByName(roleName) {
  const roleResult = await query(
    "SELECT id FROM roles WHERE name = $1 LIMIT 1",
    [roleName],
  );

  if (!roleResult.rows[0]) {
    throw new Error(
      `Role '${roleName}' tidak ditemukan. Jalankan npm run db:init dulu.`,
    );
  }

  return roleResult.rows[0].id;
}

async function upsertUser(seedUser) {
  const roleId = await getRoleIdByName(seedUser.roleName);
  const passwordHash = await bcrypt.hash(seedUser.password, SALT_ROUNDS);

  const sql = `
    INSERT INTO users (full_name, username, email, password_hash, role_id, is_verified)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      username = EXCLUDED.username,
      password_hash = EXCLUDED.password_hash,
      role_id = EXCLUDED.role_id,
      is_verified = EXCLUDED.is_verified,
      updated_at = NOW()
    RETURNING id, full_name, email
  `;

  const values = [
    seedUser.fullName,
    seedUser.username,
    seedUser.email,
    passwordHash,
    roleId,
    seedUser.isVerified,
  ];

  const result = await query(sql, values);
  return result.rows[0];
}

async function seedUsers() {
  const users = buildSeedUsers();

  try {
    for (const user of users) {
      const saved = await upsertUser(user);
      console.log(`Seeded user: ${saved.email} (id=${saved.id})`);
    }

    console.log("User seeding selesai.");
  } catch (error) {
    console.error("Gagal melakukan seed user.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedUsers();
