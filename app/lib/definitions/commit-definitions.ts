export type CommitStats = {
  committedDate: string;
  author: {
    email: string;
    name: string;
  };
  additions: number;
  deletions: number;
  changedFiles: number;
  url: string;
};
