// @ts-nocheck

import { useEffect, useState } from "react";

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
import { api } from "layouts/authentication/apiClient";
import { getAuthToken } from "layouts/authentication/authService";
import { createClient, getClientDisplayName, getClients } from "layouts/clients/clientApi";
import ClientConsultationForm from "layouts/clients/ClientConsultationForm";
import { saveClientConsultation } from "layouts/clients/clientStore";

const SALES_STORAGE_KEY = "skinzone-sales";
const TREATMENT_LIST_ENDPOINT = "/treatment/treatments";

const products = [
  { id: "PROD-001", name: "GENOP Cleanser", price: 280 },
  { id: "PROD-002", name: "Lamelle Moisturiser", price: 650 },
  { id: "PROD-003", name: "Fargon Sunscreen", price: 450 },
  { id: "PROD-004", name: "Evolution Serum", price: 520 },
];

function Sales() {
  const [treatments, setTreatments] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [consultationClient, setConsultationClient] = useState(null);
  const [sales, setSales] = useState([]);
  const [isSalesLoaded, setIsSalesLoaded] = useState(false);
  const [saleForm, setSaleForm] = useState({
    clientId: "",
    paymentMethod: "",
    visitType: "",
    treatmentIds: [],
    productIds: [],
    quantity: 1,
  });
  const [newClient, setNewClient] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    address: "",
  });
  const [showAddClient, setShowAddClient] = useState(false);
  const [message, setMessage] = useState(null);
  const [report, setReport] = useState(null);
  const [reportRange, setReportRange] = useState("30-days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadClientList = async () => {
      try {
        const clientList = await getClients();
        if (isMounted) {
          setClients(clientList);
        }
      } catch (error) {
        if (isMounted) {
          setMessage({
            color: "error",
            text: error instanceof Error ? error.message : "Could not load clients.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingClients(false);
        }
      }
    };

    loadClientList();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
        const savedSales = storedSales ? JSON.parse(storedSales) : [];

        if (!Array.isArray(savedSales)) {
          throw new Error("Saved sales data is not in the expected format.");
        }

        if (isMounted) {
          setSales(savedSales);
          setIsSalesLoaded(true);
        }

        const token = await getAuthToken();
        const treatmentList = await api.get(TREATMENT_LIST_ENDPOINT, token);

        if (!Array.isArray(treatmentList)) {
          throw new Error("The treatment list response was not a list.");
        }

        if (isMounted) {
          setTreatments(
            treatmentList.map((treatment) => ({
              id: treatment.id,
              name: treatment.name,
              price: treatment.retailPrice,
            }))
          );
        }
      } catch (error) {
        if (isMounted) {
          setMessage({
            color: "error",
            text: error instanceof Error ? error.message : "Could not load sales data.",
          });
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSalesLoaded) {
      return;
    }

    try {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not save sales data.",
      });
    }
  }, [isSalesLoaded, sales]);

  const selectedTreatments = treatments.filter((item) => saleForm.treatmentIds.includes(item.id));
  const selectedProducts = products.filter((item) => saleForm.productIds.includes(item.id));
  const selectedItems = [...selectedTreatments, ...selectedProducts];
  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * Number(saleForm.quantity || 0),
    0
  );

  const updateSaleForm = (field) => (event) =>
    setSaleForm((current) => ({ ...current, [field]: event.target.value }));

  const selectedClient = clients.find((client) => client.id === Number(saleForm.clientId));

  const saveConsultation = (answers) => {
    try {
      const updatedClients = saveClientConsultation(clients, consultationClient.id, answers);
      const updatedClient = updatedClients.find((client) => client.id === consultationClient.id);
      setClients(updatedClients);
      setConsultationClient(updatedClient);
      setMessage({ color: "success", text: "Consultation form saved successfully." });
      return true;
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not save the consultation form.",
      });
      return false;
    }
  };

  const addClient = async () => {
    if (!newClient.name.trim() || !newClient.surname.trim() || !newClient.phone.trim()) {
      setMessage({
        color: "error",
        text: "Enter the new client's name, surname, and phone number.",
      });
      return;
    }

    const clientDto = {
      name: newClient.name.trim(),
      surname: newClient.surname.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim(),
      address: newClient.address.trim(),
    };

    try {
      await createClient(clientDto);
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not add the client.",
      });
      return;
    }

    setNewClient({ name: "", surname: "", phone: "", email: "", address: "" });
    setShowAddClient(false);
    try {
      const refreshedClients = await getClients();
      setClients(refreshedClients);
      const createdClient = refreshedClients.find(
        (client) =>
          client.name.toLowerCase() === clientDto.name.toLowerCase() &&
          client.surname.toLowerCase() === clientDto.surname.toLowerCase() &&
          client.phone === clientDto.phone
      );
      if (createdClient) {
        setSaleForm((current) => ({ ...current, clientId: createdClient.id }));
      }
      setMessage({
        color: createdClient ? "success" : "warning",
        text: createdClient
          ? "Client added and selected."
          : "Client added, but could not find it in the refreshed list.",
      });
    } catch (error) {
      setMessage({
        color: "warning",
        text: `Client added, but the client list could not be refreshed: ${
          error instanceof Error ? error.message : "Unknown error."
        }`,
      });
    }
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
                        {isLoadingClients && <MenuItem disabled>Loading clients...</MenuItem>}
                        {!isLoadingClients && clients.length === 0 && (
                          <MenuItem disabled>No clients found</MenuItem>
                        )}
                        {clients.map((client) => (
                          <MenuItem value={client.id} key={client.id}>
                            {getClientDisplayName(client)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                  {selectedClient && (
                    <MDBox mb={1}>
                      <MDButton
                        type="button"
                        variant="text"
                        color="primary"
                        onClick={() => {
                          setMessage(null);
                          setConsultationClient(selectedClient);
                        }}
                      >
                        New consultation form
                      </MDButton>
                    </MDBox>
                  )}
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
                      <MDBox mb={2}>
                        <MDInput
                          label="Client surname"
                          value={newClient.surname}
                          onChange={(event) =>
                            setNewClient((current) => ({ ...current, surname: event.target.value }))
                          }
                          fullWidth
                        />
                      </MDBox>
                      <MDBox mb={2}>
                        <MDInput
                          label="Phone number"
                          value={newClient.phone}
                          onChange={(event) =>
                            setNewClient((current) => ({ ...current, phone: event.target.value }))
                          }
                          fullWidth
                        />
                      </MDBox>
                      <MDBox mb={2}>
                        <MDInput
                          type="email"
                          label="Email"
                          value={newClient.email}
                          onChange={(event) =>
                            setNewClient((current) => ({ ...current, email: event.target.value }))
                          }
                          fullWidth
                        />
                      </MDBox>
                      <MDInput
                        label="Address"
                        value={newClient.address}
                        onChange={(event) =>
                          setNewClient((current) => ({ ...current, address: event.target.value }))
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
                              {item.name} — R{Number(item.price).toFixed(2)}
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
      {consultationClient && (
        <ClientConsultationForm
          client={consultationClient}
          onClose={() => setConsultationClient(null)}
          onSave={saveConsultation}
        />
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default Sales;
