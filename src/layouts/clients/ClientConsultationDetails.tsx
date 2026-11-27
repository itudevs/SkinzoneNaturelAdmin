// @ts-nocheck

import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

function ConsultationSection({ title, fields }) {
  return (
    <Card sx={{ mb: 2, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
      <MDBox p={2}>
        <MDTypography variant="h6" mb={1}>
          {title}
        </MDTypography>
        <Grid container spacing={1.5}>
          {fields.map(([label, value]) => (
            <Grid item xs={12} sm={6} key={label}>
              <MDTypography variant="caption" color="text" display="block">
                {label}
              </MDTypography>
              <MDTypography variant="body2">{value || "Not provided"}</MDTypography>
            </Grid>
          ))}
        </Grid>
      </MDBox>
    </Card>
  );
}

ConsultationSection.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.array).isRequired,
};

function ClientConsultationDetails({ form, onClose, onPreviewPdf, onDownloadPdf }) {
  const sections = [
    {
      title: "Visit details",
      fields: [
        ["Consultation date", form.consultationDate],
        ["Date of birth", form.dateOfBirth],
        ["Referred by", form.referredBy],
        ["Main goal for treatment", form.treatmentGoal],
      ],
    },
    {
      title: "Skin history",
      fields: [
        ["Had a facial before", form.hadFacial],
        ["Last facial", form.lastFacial],
        ["Main skin concern", form.mainSkinConcern],
        ["Uses active products", form.usesActiveProducts],
        ["Active products and last use", form.activeProductsDetails],
        ["Had skin procedures", form.hadSkinProcedures],
        ["Procedures and last treatment", form.skinProceduresDetails],
        ["Used acne medication", form.usedAcneMedicine],
        ["Medication and last use", form.acneMedicineDetails],
      ],
    },
    {
      title: "Current skin-care products",
      fields: [
        ["Face wash / soap", form.products?.faceWash],
        ["Toner", form.products?.toner],
        ["Exfoliant", form.products?.exfoliant],
        ["Serum", form.products?.serum],
        ["Moisturizer", form.products?.moisturizer],
        ["Sunscreen", form.products?.sunscreen],
        ["Other products", form.products?.other],
      ],
    },
    {
      title: "Diet and lifestyle",
      fields: [
        ["Water intake per day", form.lifestyle?.waterIntake],
        ["Meals per day", form.lifestyle?.mealsPerDay],
        ["Fruits and vegetables daily", form.lifestyle?.fruitsAndVegetables],
        ["Dairy consumption", form.lifestyle?.dairy],
        ["Digestive issues", form.lifestyle?.digestiveIssues],
        ["Sugar intake", form.lifestyle?.sugarIntake],
        ["Additional notes", form.lifestyle?.notes],
        ["Dietary recommendations", form.lifestyle?.recommendations],
      ],
    },
  ];

  return (
    <Dialog open={Boolean(form)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Consultation form - {form.consultationDate || "Date not recorded"}</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
        <MDTypography variant="caption" color="text" display="block" mb={2}>
          Saved {form.createdAt ? new Date(form.createdAt).toLocaleString() : ""}
        </MDTypography>
        {sections.map((section) => (
          <ConsultationSection title={section.title} fields={section.fields} key={section.title} />
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MDButton variant="text" color="dark" onClick={onClose}>
          Close
        </MDButton>
        <MDButton variant="text" color="primary" onClick={onPreviewPdf}>
          Preview PDF
        </MDButton>
        <MDButton variant="gradient" color="primary" onClick={onDownloadPdf}>
          Download PDF
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ClientConsultationDetails.propTypes = {
  form: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onPreviewPdf: PropTypes.func.isRequired,
  onDownloadPdf: PropTypes.func.isRequired,
};

export default ClientConsultationDetails;
