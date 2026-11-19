// @ts-nocheck

import { useState } from "react";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
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
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

const categories = [
  "Salaries and Wages",
  "Rent and Utilities",
  "Stock and Inventory",
  "Transportation",
  "Marketing and Advertising",
  "Equipment and Maintenance",
  "Software and Subscriptions",
  "Operational Expenses",
  "Other Expenses",
];

const initialExpenses = [
  {
    expenseId: 1,
    name: "Stock delivery",
    quantity: 1,
    price: 1800,
    category: "Stock and Inventory",
    paymentMethod: "EFT",
    referenceNumber: "EXP-0001",
    notes: "",
    date: "2026-11-01",
    dateRecorded: "2026-11-01",
  },
  {
    expenseId: 2,
    name: "Electricity",
    quantity: 1,
    price: 950,
    category: "Rent and Utilities",
    paymentMethod: "Card",
    referenceNumber: "EXP-0002",
    notes: "",
    date: "2026-11-05",
    dateRecorded: "2026-11-05",
  },
];

function Expenditures() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    price: "",
    category: "",
    date: "",
    paymentMethod: "",
    referenceNumber: "",
    notes: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState("This Month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState(null);

  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const addExpense = (event) => {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const price = Number(form.price);

    if (
      !form.name.trim() ||
      !form.category ||
      !form.date ||
      !form.price ||
      !form.paymentMethod ||
      !form.referenceNumber.trim()
    ) {
      setMessage({ color: "error", text: "Complete all expenditure details." });
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
      setMessage({ color: "error", text: "Enter a valid quantity and price." });
      return;
    }

    setExpenses((current) => [
      ...current,
      {
        expenseId: Date.now(),
        name: form.name.trim(),
        quantity,
        price,
        category: form.category,
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber.trim(),
        notes: form.notes.trim(),
        date: form.date,
        dateRecorded: new Date().toISOString().slice(0, 10),
      },
    ]);
    setForm({
      name: "",
      quantity: 1,
      price: "",
      category: "",
      date: "",
      paymentMethod: "",
      referenceNumber: "",
      notes: "",
    });
    setMessage({ color: "success", text: "Expenditure recorded successfully." });
  };

  const removeExpense = (expense) => {
    setExpenses((current) => current.filter((item) => item.expenseId !== expense.expenseId));
    setMessage({ color: "success", text: "Expenditure removed successfully." });
  };

  const getFilteredExpenses = () =>
    expenses.filter((expense) => {
      const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;
      const matchesStart = !startDate || expense.date >= startDate;
      const matchesEnd = !endDate || expense.date <= endDate;
      return matchesCategory && matchesStart && matchesEnd;
    });

  const generateReport = () => {
    if (startDate && endDate && startDate > endDate) {
      setMessage({ color: "error", text: "The start date must be before the end date." });
      return;
    }

    setReport(getFilteredExpenses());
    setMessage({ color: "success", text: "Expenditure report generated successfully." });
  };

  const calculateTotal = () =>
    getFilteredExpenses().reduce((total, expense) => total + expense.quantity * expense.price, 0);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Expenditures
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Record expenses, remove expenses, and generate expenditure reports.
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
                  Expenditure List
                </MDTypography>
                <MDBox mb={2} px={0.5}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Filter by category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Filter by category"
                      onChange={(event) => setCategoryFilter(event.target.value)}
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
                {expenses.map((expense) => (
                  <MDBox
                    key={expense.expenseId}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1.5}
                    sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <MDBox>
                      <MDTypography variant="button" display="block" fontWeight="medium">
                        {expense.name}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {expense.category} | {expense.date} | Quantity: {expense.quantity}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="button" mr={1}>
                        R{(expense.quantity * expense.price).toFixed(2)}
                      </MDTypography>
                      <IconButton
                        color="error"
                        size="small"
                        aria-label={`Remove ${expense.name}`}
                        onClick={() => removeExpense(expense)}
                      >
                        <Icon fontSize="small">delete</Icon>
                      </IconButton>
                    </MDBox>
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  Enter Expenditure Details
                </MDTypography>
                <MDBox component="form" onSubmit={addExpense}>
                  <MDBox mb={2}>
                    <MDInput
                      label="Name"
                      value={form.name}
                      onChange={updateForm("name")}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="number"
                      label="Quantity"
                      value={form.quantity}
                      onChange={updateForm("quantity")}
                      inputProps={{ min: 1 }}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="number"
                      label="Price"
                      value={form.price}
                      onChange={updateForm("price")}
                      inputProps={{ min: 0, step: 0.01 }}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <MDInput
                      type="date"
                      label="Date"
                      value={form.date}
                      onChange={updateForm("date")}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </MDBox>
                  <MDBox mb={3} px={0.5}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Category</InputLabel>
                      <Select
                        value={form.category}
                        label="Category"
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
                  <MDButton type="submit" variant="gradient" color="primary" fullWidth>
                    Record Expenditure
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>

            <Card sx={{ mt: 3 }}>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  Expenditure Report
                </MDTypography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      type="date"
                      label="Start date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      type="date"
                      label="End date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <MDButton variant="gradient" color="primary" fullWidth onClick={generateReport}>
                  Generate Expenditure Report
                </MDButton>
                <MDButton
                  variant="text"
                  color="dark"
                  fullWidth
                  onClick={() =>
                    setMessage({ color: "success", text: `Total: R${calculateTotal().toFixed(2)}` })
                  }
                >
                  Calculate Expenditure Total
                </MDButton>
                {report && (
                  <MDBox mt={2}>
                    <MDTypography variant="button" display="block" mb={1}>
                      Report total: R
                      {report
                        .reduce((total, expense) => total + expense.quantity * expense.price, 0)
                        .toFixed(2)}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      {report.length} expenditure(s) found.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Expenditures;
