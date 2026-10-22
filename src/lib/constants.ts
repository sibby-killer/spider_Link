export const REQUEST_STATUSES = [
  "new",
  "contacted",
  "survey_scheduled",
  "survey_done",
  "installed",
  "activated",
  "rejected",
] as const;

export const COMPLAINT_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export const CUSTOMER_STATUSES = ["active", "suspended", "churned", "pending"] as const;

export const PAYMENT_STATUSES = ["pending", "accepted", "paid", "refunded"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
