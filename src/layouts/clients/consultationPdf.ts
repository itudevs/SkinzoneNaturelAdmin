import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import clientConsultationTemplate from "assets/Docs/CLIENT CONSULTATION FORM.pdf";

const pdfText = (value) =>
  String(value ?? "")
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
  drawValue(personalAndSkinPage, form.treatmentGoal, 245, 487, 290);

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
    ["Face wash", form.products?.faceWash, 251],
    ["Toner", form.products?.toner, 233],
    ["Exfoliant", form.products?.exfoliant, 215],
    ["Serum", form.products?.serum, 196],
    ["Moisturizer", form.products?.moisturizer, 178],
    ["Sunscreen", form.products?.sunscreen, 160],
    ["Other", form.products?.other, 145],
  ].forEach(([label, value, y]) => {
    if (value) {
      drawValue(personalAndSkinPage, `${label}: ${value}`, 130, y, 365, 7);
    }
  });

  drawValue(lifestylePage, form.lifestyle?.waterIntake, 176, 582, 140);
  drawValue(lifestylePage, form.lifestyle?.mealsPerDay, 145, 559, 170);
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
  drawWrappedText(lifestylePage, font, form.lifestyle?.recommendations, 78, 296, 455, 10, 5);

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
