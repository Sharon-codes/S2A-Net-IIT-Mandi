/**
 * Lightweight browser parser for 3D point cloud formats:
 * .PLY (ASCII & Binary Little Endian), .OBJ, .XYZ
 */
export function parsePointsFromBuffer(filename: string, buffer: ArrayBuffer): number[][] {
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith(".ply")) {
    return parsePLY(buffer);
  } else if (lowerName.endsWith(".obj") || lowerName.endsWith(".xyz")) {
    const text = new TextDecoder().decode(buffer);
    return parseTextPoints(text);
  }

  // Fallback: simple text attempt
  try {
    const text = new TextDecoder().decode(buffer);
    return parseTextPoints(text);
  } catch {
    return [];
  }
}

function parseTextPoints(text: string): number[][] {
  const lines = text.split("\n");
  const points: number[][] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    let parts = trimmed.split(/\s+/);
    if (parts[0] === "v") {
      parts = parts.slice(1);
    }
    if (parts.length >= 3) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        points.push([x, y, z]);
      }
    }
  }
  return points;
}

function parsePLY(buffer: ArrayBuffer): number[][] {
  const headerText = new TextDecoder().decode(new Uint8Array(buffer, 0, Math.min(2048, buffer.byteLength)));
  const headerEnd = headerText.indexOf("end_header");
  if (headerEnd === -1) return [];

  const headerLines = headerText.substring(0, headerEnd).split("\n");
  let vertexCount = 0;
  let isBinary = false;

  for (const line of headerLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("element vertex")) {
      vertexCount = parseInt(trimmed.split(/\s+/)[2], 10);
    } else if (trimmed.includes("format binary_little_endian")) {
      isBinary = true;
    }
  }

  if (vertexCount <= 0) return [];

  // Find exact byte offset of the newline right after "end_header"
  const fullHeaderStr = "end_header";
  const bytes = new Uint8Array(buffer);
  let offset = 0;
  for (let i = 0; i < Math.min(4096, bytes.length - 10); i++) {
    if (
      bytes[i] === 101 && // e
      bytes[i + 1] === 110 && // n
      bytes[i + 2] === 100 && // d
      bytes[i + 3] === 95 && // _
      bytes[i + 4] === 104 && // h
      bytes[i + 5] === 101 && // e
      bytes[i + 6] === 97 && // a
      bytes[i + 7] === 100 && // d
      bytes[i + 8] === 101 && // e
      bytes[i + 9] === 114 // r
    ) {
      offset = i + 10;
      while (offset < bytes.length && (bytes[offset] === 10 || bytes[offset] === 13)) {
        offset++;
      }
      break;
    }
  }

  const points: number[][] = [];
  if (isBinary) {
    const dataView = new DataView(buffer, offset);
    // Standard PLY float32 x, y, z (12 bytes per vertex)
    const stride = 12;
    for (let i = 0; i < vertexCount; i++) {
      if (offset + i * stride + 12 > buffer.byteLength) break;
      const x = dataView.getFloat32(i * stride + 0, true);
      const y = dataView.getFloat32(i * stride + 4, true);
      const z = dataView.getFloat32(i * stride + 8, true);
      if (isFinite(x) && isFinite(y) && isFinite(z)) {
        points.push([x, y, z]);
      }
    }
  } else {
    const bodyText = new TextDecoder().decode(new Uint8Array(buffer, offset));
    return parseTextPoints(bodyText);
  }

  return points;
}
