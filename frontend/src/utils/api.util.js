import axios from "axios";
import { BASE_URL } from "../constants/urls";

const getToken = () => localStorage.getItem("token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

export const getAuthHeaders = (headers = {}) => {
  const token = getToken();

  return {
    ...headers,
    ...(token ? { Authorization: token } : {}),
  };
};

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", token);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof data === "object" && data?.message
        ? data.message
        : `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

const STATUS_BY_ID = {
  1: "pending",
  2: "rejected",
  3: "accepted",
  4: "on_hold",
  5: "completed",
};

export const normalizeAppointmentStatus = (status) => {
  if (!status) {
    return "";
  }

  if (typeof status === "string") {
    return status;
  }

  if (typeof status === "number") {
    return STATUS_BY_ID[status] || "";
  }

  if (typeof status?.statusId === "number") {
    return STATUS_BY_ID[status.statusId] || "";
  }

  if (typeof status?.id === "number") {
    return STATUS_BY_ID[status.id] || "";
  }

  if (typeof status?.name === "string") {
    return status.name;
  }

  return "";
};

export const normalizeCustomerBooking = (item) => {
  const appointment = item?.appointment || item || {};
  const serviceIds = Array.isArray(appointment.serviceIds)
    ? appointment.serviceIds
    : [];

  return {
    id: appointment.id,
    status: normalizeAppointmentStatus(item?.status || appointment.statusId),
    shopId: item?.shop?.id,
    shop: item?.shop || null,
    expert: item?.expert || null,
    slot: item?.slot || null,
    rate: appointment.rate || 0,
    services: serviceIds.map((serviceId) => ({
      id: serviceId,
      name: `Service ${serviceId}`,
    })),
    appointment,
  };
};

export default api;
