import axios from "axios";

export async function get<T>(endpoint: string): Promise<T> {
  const response = await axios.get<T>(endpoint);
  return response.data;
}
