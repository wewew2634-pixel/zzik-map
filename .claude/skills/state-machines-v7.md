# State Machine Patterns V7
## Complete User Flow State Transitions for ZZIK MAP

Comprehensive state machine documentation for every user-facing flow and system state.

---

## Part 1: Core State Machine Principles

### What is a State Machine?

```typescript
interface StateMachine {
  states: Record<string, State>;
  transitions: Array<{
    from: string;
    to: string;
    trigger: string;
    condition?: () => boolean;
  }>;
  initialState: string;
  finalStates: string[];
}

interface State {
  name: string;
  entry_action?: () => void;  // What happens when entering?
  exit_action?: () => void;   // What happens when leaving?
  timeout?: number;            // Auto-transition after timeout?
  ui_state: 'loading' | 'content' | 'empty' | 'error' | 'success';
  user_actions: string[];      // What can user do from here?
}

// Example: Photo Upload State Machine
const photoUploadMachine = {
  initialState: 'idle',
  states: {
    idle: {
      ui_state: 'content',
      user_actions: ['click_upload'],
    },
    uploading: {
      ui_state: 'loading',
      entry_action: () => startProgress(),
      user_actions: ['cancel'],
    },
    success: {
      ui_state: 'success',
      timeout: 3000, // Auto-transition after 3s
      user_actions: ['next_action'],
    },
    error: {
      ui_state: 'error',
      user_actions: ['retry', 'cancel'],
    },
  },
  transitions: [
    { from: 'idle', to: 'uploading', trigger: 'click_upload' },
    { from: 'uploading', to: 'success', trigger: 'upload_complete' },
    { from: 'uploading', to: 'error', trigger: 'upload_failed' },
    { from: 'error', to: 'uploading', trigger: 'retry' },
    { from: 'success', to: 'idle', trigger: 'timeout' },
    { from: 'error', to: 'idle', trigger: 'cancel' },
  ],
};
```

---

## Part 2: User Authentication Flow

### Complete signup → authenticated journey

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION MACHINE                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ [UNAUTHENTICATED - Home/Landing Page]       │
│ • See hero copy: "With one photo..."        │
│ • See "Sign Up" or "Explore" CTA            │
│ • Can view feature highlights               │
│ • Cannot upload photos                      │
│ • Cannot save journeys                      │
└──────────────────────────────────────────────┘
         ↓ (click "Sign Up")        ↓ (click "Explore")
    ┌────────────────┐              ┌──────────────┐
    │  [SIGNUP]      │              │ [DEMO MODE]  │
    │  • Email input │              │ • Try app    │
    │  • Password    │              │ • No account │
    │  • Verify      │              │ • Limited    │
    └────────────────┘              └──────────────┘
         ↓                               ↓
┌──────────────────────────────────────────────┐
│ [EMAIL_VERIFICATION]                        │
│ • "Check your email for verification link"  │
│ • 10 min timeout                            │
│ • Can resend link                           │
└──────────────────────────────────────────────┘
         ↓ (click link)
┌──────────────────────────────────────────────┐
│ [ONBOARDING - Step 1]                       │
│ • "Welcome to ZZIK!"                        │
│ • Explain journey intelligence              │
│ • Learn what photo to upload                │
└──────────────────────────────────────────────┘
         ↓ (click next)
┌──────────────────────────────────────────────┐
│ [ONBOARDING - Step 2]                       │
│ • Explain vibe matching                     │
│ • Show 8 vibe categories                    │
│ • Examples of each vibe                     │
└──────────────────────────────────────────────┘
         ↓ (click next / skip)
┌──────────────────────────────────────────────┐
│ [ONBOARDING - Step 3]                       │
│ • Explain map box (MAP BOX future)          │
│ • Show how to save journeys                 │
│ • Permission: Location access?              │
└──────────────────────────────────────────────┘
         ↓ (allow permissions / skip)
┌──────────────────────────────────────────────┐
│ [AUTHENTICATED - Home Page]                 │
│ • User is logged in                         │
│ • Can upload photos                         │
│ • Can explore recommendations               │
│ • Can save journeys                         │
│ • Profile accessible                       │
└──────────────────────────────────────────────┘

Errors/Edge Cases:
  • Email already exists → [SIGNUP_ERROR]
  • Verification link expired → [VERIFY_EXPIRED] → Resend link
  • Network error during signup → [OFFLINE] → Retry
  • User closes browser at Step 2 → [ABANDONED] → Show "Continue?" on return
```

**Implementation**:

```typescript
export type AuthState =
  | 'unauthenticated'
  | 'signup'
  | 'email_verification'
  | 'onboarding_step1'
  | 'onboarding_step2'
  | 'onboarding_step3'
  | 'authenticated'
  | 'error';

interface AuthMachine {
  state: AuthState;

  transitions: {
    signup_clicked: () => void;
    email_submitted: (email: string) => Promise<void>;
    verification_pending: () => void;
    email_verified: () => void;
    onboarding_completed: () => void;
    error_occurred: (error: Error) => void;
  };
}

// In React:
const [authState, setAuthState] = useState<AuthState>('unauthenticated');
const [onboardingStep, setOnboardingStep] = useState(0);

const handleSignup = async (email: string) => {
  setAuthState('signup');
  try {
    await api.signup(email);
    setAuthState('email_verification');
  } catch (error) {
    setAuthState('error');
  }
};

const handleEmailVerified = () => {
  setAuthState('onboarding_step1');
};

const handleOnboardingNext = () => {
  if (onboardingStep < 2) {
    setOnboardingStep(step => step + 1);
    setAuthState(`onboarding_step${step + 2}` as AuthState);
  } else {
    setAuthState('authenticated');
  }
};
```

---

## Part 3: Photo Upload Flow

### Complete upload → recommendations journey

```
┌────────────────────────────────────────────────┐
│        [IDLE - Ready to Upload]               │
│ • Show upload zone                            │
│ • "Upload a travel photo"                     │
│ • Drag & drop enabled                         │
│ • Camera/gallery buttons                      │
└────────────────────────────────────────────────┘
     ↓ (photo selected)
┌────────────────────────────────────────────────┐
│        [VALIDATION]                           │
│ • Check file type (jpg, png)                 │
│ • Check file size (< 50MB)                   │
│ • Check image quality                        │
└────────────────────────────────────────────────┘
     ↓ (valid)              ↓ (invalid)
     ✓                      [ERROR_INVALID_FILE]
     │                      │
     ↓                      ↓
┌────────────────────────────────────────────────┐   ┌──────────────────────────┐
│        [UPLOADING]                             │   │ Error message:           │
│ • Progress: 0-100%                            │   │ "File too large"         │
│ • Show stages:                                 │   │ "Try a different photo"  │
│   1. "Reading photo..."        (0-10%)        │   │ [Retry] button           │
│   2. "Extracting location..."  (10-30%)       │   └──────────────────────────┘
│   3. "Analyzing vibe..."       (30-70%)       │        ↓ (click Retry)
│   4. "Finding places..."       (70-100%)      │        ↑ (back to Idle)
│ • Cancel button available                    │
└────────────────────────────────────────────────┘
     │
     ├─ Network error during upload → [ERROR_NETWORK]
     │                               → "Connection lost"
     │                               → [Retry] or [Use without location]
     │
     ├─ Server error → [ERROR_SERVER]
     │                → "Couldn't process photo"
     │                → [Retry] or [Contact support]
     │
     └─ Success → [SUCCESS]
                    │
                    ↓
┌────────────────────────────────────────────────┐
│        [SUCCESS - Photo Saved]                │
│ • Checkmark animation ✓                       │
│ • "Photo saved!"                              │
│ • 3 sec timeout (auto-advance)                │
│ • Can click to advance                        │
└────────────────────────────────────────────────┘
           ↓ (after 3s or click)
┌────────────────────────────────────────────────┐
│        [LOADING_RESULTS]                      │
│ • Skeleton cards appear                       │
│ • "Finding recommendations..."                │
│ • Spinner + stages                            │
│ • Shimmer animation                           │
└────────────────────────────────────────────────┘
           ↓ (results received)
┌────────────────────────────────────────────────┐
│        [RESULTS - Journey Intelligence]      │
│ • 3 recommendations shown                     │
│ • Each shows:                                 │
│   - Destination name                          │
│   - Match % (e.g., 78%)                      │
│   - Photo                                     │
│   - Traveler count                            │
│ • User can:                                   │
│   - Tap to explore [→ MAP]                   │
│   - Save [→ SAVE_STATE]                      │
│   - Try vibe matching [→ VIBE_STATE]         │
│   - Upload another [→ IDLE]                  │
└────────────────────────────────────────────────┘
```

**State Transitions**:

```typescript
type UploadState =
  | 'idle'
  | 'validation'
  | 'uploading'
  | 'error_invalid_file'
  | 'error_network'
  | 'error_server'
  | 'success'
  | 'loading_results'
  | 'results_loaded'
  | 'error_no_results';

interface UploadMachine {
  state: UploadState;
  progress: number; // 0-100%
  photoUrl: string;
  errorMessage?: string;
  results?: Recommendation[];

  actions: {
    selectPhoto: (file: File) => void;
    cancel: () => void;
    retry: () => void;
    advanceToResults: () => void;
  };
}

// Timeouts
export const UPLOAD_TIMEOUTS = {
  success_to_results: 3000,      // 3 sec
  loading_results_max: 30000,    // 30 sec (then error)
  no_results_timeout: 5000,      // Show error
};

// Progress stages
export const UPLOAD_STAGES = [
  { name: 'Reading photo', percent: 10 },
  { name: 'Extracting location', percent: 30 },
  { name: 'Analyzing vibe', percent: 70 },
  { name: 'Finding places', percent: 100 },
];
```

---

## Part 4: Vibe Matching Flow

### Explore similar aesthetic experiences

```
┌────────────────────────────────────────────────┐
│        [IDLE - Vibe Selector Ready]           │
│ • Show 8 vibe buttons                         │
│ • Each with example image                     │
│ • User selects one vibe                       │
│ • Or: uses previous photo as reference       │
└────────────────────────────────────────────────┘
           ↓ (select vibe or upload photo)
┌────────────────────────────────────────────────┐
│        [LOADING_VIBE_RESULTS]                 │
│ • Show skeleton results                       │
│ • "Finding {vibe} places..."                  │
│ • Progress bar                                │
└────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────┐
│        [VIBE_RESULTS_LOADED]                  │
│ • 8-12 results shown                          │
│ • Filter by:                                  │
│   - Distance (nearby first)                   │
│   - Type (cafe, gallery, etc)                │
│   - Vibes (multiple selection)                │
│ • Each result shows:                          │
│   - Photo                                     │
│   - Name                                      │
│   - Vibes (badges)                            │
│   - Match % (e.g., 89%)                      │
└────────────────────────────────────────────────┘
           ↓
     User actions:
     • Tap result → [MAP_VIEW_SINGLE]
     • Save → [SAVE_STATE]
     • Change filter → [FILTERING]
     • Change vibe → back to [VIBE_SELECTOR]
     • Share → [SHARE_STATE]
```

---

## Part 5: Saving & MAP BOX Flow

### Build personal journey collection

```
┌────────────────────────────────────────────────┐
│        [DESTINATION_DETAIL]                   │
│ • See full destination info                   │
│ • Photo, reviews, vibes, location            │
│ • [Save to MAP BOX] button                   │
└────────────────────────────────────────────────┘
           ↓ (click Save)
┌────────────────────────────────────────────────┐
│        [SAVING]                               │
│ • Button changes to "Saving..."               │
│ • Network request                             │
│ • Brief loading state                         │
└────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────┐
│        [SAVED]                                │
│ • Button changes to "Saved ✓"                │
│ • Toast: "Added to MAP BOX"                  │
│ • Option to share                             │
│ • Option to undo                              │
└────────────────────────────────────────────────┘

MAP BOX Interactions:
┌────────────────────────────────────────────────┐
│        [MAP_BOX_HOME]                         │
│ • "My Journeys" list                          │
│ • Each shows:                                 │
│   - Cover photo from first saved place       │
│   - Number of places: "12 places"            │
│   - Journey name (editable)                   │
│   - Last modified date                        │
│ • Actions:                                    │
│   - View journey [→ JOURNEY_DETAIL]          │
│   - Edit name [→ EDIT_JOURNEY_NAME]          │
│   - Share [→ SHARE_JOURNEY]                  │
│   - Delete [→ CONFIRM_DELETE]                │
└────────────────────────────────────────────────┘

Journey Detail View:
┌────────────────────────────────────────────────┐
│        [JOURNEY_DETAIL]                       │
│ • Map view with all saved places              │
│ • List view of places                         │
│ • Stats:                                      │
│   - Total places                              │
│   - Districts covered                         │
│   - Vibes represented                         │
│   - Time to explore all                       │
│ • Each place card shows:                      │
│   - Position on journey (1, 2, 3...)         │
│   - Photo                                     │
│   - Name                                      │
│   - How to get there (next: 5 min walk)      │
│   - Option to remove                          │
└────────────────────────────────────────────────┘
```

---

## Part 6: Error Recovery State Machine

### Handling failures gracefully

```
┌────────────────────────────────────────────────┐
│        [OPERATION_FAIL]                       │
│ Error detected (network, server, validation)  │
└────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────┐
│        [ERROR_STATE]                          │
│ • Error message (user-friendly)               │
│ • Icon appropriate to error                   │
│ • Suggestion to recover                       │
│                                               │
│ Example errors:                               │
│ • "Can't reach server" (network)             │
│ • "Photo too large" (validation)             │
│ • "Location not available" (GPS)             │
│ • "Try again in a moment" (rate limited)    │
└────────────────────────────────────────────────┘
           ↓
     Recovery options:
     • [Retry] → Back to previous state
     • [Alternative] → Different approach
     • [Skip] → Skip this step
     • [Help] → Contact support
     • [Cancel] → Return to home

Examples:

NETWORK ERROR:
  Message: "Connection lost"
  Suggestion: "Check your internet"
  Options: [Retry] [Use without location]

GPS EXTRACTION ERROR:
  Message: "Couldn't find your location"
  Suggestion: "Add location manually"
  Options: [Retry] [Add manually] [Skip GPS]

SERVER ERROR (5xx):
  Message: "Something went wrong"
  Suggestion: "We're working on it. Try again?"
  Options: [Retry] [Try later] [Contact us]

RATE LIMITED (429):
  Message: "Whoa, slow down!"
  Suggestion: "Too many requests. Try again in 30 sec"
  Options: [Retry] [Cancel]

FILE ERROR:
  Message: "Photo too large (max 50MB)"
  Suggestion: "Try a different photo"
  Options: [Retry] [Choose another] [Compress]
```

---

## Part 7: System Health States

### App-wide state management

```yaml
System States:
  HEALTHY:
    API: Responding < 200ms
    Database: All systems operational
    GPS Service: 95%+ success
    AI Engine: All models loaded
    UI: Smooth 60fps
    Action: Normal operation

  DEGRADED:
    GPS Service: 80% success (one region slow)
    API: Responding 200-500ms
    Database: Slow queries detected
    AI Engine: One model slow, others fast
    UI: 45-55fps (slight jank)
    Action: Show warnings, suggest alternatives

  UNHEALTHY:
    Multiple failures
    API: Timeouts > 5s
    Database: Connection failures
    GPS: < 50% success
    UI: < 30fps
    Action: Show error page, disable features

  OFFLINE:
    No internet connection
    Action: Show cached content, queue actions
    Message: "You're offline - changes will sync when online"
```

**Implementation**:

```typescript
type SystemHealth = 'healthy' | 'degraded' | 'unhealthy' | 'offline';

interface SystemState {
  health: SystemHealth;
  api_latency: number;
  gps_success_rate: number;
  database_status: 'ok' | 'slow' | 'error';
  ui_fps: number;
  last_check: number;
  timestamp: number;
}

// Health check runs every 30 seconds
export const checkSystemHealth = async (): Promise<SystemHealth> => {
  const apiLatency = await measureApiLatency();
  const gpsRate = await getGpsSuccessRate();
  const dbStatus = await checkDatabase();

  if (apiLatency < 200 && gpsRate > 0.95 && dbStatus === 'ok') {
    return 'healthy';
  } else if (apiLatency < 500 && gpsRate > 0.80) {
    return 'degraded';
  } else {
    return 'unhealthy';
  }
};

// UI reacts to health status
export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>('healthy');

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await checkSystemHealth();
      setHealth(status);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return health;
}

// Show warnings based on health
export function SystemHealthBanner() {
  const health = useSystemHealth();

  if (health === 'healthy') return null;

  return (
    <div className={cn(
      'banner',
      health === 'degraded' && 'bg-yellow-500',
      health === 'unhealthy' && 'bg-red-500'
    )}>
      {health === 'degraded' && (
        'The app is running slower than usual. Results may take longer to load.'
      )}
      {health === 'unhealthy' && (
        'Something is wrong. Please try again in a few minutes.'
      )}
    </div>
  );
}
```

---

## Part 8: Notification State Machine

### Push notification delivery flow

```
┌────────────────────────────────────────────────┐
│   [NOTIFICATION_TRIGGERED]                    │
│ • Event fires: new destination nearby         │
│ • Or: friend uploaded photo                   │
│ • Or: trending place in your district         │
└────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────┐
│   [CHECKING_NOTIFICATION_SETTINGS]             │
│ • User disabled notifications?                │
│ • User enabled "during hours only"?           │
│ • Notification window open?                   │
│ • Should send silent notification?            │
└────────────────────────────────────────────────┘
           ↓ (pass all checks)
┌────────────────────────────────────────────────┐
│   [SENDING]                                   │
│ • Create notification payload                 │
│ • Send to push service (APNs, FCM)           │
│ • Log sent notification                       │
└────────────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────────────┐
│   [DELIVERED]                                 │
│ • Device receives notification                │
│ • Badge count increased                       │
│ • Sound/vibration triggered                   │
└────────────────────────────────────────────────┘
           ↓
     User action:
     • Taps notification → [APP_OPENED_FROM_NOTIFICATION]
     • Dismisses → [NOTIFICATION_DISMISSED]
     • Ignores → stays in notification center
```

---

## Part 9: Complete State Diagram (Simple View)

```
                    [START]
                      ↓
            [UNAUTHENTICATED]
             ↙              ↘
         [SIGNUP]        [DEMO]
             ↓
      [EMAIL_VERIFY]
             ↓
     [ONBOARDING_1-3]
             ↓
      [AUTHENTICATED]
       ↙         ↙        ↘       ↘
    [UPLOAD]  [VIBE]    [EXPLORE]  [PROFILE]
       ↓         ↓          ↓          ↓
    [RESULTS] [RESULTS]  [MAP]     [SETTINGS]
       ↓         ↓          ↓          ↓
    [SAVE]     [SAVE]    [SAVE]     [LOGOUT]
       ↓         ↓          ↓
    [MAP_BOX] [MAP_BOX]  ← Loop back
```

---

*State Machine Patterns V7.0*
*Complete User Flow & System State Documentation*
*"Every state tells a story. Design them well."*
