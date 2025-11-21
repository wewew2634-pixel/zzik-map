// ZZIK LIVE v4 - Metrics Skeleton
// TODO: Integrate with Prometheus/OpenTelemetry

export const metrics = {
  incMissionRunStarted() {
    // TODO: Prometheus/OpenTelemetry counter 증가
    // mission_run_started_total{status="pending_gps"}
  },

  incMissionRunApproved() {
    // TODO: Prometheus/OpenTelemetry counter 증가
    // mission_run_approved_total
  },

  incMissionRunRejected() {
    // TODO: Prometheus/OpenTelemetry counter 증가
    // mission_run_rejected_total
  },

  incMissionRunExpired() {
    // TODO: Prometheus/OpenTelemetry counter 증가
    // mission_run_expired_total
  },

  observeMissionRunDuration(ms: number) {
    // TODO: Prometheus/OpenTelemetry histogram 기록
    // mission_run_duration_seconds
  },

  incWalletTransaction(type: string) {
    // TODO: Prometheus/OpenTelemetry counter 증가
    // wallet_transactions_total{type="mission_reward"}
  },

  observeWalletBalance(userId: string, balance: number) {
    // TODO: Prometheus/OpenTelemetry gauge 업데이트
    // wallet_balance{user_id="..."}
  },
};
