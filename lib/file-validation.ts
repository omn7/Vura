export const FILE_LIMITS = {
  template: {
    maxSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: ["application/pdf"],
  },
  dataset: {
    maxSize: 5 * 1024 * 1024, // 5 MB
    allowedExtensions: [".xlsx", ".xls", ".csv"],
    maxRows: 5000,
    minRows: 1,
  },
} as const;

export class FileValidationError extends Error {
  field: string;
  status: number;

  constructor(field: string, message: string, status: number) {
    super(message);
    this.name = "FileValidationError";
    this.field = field;
    this.status = status;
  }
}

export function validateTemplateFile(file: File | null): FileValidationError | null {
  if (!file) {
    return new FileValidationError("template", "Template file is required.", 400);
  }

  if (file.size > FILE_LIMITS.template.maxSize) {
    return new FileValidationError(
      "template",
      `Template file exceeds the maximum size of ${FILE_LIMITS.template.maxSize / (1024 * 1024)} MB.`,
      413,
    );
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return new FileValidationError("template", "Template must be a PDF file.", 400);
  }

  return null;
}

export function validateDatasetFile(file: File | null): FileValidationError | null {
  if (!file) {
    return new FileValidationError("dataset", "Dataset file is required.", 400);
  }

  if (file.size > FILE_LIMITS.dataset.maxSize) {
    return new FileValidationError(
      "dataset",
      `Dataset file exceeds the maximum size of ${FILE_LIMITS.dataset.maxSize / (1024 * 1024)} MB.`,
      413,
    );
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!FILE_LIMITS.dataset.allowedExtensions.includes(ext as any)) {
    return new FileValidationError(
      "dataset",
      `Dataset must be an Excel file (${FILE_LIMITS.dataset.allowedExtensions.join(", ")}).`,
      400,
    );
  }

  return null;
}

export function validateRowCount(rows: number): FileValidationError | null {
  if (rows > FILE_LIMITS.dataset.maxRows) {
    return new FileValidationError(
      "dataset",
      `Dataset exceeds the maximum of ${FILE_LIMITS.dataset.maxRows} rows. Found ${rows} rows.`,
      400,
    );
  }
  return null;
}
