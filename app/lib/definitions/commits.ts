export type CommitStats = {
  committedDate: string;
  author: {
    email: string;
    name: string;
  };
  message: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  url: string;
};
