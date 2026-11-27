import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import clientConsultationTemplate from "assets/Docs/CLIENT CONSULTATION FORM.pdf";

const pdfText = (value) =>
  String(value ?? "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2012-\u2015\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2022\u00B7]/g, "-")
    .replace(/\u00A0/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");

const drawFittedText = (page, font, value, x, y, maxWidth, size = 8) => {
  const text = pdfText(value);
  if (!text) {
    return;
  }

  let fontSize = size;
  while (fontSize > 5 && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
    fontSize -= 0.25;
  }

  let fittedText = text;
  while (fittedText.length > 1 && font.widthOfTextAtSize(fittedText, fontSize) > maxWidth) {
    fittedText = fittedText.slice(0, -1);
  }
  if (fittedText !== text && fittedText.length > 3) {
    fittedText = `${fittedText.slice(0, -3)}...`;
  }

  const textWidth = font.widthOfTextAtSize(fittedText, fontSize);
  page.drawRectangle({
    x: x - 1,
    y: y - 2,
    width: Math.min(textWidth + 2, maxWidth),
    height: fontSize + 4,
    color: rgb(1, 1, 1),
  });
  page.drawText(fittedText, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0.08, 0.08, 0.08),
  });
};

const drawWrappedText = (page, font, value, x, y, maxWidth, lineHeight, maxLines) => {
  const text = pdfText(value).trim();
  if (!text) {
    return;
  }

  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, 8) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    drawFittedText(page, font, line, x, y - index * lineHeight, maxWidth, 8);
  });
};

export const createConsultationPdf = async (client, form) => {
  const templateResponse = await fetch(clientConsultationTemplate);
  if (!templateResponse.ok) {
    throw new Error("Could not load the original client consultation PDF.");
  }

  const templateBytes = await templateResponse.arrayBuffer();
  const pdf = await PDFDocument.load(templateBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const [personalAndSkinPage, lifestylePage] = pdf.getPages();
  const textColor = rgb(0.08, 0.08, 0.08);

  const drawValue = (page, value, x, y, width, size = 8) =>
    drawFittedText(page, font, value, x, y, width, size);

  drawValue(personalAndSkinPage, form.consultationDate, 108, 619, 390);
  drawValue(personalAndSkinPage, client.name, 176, 592, 145);
  drawValue(personalAndSkinPage, form.dateOfBirth, 443, 592, 105);
  drawValue(personalAndSkinPage, client.phone, 118, 566, 125);
  drawValue(personalAndSkinPage, client.email, 306, 566, 238);
  drawValue(personalAndSkinPage, client.address, 110, 540, 430);
  drawValue(personalAndSkinPage, form.referredBy, 124, 513, 416);
  drawValue(personalAndSkinPage, form.treatmentGoal, 285, 487, 250);

  drawValue(personalAndSkinPage, form.hadFacial, 280, 434, 210);
  drawValue(personalAndSkinPage, form.lastFacial, 280, 416, 210);
  drawValue(personalAndSkinPage, form.mainSkinConcern, 280, 398, 210);
  drawValue(personalAndSkinPage, form.usesActiveProducts, 490, 380, 50);
  drawValue(personalAndSkinPage, form.activeProductsDetails, 180, 361, 300);
  drawValue(personalAndSkinPage, form.hadSkinProcedures, 455, 343, 75);
  drawValue(personalAndSkinPage, form.skinProceduresDetails, 276, 325, 210);
  drawValue(personalAndSkinPage, form.usedAcneMedicine, 230, 306, 90);
  drawValue(personalAndSkinPage, form.acneMedicineDetails, 315, 288, 180);

  [
    [form.products?.faceWash, 215, 251, 110],
    [form.products?.toner, 370, 251, 135],
    [form.products?.moisturizer, 205, 233, 120],
    [form.products?.sunscreen, 365, 233, 140],
    [form.products?.exfoliant, 215, 215, 105],
    [form.products?.serum, 165, 196, 145],
    [form.products?.other, 160, 178, 345],
  ].forEach(([value, x, y, width]) => {
    if (value) {
      drawValue(personalAndSkinPage, value, x, y, width, 7);
    }
  });

  drawValue(lifestylePage, form.lifestyle?.waterIntake, 335, 582, 220);
  drawValue(lifestylePage, form.lifestyle?.mealsPerDay, 335, 559, 220);
  drawValue(lifestylePage, form.lifestyle?.fruitsAndVegetables, 382, 536, 95);
  drawValue(lifestylePage, form.lifestyle?.dairy, 382, 513, 95);
  drawValue(lifestylePage, form.lifestyle?.digestiveIssues, 382, 490, 95);

  const sugarIntake = String(form.lifestyle?.sugarIntake || "").toLowerCase();
  const sugarOptionY = { low: 466, moderate: 451, high: 421 }[sugarIntake];
  if (sugarOptionY) {
    lifestylePage.drawText("X", {
      x: 356,
      y: sugarOptionY,
      size: 8,
      font: boldFont,
      color: textColor,
    });
  }
  drawValue(lifestylePage, form.lifestyle?.notes, 374, 385, 165, 7);
  drawWrappedText(lifestylePage, font, form.lifestyle?.recommendations, 335, 296, 220, 10, 5);

  return pdf.save();
};

export const createConsultationFormsPdf = async (client, forms) => {
  const combinedPdf = await PDFDocument.create();

  for (const form of forms) {
    const formPdf = await PDFDocument.load(await createConsultationPdf(client, form));
    const pages = await combinedPdf.copyPages(formPdf, formPdf.getPageIndices());
    pages.forEach((page) => combinedPdf.addPage(page));
  }

  return combinedPdf.save();
};
