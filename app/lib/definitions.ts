interface repositoryOverview {
  name: string;
  contributors: string[] | undefined;
  openIssues: number;
}

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};
