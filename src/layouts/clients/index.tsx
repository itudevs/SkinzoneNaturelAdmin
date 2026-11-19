// @ts-nocheck

import { useState } from "react";

import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const initialClients = [
  {
    id: 1,
    name: "John Michael",
    email: "john@example.com",
    phone: "071 123 4567",
    transactions: [
      {
        date: "2026-11-18",
        time: "09:30",
        paymentMethod: "Card",
        visitType: "Consultation",
        total: "R450.00",
        saleLines: [{ name: "Skin consultation", amount: "R450.00" }],
      },
      {
        date: "2026-11-02",
        time: "14:15",
        paymentMethod: "Cash",
        visitType: "Treatment",
        total: "R850.00",
        saleLines: [{ name: "Naturel skincare set", amount: "R850.00" }],
      },
    ],
  },
  {
    id: 2,
    name: "Alexa Liras",
    email: "alexa@example.com",
    phone: "072 987 6543",
    transactions: [
      {
        date: "2026-11-12",
        time: "11:00",
        paymentMethod: "Card",
        visitType: "Treatment",
        total: "R600.00",
        saleLines: [{ name: "Facial treatment", amount: "R600.00" }],
      },
    ],
  },
  {
    id: 3,
    name: "Laurent Perrier",
    email: "laurent@example.com",
    phone: "083 555 0198",
    transactions: [],
  },
];

const formatTransactionDate = (date) =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

function Clients() {
  const [clients, setClients] = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalView, setModalView] = useState("details");
  const [editedClient, setEditedClient] = useState(null);
  const [transactionDateFilter, setTransactionDateFilter] = useState("");

  const openClientModal = (client) => {
    setSelectedClient(client);
    setEditedClient({ ...client });
    setModalView("details");
    setTransactionDateFilter("");
  };

  const closeClientModal = () => {
    setSelectedClient(null);
    setEditedClient(null);
    setTransactionDateFilter("");
  };

  const saveClientDetails = () => {
    setClients((currentClients) =>
      currentClients.map((client) => (client.id === editedClient.id ? editedClient : client))
    );
    setSelectedClient(editedClient);
    setModalView("details");
  };

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
                  <MDButton
                    variant="gradient"
                    color="primary"
                    fullWidth
                    onClick={() => openClientModal(client)}
                  >
                    View
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={Boolean(selectedClient)} onClose={closeClientModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {modalView === "transactions"
            ? `${selectedClient?.name}'s transactions`
            : `${selectedClient?.name} details`}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
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
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="dark" onClick={closeClientModal}>
            close
          </MDButton>
          {modalView === "transactions" ? (
            <MDButton variant="gradient" color="primary" onClick={() => setModalView("details")}>
              update details
            </MDButton>
          ) : (
            <>
              <MDButton variant="text" color="primary" onClick={() => setModalView("transactions")}>
                view client transactions
              </MDButton>
              <MDButton variant="gradient" color="primary" onClick={saveClientDetails}>
                save details
              </MDButton>
            </>
          )}
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Clients;
