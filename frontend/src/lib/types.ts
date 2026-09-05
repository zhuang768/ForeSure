export type ChainStatus = {
  mode: "sepolia" | "mock";
  rpc_url: string | null;
  contract_address: string | null;
  submitter: string | null;
};
