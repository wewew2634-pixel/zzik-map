// ZZIK LIVE v4 - GPS Verification Configuration

export const GpsVerificationConfig = {
  MAX_DISTANCE_METERS: 100, // 기본 허용 거리
  MAX_ACCURACY_METERS: 80, // accuracy가 이보다 크면 거절
  MAX_AGE_MS: 2 * 60 * 1000, // 2분 이내 좌표만 허용
};
