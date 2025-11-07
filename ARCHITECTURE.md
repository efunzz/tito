# Tito App - Architecture Documentation

## 📂 Project Structure

```
tito/
├── App.tsx                 # Main app entry point
├── index.ts                # Expo entry
├── .env                    # Environment variables (NOT in git)
├── .env.example            # Template for environment variables
│
├── assets/                 # Images, icons, fonts
│
├── components/             # Reusable UI components
│   ├── BottomSheetModal.tsx
│   ├── CustomTabBar.tsx
│   ├── ExportDataModal.tsx
│   ├── HourlyRateModal.tsx
│   ├── MonthlyGoalModal.tsx
│   └── WorkHoursModal.tsx
│
├── screens/                # Screen components
│   ├── HomeScreen.tsx      # Clock in/out
│   ├── DetailsScreen.tsx   # Analytics & earnings
│   ├── ProfileScreen.tsx   # User profile & settings
│   ├── LoginScreen.tsx     # Authentication
│   └── SignupScreen.tsx    # Registration
│
├── constants/              # ✅ Centralized constants
│   ├── theme.ts           # Colors, spacing, typography
│   └── types.ts           # TypeScript type definitions
│
├── services/               # ✅ NEW: Business logic layer
│   ├── auth.service.ts    # Authentication operations
│   └── storage.service.ts # AsyncStorage wrapper
│
└── lib/                    # External service clients
    └── supabase.ts        # Supabase client config
```

---

## 🎯 Design Principles

### 1. **D.R.Y. (Don't Repeat Yourself)**
- ✅ **Colors**: Single source in `constants/theme.ts`
- ✅ **Types**: Centralized in `constants/types.ts`
- ✅ **Auth logic**: Wrapped in `services/auth.service.ts`
- ✅ **Storage logic**: Wrapped in `services/storage.service.ts`

### 2. **Separation of Concerns**
- **Components**: Only UI logic
- **Services**: Business logic & API calls
- **Constants**: Static data & types
- **Screens**: Composition of components

### 3. **Type Safety**
- TypeScript strict mode enabled
- All data structures typed
- Navigation types defined

---

## 🔧 Service Layer Pattern

### **Before (Not D.R.Y.):**
```typescript
// In ProfileScreen.tsx
const { data: { user }, error } = await supabase.auth.getUser();

// In LoginScreen.tsx
const { data, error } = await supabase.auth.signInWithPassword({...});

// In HomeScreen.tsx
const savedShifts = await AsyncStorage.getItem('shifts');
if (savedShifts) setShifts(JSON.parse(savedShifts));
```

**Problems:**
- Duplicate code in 3+ files
- Hard to test
- If Supabase API changes, update multiple files

### **After (D.R.Y.):**
```typescript
// In any screen
import { authService } from '../services/auth.service';
import { storageService } from '../services/storage.service';

const { user, error } = await authService.getCurrentUser();
const { session, error } = await authService.signIn(email, password);
const shifts = await storageService.getShifts();
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easy to test
- ✅ Change once, updates everywhere
- ✅ Better error handling

---

## 📖 How To Use Services

### **Auth Service**

```typescript
import { authService } from '../services/auth.service';

// Get current user
const { user, error } = await authService.getCurrentUser();

// Sign in
const { session, user, error } = await authService.signIn(email, password);

// Sign up
const { session, user, error } = await authService.signUp(email, password, {
  full_name: 'John Doe'
});

// Sign out
const { success, error } = await authService.signOut();

// OAuth
const { success, error } = await authService.signInWithOAuth('google');
```

### **Storage Service**

```typescript
import { storageService } from '../services/storage.service';

// Shifts
const shifts = await storageService.getShifts();
await storageService.saveShifts(shifts);
await storageService.addShift(newShift);

// Settings
const rate = await storageService.getHourlyRate();
await storageService.saveHourlyRate(20);

const goal = await storageService.getMonthlyGoal();
await storageService.saveMonthlyGoal(2000);

// Session state
const status = await storageService.getStatus();
await storageService.saveStatus('clocked-in');

const clockIn = await storageService.getCurrentClockIn();
await storageService.saveCurrentClockIn(new Date());
```

---

## 🎨 Theme System

All colors, spacing, and typography centralized in `constants/theme.ts`:

```typescript
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

// Use in StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.base,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
  },
});
```

---

## 🔐 Environment Variables

Using Expo's `EXPO_PUBLIC_` prefix for environment variables:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Access in code:
```typescript
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

**Security:**
- ✅ `.env` is in `.gitignore`
- ✅ `.env.example` is committed (template only)
- ✅ Anon key is safe to expose (RLS protects data)

---

## 📝 TypeScript Types

All shared types in `constants/types.ts`:

```typescript
import type { Shift, Status, UserSettings, WeekDay } from '../constants/types';
```

---

## 🚀 Future Improvements

### Phase 1: State Management (Next Task)
- [ ] Create React Context for shared state
- [ ] Implement ShiftsContext
- [ ] Implement SettingsContext
- [ ] Remove redundant AsyncStorage calls

### Phase 2: Cloud Sync
- [ ] Create Supabase tables for shifts
- [ ] Implement real-time sync
- [ ] Add offline support
- [ ] Backup user data to cloud

### Phase 3: Testing
- [ ] Setup Jest
- [ ] Unit tests for services
- [ ] Integration tests for screens
- [ ] E2E tests for critical flows

---

## 📚 Development Guidelines

### When Creating a New Screen:
1. Import theme: `import { COLORS } from '../constants/theme'`
2. Import types: `import type { Shift } from '../constants/types'`
3. Use services: `import { authService, storageService } from '../services'`
4. Add navigation types

### When Adding a New Feature:
1. Define types in `constants/types.ts`
2. Add business logic to appropriate service
3. Create/update screen components
4. Test thoroughly
5. Commit with conventional commit format

### Git Commit Format:
```
type(scope): subject

Examples:
feat(auth): add password reset functionality
fix(shifts): correct break time calculation
refactor(storage): migrate to service layer
docs: update architecture documentation
```

---

## 🎓 Learning Resources

- [React Navigation TypeScript](https://reactnavigation.org/docs/typescript/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [React Native Best Practices](https://github.com/jondot/awesome-react-native)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

**Last Updated:** 2025-11-07
**Version:** 1.0.0
**Maintainer:** efunzz
