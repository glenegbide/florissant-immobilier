// Show or change the admin password.
//   npm run password          → shows current email + password
//   npm run password -- new   → sets password to "new"
import fs from "node:fs";

const envPath = new URL("../.env", import.meta.url).pathname;
let env = fs.readFileSync(envPath, "utf8");

const newPass = process.argv[2];

if (newPass) {
  if (newPass.length < 8) {
    console.error("Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }
  env = env.replace(/ADMIN_PASSWORD="[^"]*"/, `ADMIN_PASSWORD="${newPass}"`);
  fs.writeFileSync(envPath, env);
  console.log(`✓ Nouveau mot de passe enregistré : ${newPass}`);
  console.log("  Redémarrez le serveur pour l'appliquer (ou il sera pris au prochain démarrage).");
} else {
  const email = env.match(/ADMIN_EMAIL="([^"]*)"/)?.[1];
  const pass = env.match(/ADMIN_PASSWORD="([^"]*)"/)?.[1];
  console.log(`E-mail       : ${email}`);
  console.log(`Mot de passe : ${pass}`);
}
