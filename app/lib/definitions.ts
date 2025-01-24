export type repositoryOverview = {
  name: string;
  contributors: string[];
  openIssues: number;
  url: string;
};

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};
