// @ts-nocheck

import { useState } from "react";

import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import MDAlert from "components/MDAlert";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const categories = ["Facial", "Body", "Chemical Peel", "Other"];

const initialTreatments = [
  {
    treatmentId: 1,
    name: "Deep Cleansing Facial",
    category: "Facial",
    discount: 10,
    retailPrice: 650,
  },
  { treatmentId: 2, name: "Body Sculpting", category: "Body", discount: 0, retailPrice: 850 },
  {
    treatmentId: 3,
    name: "Skin Renewal Peel",
    category: "Chemical Peel",
    discount: 5,
    retailPrice: 750,
  },
];

function Treatments() {
  const [treatments, setTreatments] = useState(initialTreatments);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    discount: "",
    retailPrice: "",
  });
  const [message, setMessage] = useState(null);

  const visibleTreatments = treatments.filter(
    (treatment) =>
      (selectedCategory === "All" || treatment.category === selectedCategory) &&
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const resetForm = () => {
    setEditingTreatmentId(null);
    setForm({ name: "", category: "", discount: "", retailPrice: "" });
  };

  const saveTreatment = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.category || form.discount === "" || form.retailPrice === "") {
      setMessage({ color: "error", text: "Please complete all treatment details." });
      return;
    }

    const discount = Number(form.discount);
    const retailPrice = Number(form.retailPrice);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100 ||
      !Number.isFinite(retailPrice) ||
      retailPrice < 0
    ) {
      setMessage({
        color: "error",
        text: "Enter a discount from 0 to 100 and a valid retail price.",
      });
      return;
    }

    if (editingTreatmentId) {
      setTreatments((current) =>
        current.map((treatment) =>
          treatment.treatmentId === editingTreatmentId
            ? {
                ...treatment,
                name: form.name.trim(),
                category: form.category,
                discount,
                retailPrice,
              }
            : treatment
        )
      );
      setMessage({ color: "success", text: "Treatment details updated successfully." });
    } else {
      setTreatments((current) => [
        ...current,
        {
          treatmentId: Date.now(),
          name: form.name.trim(),
          category: form.category,
          discount,
          retailPrice,
        },
      ]);
      setMessage({ color: "success", text: "Treatment saved successfully." });
    }

    resetForm();
  };

  const editTreatment = (treatment) => {
    setEditingTreatmentId(treatment.treatmentId);
    setForm({
      name: treatment.name,
      category: treatment.category,
      discount: treatment.discount,
      retailPrice: treatment.retailPrice,
    });
    setMessage(null);
  };

  const removeTreatment = (treatment) => {
    setTreatments((current) =>
      current.filter((item) => item.treatmentId !== treatment.treatmentId)
    );
    if (editingTreatmentId === treatment.treatmentId) {
      resetForm();
    }
    setMessage({ color: "success", text: "Treatment removed successfully." });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Manage Treatments
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Add treatments, assign categories, and maintain treatment information.
          </MDTypography>
        </MDBox>

        {message && (
          <MDBox mb={3}>
            <MDAlert color={message.color} dismissible onClose={() => setMessage(null)}>
              {message.text}
            </MDAlert>
          </MDBox>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  Treatments
                </MDTypography>
                <MDBox mb={2}>
                  <MDInput
                    label="Search treatment"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    fullWidth
                  />
                </MDBox>
                <MDBox mb={3} px={0.5}>
                  <FormControl fullWidth sx={{ minWidth: 0 }}>
                    <InputLabel shrink>Filter by category</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Filter by category"
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="All">All categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem value={category} key={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBox>
                {visibleTreatments.length ? (
                  visibleTreatments.map((treatment) => (
                    <MDBox
                      key={treatment.treatmentId}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1.5}
                      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                    >
                      <MDBox>
                        <MDTypography variant="button" fontWeight="medium" display="block">
                          {treatment.name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          TreatmentID: {treatment.treatmentId} | Category: {treatment.category}
                          {" | "}Retail price: R{treatment.retailPrice.toFixed(2)}
                          {" | "}Discount: {treatment.discount}%
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label={`Edit ${treatment.name}`}
                          onClick={() => editTreatment(treatment)}
                        >
                          <Icon fontSize="small">edit</Icon>
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`Remove ${treatment.name}`}
                          onClick={() => removeTreatment(treatment)}
                        >
                          <Icon fontSize="small">delete</Icon>
                        </IconButton>
                      </MDBox>
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="body2" color="text">
                    No treatments found.
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  {editingTreatmentId ? "Update Treatment Details" : "Enter Treatment Details"}
                </MDTypography>
                <MDBox component="form" onSubmit={saveTreatment}>
                  <MDBox mb={3}>
                    <MDInput
                      label="Treatment name"
                      value={form.name}
                      onChange={updateForm("name")}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={3} px={0.5}>
                    <FormControl fullWidth sx={{ minWidth: 0 }}>
                      <InputLabel shrink>Assign category</InputLabel>
                      <Select
                        value={form.category}
                        label="Assign category"
                        onChange={updateForm("category")}
                        sx={{ minHeight: 56 }}
                      >
                        {categories.map((category) => (
                          <MenuItem value={category} key={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput
                      type="number"
                      label="Retail price"
                      value={form.retailPrice}
                      onChange={updateForm("retailPrice")}
                      inputProps={{ min: 0, step: 0.01 }}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput
                      type="number"
                      label="Discount (%)"
                      value={form.discount}
                      onChange={updateForm("discount")}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                      fullWidth
                    />
                  </MDBox>
                  <MDButton type="submit" variant="gradient" color="primary" fullWidth>
                    {editingTreatmentId ? "Update Treatment" : "Save Treatment"}
                  </MDButton>
                  {editingTreatmentId && (
                    <MDButton
                      type="button"
                      variant="text"
                      color="dark"
                      fullWidth
                      onClick={resetForm}
                    >
                      Cancel edit
                    </MDButton>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Treatments;
