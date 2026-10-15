import axios from 'axios';

// All API URLs live in this one file. In development Vite proxies /api to Express.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export async function fetchEmployees() {
  const response = await client.get('/employees');
  return response.data.data;
}

export async function fetchEmployee(employeeId) {
  const response = await client.get(`/employees/${encodeURIComponent(employeeId)}`);
  return response.data.data;
}

export async function createEmployee(employeeData) {
  const response = await client.post('/employees', employeeData);
  return response.data;
}

export async function deleteEmployee(employeeId) {
  const response = await client.delete(`/employees/${encodeURIComponent(employeeId)}`);
  return response.data;
}

export async function fetchHierarchy() {
  const response = await client.get('/employees/hierarchy');
  return response.data.data;
}

// Turns any Axios error into something the UI can show:
//   { message, fieldErrors, directReports, status }
// so components never display text like "Request failed with status code 500".
export function parseApiError(error) {
  // The server answered with an error status: prefer its message.
  if (error.response) {
    const body = error.response.data || {};
    return {
      status: error.response.status,
      message: body.message || 'Something went wrong. Please try again.',
      fieldErrors: body.errors || {},
      directReports: body.directReports || [],
    };
  }

  // The request was sent but nothing came back: server down, no network, or timeout.
  if (error.request) {
    return {
      status: null,
      message: 'Cannot reach the server. Please check that the backend is running and try again.',
      fieldErrors: {},
      directReports: [],
    };
  }

  return { status: null, message: 'Something went wrong. Please try again.', fieldErrors: {}, directReports: [] };
}
