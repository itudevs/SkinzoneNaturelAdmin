// @ts-nocheck

import { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
import { api } from "layouts/authentication/apiClient";
import { getAuthToken } from "layouts/authentication/authService";

const getErrorMessage = (error, fallback) => (error instanceof Error ? error.message : fallback);

const getTreatmentCatalog = async (token) => {
  const [categories, treatments] = await Promise.all([
    api.get("/treatment/categories", token),
    api.get("/treatment/treatments", token),
  ]);

  if (!Array.isArray(categories) || !Array.isArray(treatments)) {
    throw new Error("The treatment categories or treatment list response was not a list.");
  }

  return { categories, treatments };
};

const getDetailedTreatments = async (treatments, token) =>
  Promise.all(
    treatments.map(async (treatment) => {
      const details = await api.get(`/treatment/treatment/${treatment.id}`, token);

      if (!details || typeof details !== "object") {
        throw new Error(`The details response for treatment ${treatment.id} was invalid.`);
      }

      return { ...details, id: treatment.id };
    })
  );

function Treatments() {
  const [categories, setCategories] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [categoryTreatments, setCategoryTreatments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isLoadingCategoryTreatments, setIsLoadingCategoryTreatments] = useState(false);
  const [isLoadingTreatmentDetails, setIsLoadingTreatmentDetails] = useState(false);
  const [isSavingTreatment, setIsSavingTreatment] = useState(false);
  const [isDeletingTreatment, setIsDeletingTreatment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    discount: "",
    retailPrice: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const token = await getAuthToken();
        const catalog = await getTreatmentCatalog(token);

        if (isMounted) {
          setCategories(catalog.categories);
          setTreatments(catalog.treatments);
        }
      } catch (error) {
        if (isMounted) {
          setMessage({
            color: "error",
            text: getErrorMessage(error, "Could not load treatment data."),
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshCatalog = async (token) => {
    const catalog = await getTreatmentCatalog(token);
    setCategories(catalog.categories);
    setTreatments(catalog.treatments);
    return catalog.treatments;
  };

  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const openCategory = async (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedTreatment(null);
    setCategoryTreatments([]);
    setSearchTerm("");
    setIsLoadingCategoryTreatments(true);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const details = await getDetailedTreatments(treatments, token);
      setCategoryTreatments(details.filter((treatment) => treatment.category === categoryName));
    } catch (error) {
      setMessage({
        color: "error",
        text: getErrorMessage(error, `Could not load treatments in ${categoryName}.`),
      });
    } finally {
      setIsLoadingCategoryTreatments(false);
    }
  };

  const openTreatment = async (treatment) => {
    setSelectedTreatment({ id: treatment.id, name: treatment.name });
    setIsLoadingTreatmentDetails(true);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const details = await api.get(`/treatment/treatment/${treatment.id}`, token);

      if (!details || typeof details !== "object") {
        throw new Error("The treatment details response was invalid.");
      }

      setSelectedTreatment({ ...details, id: treatment.id });
    } catch (error) {
      setSelectedTreatment(null);
      setMessage({
        color: "error",
        text: getErrorMessage(error, `Could not load ${treatment.name}.`),
      });
    } finally {
      setIsLoadingTreatmentDetails(false);
    }
  };

  const saveTreatment = async (event) => {
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

    setIsSavingTreatment(true);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const treatment = {
        name: form.name.trim(),
        category: form.category,
        retailPrice,
        discount,
        numberOfPeopleTreated: 0,
      };
      const savedTreatment = await api.post("/treatment/add/treatment", treatment, token);

      if (!savedTreatment) {
        throw new Error("The treatment could not be saved.");
      }

      const updatedTreatments = await refreshCatalog(token);
      setSelectedCategory(form.category);
      setSelectedTreatment(null);
      setCategoryTreatments(
        (await getDetailedTreatments(updatedTreatments, token)).filter(
          (item) => item.category === form.category
        )
      );
      setForm({ name: "", category: "", discount: "", retailPrice: "" });
      setMessage({ color: "success", text: "Treatment saved successfully." });
    } catch (error) {
      setMessage({
        color: "error",
        text: getErrorMessage(error, "Could not save the treatment."),
      });
    } finally {
      setIsSavingTreatment(false);
    }
  };

  const saveCategory = async () => {
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      setMessage({ color: "error", text: "Enter a category name." });
      return;
    }

    if (
      categories.some(
        (category) => category.treatmentCategory.toLowerCase() === categoryName.toLowerCase()
      )
    ) {
      setMessage({ color: "error", text: "That treatment category already exists." });
      return;
    }

    setIsSavingCategory(true);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const categoryAdded = await api.post("/treatment/add/category", categoryName, token);

      if (!categoryAdded) {
        throw new Error("The treatment category could not be added.");
      }

      await refreshCatalog(token);
      setSelectedCategory(null);
      setSelectedTreatment(null);
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      setMessage({ color: "success", text: `${categoryName} category added successfully.` });
    } catch (error) {
      setMessage({
        color: "error",
        text: getErrorMessage(error, `Could not add ${categoryName}.`),
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const removeTreatment = async (treatment) => {
    setIsDeletingTreatment(true);
    setMessage(null);

    try {
      const token = await getAuthToken();
      const deleted = await api.post(
        `/treatment/treatment/delete/${treatment.id}`,
        undefined,
        token
      );

      if (!deleted) {
        throw new Error("The treatment could not be deleted.");
      }

      const updatedTreatments = await refreshCatalog(token);
      setSelectedTreatment(null);
      if (selectedCategory) {
        setCategoryTreatments(
          (await getDetailedTreatments(updatedTreatments, token)).filter(
            (item) => item.category === selectedCategory
          )
        );
      }
      setMessage({ color: "success", text: "Treatment removed successfully." });
    } catch (error) {
      setMessage({
        color: "error",
        text: getErrorMessage(error, "Could not remove the treatment."),
      });
    } finally {
      setIsDeletingTreatment(false);
    }
  };

  const visibleTreatments = categoryTreatments.filter((treatment) =>
    treatment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isTreatmentDetailsSelected = selectedTreatment !== null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Treatment List
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Browse treatments by category, view treatment totals, and maintain the treatment
            catalog.
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
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h6">
                    {isTreatmentDetailsSelected
                      ? "Treatment Details"
                      : selectedCategory
                      ? `${selectedCategory} Treatments`
                      : "Treatment Categories"}
                  </MDTypography>
                  {selectedCategory || isTreatmentDetailsSelected ? (
                    <MDButton
                      variant="text"
                      color="primary"
                      onClick={() => {
                        if (isTreatmentDetailsSelected) {
                          setSelectedTreatment(null);
                        } else {
                          setSelectedCategory(null);
                          setCategoryTreatments([]);
                          setSearchTerm("");
                        }
                      }}
                    >
                      {isTreatmentDetailsSelected ? "Back to treatments" : "All categories"}
                    </MDButton>
                  ) : (
                    <MDButton
                      variant="text"
                      color="primary"
                      onClick={() => setCategoryDialogOpen(true)}
                    >
                      Add category
                    </MDButton>
                  )}
                </MDBox>

                {isLoadingCatalog ? (
                  <MDTypography variant="body2" color="text">
                    Loading treatment categories...
                  </MDTypography>
                ) : isTreatmentDetailsSelected ? (
                  <MDBox>
                    <MDTypography variant="h5" fontWeight="medium" mb={1}>
                      {selectedTreatment.name}
                    </MDTypography>
                    {isLoadingTreatmentDetails ? (
                      <MDTypography variant="body2" color="text">
                        Loading treatment details...
                      </MDTypography>
                    ) : (
                      <>
                        <MDTypography variant="body2" color="text" mb={3}>
                          Category: {selectedTreatment.category}
                        </MDTypography>
                        <Grid container spacing={2} mb={2}>
                          <Grid item xs={12} sm={4}>
                            <Card>
                              <MDBox p={2}>
                                <MDTypography variant="caption" color="text">
                                  People treated
                                </MDTypography>
                                <MDTypography variant="h5">
                                  {selectedTreatment.numberOfPeopleTreated ?? "Unavailable"}
                                </MDTypography>
                              </MDBox>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Card>
                              <MDBox p={2}>
                                <MDTypography variant="caption" color="text">
                                  Retail price
                                </MDTypography>
                                <MDTypography variant="h5">
                                  R{Number(selectedTreatment.retailPrice).toFixed(2)}
                                </MDTypography>
                              </MDBox>
                            </Card>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Card>
                              <MDBox p={2}>
                                <MDTypography variant="caption" color="text">
                                  Total amount (people × retail price)
                                </MDTypography>
                                <MDTypography variant="h5">
                                  {Number.isFinite(Number(selectedTreatment.numberOfPeopleTreated))
                                    ? `R${(
                                        Number(selectedTreatment.numberOfPeopleTreated) *
                                        Number(selectedTreatment.retailPrice)
                                      ).toFixed(2)}`
                                    : "Unavailable"}
                                </MDTypography>
                              </MDBox>
                            </Card>
                          </Grid>
                        </Grid>
                        <MDBox display="flex" justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Remove ${selectedTreatment.name}`}
                            disabled={isDeletingTreatment}
                            onClick={() => removeTreatment(selectedTreatment)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      </>
                    )}
                  </MDBox>
                ) : selectedCategory ? (
                  <MDBox>
                    <MDBox mb={2}>
                      <MDInput
                        label="Search treatment"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        fullWidth
                      />
                    </MDBox>
                    {isLoadingCategoryTreatments ? (
                      <MDTypography variant="body2" color="text">
                        Loading treatments...
                      </MDTypography>
                    ) : visibleTreatments.length ? (
                      visibleTreatments.map((treatment) => (
                        <MDBox
                          key={treatment.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          py={1}
                          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                        >
                          <MDButton
                            variant="text"
                            color="dark"
                            onClick={() => openTreatment(treatment)}
                            sx={{ textAlign: "left", justifyContent: "flex-start", flexGrow: 1 }}
                          >
                            <MDBox>
                              <MDTypography variant="button" fontWeight="medium" display="block">
                                {treatment.name}
                              </MDTypography>
                              <MDTypography variant="caption" color="text">
                                Retail price: R{Number(treatment.retailPrice).toFixed(2)}
                              </MDTypography>
                            </MDBox>
                          </MDButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Remove ${treatment.name}`}
                            disabled={isDeletingTreatment}
                            onClick={() => removeTreatment(treatment)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      ))
                    ) : (
                      <MDTypography variant="body2" color="text">
                        No treatments found in this category.
                      </MDTypography>
                    )}
                  </MDBox>
                ) : categories.length ? (
                  <Grid container spacing={2}>
                    {categories.map((category) => (
                      <Grid item xs={12} sm={6} key={category.treatmentCategory}>
                        <Card>
                          <MDBox p={2}>
                            <MDTypography variant="h6" mb={1}>
                              {category.treatmentCategory}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={2}>
                              {category.numberOfTreatments} treatment(s)
                            </MDTypography>
                            <MDButton
                              variant="gradient"
                              color="primary"
                              fullWidth
                              onClick={() => openCategory(category.treatmentCategory)}
                            >
                              View treatments
                            </MDButton>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <MDTypography variant="body2" color="text">
                    No treatment categories found. Add a category to get started.
                  </MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  Add Treatment
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
                          <MenuItem
                            value={category.treatmentCategory}
                            key={category.treatmentCategory}
                          >
                            {category.treatmentCategory}
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
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="primary"
                    fullWidth
                    disabled={isSavingTreatment || !categories.length}
                  >
                    {isSavingTreatment ? "Saving..." : "Save Treatment"}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog
        open={categoryDialogOpen}
        onClose={() => {
          if (!isSavingCategory) {
            setCategoryDialogOpen(false);
            setNewCategoryName("");
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add treatment category</DialogTitle>
        <DialogContent>
          <MDBox mt={1}>
            <MDInput
              label="Category name"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              fullWidth
              autoFocus
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="dark"
            disabled={isSavingCategory}
            onClick={() => {
              setCategoryDialogOpen(false);
              setNewCategoryName("");
            }}
          >
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color="primary"
            disabled={isSavingCategory}
            onClick={saveCategory}
          >
            {isSavingCategory ? "Saving..." : "Add category"}
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default Treatments;
