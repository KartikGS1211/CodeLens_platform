export type Repository = {
  id: string;
  repositoryName: string;
  repositoryUrl: string;
  owner?: string;
  status: string;
  analysis?: {
    id: string;
    status: string;
  };
};
