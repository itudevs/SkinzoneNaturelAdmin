// @ts-nocheck

import { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MDAlert from "components/MDAlert";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ClientConsultationDetails from "layouts/clients/ClientConsultationDetails";
import ClientConsultationPdfPreview from "layouts/clients/ClientConsultationPdfPreview";
import { initialClients, loadClients, saveClients } from "layouts/clients/clientStore";
import { createConsultationFormsPdf, createConsultationPdf } from "layouts/clients/consultationPdf";

const downloadFile = (fileName, blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const getConsultationPdfFileName = (client, form, suffix = "") => {
  const clientName =
    client.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "client";
  const safeSuffix = suffix.replace(/[^a-z0-9-]/gi, "");
  const formDate = String(form.consultationDate || form.createdAt || "")
    .replace(/[^0-9-]/g, "")
    .slice(0, 10);
  return `${clientName}-consultations${safeSuffix}-${formDate || "undated"}.pdf`;
};

const formatSavedAt = (value) => (value ? new Date(value).toLocaleString() : "date unknown");

const formatTransactionDate = (date) =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

function Clients() {
  const [clients, setClients] = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [message, setMessage] = useState(null);
  const [modalView, setModalView] = useState("details");
  const [editedClient, setEditedClient] = useState(null);
  const [transactionDateFilter, setTransactionDateFilter] = useState("");

  useEffect(() => {
    try {
      setClients(loadClients());
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not load client data.",
      });
    }
  }, []);

  useEffect(() => {
    if (!pdfPreview) {
      return undefined;
    }

    return () => URL.revokeObjectURL(pdfPreview.url);
  }, [pdfPreview]);

  const openClientModal = (client, view = "details") => {
    setMessage(null);
    setSelectedClient(client);
    setEditedClient({ ...client });
    setSelectedConsultation(null);
    setModalView(view);
    setTransactionDateFilter("");
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setEditedClient(null);
    setSelectedConsultation(null);
    setTransactionDateFilter("");
  };

  const saveClientDetails = () => {
    const updatedClients = clients.map((client) =>
      client.id === editedClient.id ? editedClient : client
    );
    try {
      saveClients(updatedClients);
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not save client details.",
      });
      return;
    }
    setClients(updatedClients);
    setSelectedClient(editedClient);
    setModalView("details");
  };

  const addClient = () => {
    if (!newClient.name.trim()) {
      setMessage({ color: "error", text: "Enter the new client's name." });
      return;
    }

    const client = {
      id: Date.now(),
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      phone: newClient.phone.trim(),
      address: newClient.address.trim(),
      consultationForms: [],
      transactions: [],
    };
    const updatedClients = [...clients, client];

    try {
      saveClients(updatedClients);
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not add the client.",
      });
      return;
    }

    setClients(updatedClients);
    setNewClient({ name: "", email: "", phone: "", address: "" });
    setShowAddClient(false);
    setSelectedClient(client);
    setEditedClient(client);
    setModalView("details");
    setMessage({ color: "success", text: "Client added successfully." });
  };

  const downloadConsultationPdf = async (client, form) => {
    try {
      const pdf = await createConsultationPdf(client, form);
      downloadFile(
        getConsultationPdfFileName(client, form, `-${form.id}`),
        new Blob([pdf], { type: "application/pdf" })
      );
    } catch (error) {
      setPdfPreview(null);
      setSelectedConsultation(null);
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not download the consultation PDF.",
      });
    }
  };

  const openConsultationPdfPreview = async (client, form) => {
    try {
      const pdf = await createConsultationPdf(client, form);
      const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
      setPdfPreview({
        url,
        fileName: getConsultationPdfFileName(client, form),
        client,
        form,
      });
    } catch (error) {
      setSelectedConsultation(null);
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not preview the consultation PDF.",
      });
    }
  };

  const exportAllConsultations = async () => {
    try {
      const forms = selectedClient?.consultationForms || [];
      if (forms.length === 0) {
        throw new Error("This client has no consultation forms to export.");
      }

      const pdf = await createConsultationFormsPdf(selectedClient, forms);
      const fileDate = new Date().toISOString().slice(0, 10);
      downloadFile(
        getConsultationPdfFileName(selectedClient, { consultationDate: fileDate }),
        new Blob([pdf], { type: "application/pdf" })
      );
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not export consultation forms.",
      });
    }
  };

  const selectedConsultations = [...(selectedClient?.consultationForms || [])].sort(
    (first, second) =>
      new Date(second.createdAt || second.consultationDate).getTime() -
      new Date(first.createdAt || first.consultationDate).getTime()
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Clients
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Select a client to update their details or view their transactions.
          </MDTypography>
        </MDBox>
        {message && !showAddClient && !selectedClient && (
          <MDBox mb={3}>
            <MDAlert color={message.color} dismissible onClose={() => setMessage(null)}>
              {message.text}
            </MDAlert>
          </MDBox>
        )}
        <MDBox mb={3}>
          <MDButton
            variant="gradient"
            color="primary"
            onClick={() => {
              setNewClient({ name: "", email: "", phone: "", address: "" });
              setShowAddClient(true);
            }}
          >
            Add client
          </MDButton>
        </MDBox>
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6">{client.name}</MDTypography>
                  </MDBox>
                  <MDTypography variant="body2" color="text">
                    {client.email}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={3}>
                    {client.phone}
                  </MDTypography>
                  {client.address && (
                    <MDTypography variant="body2" color="text" mb={2}>
                      {client.address}
                    </MDTypography>
                  )}
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <MDButton
                      variant="gradient"
                      color="primary"
                      fullWidth
                      onClick={() => openClientModal(client)}
                    >
                      View
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => openClientModal(client, "consultations")}
                    >
                      View consultation forms
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={Boolean(selectedClient)} onClose={closeClientModal} fullWidth maxWidth="md">
        <DialogTitle>{selectedClient?.name}</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          {message && selectedClient && (
            <MDBox mb={2}>
              <MDAlert color={message.color} dismissible onClose={() => setMessage(null)}>
                {message.text}
              </MDAlert>
            </MDBox>
          )}
          <Tabs
            value={modalView}
            onChange={(event, nextView) => setModalView(nextView)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab label="Details" value="details" />
            <Tab label="Transactions" value="transactions" />
            <Tab label="Consultation forms" value="consultations" />
          </Tabs>
          {modalView === "transactions" ? (
            <MDBox>
              <MDBox mb={2} mt={1} px={1}>
                <MDInput
                  type="date"
                  label="Filter by transaction date"
                  value={transactionDateFilter}
                  onChange={(event) => setTransactionDateFilter(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </MDBox>
              {selectedClient?.transactions
                .filter(
                  (transaction) =>
                    !transactionDateFilter || transaction.date === transactionDateFilter
                )
                .map((transaction) => (
                  <Card
                    key={`${transaction.date}-${transaction.time}`}
                    sx={{ mb: 2, boxShadow: "none" }}
                  >
                    <MDBox
                      p={2}
                      sx={{ border: "1px solid", borderColor: "divider", borderRadius: "0.75rem" }}
                    >
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium" display="block">
                            {formatTransactionDate(transaction.date)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Time: {transaction.time}
                          </MDTypography>
                        </MDBox>
                        <MDTypography variant="h6" fontWeight="medium">
                          {transaction.total}
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="caption" color="text" display="block">
                        Payment method: {transaction.paymentMethod}
                      </MDTypography>
                      <MDTypography variant="caption" color="text" display="block" mb={1}>
                        Visit type: {transaction.visitType}
                      </MDTypography>
                      {transaction.saleLines.map((saleLine) => (
                        <MDBox
                          key={saleLine.name}
                          display="flex"
                          justifyContent="space-between"
                          py={0.5}
                        >
                          <MDTypography variant="caption" color="text">
                            {saleLine.name}
                          </MDTypography>
                          <MDTypography variant="caption" fontWeight="medium">
                            {saleLine.amount}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </MDBox>
                  </Card>
                ))}
              {(!selectedClient?.transactions.length ||
                (transactionDateFilter &&
                  !selectedClient.transactions.some(
                    (transaction) => transaction.date === transactionDateFilter
                  ))) && (
                <MDTypography variant="body2" color="text">
                  No transactions found for the selected date.
                </MDTypography>
              )}
            </MDBox>
          ) : modalView === "consultations" ? (
            <MDBox>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
                mb={2}
              >
                <MDTypography variant="body2" color="text">
                  {selectedConsultations.length} saved form
                  {selectedConsultations.length === 1 ? "" : "s"}
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="primary"
                  disabled={!selectedConsultations.length}
                  onClick={exportAllConsultations}
                >
                  Export all forms
                </MDButton>
              </MDBox>
              {selectedConsultations.length ? (
                selectedConsultations.map((form) => (
                  <Card key={form.id} sx={{ mb: 2, boxShadow: "none" }}>
                    <MDBox
                      p={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={2}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "0.75rem",
                      }}
                    >
                      <MDBox>
                        <MDTypography variant="button" display="block">
                          Consultation on {form.consultationDate || "date not recorded"}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Saved {formatSavedAt(form.createdAt)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        <MDButton
                          variant="text"
                          color="primary"
                          onClick={() => setSelectedConsultation(form)}
                        >
                          View form
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </Card>
                ))
              ) : (
                <MDTypography variant="body2" color="text">
                  No consultation forms have been saved for this client yet. Create one from Sales.
                </MDTypography>
              )}
            </MDBox>
          ) : (
            <MDBox pt={1}>
              <MDBox mb={2}>
                <MDInput
                  label="Name"
                  value={editedClient?.name || ""}
                  onChange={(event) =>
                    setEditedClient({ ...editedClient, name: event.target.value })
                  }
                  fullWidth
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="email"
                  label="Email"
                  value={editedClient?.email || ""}
                  onChange={(event) =>
                    setEditedClient({ ...editedClient, email: event.target.value })
                  }
                  fullWidth
                />
              </MDBox>
              <MDInput
                label="Phone"
                value={editedClient?.phone || ""}
                onChange={(event) =>
                  setEditedClient({ ...editedClient, phone: event.target.value })
                }
                fullWidth
              />
              <MDBox mt={2}>
                <MDInput
                  label="Address"
                  value={editedClient?.address || ""}
                  onChange={(event) =>
                    setEditedClient({ ...editedClient, address: event.target.value })
                  }
                  fullWidth
                />
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="dark" onClick={closeClientModal}>
            close
          </MDButton>
          {modalView === "details" && (
            <MDButton variant="gradient" color="primary" onClick={saveClientDetails}>
              save details
            </MDButton>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={showAddClient} onClose={() => setShowAddClient(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add client</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          {message && showAddClient && (
            <MDBox mb={2}>
              <MDAlert color={message.color} dismissible onClose={() => setMessage(null)}>
                {message.text}
              </MDAlert>
            </MDBox>
          )}
          <MDBox pt={1}>
            <MDBox mb={2}>
              <MDInput
                label="Name"
                value={newClient.name}
                onChange={(event) =>
                  setNewClient((current) => ({ ...current, name: event.target.value }))
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
            <MDBox mb={2}>
              <MDInput
                label="Phone"
                value={newClient.phone}
                onChange={(event) =>
                  setNewClient((current) => ({ ...current, phone: event.target.value }))
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
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="dark" onClick={() => setShowAddClient(false)}>
            Cancel
          </MDButton>
          <MDButton variant="gradient" color="primary" onClick={addClient}>
            Save client
          </MDButton>
        </DialogActions>
      </Dialog>
      {selectedConsultation && (
        <ClientConsultationDetails
          form={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          onPreviewPdf={() => openConsultationPdfPreview(selectedClient, selectedConsultation)}
          onDownloadPdf={() => downloadConsultationPdf(selectedClient, selectedConsultation)}
        />
      )}
      {pdfPreview && (
        <ClientConsultationPdfPreview
          pdfUrl={pdfPreview.url}
          fileName={pdfPreview.fileName}
          onClose={() => setPdfPreview(null)}
          onDownload={() => downloadConsultationPdf(pdfPreview.client, pdfPreview.form)}
        />
      )}
    </DashboardLayout>
  );
}

export default Clients;
