export enum ChatProvider {
  Drift = "Drift",
  SalesForce = "SalesForce",
  None = "None",
  Both = "Both",
}

export const BASE_PATH = "/app/data";

// these are the keywords that we're looking for in the html.
export const DRIFT_EMBED_KEYWORD = "driftt";

// salesforce doesn't have the clearest documentation for how people are embedding
// their chat widget, this has been the one I am sure of.
export const SALESFORCE_EMBED_KEYWORD = "service.force";
