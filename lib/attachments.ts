export interface Attachment {
  name: string;
  size: string;
  type: string;
  base64: string;
}

export interface ParsedNotes {
  briefText: string;
  attachments: Attachment[];
}

export function parseNotes(notesStr: string): ParsedNotes {
  if (!notesStr) {
    return { briefText: "No specifications provided.", attachments: [] };
  }

  const separator = "--- Attached Media ---";
  if (!notesStr.includes(separator)) {
    return { briefText: notesStr, attachments: [] };
  }

  const parts = notesStr.split(separator);
  const briefText = parts[0].trim();
  const attachmentsPart = parts[1] || "";

  const attachments: Attachment[] = [];
  // Matching [File: filename (size) | Type: type | Data: base64]
  const regex = /\[File:\s*([^(\]]+)\s*\(([^)]+)\)\s*\|\s*Type:\s*([^|]+)\s*\|\s*Data:\s*([^\]]+)\]/g;

  let match;
  while ((match = regex.exec(attachmentsPart)) !== null) {
    attachments.push({
      name: match[1].trim(),
      size: match[2].trim(),
      type: match[3].trim(),
      base64: match[4].trim(),
    });
  }

  return {
    briefText: briefText || "No specifications provided.",
    attachments
  };
}

export function formatNotesWithAttachments(briefText: string, attachments: Attachment[]): string {
  let result = briefText || "No specifications provided.";
  if (attachments.length > 0) {
    result += "\n\n--- Attached Media ---";
    attachments.forEach((file) => {
      result += `\n[File: ${file.name} (${file.size}) | Type: ${file.type} | Data: ${file.base64}]`;
    });
  }
  return result;
}
