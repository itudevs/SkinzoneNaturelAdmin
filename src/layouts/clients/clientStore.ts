const CLIENTS_STORAGE_KEY = "skinzone-clients";

export const initialClients = [
  {
    id: 1,
    name: "John Michael",
    email: "john@example.com",
    phone: "071 123 4567",
    address: "",
    consultationForms: [],
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
    address: "",
    consultationForms: [],
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
    address: "",
    consultationForms: [],
    transactions: [],
  },
];

export const loadClients = () => {
  const storedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
  if (!storedClients) {
    return initialClients;
  }

  const clients = JSON.parse(storedClients);
  if (
    !Array.isArray(clients) ||
    !clients.every((client) => client && typeof client === "object" && client.id && client.name)
  ) {
    throw new Error("Saved client data is not in the expected format.");
  }

  return clients.map((client) => {
    const { consultation, ...clientData } = client;
    let consultationForms = client.consultationForms;
    if (!Array.isArray(consultationForms)) {
      consultationForms = consultation
        ? [
            {
              ...consultation,
              id: consultation.id || `legacy-${client.id}`,
              createdAt:
                consultation.createdAt ||
                consultation.updatedAt ||
                consultation.consultationDate ||
                "",
            },
          ]
        : [];
    }

    return {
      ...clientData,
      email: client.email || "",
      phone: client.phone || client.contactNumber || "",
      address: client.address || "",
      consultationForms,
      transactions: Array.isArray(client.transactions) ? client.transactions : [],
    };
  });
};

export const saveClients = (clients) => {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
};

export const saveClientConsultation = (clients, clientId, consultation) => {
  if (!clients.some((client) => client.id === clientId)) {
    throw new Error("The selected client could not be found.");
  }

  const savedForm = {
    ...consultation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const updatedClients = clients.map((client) =>
    client.id === clientId
      ? { ...client, consultationForms: [...(client.consultationForms || []), savedForm] }
      : client
  );
  saveClients(updatedClients);
  return updatedClients;
};
