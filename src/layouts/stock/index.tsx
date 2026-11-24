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

const initialStock = [
  {
    id: 1,
    name: "Cleanser",
    dateReceived: "2026-11-01",
    amountAvailable: 12,
    clinicalPrice: 280,
    retailPrice: 350,
    category: "GENOP",
  },
  {
    id: 2,
    name: "Moisturiser",
    dateReceived: "2026-11-03",
    amountAvailable: 8,
    clinicalPrice: 650,
    retailPrice: 780,
    category: "Lamelle",
  },
  {
    id: 3,
    name: "Sunscreen",
    dateReceived: "2026-11-05",
    amountAvailable: 20,
    clinicalPrice: 450,
    retailPrice: 550,
    category: "Fargon",
  },
  {
    id: 4,
    name: "Serum",
    dateReceived: "2026-11-08",
    amountAvailable: 15,
    clinicalPrice: 520,
    retailPrice: 630,
    category: "Evolution",
  },
];

const initialCategories = ["GENOP", "Lamelle", "Fargon", "Evolution"];
const ADD_CATEGORY = "__add_category";

function Stock() {
  const [stockItems, setStockItems] = useState(initialStock);
  const [categories, setCategories] = useState(() => {
    try {
      const savedCategories = JSON.parse(localStorage.getItem("stockCategories"));
      return Array.isArray(savedCategories) ? savedCategories : initialCategories;
    } catch {
      return initialCategories;
    }
  });
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryTarget, setCategoryTarget] = useState("form");
  const [editingItemId, setEditingItemId] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [form, setForm] = useState({
    name: "",
    dateReceived: "",
    category: "",
    amountAvailable: "",
    clinicalPrice: "",
    retailPrice: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem("stockCategories", JSON.stringify(categories));
  }, [categories]);
  const filteredStockItems = stockItems.filter(
    (item) =>
      (categoryFilter === "All" || item.category === categoryFilter) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const openAddCategoryDialog = (target) => {
    setCategoryTarget(target);
    setNewCategoryName("");
    setCategoryDialogOpen(true);
  };

  const addCategory = () => {
    const categoryName = newCategoryName.trim();

    if (!categoryName) {
      setMessage({ color: "error", text: "Enter a category name." });
      return;
    }

    const existingCategory = categories.find(
      (category) => category.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      setMessage({ color: "error", text: "That category already exists." });
      return;
    }

    setCategories((current) => [...current, categoryName]);
    if (categoryTarget === "filter") {
      setCategoryFilter(categoryName);
    } else {
      setForm((current) => ({ ...current, category: categoryName }));
    }
    setCategoryDialogOpen(false);
    setNewCategoryName("");
    setMessage({ color: "success", text: `${categoryName} category added successfully.` });
  };

  const addStockItem = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.dateReceived ||
      !form.category ||
      form.amountAvailable === "" ||
      form.clinicalPrice === "" ||
      form.retailPrice === ""
    ) {
      setMessage({ color: "error", text: "Please complete every stock item detail." });
      return;
    }

    const amountAvailable = Number(form.amountAvailable);
    const clinicalPrice = Number(form.clinicalPrice);
    const retailPrice = Number(form.retailPrice);

    if (
      !Number.isFinite(amountAvailable) ||
      amountAvailable < 0 ||
      !Number.isFinite(clinicalPrice) ||
      clinicalPrice < 0 ||
      !Number.isFinite(retailPrice) ||
      retailPrice < 0
    ) {
      setMessage({
        color: "error",
        text: "Amount available and both prices must be valid values.",
      });
      return;
    }

    if (editingItemId) {
      setStockItems((current) =>
        current.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: form.name.trim(),
                dateReceived: form.dateReceived,
                category: form.category,
                amountAvailable,
                clinicalPrice,
                retailPrice,
              }
            : item
        )
      );
      setEditingItemId(null);
      setMessage({ color: "success", text: "Stock item updated successfully." });
    } else {
      setStockItems((current) => [
        ...current,
        {
          id: Date.now(),
          name: form.name.trim(),
          dateReceived: form.dateReceived,
          category: form.category,
          amountAvailable,
          clinicalPrice,
          retailPrice,
        },
      ]);
      setMessage({ color: "success", text: "Stock item added successfully." });
    }
    setForm({
      name: "",
      dateReceived: "",
      category: "",
      amountAvailable: "",
      clinicalPrice: "",
      retailPrice: "",
    });
  };

  const editStockItem = (item) => {
    setEditingItemId(item.id);
    setForm({
      name: item.name,
      dateReceived: item.dateReceived,
      category: item.category,
      amountAvailable: item.amountAvailable,
      clinicalPrice: item.clinicalPrice,
      retailPrice: item.retailPrice ?? "",
    });
    setMessage(null);
  };

  const deleteStockItem = (item) => {
    setStockItems((current) => current.filter((stockItem) => stockItem.id !== item.id));
    if (editingItemId === item.id) {
      setEditingItemId(null);
      setForm({
        name: "",
        dateReceived: "",
        category: "",
        amountAvailable: "",
        clinicalPrice: "",
        retailPrice: "",
      });
    }
    setMessage({ color: "success", text: `${item.name} was deleted successfully.` });
  };

  const addStock = () => {
    const amount = Number(restockAmount);

    if (!Number.isInteger(amount) || amount < 1) {
      setMessage({
        color: "error",
        text: "Enter a whole-number stock amount of at least one.",
      });
      return;
    }

    setStockItems((current) =>
      current.map((item) =>
        item.id === restockItem.id
          ? { ...item, amountAvailable: item.amountAvailable + amount }
          : item
      )
    );
    setMessage({ color: "success", text: `Added ${amount} to ${restockItem.name} stock.` });
    setRestockItem(null);
    setRestockAmount("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Manage Stock
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Add, view, and remove products from the stock list.
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
                  Stock Products
                </MDTypography>
                <MDBox mb={2}>
                  <MDInput
                    label="Search stock item"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    fullWidth
                  />
                </MDBox>
                <MDBox mb={3} px={0.5}>
                  <FormControl fullWidth sx={{ minWidth: 0 }}>
                    <InputLabel shrink>Filter by category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Filter by category"
                      onChange={(event) => {
                        if (event.target.value === ADD_CATEGORY) {
                          openAddCategoryDialog("filter");
                        } else {
                          setCategoryFilter(event.target.value);
                        }
                      }}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="All">All categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem value={category} key={category}>
                          {category}
                        </MenuItem>
                      ))}
                      <MenuItem value={ADD_CATEGORY}>
                        <Icon fontSize="small" sx={{ mr: 1 }}>
                          add
                        </Icon>
                        Add category
                      </MenuItem>
                    </Select>
                  </FormControl>
                </MDBox>
                <MDBox mt={1}>
                  {filteredStockItems.length ? (
                    filteredStockItems.map((item) => (
                      <MDBox
                        key={item.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1.5}
                        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                      >
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium" display="block">
                            {item.name}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {item.category} | Received: {item.dateReceived} | Available:{" "}
                            {item.amountAvailable}
                          </MDTypography>
                        </MDBox>
                        <MDBox display="flex" alignItems="center">
                          <MDTypography variant="button" fontWeight="medium" mr={1}>
                            R{(item.retailPrice ?? item.clinicalPrice).toFixed(2)}
                          </MDTypography>
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => editStockItem(item)}
                          >
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            aria-label={`Add stock for ${item.name}`}
                            onClick={() => {
                              setRestockItem(item);
                              setRestockAmount("");
                            }}
                          >
                            <Icon fontSize="small">add</Icon>
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => deleteStockItem(item)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      </MDBox>
                    ))
                  ) : (
                    <MDTypography variant="body2" color="text">
                      No stock products found.
                    </MDTypography>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  Add Stock Item
                </MDTypography>
                <MDBox component="form" onSubmit={addStockItem}>
                  <MDBox mb={2}>
                    <MDInput
                      label="Product name"
                      value={form.name}
                      onChange={updateForm("name")}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput
                      type="date"
                      label="Date received"
                      value={form.dateReceived}
                      onChange={updateForm("dateReceived")}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={3} px={0.5}>
                    <FormControl fullWidth sx={{ minWidth: 0 }}>
                      <InputLabel shrink>Category</InputLabel>
                      <Select
                        value={form.category}
                        label="Category"
                        onChange={(event) => {
                          if (event.target.value === ADD_CATEGORY) {
                            openAddCategoryDialog("form");
                          } else {
                            updateForm("category")(event);
                          }
                        }}
                        sx={{ minHeight: 56 }}
                      >
                        {categories.map((category) => (
                          <MenuItem value={category} key={category}>
                            {category}
                          </MenuItem>
                        ))}
                        <MenuItem value={ADD_CATEGORY}>
                          <Icon fontSize="small" sx={{ mr: 1 }}>
                            add
                          </Icon>
                          Add category
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="number"
                      label="Amount available"
                      value={form.amountAvailable}
                      onChange={updateForm("amountAvailable")}
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput
                      type="number"
                      label="Clinical price"
                      value={form.clinicalPrice}
                      onChange={updateForm("clinicalPrice")}
                      inputProps={{ min: 0, step: 0.01 }}
                      fullWidth
                    />
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
                  <MDButton type="submit" variant="gradient" color="primary" fullWidth>
                    {editingItemId ? "Update Stock Item" : "Add Stock Item"}
                  </MDButton>
                  {editingItemId && (
                    <MDButton
                      type="button"
                      variant="text"
                      color="dark"
                      fullWidth
                      onClick={() => {
                        setEditingItemId(null);
                        setForm({
                          name: "",
                          dateReceived: "",
                          category: "",
                          amountAvailable: "",
                          clinicalPrice: "",
                        });
                      }}
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
      <Dialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setNewCategoryName("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add category</DialogTitle>
        <DialogContent>
          <MDInput
            label="Category name"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCategory();
              }
            }}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="dark"
            onClick={() => {
              setCategoryDialogOpen(false);
              setNewCategoryName("");
            }}
          >
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="primary" onClick={addCategory}>
            Add category
          </MDButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(restockItem)}
        onClose={() => {
          setRestockItem(null);
          setRestockAmount("");
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add stock</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="text" mb={2}>
            Current stock for {restockItem?.name}: {restockItem?.amountAvailable}
          </MDTypography>
          <MDInput
            type="number"
            label="Amount to add"
            value={restockAmount}
            onChange={(event) => setRestockAmount(event.target.value)}
            inputProps={{ min: 1 }}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="dark"
            onClick={() => {
              setRestockItem(null);
              setRestockAmount("");
            }}
          >
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="primary" onClick={addStock}>
            Add stock
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default Stock;
