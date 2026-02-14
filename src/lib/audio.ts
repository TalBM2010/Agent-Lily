export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

export function createAudioDataUrl(
  base64: string,
  mimeType: string = "audio/mpeg"
): string {
  return `data:${mimeType};base64,${base64}`;
}
