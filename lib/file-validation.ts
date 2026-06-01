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

export type FileValidationError = {
  field: string;
  message: string;
  status: number;
};

export function validateTemplateFile(file: File | null): FileValidationError | null {
  if (!file) {
    return { field: "template", message: "Template file is required.", status: 400 };
  }

  if (file.size > FILE_LIMITS.template.maxSize) {
    return {
      field: "template",
      message: `Template file exceeds the maximum size of ${FILE_LIMITS.template.maxSize / (1024 * 1024)} MB.`,
      status: 413,
    };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return {
      field: "template",
      message: "Template must be a PDF file.",
      status: 400,
    };
  }

  return null;
}

export function validateDatasetFile(file: File | null): FileValidationError | null {
  if (!file) {
    return { field: "dataset", message: "Dataset file is required.", status: 400 };
  }

  if (file.size > FILE_LIMITS.dataset.maxSize) {
    return {
      field: "dataset",
      message: `Dataset file exceeds the maximum size of ${FILE_LIMITS.dataset.maxSize / (1024 * 1024)} MB.`,
      status: 413,
    };
  }

  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!FILE_LIMITS.dataset.allowedExtensions.includes(ext as any)) {
    return {
      field: "dataset",
      message: `Dataset must be an Excel file (${FILE_LIMITS.dataset.allowedExtensions.join(", ")}).`,
      status: 400,
    };
  }

  return null;
}

export function validateRowCount(rows: number): FileValidationError | null {
  if (rows > FILE_LIMITS.dataset.maxRows) {
    return {
      field: "dataset",
      message: `Dataset exceeds the maximum of ${FILE_LIMITS.dataset.maxRows} rows. Found ${rows} rows.`,
      status: 400,
    };
  }
  return null;
}
