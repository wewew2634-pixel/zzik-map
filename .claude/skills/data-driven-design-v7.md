# Data-Driven Design Framework V7
## Metrics, Analytics & Design Decision-Making for ZZIK MAP

Comprehensive guide to measuring UX effectiveness and making decisions based on real user data.

---

## Part 1: The Right Metrics (What Actually Matters)

### Vanity Metrics vs. Real Metrics

```yaml
VANITY METRICS (Misleading):
  Page Views:
    Why bad: "User scrolls page = views spike"
    Problem: Doesn't indicate engagement
    Can hide: Users confused, searching for exit

  Bounce Rate:
    Why bad: "User bounces = user quit"
    Problem: User might have found answer immediately
    Can hide: Actually high satisfaction

  Click-Through Rate:
    Why bad: "More clicks = success"
    Problem: Can indicate confusion (users searching)
    Can hide: Low quality clicks

  Time on Page:
    Why bad: "Longer = more engaged"
    Problem: Users might be stuck/confused
    Can hide: Actual frustration

REAL METRICS (Actionable):
  Task Completion Rate:
    What: % of users completing intended action
    Why matters: Shows if product works
    For ZZIK: "% uploading first photo"
    Target: 60%+

  User Return Rate:
    What: % of users coming back
    Why matters: Shows if sticky
    For ZZIK: "Day-1, 7, 30 retention"
    Target: 30% Day-1, 15% Day-7

  Feature Adoption:
    What: % using each feature
    Why matters: Shows what resonates
    For ZZIK: "Journey vs vibe vs map box"
    Target: 70% try journey, 40% try vibe

  Error Rate:
    What: % of actions resulting in error
    Why matters: Shows friction points
    For ZZIK: "Upload failures, GPS failures"
    Target: < 5%
```

---

## Part 2: ZZIK-Specific Metrics Framework

### Three-Level Metric Hierarchy

**Level 1: North Star Metric (The One Truth)**

```yaml
North Star: "# of unique destinations discovered per user per month"

Why this metric:
  - Measures core value (discovery + serendipity)
  - Aligns with business (more destinations = more MAP BOX opportunities)
  - Aligns with user need (find new places)
  - Not gameable (can't fake discovery)

Success trajectory:
  Month 1: 3 destinations/user/month (early adopters)
  Month 3: 8 destinations/user/month (growth)
  Month 6: 15 destinations/user/month (mature)
  Month 12: 25 destinations/user/month (mastery)

This drives ALL other metrics and decisions.
```

**Level 2: Key Performance Indicators (KPIs)**

```typescript
interface KPI {
  metric: string;
  target: number;
  current: number;
  status: 'exceeding' | 'on-track' | 'at-risk' | 'failing';
  impact_on_north_star: 'high' | 'medium' | 'low';
  owner: string;
}

export const KPIs = [
  // Engagement KPIs
  {
    metric: 'DAU (Daily Active Users)',
    target: 1000,
    current: 750,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },
  {
    metric: 'MAU (Monthly Active Users)',
    target: 5000,
    current: 3200,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },

  // Feature KPIs
  {
    metric: '% Users Uploading Photos',
    target: 70,
    current: 55,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },
  {
    metric: '% Users Trying Vibe Matching',
    target: 40,
    current: 28,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },
  {
    metric: 'Avg Photos per User',
    target: 3.5,
    current: 2.1,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },

  // Quality KPIs
  {
    metric: 'Photo Upload Success Rate',
    target: 98,
    current: 92,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Engineering',
  },
  {
    metric: 'GPS Extraction Success Rate',
    target: 85,
    current: 68,
    status: 'failing',
    impact_on_north_star: 'high',
    owner: 'Engineering',
  },
  {
    metric: 'Recommendation Quality Score',
    target: 8.5,
    current: 7.2,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'AI/ML',
  },

  // Retention KPIs
  {
    metric: 'Day-1 Retention',
    target: 40,
    current: 32,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },
  {
    metric: 'Day-7 Retention',
    target: 20,
    current: 14,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },
  {
    metric: 'Day-30 Retention',
    target: 8,
    current: 5,
    status: 'at-risk',
    impact_on_north_star: 'high',
    owner: 'Product',
  },

  // Technical KPIs
  {
    metric: 'App Crash Rate',
    target: 0.1,
    current: 0.2,
    status: 'failing',
    impact_on_north_star: 'high',
    owner: 'Engineering',
  },
  {
    metric: 'First Contentful Paint',
    target: 1800,
    current: 2100,
    status: 'at-risk',
    impact_on_north_star: 'medium',
    owner: 'Engineering',
  },
];
```

**Level 3: Diagnostic Metrics (Understand Why)**

```yaml
Why is DAU low?
  → Check: App Crash Rate (blocking access)
  → Check: Day-1 Retention (not coming back)
  → Check: First Contentful Paint (takes too long)
  → Check: Photo Upload Success (can't take first action)

Why is retention low?
  → Check: Recommendation Quality (not finding good places)
  → Check: % Users Trying Vibe Matching (limited discovery)
  → Check: Avg Photos per User (not engaging repeatedly)

Why is GPS extraction failing?
  → Check: Device OS version distribution
  → Check: Location permission grant rate
  → Check: GPS accuracy by region
  → Check: Network quality when extracting
```

---

## Part 3: UX Metrics (Perception & Behavior)

### Measuring Design Quality Without Asking Users

```typescript
interface UXMetric {
  metric: string;
  measurement: string;
  target: number;
  how_to_measure: string;
}

export const UX_METRICS = [
  // Responsiveness
  {
    metric: 'Input Response Time',
    measurement: 'milliseconds',
    target: 200,
    how_to_measure: 'Performance API: measure time from click to visual feedback',
  },
  {
    metric: 'Page Transition Smoothness',
    measurement: 'FPS',
    target: 55,
    how_to_measure: 'DevTools Performance: frame rate during navigation',
  },

  // Error Recovery
  {
    metric: 'Error Handling Success Rate',
    measurement: '%',
    target: 95,
    how_to_measure: 'Track users who recover from errors vs. abandon',
  },
  {
    metric: 'Retry Success Rate',
    measurement: '%',
    target: 80,
    how_to_measure: 'Track failed actions that succeed on retry',
  },

  // Accessibility
  {
    metric: 'Keyboard Navigation Coverage',
    measurement: '%',
    target: 100,
    how_to_measure: 'Audit: which interactive elements accessible via keyboard',
  },
  {
    metric: 'Color Contrast Compliance',
    measurement: '%',
    target: 100,
    how_to_measure: 'Automated tool: axe-core or similar',
  },
  {
    metric: 'Touch Target Size',
    measurement: '%',
    target: 100,
    how_to_measure: 'Automated tool: minimum 44x44px',
  },

  // Clarity
  {
    metric: 'Task Success Rate',
    measurement: '%',
    target: 90,
    how_to_measure: 'Usability test: can users complete intended task?',
  },
  {
    metric: 'Time to Task Completion',
    measurement: 'seconds',
    target: 30,
    how_to_measure: 'Usability test: how long does task take?',
  },

  // Delight
  {
    metric: 'Animation Preference',
    measurement: '%',
    target: 75,
    how_to_measure: 'A/B test: animation version vs. no animation',
  },
  {
    metric: 'Feature Discoverability',
    measurement: '%',
    target: 60,
    how_to_measure: 'Heatmap: % of users finding hidden features',
  },
];
```

---

## Part 4: Analytics Events (What to Track)

### Event Taxonomy for ZZIK

```typescript
// Every important user action should be tracked
// Format: event_name with properties

interface AnalyticsEvent {
  event: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
  user_id: string;
  session_id: string;
}

export const EVENTS = {
  // Onboarding
  app_installed: {
    os: 'ios' | 'android' | 'web',
    version: '1.0.0',
    source: 'app_store' | 'google_play' | 'web',
  },
  welcome_viewed: {
    step: 1 | 2 | 3,
  },
  signup_started: {},
  signup_completed: {
    method: 'email' | 'google' | 'apple',
  },

  // Core Features
  photo_upload_started: {
    source: 'camera' | 'library' | 'url',
  },
  photo_upload_completed: {
    size_mb: number,
    has_gps: boolean,
    time_ms: number,
  },
  photo_upload_failed: {
    error_type: 'network' | 'validation' | 'server',
    retry_count: number,
  },

  // Journey Intelligence
  journey_requested: {
    photo_id: string,
    has_gps: boolean,
  },
  journey_received: {
    recommendation_count: number,
    top_match_percentage: number,
    time_ms: number,
  },
  destination_selected: {
    destination_id: string,
    match_percentage: number,
    position: 1 | 2 | 3 | 4 | 5,
  },

  // Vibe Matching
  vibe_filter_applied: {
    vibe: 'cozy' | 'modern' | 'vintage' | 'minimal' | 'romantic' | 'industrial' | 'nature' | 'luxury',
  },
  vibe_matching_requested: {
    vibe: string,
  },
  vibe_results_viewed: {
    result_count: number,
  },

  // Saving / Curation
  destination_saved: {
    destination_id: string,
    destination_name: string,
  },
  destination_unsaved: {
    destination_id: string,
  },
  journey_saved: {
    photo_count: number,
  },

  // Engagement
  share_initiated: {
    share_type: 'journey' | 'destination' | 'recommendation',
    share_platform: 'kakao' | 'instagram' | 'facebook' | 'twitter' | 'link',
  },
  notification_received: {
    notification_type: 'new_destination' | 'trending' | 'friend_activity',
  },
  notification_tapped: {
    notification_type: string,
  },

  // Errors
  error_occurred: {
    error_code: string,
    error_message: string,
    context: string, // where did error happen?
  },
  error_recovered: {
    error_code: string,
    recovery_method: 'retry' | 'alternative' | 'skip',
  },

  // Performance
  page_loaded: {
    page_name: string,
    load_time_ms: number,
    cached: boolean,
  },
  feature_used: {
    feature_name: string,
    is_first_use: boolean,
  },

  // Churn Risk
  app_backgrounded: {
    session_duration_seconds: number,
  },
  app_uninstalled: {
    session_count: number,
    days_since_install: number,
  },
};

// Implementation example (Segment/Mixpanel style):
export function trackEvent(event: string, properties: any) {
  analytics.track(event, {
    ...properties,
    timestamp: Date.now(),
    user_id: currentUser.id,
    session_id: sessionStorage.getItem('sessionId'),
    app_version: APP_VERSION,
    device_type: isMobile ? 'mobile' : 'desktop',
  });
}

// Usage:
trackEvent('photo_upload_completed', {
  size_mb: 2.5,
  has_gps: true,
  time_ms: 1200,
});
```

---

## Part 5: Cohort Analysis (Understanding Users)

### Segmenting Users by Behavior

```yaml
Cohort 1: "High Engagement"
  Definition: Uploaded 5+ photos, tried 2+ features, returned 5+ days
  Size: 15% of users
  Characteristics:
    - Core users who found product valuable
    - Likely to become paying customers
    - Best for feature testing (accept change)
  Retention: 80% Day-7, 40% Day-30
  Average destinations discovered: 18/month

Cohort 2: "Explorers"
  Definition: Uploaded 2-4 photos, tried 1+ features, returned 2-4 days
  Size: 25% of users
  Characteristics:
    - Curious, but not committed
    - Price sensitive
    - Need habit formation help
  Retention: 30% Day-7, 8% Day-30
  Average destinations discovered: 5/month
  Action: Daily notifications, habit building

Cohort 3: "One-Shot Users"
  Definition: Uploaded 1 photo, never returned
  Size: 40% of users
  Characteristics:
    - Tried but didn't see value
    - Need better onboarding
    - Or genuinely not target market
  Retention: 0% Day-7
  Average destinations discovered: 1/month
  Action: Improve first-time experience

Cohort 4: "Inactive"
  Definition: Installed but never uploaded
  Size: 20% of users
  Characteristics:
    - High friction to first action
    - Unclear value proposition
    - Wrong marketing channel
  Retention: 0%
  Action: Improve onboarding, reduce barriers

Analysis: Where's the churn?
  Biggest drop: Cohort 3 → inactive → uninstall
  Action: Focus on first-experience improvements

  Second biggest: Cohort 2 → low engagement
  Action: Habit formation + social features
```

---

## Part 6: A/B Testing Framework

### Making Data-Driven Design Decisions

```typescript
interface ABTest {
  name: string;
  hypothesis: string;
  control: string;
  variant: string;
  target_metric: string;
  sample_size: number;
  duration_days: number;
  confidence_level: number; // 95% = 0.95
  mde: number; // Minimum Detectable Effect
}

export const CURRENT_TESTS = [
  {
    name: 'First Upload CTA Button Color',
    hypothesis: 'Coral button more visible than blue button',
    control: 'Blue (#0EA5E9)',
    variant: 'Coral (#FF5A5F)',
    target_metric: 'Photo Upload Rate',
    sample_size: 1000,
    duration_days: 7,
    confidence_level: 0.95,
    mde: 0.15, // 15% improvement needed
    status: 'running',
    current_results: {
      control_rate: 0.52,
      variant_rate: 0.61,
      improvement: '17.3%',
      p_value: 0.018,
      verdict: 'WINNING - Variant significantly better',
    },
  },

  {
    name: 'Success Animation Duration',
    hypothesis: 'Longer celebration (600ms) more satisfying than short (300ms)',
    control: '300ms bounce animation',
    variant: '600ms bounce animation',
    target_metric: 'App Return Rate (Day-1)',
    sample_size: 500,
    duration_days: 7,
    confidence_level: 0.95,
    mde: 0.10, // 10% improvement needed
    status: 'running',
    current_results: {
      control_rate: 0.32,
      variant_rate: 0.35,
      improvement: '9.4%',
      p_value: 0.34,
      verdict: 'INCONCLUSIVE - Not significant (p > 0.05)',
    },
  },

  {
    name: 'Vibe Filter Prominence',
    hypothesis: 'Showing vibe filters by default increases vibe matching adoption',
    control: 'Vibe filters hidden by default',
    variant: 'Vibe filters visible by default',
    target_metric: 'Vibe Matching Adoption',
    sample_size: 2000,
    duration_days: 14,
    confidence_level: 0.95,
    mde: 0.20, // 20% improvement needed
    status: 'planned',
  },
];

// How to run an A/B test:
export function ABTestExample() {
  // 1. Assign user to cohort
  const cohort = assignToCohort(userId, 'first_upload_cta');
  // Returns: 'control' or 'variant'

  // 2. Show appropriate variant
  const buttonColor = cohort === 'control' ? 'blue' : 'coral';

  // 3. Track interaction
  const handleUpload = () => {
    trackEvent('photo_upload_completed', {
      test: 'first_upload_cta',
      cohort,
    });
  };

  // 4. Analyze results
  // → Calculate p-value
  // → Check if p < 0.05 (statistically significant)
  // → If variant wins by MDE, deploy it
}
```

---

## Part 7: Decision Framework

### How to Make UX Decisions Based on Data

```typescript
interface UXDecision {
  decision: string;
  data_source: string;
  confidence: 'high' | 'medium' | 'low';
  action: string;
}

export const DECISION_FRAMEWORK = [
  // High confidence: Multiple data sources agree
  {
    decision: 'Fix GPS extraction (currently 68% vs. 85% target)',
    data_source: [
      'KPI: GPS Success Rate at 68%',
      'User feedback: "App doesn\'t know where I am"',
      'Heatmap: 40% of users skip GPS results',
      'A/B test: Manual geo selection improves journey results',
    ],
    confidence: 'high',
    action: 'PRIORITY 1: Implement GPS fallback improvements',
  },

  {
    decision: 'Reduce photo upload friction',
    data_source: [
      'KPI: 55% of users uploading vs. 70% target',
      'Cohort: "Inactive" cohort (20%) never uploads',
      'Session recording: Users abandon at upload screen',
      'A/B test: One-tap upload (camera) vs. two-tap (library)',
    ],
    confidence: 'high',
    action: 'PRIORITY 1: Simplify upload flow',
  },

  {
    decision: 'Improve Day-1 retention (currently 32% vs. 40% target)',
    data_source: [
      'KPI: Day-1 retention at 32%',
      'Cohort: High-engagement users have 2+ photos on Day-1',
      'Hypothesis: Second photo = habit formation trigger',
      'A/B test: "Upload another photo?" prompt after first',
    ],
    confidence: 'medium',
    action: 'TEST: Suggest second photo immediately after first',
  },

  {
    decision: 'Add vibe matching to home screen',
    data_source: [
      'Feature adoption: 28% trying vibe vs. 40% target',
      'User feedback: "Didn\'t know vibe matching existed"',
      'A/B test (planned): Hidden vs. visible by default',
      'Current: Only 4% of journey users try vibe afterwards',
    ],
    confidence: 'medium',
    action: 'TEST: Move vibe matching to primary navigation',
  },

  {
    decision: 'Implement daily notification strategy',
    data_source: [
      'Retention: 14% Day-7 vs. 20% target',
      'Research: "Daily discovery habit" increases retention 4x',
      'Note: No current A/B test yet',
      'Risk: Notifications can cause uninstalls if spammy',
    ],
    confidence: 'medium',
    action: 'CAREFUL TEST: One notification per day, triggered by time',
  },

  {
    decision: 'Keep 6-second animation (no data yet)',
    data_source: [
      'A/B test: 600ms vs 300ms animations (inconclusive)',
      'Insufficient sample size?',
      'User sentiment: "Felt good and smooth"',
      'Decision: Keep longer animation, test on more users',
    ],
    confidence: 'low',
    action: 'CONTINUE TESTING: Double sample size, 14-day duration',
  },

  {
    decision: 'Remove background animated globs',
    data_source: [
      'Performance: Drains 15% battery on low-end devices',
      'User feedback: "Battery drains fast"',
      'No engagement data: Rarely mentioned positively',
      'Cost/benefit: High cost (battery), low value (decoration)',
    ],
    confidence: 'high',
    action: 'REMOVE: Static background or pause when not visible',
  },
];
```

---

## Part 8: Reporting & Communication

### Sharing Data with Team

```typescript
// Weekly Data Summary (for team)
export const WEEKLY_REPORT = {
  week: '2025-W48',
  north_star: {
    metric: 'Destinations per user per month',
    current: 4.2,
    target: 8.0,
    trend: '↓ -8% vs. last week',
    status: 'at-risk',
  },

  kpi_summary: [
    {
      kpi: 'DAU',
      current: 750,
      target: 1000,
      trend: '↑ +12% vs. last week',
      status: 'improving',
    },
    {
      kpi: 'Photo upload rate',
      current: '55%',
      target: '70%',
      trend: '→ flat vs. last week',
      status: 'stuck',
    },
    {
      kpi: 'Day-7 retention',
      current: '14%',
      target: '20%',
      trend: '↓ -3% vs. last week',
      status: 'concerning',
    },
  ],

  ab_tests: [
    {
      test: 'First Upload CTA Button Color',
      status: 'winning',
      improvement: '+17.3%',
      recommendation: 'Deploy coral button next week',
    },
  ],

  action_items: [
    'URGENT: GPS extraction only 68%, user complaints increasing',
    'Continue: A/B test on retention notifications',
    'Remove: Background globs animation (performance impact)',
  ],

  insights: [
    'High-engagement cohort reaches 5+ photos before Day-3',
    'One-shot users rarely see value in recommendations',
    'Vibe matching adoption still low (28%)',
  ],
};

// Executive Summary (for leadership)
export const MONTHLY_EXECUTIVE_BRIEF = {
  headline: 'North Star declining, need action on upload friction',
  one_number: {
    metric: 'Destinations discovered per user per month',
    value: 4.2,
    target: 8.0,
    status: '47% of target',
  },
  traffic: {
    mau: 3200,
    target: 5000,
    trend: '+12% vs. last month',
  },
  retention: {
    day1: '32%',
    day7: '14%',
    day30: '5%',
    target: '40% / 20% / 8%',
    comparison: '20-25% below target across all cohorts',
  },
  top_priority: 'Fix GPS extraction (68% vs 85% target) and upload friction (55% vs 70%)',
  next_month_focus: [
    '1. Reduce upload barriers (one-tap camera)',
    '2. Improve GPS accuracy (implement AI fallback)',
    '3. Test daily notification habit loop',
  ],
};
```

---

*Data-Driven Design Framework V7.0*
*Metrics, Analytics & Evidence-Based Decisions*
*"In data we trust. In users we design."*
