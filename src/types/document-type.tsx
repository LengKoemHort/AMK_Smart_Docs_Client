export interface DocumentProps {
  id: string;
  title: string;
  department: string;
  document_type: string;
  file_size: string;

  code?: string;
  version: string;
  publisher_name?: string;
  published_date: string;
  created_at?: string;
  branch?: string;

  total_versions?: number;
  file?: any;

  is_vector_processed?: boolean;
}

export interface DocumentPayload {
  file: any;
  title: string;
  code: string;
  version?: string;
  document_type: string;
  department: string;
  unit: string;
  branch: string;
  issueDate: string;
}

export const departmentShortMap: Record<string, string> = {
  "Human Resources": "HR",
  Finance: "Finance",
  Marketing: "Marketing",
  Legal: "Legal",
  Sales: "Sales",
  "Information Technology": "IT",
};
