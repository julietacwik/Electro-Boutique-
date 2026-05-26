import { createAdminUser, findAdminByIdentifier } from "../lib/database.mjs";
import { hashPassword } from "../lib/security.mjs";

const [, , email, thirdArg, fourthArg] = process.argv;

if (!email || !thirdArg) {
  console.error("Uso: node scripts/create-admin.mjs <email> <password> o <email> <username> <password>");
  process.exit(1);
}

const safeUsername = fourthArg ? thirdArg : null;
const safePassword = fourthArg || thirdArg;

if (findAdminByIdentifier(email) || (safeUsername && findAdminByIdentifier(safeUsername))) {
  console.error("Ya existe un admin con ese email o username.");
  process.exit(1);
}

const adminId = createAdminUser({
  email,
  username: safeUsername,
  passwordHash: hashPassword(safePassword)
});

console.log(`Admin creado correctamente con id ${adminId}.`);
