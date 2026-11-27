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
import {
  createClient,
  getClient,
  getClientDisplayName,
  getClientForm,
  getClientForms,
  getClients,
  getClientTransactions,
} from "layouts/clients/clientApi";
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
    getClientDisplayName(client)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "client";
  const safeSuffix = suffix.replace(/[^a-z0-9-]/gi, "");
  const formDate = String(form.consultationDate || form.createdAt || "")
    .replace(/[^0-9-]/g, "")
    .slice(0, 10);
  return `${clientName}-consultations${safeSuffix}-${formDate || "undated"}.pdf`;
};

const formatTransactionDate = (date) =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const normalizeClientForm = (formId, form, summary) => ({
  ...form.answers,
  id: formId,
  consultationDate: form.date,
  createdAt: summary?.date ? `${summary.date}T${summary.time || "00:00:00"}` : form.date,
  treatmentGoal: form.todayTreatmentGoal || form.answers?.treatmentGoal || "",
});

function Clients() {
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [clientTransactions, setClientTransactions] = useState([]);
  const [clientForms, setClientForms] = useState([]);
  const [isLoadingClientView, setIsLoadingClientView] = useState(false);
  const [isLoadingConsultation, setIsLoadingConsultation] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState(null);
  const [modalView, setModalView] = useState("details");
  const [transactionDateFilter, setTransactionDateFilter] = useState("");

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
    if (!selectedClient) {
      return undefined;
    }

    let isMounted = true;
    setIsLoadingClientView(true);

    const loadClientView = async () => {
      try {
        if (modalView === "details") {
          const details = await getClient(selectedClient.id);
          if (isMounted) {
            setSelectedClient((current) =>
              current?.id === selectedClient.id ? { ...current, ...details } : current
            );
          }
        } else if (modalView === "transactions") {
          const transactions = await getClientTransactions(selectedClient.id);
          if (isMounted) {
            setClientTransactions(transactions);
          }
        } else if (modalView === "consultations") {
          const forms = await getClientForms(selectedClient.id);
          if (isMounted) {
            setClientForms(forms);
          }
        }
      } catch (error) {
        if (isMounted) {
          setMessage({
            color: "error",
            text: error instanceof Error ? error.message : "Could not load client information.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingClientView(false);
        }
      }
    };

    loadClientView();
    return () => {
      isMounted = false;
    };
  }, [selectedClient?.id, modalView]);

  useEffect(() => {
    if (!pdfPreview) {
      return undefined;
    }

    return () => URL.revokeObjectURL(pdfPreview.url);
  }, [pdfPreview]);

  const openClientModal = (client, view = "details") => {
    setMessage(null);
    setSelectedClient(client);
    setSelectedConsultation(null);
    setModalView(view);
    setTransactionDateFilter("");
    setClientTransactions([]);
    setClientForms([]);
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setSelectedConsultation(null);
    setTransactionDateFilter("");
  };

  const addClient = async () => {
    if (!newClient.name.trim() || !newClient.surname.trim() || !newClient.phone.trim()) {
      setMessage({ color: "error", text: "Enter the client's name, surname, and phone number." });
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

    setNewClient({ name: "", surname: "", email: "", phone: "", address: "" });
    setShowAddClient(false);
    try {
      setClients(await getClients());
      setMessage({ color: "success", text: "Client added successfully." });
    } catch (error) {
      setMessage({
        color: "warning",
        text: `Client added, but the client list could not be refreshed: ${
          error instanceof Error ? error.message : "Unknown error."
        }`,
      });
    }
  };

  const downloadConsultationPdf = async (client, form) => {
    try {
      const pdfClient = { ...client, name: getClientDisplayName(client) };
      const pdf = await createConsultationPdf(pdfClient, form);
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
      const pdfClient = { ...client, name: getClientDisplayName(client) };
      const pdf = await createConsultationPdf(pdfClient, form);
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
      if (selectedConsultations.length === 0) {
        throw new Error("This client has no consultation forms to export.");
      }

      const forms = await Promise.all(
        selectedConsultations.map(async (summary) => {
          if (summary.localForm) {
            return summary.localForm;
          }

          return normalizeClientForm(summary.id, await getClientForm(summary.id), summary);
        })
      );
      const pdfClient = { ...selectedClient, name: getClientDisplayName(selectedClient) };
      const pdf = await createConsultationFormsPdf(pdfClient, forms);
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

  const openConsultationForm = async (summary) => {
    if (summary.localForm) {
      setSelectedConsultation(summary.localForm);
      return;
    }

    setIsLoadingConsultation(true);
    setMessage(null);
    try {
      const form = await getClientForm(summary.id);
      setSelectedConsultation(normalizeClientForm(summary.id, form, summary));
    } catch (error) {
      setMessage({
        color: "error",
        text: error instanceof Error ? error.message : "Could not load the consultation form.",
      });
    } finally {
      setIsLoadingConsultation(false);
    }
  };

  const selectedConsultations = [
    ...clientForms.map((form) => ({ ...form, source: "api" })),
    ...(selectedClient?.consultationForms || []).map((form) => ({
      id: form.id,
      date: form.consultationDate || form.createdAt?.slice(0, 10) || "",
      time: form.createdAt ? new Date(form.createdAt).toLocaleTimeString() : "",
      source: "local",
      localForm: form,
    })),
  ].sort(
    (first, second) =>
      new Date(
        second.localForm?.createdAt || `${second.date}T${second.time || "00:00:00"}`
      ).getTime() -
      new Date(first.localForm?.createdAt || `${first.date}T${first.time || "00:00:00"}`).getTime()
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
            Select a client to view their details, transactions, or consultation forms.
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
              setNewClient({ name: "", surname: "", email: "", phone: "", address: "" });
              setShowAddClient(true);
            }}
          >
            Add client
          </MDButton>
        </MDBox>
        {isLoadingClients && (
          <MDTypography variant="body2" color="text" mb={2}>
            Loading clients...
          </MDTypography>
        )}
        {!isLoadingClients && clients.length === 0 && (
          <MDTypography variant="body2" color="text" mb={2}>
            No clients found.
          </MDTypography>
        )}
        <Grid container spacing={3}>
          {clients.map((client) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6">{getClientDisplayName(client)}</MDTypography>
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
        <DialogTitle>{selectedClient ? getClientDisplayName(selectedClient) : ""}</DialogTitle>
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
          {isLoadingClientView ? (
            <MDTypography variant="body2" color="text">
              Loading client information...
            </MDTypography>
          ) : modalView === "transactions" ? (
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
              {clientTransactions
                .filter(
                  (transaction) =>
                    !transactionDateFilter || transaction.date === transactionDateFilter
                )
                .map((transaction) => {
                  const saleLines = [
                    ...(transaction.treatments || []).map((treatment) => ({
                      name: treatment.name,
                      amount: Number(treatment.retailPrice) || 0,
                    })),
                    ...(transaction.products || []).map((product) => ({
                      name: `${product.name} × ${product.quantity}`,
                      amount: (Number(product.retailPrice) || 0) * (Number(product.quantity) || 0),
                    })),
                  ];
                  const total = saleLines.reduce((sum, line) => sum + line.amount, 0);

                  return (
                    <Card
                      key={`${transaction.date}-${transaction.time}`}
                      sx={{ mb: 2, boxShadow: "none" }}
                    >
                      <MDBox
                        p={2}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "0.75rem",
                        }}
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
                            R{total.toFixed(2)}
                          </MDTypography>
                        </MDBox>
                        {saleLines.map((saleLine) => (
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
                              R{saleLine.amount.toFixed(2)}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    </Card>
                  );
                })}
              {(!clientTransactions.length ||
                (transactionDateFilter &&
                  !clientTransactions.some(
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
                          Consultation on {form.date || "date not recorded"}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {form.time ? `Time: ${form.time}` : ""}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        <MDButton
                          variant="text"
                          color="primary"
                          onClick={() => openConsultationForm(form)}
                          disabled={isLoadingConsultation}
                        >
                          {isLoadingConsultation ? "Loading..." : "View form"}
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
              <MDTypography variant="caption" color="text" display="block" mb={2}>
                Client details are read-only because the current API does not provide an update
                endpoint.
              </MDTypography>
              <MDBox mb={2}>
                <MDInput label="Name" value={selectedClient?.name || ""} disabled fullWidth />
              </MDBox>
              <MDBox mb={2}>
                <MDInput label="Surname" value={selectedClient?.surname || ""} disabled fullWidth />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="email"
                  label="Email"
                  value={selectedClient?.email || ""}
                  disabled
                  fullWidth
                />
              </MDBox>
              <MDInput label="Phone" value={selectedClient?.phone || ""} disabled fullWidth />
              <MDBox mt={2}>
                <MDInput label="Address" value={selectedClient?.address || ""} disabled fullWidth />
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="dark" onClick={closeClientModal}>
            close
          </MDButton>
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
                label="Surname"
                value={newClient.surname}
                onChange={(event) =>
                  setNewClient((current) => ({ ...current, surname: event.target.value }))
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
