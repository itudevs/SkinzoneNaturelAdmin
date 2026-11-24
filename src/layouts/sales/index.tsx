// @ts-nocheck

import { useState } from "react";

import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
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

const treatments = [
  { id: "TREAT-001", name: "Deep Cleansing Facial", price: 650 },
  { id: "TREAT-002", name: "Body Sculpting", price: 850 },
  { id: "TREAT-003", name: "Skin Renewal Peel", price: 750 },
];

const products = [
  { id: "PROD-001", name: "GENOP Cleanser", price: 280 },
  { id: "PROD-002", name: "Lamelle Moisturiser", price: 650 },
  { id: "PROD-003", name: "Fargon Sunscreen", price: 450 },
  { id: "PROD-004", name: "Evolution Serum", price: 520 },
];

const initialClients = [
  { id: 1, name: "John Michael", contactNumber: "071 123 4567" },
  { id: 2, name: "Alexa Liras", contactNumber: "072 987 6543" },
];

function Sales() {
  const [clients, setClients] = useState(initialClients);
  const [sales, setSales] = useState([]);
  const [saleForm, setSaleForm] = useState({
    clientId: "",
    paymentMethod: "",
    visitType: "",
    treatmentIds: [],
    productIds: [],
    quantity: 1,
  });
  const [newClient, setNewClient] = useState({ name: "", contactNumber: "" });
  const [showAddClient, setShowAddClient] = useState(false);
  const [message, setMessage] = useState(null);
  const [report, setReport] = useState(null);
  const [reportRange, setReportRange] = useState("30-days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const selectedTreatments = treatments.filter((item) => saleForm.treatmentIds.includes(item.id));
  const selectedProducts = products.filter((item) => saleForm.productIds.includes(item.id));
  const selectedItems = [...selectedTreatments, ...selectedProducts];
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * Number(saleForm.quantity || 0),
    0
  );

  const updateSaleForm = (field) => (event) =>
    setSaleForm((current) => ({ ...current, [field]: event.target.value }));

  const addClient = () => {
    if (!newClient.name.trim() || !newClient.contactNumber.trim()) {
      setMessage({ color: "error", text: "Enter the new client's name and contact number." });
      return;
    }

    const client = {
      id: Date.now(),
      name: newClient.name.trim(),
      contactNumber: newClient.contactNumber.trim(),
    };
    setClients((current) => [...current, client]);
    setSaleForm((current) => ({ ...current, clientId: client.id }));
    setNewClient({ name: "", contactNumber: "" });
    setShowAddClient(false);
    setMessage({ color: "success", text: "Client added successfully." });
  };

  const saveSale = (event) => {
    event.preventDefault();

    if (
      !saleForm.clientId ||
      !saleForm.paymentMethod ||
      !saleForm.visitType ||
      !selectedItems.length ||
      Number(saleForm.quantity) <= 0
    ) {
      setMessage({ color: "error", text: "Complete all sale details before saving." });
      return;
    }

    const client = clients.find((item) => item.id === Number(saleForm.clientId));
    if (!client) {
      setMessage({ color: "error", text: "The selected client could not be found." });
      return;
    }

    const transactionDate = new Date().toISOString();
    setSales((current) => [
      ...current,
      {
        saleId: Date.now(),
        clientId: client.id,
        clientName: client.name,
        paymentMethod: saleForm.paymentMethod,
        visitType: saleForm.visitType,
        items: selectedItems.map((item) => ({
          itemId: item.id,
          name: item.name,
          type: treatments.includes(item) ? "Treatment" : "Product",
          amount: item.price * Number(saleForm.quantity),
        })),
        itemName: selectedItems.map((item) => item.name).join(", "),
        quantity: Number(saleForm.quantity),
        total,
        transactionDate,
      },
    ]);
    setSaleForm({
      clientId: "",
      paymentMethod: "",
      visitType: "",
      treatmentIds: [],
      productIds: [],
      quantity: 1,
    });
    setMessage({ color: "success", text: "Sale saved successfully." });
  };

  const generateReport = () => {
    let reportSales;
    let reportDescription;

    if (reportRange === "30-days") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      reportSales = sales.filter((sale) => new Date(sale.transactionDate) >= cutoff);
      reportDescription = "previous 30 days";
    } else {
      if (!startDate || !endDate) {
        setMessage({ color: "error", text: "Select both a start date and an end date." });
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        setMessage({ color: "error", text: "The start date must be before the end date." });
        return;
      }

      reportSales = sales.filter((sale) => {
        const date = new Date(sale.transactionDate);
        const saleDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
        return saleDate >= startDate && saleDate <= endDate;
      });
      reportDescription = `${startDate} to ${endDate}`;
    }

    setReport(reportSales);
    setMessage({
      color: "success",
      text: `Report generated for ${reportDescription}: ${reportSales.length} sale(s).`,
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Manage Sales
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Record a sale, select a treatment or product, and generate a 30-day report.
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
                  Enter Sale Details
                </MDTypography>
                <MDBox component="form" onSubmit={saveSale}>
                  <MDBox mb={2}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Client</InputLabel>
                      <Select
                        value={saleForm.clientId}
                        label="Client"
                        onChange={updateSaleForm("clientId")}
                        sx={{ minHeight: 56 }}
                      >
                        {clients.map((client) => (
                          <MenuItem value={client.id} key={client.id}>
                            {client.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDButton
                    type="button"
                    variant="text"
                    color="primary"
                    onClick={() => setShowAddClient((current) => !current)}
                  >
                    {showAddClient ? "Cancel add client" : "Add client"}
                  </MDButton>
                  {showAddClient && (
                    <MDBox mt={1} mb={2}>
                      <MDBox mb={2}>
                        <MDInput
                          label="Client name"
                          value={newClient.name}
                          onChange={(event) =>
                            setNewClient((current) => ({ ...current, name: event.target.value }))
                          }
                          fullWidth
                        />
                      </MDBox>
                      <MDInput
                        label="Contact number"
                        value={newClient.contactNumber}
                        onChange={(event) =>
                          setNewClient((current) => ({
                            ...current,
                            contactNumber: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                      <MDBox mt={2}>
                        <MDButton
                          type="button"
                          variant="gradient"
                          color="primary"
                          onClick={addClient}
                        >
                          Save client
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  )}
                  <MDBox mb={2}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Visit type</InputLabel>
                      <Select
                        value={saleForm.visitType}
                        label="Visit type"
                        onChange={updateSaleForm("visitType")}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="Booking">Booking</MenuItem>
                        <MenuItem value="Consultation">Consultation</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Payment method</InputLabel>
                      <Select
                        value={saleForm.paymentMethod}
                        label="Payment method"
                        onChange={updateSaleForm("paymentMethod")}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="EFT">EFT</MenuItem>
                        <MenuItem value="Card">Card</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Select treatments</InputLabel>
                      <Select
                        multiple
                        value={saleForm.treatmentIds}
                        label="Select treatments"
                        onChange={(event) =>
                          setSaleForm((current) => ({
                            ...current,
                            treatmentIds: event.target.value,
                          }))
                        }
                        renderValue={(selected) =>
                          treatments
                            .filter((item) => selected.includes(item.id))
                            .map((item) => item.name)
                            .join(", ")
                        }
                        sx={{ minHeight: 56 }}
                      >
                        <ListSubheader>
                          <MDInput
                            label="Search treatments"
                            value={treatmentSearch}
                            onChange={(event) => setTreatmentSearch(event.target.value)}
                            onKeyDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            fullWidth
                          />
                        </ListSubheader>
                        {treatments
                          .filter((item) =>
                            item.name.toLowerCase().includes(treatmentSearch.toLowerCase())
                          )
                          .map((item) => (
                            <MenuItem value={item.id} key={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mb={2}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Select products</InputLabel>
                      <Select
                        multiple
                        value={saleForm.productIds}
                        label="Select products"
                        onChange={(event) =>
                          setSaleForm((current) => ({
                            ...current,
                            productIds: event.target.value,
                          }))
                        }
                        renderValue={(selected) =>
                          products
                            .filter((item) => selected.includes(item.id))
                            .map((item) => item.name)
                            .join(", ")
                        }
                        sx={{ minHeight: 56 }}
                      >
                        <ListSubheader>
                          <MDInput
                            label="Search products"
                            value={productSearch}
                            onChange={(event) => setProductSearch(event.target.value)}
                            onKeyDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            fullWidth
                          />
                        </ListSubheader>
                        {products
                          .filter((item) =>
                            item.name.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          .map((item) => (
                            <MenuItem value={item.id} key={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox mt={2} mb={3}>
                    <MDInput
                      type="number"
                      label="Quantity"
                      value={saleForm.quantity}
                      onChange={updateSaleForm("quantity")}
                      inputProps={{ min: 1 }}
                      fullWidth
                    />
                  </MDBox>
                  <MDTypography variant="button" display="block" mb={2}>
                    Total: R{total.toFixed(2)}
                  </MDTypography>
                  <MDButton type="submit" variant="gradient" color="primary" fullWidth>
                    Save Sale
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" mb={2}>
                  Sales Report
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={3}>
                  Generate a report for the previous 30 days or choose a custom date range.
                </MDTypography>
                <MDBox mb={2}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Report period</InputLabel>
                    <Select
                      value={reportRange}
                      label="Report period"
                      onChange={(event) => {
                        setReportRange(event.target.value);
                        setReport(null);
                      }}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="30-days">Previous 30 days</MenuItem>
                      <MenuItem value="custom">Custom date range</MenuItem>
                    </Select>
                  </FormControl>
                </MDBox>
                {reportRange === "custom" && (
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
                )}
                <MDButton variant="gradient" color="primary" fullWidth onClick={generateReport}>
                  Generate Report
                </MDButton>
                {report && (
                  <MDBox mt={3}>
                    {report.length ? (
                      report.map((sale) => (
                        <MDBox
                          key={sale.saleId}
                          py={1.5}
                          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                        >
                          <MDTypography variant="button" display="block">
                            {sale.clientName} - {sale.itemName}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {new Date(sale.transactionDate).toLocaleString()} | R
                            {sale.total.toFixed(2)}
                          </MDTypography>
                        </MDBox>
                      ))
                    ) : (
                      <MDTypography variant="body2" color="text">
                        No sales recorded in the previous 30 days.
                      </MDTypography>
                    )}
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

export default Sales;
