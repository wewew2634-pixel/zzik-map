// ZZIK LIVE v4 - Metrics Implementation
// Prometheus metrics using OpenTelemetry

import { metrics as otelMetrics } from "@opentelemetry/api";

// Get meter instance for creating metrics
const meter = otelMetrics.getMeter("zzik-live-web", "1.0.0");

/**
 * Mission Run Metrics
 *
 * Example usage:
 *   metrics.incMissionRunStarted();
 *   // Increments counter: mission_run_started_total{status="pending_gps"}
 */

// Mission run started counter
// Tracks total number of mission runs initiated
const missionRunStartedCounter = meter.createCounter(
  "mission_run_started_total",
  {
    description: "Total number of mission runs started",
    unit: "1",
  }
);

// Mission run completed by status counters
// Separate counters for each completion status
const missionRunApprovedCounter = meter.createCounter(
  "mission_run_completed_total",
  {
    description: "Total number of mission runs completed by status",
    unit: "1",
  }
);

// Mission run duration histogram
// Tracks time taken from start to completion
const missionRunDurationHistogram = meter.createHistogram(
  "mission_run_duration_seconds",
  {
    description: "Duration of mission runs in seconds",
    unit: "s",
  }
);

/**
 * Wallet Transaction Metrics
 *
 * Example usage:
 *   metrics.incWalletTransaction("mission_reward");
 *   // Increments counter: wallet_transactions_total{type="mission_reward"}
 */

// Wallet transaction counter
// Tracks total number of wallet transactions by type
const walletTransactionCounter = meter.createCounter(
  "wallet_transactions_total",
  {
    description: "Total number of wallet transactions by type",
    unit: "1",
  }
);

// Wallet balance gauge (observable)
// Current wallet balance per user
const walletBalanceGauge = meter.createObservableGauge(
  "wallet_balance",
  {
    description: "Current wallet balance by user",
    unit: "credits",
  }
);

// Store for wallet balances (to be updated by observeWalletBalance)
const walletBalances = new Map<string, number>();

// Register callback for wallet balance gauge
walletBalanceGauge.addCallback((observableResult) => {
  walletBalances.forEach((balance, userId) => {
    observableResult.observe(balance, { user_id: userId });
  });
});

/**
 * API Request Metrics
 *
 * Example usage:
 *   const start = Date.now();
 *   // ... handle request ...
 *   metrics.observeApiRequestDuration("/api/missions", "POST", 200, Date.now() - start);
 */

// API request duration histogram
const apiRequestDurationHistogram = meter.createHistogram(
  "http_request_duration_seconds",
  {
    description: "HTTP request duration in seconds",
    unit: "s",
  }
);

export const metrics = {
  /**
   * Increment mission run started counter
   * Called when a new mission run is initiated
   */
  incMissionRunStarted() {
    missionRunStartedCounter.add(1, { status: "pending_gps" });
  },

  /**
   * Increment mission run approved counter
   * Called when a mission run is successfully approved
   */
  incMissionRunApproved() {
    missionRunApprovedCounter.add(1, { status: "approved" });
  },

  /**
   * Increment mission run rejected counter
   * Called when a mission run is rejected
   */
  incMissionRunRejected() {
    missionRunApprovedCounter.add(1, { status: "rejected" });
  },

  /**
   * Increment mission run expired counter
   * Called when a mission run expires without completion
   */
  incMissionRunExpired() {
    missionRunApprovedCounter.add(1, { status: "expired" });
  },

  /**
   * Record mission run duration
   * @param ms - Duration in milliseconds
   *
   * Example:
   *   const startTime = Date.now();
   *   // ... mission run processing ...
   *   metrics.observeMissionRunDuration(Date.now() - startTime);
   */
  observeMissionRunDuration(ms: number) {
    // Convert milliseconds to seconds for Prometheus standard
    const seconds = ms / 1000;
    missionRunDurationHistogram.record(seconds);
  },

  /**
   * Increment wallet transaction counter
   * @param type - Transaction type (e.g., "mission_reward", "withdrawal")
   *
   * Example:
   *   metrics.incWalletTransaction("mission_reward");
   */
  incWalletTransaction(type: string) {
    walletTransactionCounter.add(1, { type });
  },

  /**
   * Update wallet balance gauge
   * @param userId - User ID
   * @param balance - Current wallet balance
   *
   * Example:
   *   metrics.observeWalletBalance("user123", 1500);
   */
  observeWalletBalance(userId: string, balance: number) {
    walletBalances.set(userId, balance);
  },

  /**
   * Record API request duration
   * @param path - API endpoint path
   * @param method - HTTP method
   * @param statusCode - HTTP status code
   * @param ms - Duration in milliseconds
   *
   * Example:
   *   metrics.observeApiRequestDuration("/api/missions/123", "GET", 200, 150);
   */
  observeApiRequestDuration(
    path: string,
    method: string,
    statusCode: number,
    ms: number
  ) {
    const seconds = ms / 1000;
    apiRequestDurationHistogram.record(seconds, {
      path,
      method,
      status_code: statusCode.toString(),
    });
  },
};
