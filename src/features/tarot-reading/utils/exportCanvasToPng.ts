import { toPng } from "html-to-image";
import { TAROT_CONFIG } from "@/constants/app";

/**
 * Chờ toàn bộ ảnh trong node giải mã xong và xuất ra tệp PNG chất lượng cao.
 * Tự động hạ pixelRatio xuống 1.5 với các ảnh quá dài để tránh tràn bộ nhớ canvas trên Mobile Safari.
 */
export async function downloadElementAsPng(
  targetNode: HTMLElement,
  filename: string,
): Promise<void> {
  const images = Array.from(targetNode.querySelectorAll("img"));

  await Promise.all(
    images.map((img) =>
      img.complete
        ? img.decode().catch(() => undefined)
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
    ),
  );

  const nodeHeight = targetNode.offsetHeight || TAROT_CONFIG.SHARE_IMAGE_HEIGHT;
  const safePixelRatio = nodeHeight > 2600 ? 1.5 : 2;

  const pngDataUrl = await toPng(targetNode, {
    cacheBust: true,
    pixelRatio: safePixelRatio,
    width: TAROT_CONFIG.SHARE_IMAGE_WIDTH,
    height: nodeHeight,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = pngDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
