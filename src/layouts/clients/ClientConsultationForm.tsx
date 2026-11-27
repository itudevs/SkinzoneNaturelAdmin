// @ts-nocheck

import { useState } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

const steps = ["Visit", "Skin history", "Products", "Lifestyle"];

const createInitialAnswers = () => ({
  consultationDate: new Date().toISOString().slice(0, 10),
  dateOfBirth: "",
  referredBy: "",
  treatmentGoal: "",
  hadFacial: "",
  lastFacial: "",
  mainSkinConcern: "",
  usesActiveProducts: "",
  activeProductsDetails: "",
  hadSkinProcedures: "",
  skinProceduresDetails: "",
  usedAcneMedicine: "",
  acneMedicineDetails: "",
  products: {
    faceWash: "",
    toner: "",
    exfoliant: "",
    serum: "",
    moisturizer: "",
    sunscreen: "",
    other: "",
  },
  lifestyle: {
    waterIntake: "",
    mealsPerDay: "",
    fruitsAndVegetables: "",
    dairy: "",
    digestiveIssues: "",
    sugarIntake: "",
    notes: "",
    recommendations: "",
  },
  products: {
    faceWash: "",
    toner: "",
    exfoliant: "",
    serum: "",
    moisturizer: "",
    sunscreen: "",
    other: "",
  },
  lifestyle: {
    waterIntake: "",
    mealsPerDay: "",
    fruitsAndVegetables: "",
    dairy: "",
    digestiveIssues: "",
    sugarIntake: "",
    notes: "",
    recommendations: "",
  },
});

function ConsultationSelect({ label, value, onChange, options }) {
  return (
    <MDInput select label={label} value={value} onChange={onChange} fullWidth>
      <MenuItem value="">
        <em>Select an answer</em>
      </MenuItem>
      {options.map((option) => (
        <MenuItem value={option} key={option}>
          {option}
        </MenuItem>
      ))}
    </MDInput>
  );
}

ConsultationSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function ClientConsultationForm({ client, onClose, onSave }) {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState(createInitialAnswers);

  const updateAnswer = (field) => (event) =>
    setAnswers((current) => ({ ...current, [field]: event.target.value }));
  const updateSection = (section, field) => (event) =>
    setAnswers((current) => ({
      ...current,
      [section]: { ...current[section], [field]: event.target.value },
    }));

  const handleSave = () => {
    if (onSave(answers)) {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(client)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Client consultation - {client.name}</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 2 }}>
        <MDBox mb={3}>
          <MDTypography variant="body2" color="text" mb={1}>
            Page {activeStep + 1} of {steps.length}: {steps[activeStep]}
          </MDTypography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </MDBox>

        {activeStep === 0 && (
          <MDBox>
            <MDTypography variant="h6" mb={2}>
              Visit details
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDInput
                  type="date"
                  label="Consultation date"
                  value={answers.consultationDate}
                  onChange={updateAnswer("consultationDate")}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  type="date"
                  label="Date of birth"
                  value={answers.dateOfBirth}
                  onChange={updateAnswer("dateOfBirth")}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  label="Referred by"
                  value={answers.referredBy}
                  onChange={updateAnswer("referredBy")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  label="Main goal for today's treatment"
                  value={answers.treatmentGoal}
                  onChange={updateAnswer("treatmentGoal")}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {activeStep === 1 && (
          <MDBox>
            <MDTypography variant="h6" mb={2}>
              Skin history
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Have you had a facial before?"
                  value={answers.hadFacial}
                  onChange={updateAnswer("hadFacial")}
                  options={["Yes", "No"]}
                />
              </Grid>
              {answers.hadFacial === "Yes" && (
                <Grid item xs={12} sm={6}>
                  <MDInput
                    label="When was your last facial?"
                    value={answers.lastFacial}
                    onChange={updateAnswer("lastFacial")}
                    fullWidth
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <MDInput
                  label="Main skin concern"
                  value={answers.mainSkinConcern}
                  onChange={updateAnswer("mainSkinConcern")}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Do you use retinoids, AHA, or similar active products?"
                  value={answers.usesActiveProducts}
                  onChange={updateAnswer("usesActiveProducts")}
                  options={["Yes", "No"]}
                />
              </Grid>
              {answers.usesActiveProducts === "Yes" && (
                <Grid item xs={12} sm={6}>
                  <MDInput
                    label="Which products and when last used?"
                    value={answers.activeProductsDetails}
                    onChange={updateAnswer("activeProductsDetails")}
                    fullWidth
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Have you had a peel, laser, or microdermabrasion?"
                  value={answers.hadSkinProcedures}
                  onChange={updateAnswer("hadSkinProcedures")}
                  options={["Yes", "No"]}
                />
              </Grid>
              {answers.hadSkinProcedures === "Yes" && (
                <Grid item xs={12} sm={6}>
                  <MDInput
                    label="Procedure and date of last treatment"
                    value={answers.skinProceduresDetails}
                    onChange={updateAnswer("skinProceduresDetails")}
                    fullWidth
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Have you used acne medication?"
                  value={answers.usedAcneMedicine}
                  onChange={updateAnswer("usedAcneMedicine")}
                  options={["Yes", "No"]}
                />
              </Grid>
              {answers.usedAcneMedicine === "Yes" && (
                <Grid item xs={12} sm={6}>
                  <MDInput
                    label="Medication and when last used"
                    value={answers.acneMedicineDetails}
                    onChange={updateAnswer("acneMedicineDetails")}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          </MDBox>
        )}

        {activeStep === 2 && (
          <MDBox>
            <MDTypography variant="h6" mb={2}>
              Current skin-care products
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={2}>
              List the products currently used and include brands where known.
            </MDTypography>
            <Grid container spacing={2}>
              {[
                ["faceWash", "Face wash / soap"],
                ["toner", "Toner"],
                ["exfoliant", "Exfoliant"],
                ["serum", "Serum"],
                ["moisturizer", "Moisturizer"],
                ["sunscreen", "Sunscreen"],
                ["other", "Other products"],
              ].map(([field, label]) => (
                <Grid item xs={12} sm={6} key={field}>
                  <MDInput
                    label={label}
                    value={answers.products[field]}
                    onChange={updateSection("products", field)}
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {activeStep === 3 && (
          <MDBox>
            <MDTypography variant="h6" mb={2}>
              Diet and lifestyle
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={2}>
              Share what you are comfortable with. This information supports general skin-care
              discussions and is not medical advice.
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Water intake per day"
                  value={answers.lifestyle.waterIntake}
                  onChange={updateSection("lifestyle", "waterIntake")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Meals per day"
                  value={answers.lifestyle.mealsPerDay}
                  onChange={updateSection("lifestyle", "mealsPerDay")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Do you eat fruits and vegetables daily?"
                  value={answers.lifestyle.fruitsAndVegetables}
                  onChange={updateSection("lifestyle", "fruitsAndVegetables")}
                  options={["Yes", "No"]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Do you consume dairy often?"
                  value={answers.lifestyle.dairy}
                  onChange={updateSection("lifestyle", "dairy")}
                  options={["Yes", "No"]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="Do you experience bloating or digestive issues?"
                  value={answers.lifestyle.digestiveIssues}
                  onChange={updateSection("lifestyle", "digestiveIssues")}
                  options={["Yes", "No"]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ConsultationSelect
                  label="How would you describe your sugar intake?"
                  value={answers.lifestyle.sugarIntake}
                  onChange={updateSection("lifestyle", "sugarIntake")}
                  options={["Low", "Moderate", "High"]}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  label="Additional notes"
                  value={answers.lifestyle.notes}
                  onChange={updateSection("lifestyle", "notes")}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  label="Dietary recommendations"
                  value={answers.lifestyle.recommendations}
                  onChange={updateSection("lifestyle", "recommendations")}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>
            </Grid>
          </MDBox>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MDButton variant="text" color="dark" onClick={onClose}>
          Cancel
        </MDButton>
        {activeStep > 0 && (
          <MDButton variant="text" color="primary" onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </MDButton>
        )}
        {activeStep < steps.length - 1 ? (
          <MDButton
            variant="gradient"
            color="primary"
            onClick={() => setActiveStep(activeStep + 1)}
          >
            Next
          </MDButton>
        ) : (
          <MDButton variant="gradient" color="primary" onClick={handleSave}>
            Save consultation
          </MDButton>
        )}
      </DialogActions>
    </Dialog>
  );
}

ClientConsultationForm.propTypes = {
  client: PropTypes.shape({
    name: PropTypes.string.isRequired,
    consultation: PropTypes.object,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ClientConsultationForm;
