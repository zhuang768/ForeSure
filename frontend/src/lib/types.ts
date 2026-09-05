export type ChainStatus = {
  mode: "sepolia" | "mock";
  rpc_url: string | null;
  contract_address: string | null;
  submitter: string | null;
};

export type Health = { status: string; timestamp: number; chain: "sepolia" | "mock" };

export type NewsItem = {
  title: string;
  link: string;
  published: string;
  summary: string;
  source?: string;
  is_mock: boolean;
};

export type MatchedProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: number;
};

/** Provenance of the actuarial figures (docs/API.md "精算依據"); absent on records made before 2026-09-05. */
export type ActuarialBasis = {
  peril?: string;
  probability_source?: string; // data source string, or "assumption"
  probability_method?: string;
  years_observed?: number | null;
  events_observed?: number | null;
  severe_events_observed?: number | null;
  annual_frequency?: number | null;
  low_sample?: boolean | null;
  loss_source?: string; // always "assumption" for now
  loss_method?: string;
  mean_households_per_severe_event?: number | null;
  assumed_loss_per_household_usd?: number | null;
  assumed_loss_note?: string;
  premium_method?: string;
};

export type ActuarialData = {
  probability_pct: number;
  expected_loss_usd: number;
  premium_range_usd: [number, number];
  markup_multiplier: [number, number];
  basis?: ActuarialBasis | null;
};

export type Proposal = {
  product_name: string;
  target_audience: string;
  market_gap: string;
  coverage_details: string;
  exclusions: string;
  business_logic: string;
};

export type Debate = { pm: string; underwriter: string };

export type ProposalData = {
  source_news: string;
  news_summary: string;
  news_link?: string;
  actuarial_data: ActuarialData;
  debate: Debate;
  proposal: Proposal;
  is_mock: boolean;
  model: string | null;
};

export type Receipt = {
  decision_id: string;
  payload: Record<string, unknown>;
  data_hash: string;
  blockchain_tx_hash: string | null;
  block_number: number | null;
  verification_url: string | null;
  network: string;
  is_mock: boolean;
  timestamp: string;
};

export type RunRecord = {
  decision_id: string;
  run_id?: string;
  timestamp: string;
  news: NewsItem;
  matched_products: MatchedProduct[];
  actuarial_data: ActuarialData;
  proposal_data: ProposalData;
  blockchain_receipt: Receipt;
  report_path: string;
};

export type RunSummary = {
  decision_id: string;
  run_id: string | null;
  timestamp: string;
  news_title: string | null;
  product_name: string | null;
  is_mock_proposal: boolean | null;
  chain_is_mock: boolean | null;
  tx_hash: string | null;
  verification_url: string | null;
};

export type VerifyResult = {
  decision_id: string;
  local_hash_hex?: string;
  matched: boolean;
  onchain_timestamp?: number | null;
  submitter?: string | null;
  is_mock: boolean;
  reason?: string;
  error?: string;
  tampered_fields: string[];
  payload: Record<string, unknown>;
  stored_hash: string | null;
  tx_hash: string | null;
  verification_url: string | null;
};

export type Stage =
  | "news_fetched"
  | "news_selected"
  | "kb_matched"
  | "actuarial"
  | "pm"
  | "underwriter"
  | "actuary"
  | "report"
  | "chain_pending"
  | "chain_done"
  | "done"
  | "error";

export type RunEvent = { stage: Stage; data: unknown };

export type ActiveRun = { run_id: string; status: "running" | "finished" | "error"; events: RunEvent[] };
