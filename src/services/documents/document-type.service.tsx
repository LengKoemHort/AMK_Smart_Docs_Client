import API from "@/lib/axios";

export default async function getDocumentTypes() {
  try {
    const res = await API.get("/api/document-types/");
    return res.data.body;
  } catch (error) {
    console.error("Error fetching document types:", error);
    return [];
  }
}
