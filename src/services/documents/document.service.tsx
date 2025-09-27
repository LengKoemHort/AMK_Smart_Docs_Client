import API from "@/lib/axios";
import { departmentShortMap, DocumentPayload } from "@/types/document-type";
import { DocumentProps } from "next/document";

export const getUserProfile = async () => {
  const res = await API.get("/whoami/");
  console.log("whoami: " + JSON.stringify(res.data));
  return res.data;
};

export async function getAllDocuments() {
  try {
    const res = await API.get("/api/documents/list/");
    const docs = res.data.body.results;

    // map dept name to shortcut
    const normalizedDocs = docs.map((doc: any) => ({
      ...doc,
      department: departmentShortMap[doc.department] || doc.department,
    }));

    // console.log("documents: " + JSON.stringify(normalizedDocs));

    return normalizedDocs;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function getDocumentDetail(document_id: string) {
  try {
    const res = await API.get(`/api/documents/${document_id}/`);
    const docs = res.data.body;

    // console.log("docs: " + JSON.stringify(docs));
    return docs;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function softDeleteDocument(document_id: string) {
  try {
    const res = await API.delete(`/api/documents/${document_id}/delete/`);

    console.log("delete Document: " + JSON.stringify(res));

    window.location.reload();
  } catch (error) {
    console.log("error delete Document", error);
  }
}

export async function softDeleteDocumentActive(document_id: string) {
  try {
    const res = await API.delete(`/api/documents/${document_id}/delete/`);
  } catch (error) {
    console.log("error delete Document", error);
  }
}

export async function uploadDocument(document: FormData) {
  try {
    const res = await API.post("/api/documents/upload/", document);

    console.log("Uploaded Document: " + JSON.stringify(res));

    return res.data;
  } catch (error) {
    console.log("error uploading Document", error);
    throw error;
  }
}

export async function updateDocument(document: FormData, id: string) {
  try {
    const res = await API.post(
      `/api/documents/${id}/upload-version/`,
      document
    );

    console.log("Updated Document: " + JSON.stringify(res));

    return res.data;
  } catch (error) {
    console.log("error updating Document", error);
    throw error;
  }
}

export async function getDocumentsByPage(page: number) {
  try {
    const res = await API.get(`/api/documents/list/?page=${page}`);
    const { results, next, previous } = res.data.body;

    // short form
    const normalizedDocs = results.map((doc: any) => ({
      ...doc,
      department: departmentShortMap[doc.department] || doc.department,
    }));

    const hasNextPage = next !== null;
    const hasPreviousPage = previous !== null;

    return {
      documents: normalizedDocs,
      hasNextPage,
      hasPreviousPage,
    };
  } catch (error) {
    console.error("Error fetching paginated documents:", error);
    return {
      documents: [],
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
}

export async function viewDocument(documentId: string) {
  try {
    const response = await API.get(`/api/documents/${documentId}/download/`, {
      responseType: "blob",
    });

    const buffer = await response.data.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    return uint8Array;
  } catch (error) {
    console.error("rrror viewing document:", error);
  }
}

export async function viewDocumentDownloadPrivilege(documentId: string) {
  try {
    const response = await API.get(`/api/documents/${documentId}/download/`, {
      responseType: "blob",
    });

    const url = URL.createObjectURL(response.data);
    window.open(url, "_tab");
  } catch (error) {
    console.error("rrror viewing document:", error);
  }
}

export async function updateDocumentById(document_id: string) {
  try {
    const response = await API.patch(`/api/documents/${document_id}/update`);
  } catch (error) {
    console.log("error updating document");
  }
}

export async function uploadDocumentNewVersion(
  document: FormData,
  document_id: string
) {
  try {
    for (let [key, value] of document.entries()) {
      console.log(`${key}:`, value);
    }

    const res = await API.post(
      `/api/documents/${document_id}/upload-version/`,
      document
    );

    console.log("Updated Document x: " + JSON.stringify(res));

    return res.data;
  } catch (error) {
    console.log("error updating Document", error);
    throw error;
  }
}

export async function updateDocumentVersion(
  document: FormData,
  document_id: string
) {
  try {
    const res = await API.patch(
      `/api/documents/${document_id}/update-version/`,
      document
    );

    console.log(
      `Updated Document Version of Specific Version` +
        JSON.stringify(res.data.body)
    );

    return res.data;
  } catch (error) {
    console.log("error updating Document", error);
    throw error;
  }
}

export async function getInactiveDocumentsByPage(page: number) {
  const pageSize = 10;
  const currentPage = page;

  try {
    const res = await API.get(
      `/api/documents/list/?is_active=false&page_size=${pageSize}&page=${currentPage}`
    );
    const { results, count, next, previous } = res.data.body;

    const normalizedDocs = results.map((doc: any) => ({
      ...doc,
      department: departmentShortMap[doc.department] || doc.department,
    }));

    const hasNextPage = next !== null;
    const hasPreviousPage = previous !== null;

    return {
      documents: normalizedDocs,
      hasNextPage,
      hasPreviousPage,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
    };
  } catch (error) {
    console.error("Error fetching inactive documents:", error);
    return {
      documents: [],
      hasNextPage: false,
      hasPreviousPage: false,
      total: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
}

export async function restoreDocument(document_id: string) {
  try {
    const response = await API.post(`/api/documents/${document_id}/restore/`);

    window.location.reload();
  } catch (error) {
    console.log("error restoring document", error);
  }
}
