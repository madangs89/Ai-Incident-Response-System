import crypto from "crypto";
import path from "path";

function normalizeMessage(msg) {
  if (!msg) return "";
  return msg
    .toLowerCase()
    .replace(/\b\d+\b/g, "<num>") // numeric ids
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      "<uuid>"
    ) // UUIDs
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi, "<email>"); // emails
}

export function generateSignature(ErrorType, Errormessage, functionName, fileName) {
  const type = ErrorType || "Error";
  const message = normalizeMessage(Errormessage || "");
  const func = functionName || "<anonymous>";
  const file = fileName ? path.basename(fileName) : "<unknown>";

  const base = `${type}|${message}|${func}|${file}`;

  return crypto.createHash("sha256").update(base).digest("hex");
}
