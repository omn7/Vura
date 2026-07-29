// ── Constants ─────────────────────────────────────────────────────────────────

export const TEMPLATE_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
export const DATASET_MAX_SIZE = 5 * 1024 * 1024;   // 5 MB
export const MAX_ROW_COUNT = 5000;

const ALLOWED_TEMPLATE_MIME = new Set(["application/pdf"]);
const ALLOWED_TEMPLATE_EXT = ".pdf";

const ALLOWED_DATASET_MIME = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel",                                          // .xls
  "text/csv",
  "application/csv",
  "application/octet-stream", // some browsers send this for xlsx/csv
]);
const ALLOWED_DATASET_EXT = new Set([".xlsx", ".xls", ".csv"]);

// ── Types ─────────────────────────────────────────────────────────────────────

export type FileValidationError = {
  message: string;
  status: 400 | 413;
};

// ── Validators ────────────────────────────────────────────────────────────────

export function validateTemplateFile(file: File | null): FileValidationError | null {
  if (!file) {
    return { message: "Template file is required.", status: 400 };
  }

  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  const mimeOk = ALLOWED_TEMPLATE_MIME.has(file.type);
  const extOk = ext === ALLOWED_TEMPLATE_EXT;

  if (!mimeOk || !extOk) {
    return { message: "Unsupported file type", status: 400 };
  }

  if (file.size > TEMPLATE_MAX_SIZE) {
    return { message: "Template file too large", status: 413 };
  }

  return null;
}

export function validateDatasetFile(file: File | null): FileValidationError | null {
  if (!file) {
    return { message: "Dataset file is required.", status: 400 };
  }

  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  const extOk = ALLOWED_DATASET_EXT.has(ext);
  const mimeOk = ALLOWED_DATASET_MIME.has(file.type);
  // application/octet-stream is only valid when the extension is recognised
  const octetWithBadExt = file.type === "application/octet-stream" && !extOk;

  if (!mimeOk || !extOk || octetWithBadExt) {
    return { message: "Unsupported file type", status: 400 };
  }

  if (file.size > DATASET_MAX_SIZE) {
    return { message: "Dataset file too large", status: 413 };
  }

  return null;
}

export function validateRowCount(rowCount: number): FileValidationError | null {
  if (rowCount > MAX_ROW_COUNT) {
    return { message: "Dataset exceeds maximum row limit", status: 400 };
  }
  return null;
}

/**
 * Validates a fetched PDF template response (used in certificates/create).
 * Call after safeFetch but before arrayBuffer().
 */
export function validateTemplateFetchResponse(
  contentType: string | null,
  contentLength: string | null,
): FileValidationError | null {
  const mime = (contentType ?? "").split(";")[0].trim().toLowerCase();
  if (mime && !ALLOWED_TEMPLATE_MIME.has(mime)) {
    return { message: "Unsupported file type", status: 400 };
  }

  const size = contentLength ? parseInt(contentLength, 10) : NaN;
  if (!isNaN(size) && size > TEMPLATE_MAX_SIZE) {
    return { message: "Template file too large", status: 413 };
  }

  return null;
}
