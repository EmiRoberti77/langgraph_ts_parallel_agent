import axios from "axios";

export async function get<T>(endpoint: string): Promise<T> {
  const response = await axios.get<T>(endpoint);
  return response.data;
}

export async function post(endpoint: string, body: any): Promise<any> {
  const response = await axios.post(endpoint, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
}
