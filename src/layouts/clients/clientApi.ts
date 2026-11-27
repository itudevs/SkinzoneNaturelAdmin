import { api } from "layouts/authentication/apiClient";
import { getAuthToken } from "layouts/authentication/authService";
import { loadClients } from "layouts/clients/clientStore";

export interface ClientDto {
  name: string;
  surname: string;
  phone: string;
  email: string;
  address: string;
}

export interface ClientListDto {
  id: number;
  name: string;
  surname: string;
  email: string;
  contactNumber: string;
  address: string;
}

export interface ClientRecord {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  consultationForms: unknown[];
  transactions: unknown[];
}

export interface TransactionItemDto {
  id: number;
  name: string;
  retailPrice: number;
}

export interface ProductTransactionItemDto extends TransactionItemDto {
  quantity: number;
}

export interface TransactionDto {
  date: string;
  time: string;
  treatments: TransactionItemDto[];
  products: ProductTransactionItemDto[];
}

export interface ClientFormListDto {
  id: number;
  date: string;
  time: string;
}

export interface ClientFormDto {
  date: string;
  todayTreatmentGoal: string;
  answers: Record<string, unknown>;
  client: ClientDto;
}

const CLIENTS_ENDPOINT = "/clients";
const clientEndpoint = (clientId: number) =>
  `${CLIENTS_ENDPOINT}/client/${encodeURIComponent(clientId)}`;

export const getClients = async (): Promise<ClientRecord[]> => {
  const token = await getAuthToken();
  const clients = await api.get<ClientListDto[] | null>(`${CLIENTS_ENDPOINT}/clients`, token);
  if (clients == null) {
    return [];
  }

  if (!Array.isArray(clients)) {
    throw new Error("The clients response was not a list.");
  }

  const cachedClients = loadClients();
  return clients.map((client) => {
    const cachedClient = cachedClients.find((cached) => cached.id === client.id);
    return {
      id: client.id,
      name: client.name,
      surname: client.surname || "",
      email: client.email || "",
      phone: client.contactNumber || "",
      address: client.address || "",
      consultationForms: cachedClient?.consultationForms || [],
      transactions: [],
    };
  });
};

export const createClient = async (client: ClientDto): Promise<void> => {
  const token = await getAuthToken();
  await api.post<void, ClientDto>(`${CLIENTS_ENDPOINT}/add/client`, client, token);
};

export const getClient = async (clientId: number): Promise<ClientDto> => {
  const token = await getAuthToken();
  return api.get<ClientDto>(clientEndpoint(clientId), token);
};

export const getClientTransactions = async (clientId: number): Promise<TransactionDto[]> => {
  const token = await getAuthToken();
  const transactions = await api.get<TransactionDto[]>(
    `${CLIENTS_ENDPOINT}/transactions/${encodeURIComponent(clientId)}`,
    token
  );
  if (!Array.isArray(transactions)) {
    throw new Error("The client transactions response was not a list.");
  }

  return transactions;
};

export const getClientForms = async (clientId: number): Promise<ClientFormListDto[]> => {
  const token = await getAuthToken();
  const forms = await api.get<ClientFormListDto[] | null>(
    `${CLIENTS_ENDPOINT}/forms/${encodeURIComponent(clientId)}`,
    token
  );
  if (forms == null) {
    return [];
  }

  if (!Array.isArray(forms)) {
    throw new Error("The client forms response was not a list.");
  }

  return forms;
};

export const getClientForm = async (formId: number): Promise<ClientFormDto> => {
  const token = await getAuthToken();
  return api.get<ClientFormDto>(`${CLIENTS_ENDPOINT}/form/${encodeURIComponent(formId)}`, token);
};

export const getClientDisplayName = (client: Pick<ClientRecord, "name" | "surname">) =>
  `${client.name} ${client.surname || ""}`.trim();
