import { createApp } from 'vue';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

/** Decode base64 data URL to Uint8Array */
function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Export RakezWeeklyCampaignTemplate (HTML) to PDF using html2canvas + pdf-lib.
 * @param {Object} props - { logoSrc?, rows: [{ id, platform, clicks, impressions }], footer? }
 * @returns {Promise<Uint8Array>} PDF bytes
 */
/** Load Amiri TTF and return base64 for injection (main doc + clone doc in html2canvas) */
async function getAmiriBase64() {
  const res = await fetch('/fonts/Amiri-Regular.ttf');
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function makeAmiriFontFaceCss(base64) {
  if (!base64) return '';
  return `@font-face{font-family:'Amiri';src:url(data:font/ttf;base64,${base64}) format('truetype');font-weight:400;font-style:normal;}`;
}

export async function exportDeveloperPlanTemplateToPdf(props) {
  const fontBase64 = await getAmiriBase64();
  if (fontBase64) {
    const style = document.createElement('style');
    style.id = 'amiri-pdf-export-font';
    style.textContent = makeAmiriFontFaceCss(fontBase64);
    document.head.appendChild(style);
    try {
      await document.fonts.load('16px Amiri');
      await document.fonts.ready;
    } catch (_) {}
  }

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;z-index:-1;font-family:\'Amiri\',serif;';
  document.body.appendChild(container);

  const { default: RakezWeeklyCampaignTemplate } = await import(
    '@/components/marketing/RakezWeeklyCampaignTemplate.vue'
  );
  const app = createApp(RakezWeeklyCampaignTemplate, props);
  app.mount(container);

  await new Promise((r) => setTimeout(r, 800));

  const pageEl = container.querySelector('.a4-page');
  if (!pageEl) {
    app.unmount();
    container.remove();
    document.getElementById('amiri-pdf-export-font')?.remove();
    throw new Error('Template root .a4-page not found');
  }

  pageEl.style.fontFamily = "'Amiri', serif";

  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(pageEl, {
    useCORS: true,
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    onclone(clonedDoc, clonedNode) {
      if (fontBase64 && clonedDoc && clonedDoc.head) {
        const style = clonedDoc.createElement('style');
        style.textContent = makeAmiriFontFaceCss(fontBase64);
        clonedDoc.head.appendChild(style);
      }
      const root = clonedNode.querySelector?.('.a4-page') || clonedNode;
      if (root) root.style.fontFamily = "'Amiri', serif";
    },
  });

  app.unmount();
  container.remove();
  const styleEl = document.getElementById('amiri-pdf-export-font');
  if (styleEl) styleEl.remove();

  const pngDataUrl = canvas.toDataURL('image/png');
  const pngBytes = dataUrlToBytes(pngDataUrl);

  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const image = await pdfDoc.embedPng(pngBytes);

  const pageAspect = A4_HEIGHT / A4_WIDTH;
  const imgAspect = image.height / image.width;
  let w = A4_WIDTH;
  let h = A4_HEIGHT;
  let x = 0;
  let y = 0;
  if (imgAspect > pageAspect) {
    w = A4_HEIGHT / imgAspect;
    x = (A4_WIDTH - w) / 2;
  } else {
    h = A4_WIDTH * imgAspect;
    y = (A4_HEIGHT - h) / 2;
  }
  page.drawImage(image, { x, y, width: w, height: h });

  return pdfDoc.save();
}
