import API from "@/lib/axios";
import { departmentShortMap } from "@/types/document-type";

export default async function getDepartments() {
  try {
    const res = await API.get("/api/departments/");
    return res.data.body;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}
