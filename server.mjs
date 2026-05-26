import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { access } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

import { config } from "./lib/config.mjs";
import {
  createAdminSession,
  createContactMessage,
  deleteAdminSession,
  deleteContactMessage,
  deleteExpiredAdminSessions,
  findAdminByIdentifier,
  findAdminSession,
  listContactMessages,
  updateContactMessageStatus
} from "./lib/database.mjs";
import {
  buildCookie,
  createSessionToken,
  parseCookies,
  sha256,
  verifyPassword
} from "./lib/security.mjs";

const SESSION_COOKIE_NAME = "eb_admin_session";
const VALID_STATUSES = new Set(["new", "read", "replied"]);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function notFound(response) {
  sendJson(response, 404, { error: "No encontrado." });
}

function getRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 1_000_000) {
        reject(new Error("Request demasiado grande."));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function parseJsonBody(request) {
  const body = await getRequestBody(request);
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("JSON invalido.");
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function sessionTtlSeconds() {
  return config.sessionTtlDays * 24 * 60 * 60;
}

function getSessionCookieHeader(token, expiresAt) {
  return buildCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.isProduction,
    path: "/",
    maxAge: sessionTtlSeconds(),
    expires: expiresAt
  });
}

function getExpiredSessionCookieHeader() {
  return buildCookie(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: config.isProduction,
    path: "/",
    maxAge: 0,
    expires: new Date(0)
  });
}

function getAuthenticatedAdmin(request) {
  deleteExpiredAdminSessions();

  const cookies = parseCookies(request.headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  if (!sessionToken) {
    return null;
  }

  const tokenHash = sha256(`${sessionToken}:${config.sessionSecret}`);
  const session = findAdminSession(tokenHash);
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    deleteAdminSession(tokenHash);
    return null;
  }

  return {
    id: session.userId,
    email: session.email,
    username: session.username,
    tokenHash
  };
}

async function handleCreateMessage(request, response) {
  const payload = await parseJsonBody(request);
  const name = sanitizeText(payload.name);
  const email = sanitizeText(payload.email);
  const phone = sanitizeText(payload.phone);
  const message = sanitizeText(payload.message);

  if (!name || !email || !message) {
    sendJson(response, 400, { error: "Completá nombre, email y mensaje." });
    return;
  }

  if (!isValidEmail(email)) {
    sendJson(response, 400, { error: "Ingresá un email valido." });
    return;
  }

  createContactMessage({ name, email, phone, message });
  sendJson(response, 201, {
    success: true,
    message: "Gracias. Tu mensaje fue enviado correctamente."
  });
}

async function handleAdminLogin(request, response) {
  const payload = await parseJsonBody(request);
  const identifier = sanitizeText(payload.identifier);
  const password = String(payload.password || "");

  if (!identifier || !password) {
    sendJson(response, 400, { error: "Ingresá usuario/email y contrasena." });
    return;
  }

  const admin = findAdminByIdentifier(identifier);
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    sendJson(response, 401, { error: "Credenciales invalidas." });
    return;
  }

  const token = createSessionToken();
  const tokenHash = sha256(`${token}:${config.sessionSecret}`);
  const expiresAt = new Date(Date.now() + sessionTtlSeconds() * 1000);

  createAdminSession({
    userId: admin.id,
    tokenHash,
    expiresAt: expiresAt.toISOString()
  });

  sendJson(
    response,
    200,
    {
      success: true,
      user: {
        email: admin.email,
        username: admin.username
      }
    },
    {
      "Set-Cookie": getSessionCookieHeader(token, expiresAt)
    }
  );
}

async function handleAdminLogout(request, response) {
  const admin = getAuthenticatedAdmin(request);
  if (admin?.tokenHash) {
    deleteAdminSession(admin.tokenHash);
  }

  sendJson(
    response,
    200,
    { success: true },
    { "Set-Cookie": getExpiredSessionCookieHeader() }
  );
}

function requireAdmin(request, response) {
  const admin = getAuthenticatedAdmin(request);
  if (!admin) {
    sendJson(response, 401, { error: "No autorizado." });
    return null;
  }

  return admin;
}

async function handleAdminMessages(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  sendJson(response, 200, { messages: listContactMessages() });
}

async function handleAdminMe(request, response) {
  const admin = requireAdmin(request, response);
  if (!admin) {
    return;
  }

  sendJson(response, 200, {
    user: {
      id: admin.id,
      email: admin.email,
      username: admin.username
    }
  });
}

async function handleAdminMessageUpdate(request, response, id) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const payload = await parseJsonBody(request);
  const status = sanitizeText(payload.status).toLowerCase();

  if (!VALID_STATUSES.has(status)) {
    sendJson(response, 400, { error: "Estado invalido." });
    return;
  }

  const updated = updateContactMessageStatus(Number(id), status);
  if (!updated) {
    notFound(response);
    return;
  }

  sendJson(response, 200, { success: true });
}

async function handleAdminMessageDelete(request, response, id) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const deleted = deleteContactMessage(Number(id));
  if (!deleted) {
    notFound(response);
    return;
  }

  sendJson(response, 200, { success: true });
}

function resolveStaticPath(pathname) {
  const decodedPathname = decodeURIComponent(pathname);

  if (decodedPathname === "/") {
    return join(config.rootDir, "index.html");
  }

  if (decodedPathname === "/admin-login") {
    return join(config.rootDir, "admin-login.html");
  }

  if (decodedPathname === "/admin-dashboard") {
    return join(config.rootDir, "admin-dashboard.html");
  }

  const normalized = normalize(decodedPathname).replace(/^(\.\.[/\\])+/, "");
  return join(config.rootDir, normalized);
}

async function serveStaticFile(request, response, pathname) {
  const filePath = resolveStaticPath(pathname);

  if (pathname === "/admin-dashboard" && !getAuthenticatedAdmin(request)) {
    redirect(response, "/admin-login");
    return;
  }

  try {
    await access(filePath);
  } catch {
    notFound(response);
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    const { pathname } = url;

    if (request.method === "POST" && pathname === "/api/messages") {
      await handleCreateMessage(request, response);
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/login") {
      await handleAdminLogin(request, response);
      return;
    }

    if (request.method === "POST" && pathname === "/api/admin/logout") {
      await handleAdminLogout(request, response);
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/me") {
      await handleAdminMe(request, response);
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/messages") {
      await handleAdminMessages(request, response);
      return;
    }

    const adminMessageMatch = pathname.match(/^\/api\/admin\/messages\/(\d+)$/);
    if (adminMessageMatch && request.method === "PATCH") {
      await handleAdminMessageUpdate(request, response, adminMessageMatch[1]);
      return;
    }

    if (adminMessageMatch && request.method === "DELETE") {
      await handleAdminMessageDelete(request, response, adminMessageMatch[1]);
      return;
    }

    const staticPath = resolveStaticPath(pathname);
    if (existsSync(staticPath)) {
      await serveStaticFile(request, response, pathname);
      return;
    }

    if (pathname === "/admin-login" || pathname === "/admin-dashboard" || pathname === "/") {
      await serveStaticFile(request, response, pathname);
      return;
    }

    notFound(response);
  } catch (error) {
    if (error.message === "JSON invalido.") {
      sendJson(response, 400, { error: "El cuerpo enviado no es valido." });
      return;
    }

    console.error(error);
    sendJson(response, 500, { error: "Ocurrio un error interno." });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Electro Boutique corriendo en http://${config.host}:${config.port}`);
});
