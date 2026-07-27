require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const readline = require("readline");
const bcrypt = require("bcrypt");
const pool = require("../db");

const SALT_ROUNDS = 12;

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let value = "";
    function onData(char) {
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (char === "") {
        process.stdout.write("\n");
        process.exit(0);
      } else if (char === "") {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    }

    process.stdin.on("data", onData);
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  console.log("\nElectro Boutique — crear / actualizar administrador\n");

  const email = (await ask(rl, "Email del admin: ")).trim().toLowerCase();
  rl.close();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Email invalido. Saliendo.");
    process.exit(1);
  }

  const password = await askHidden("Contraseña (no se mostrará): ");
  const confirm  = await askHidden("Repetir contraseña:          ");

  if (password !== confirm) {
    console.error("\nLas contraseñas no coinciden. Saliendo.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("\nLa contraseña debe tener al menos 8 caracteres. Saliendo.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const [existing] = await pool.query(
    "SELECT id_admin FROM admins WHERE email = ? LIMIT 1",
    [email]
  );

  if (existing.length > 0) {
    await pool.query(
      "UPDATE admins SET password_hash = ? WHERE email = ?",
      [hash, email]
    );
    console.log(`\nContraseña actualizada para: ${email}`);
  } else {
    await pool.query(
      "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
      [email, hash]
    );
    console.log(`\nAdministrador creado: ${email}`);
  }

  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error("\nError:", err.message);
  pool.end().finally(() => process.exit(1));
});
