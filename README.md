# MyApp - React Native Task Management App

A production-level React Native application with offline-first architecture, intelligent sync, form validation using Formik + Yup, and persistent storage.

## ✨ Features

- ✅ **Offline-First**: Works seamlessly without internet
- ✅ **Automatic Sync**: Syncs when network is restored
- ✅ **Smart Validation**: Formik + Yup form validation
- ✅ **Optimistic Updates**: Instant UI feedback
- ✅ **Retry Logic**: Exponential backoff for failed operations
- ✅ **Type-Safe**: Full TypeScript implementation
- ✅ **Persistent**: Data survives app restart
- ✅ **Clean UI**: Intuitive interface with sync status indicators
- ✅ **Production-Ready**: Scalable architecture

## 🎯 All Requirements Met

### Functional Requirements
- ✅ **List Screen**: Display tasks with title, amount, created date, and sync status
- ✅ **Create Screen**: Form with Formik + Yup validation (required fields, valid numbers)
- ✅ **Edit Screen**: Modify pending tasks (SYNCED tasks are protected)
- ✅ **Offline Support**: Works completely without internet
- ✅ **Auto Sync**: Pending records sync automatically when network restored
- ✅ **Manual Retry**: Failed syncs can be manually retried

### Sync & Offline
- ✅ **Persist Locally**: AsyncStorage + Redux debounced persistence
- ✅ **Sync Status**: PENDING / SYNCED / FAILED tracking
- ✅ **Prevent Duplicates**: In-memory deduplication map
- ✅ **Network Handling**: NetInfo detects offline/online transitions

### Technical Stack
- ✅ **React Native + TypeScript**: Fully typed codebase
- ✅ **Redux Toolkit**: Modern state management
- ✅ **Redux Thunk**: Async operation handling
- ✅ **React Navigation**: Screen transitions
- ✅ **NetInfo**: Network detection
- ✅ **Formik + Yup**: Form validation
- ✅ **Custom Hooks**: Reusable logic
- ✅ **Reusable Components**: 6 UI components

---

## 🏗️ Architecture Overview

### Why Redux Toolkit + Thunk?

| Aspect | Thunk | Saga |
|--------|-------|------|
| Learning Curve | Low | Steep |
| Bundle Size | 2KB | 12KB |
| Complexity | Simple | Complex |
| Interview Context | ✅ Ideal | ❌ Overkill |

Thunk is perfect for this scope, allowing clean async logic without unnecessary complexity.

---

## 💾 Offline & Sync Strategy

### 1. Optimistic Updates
- User creates task → stored in Redux + AsyncStorage immediately
- Task appears in UI instantly
- Sync happens in background when online

### 2. Sync Queue
Operations waiting to sync are queued with metadata:
```typescript
SyncQueue {
  id: string,              // Unique operation ID
  taskId: string,          // Task being operated on
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  payload: Partial<Task>,  // Data to send to server
  retryCount: number,      // Failure tracking
}
```

### 3. Duplicate Prevention
In-memory deduplication map prevents simultaneous syncs for same task:
```typescript
const syncInProgressMap = new Map<string, Promise<void>>();

if (syncInProgressMap.has(taskId)) {
  continue; // Skip, already syncing
}
```

### 4. Retry with Exponential Backoff
```
Failed sync → Wait 2s → Retry 1
Failed sync → Wait 4s → Retry 2
Failed sync → Wait 8s → Retry 3
Failed sync → Mark FAILED (user can manually retry)
```

### 5. Auto-Sync on Network Restore
Custom hook detects offline → online transition:
```typescript
useSyncOnNetworkRestore() {
  if (wasOffline && nowOnline) {
    dispatch(processSyncQueue());
  }
}
```

---

## 🧬 Key Design Decisions

### Why Soft Deletes?
```typescript
// Local: mark deleted immediately
task.isDeleted = true;
task.syncStatus = 'PENDING';

// Server sync: then hard delete
await api.deleteTask(id);
```
User sees feedback instantly, survives network failure, enables undo.

### Why Prevent Editing Synced Tasks?
Synced tasks represent server truth. Forcing new edits to go through server prevents sync complexity and conflicts.

### Why Storage Abstraction?
```typescript
export const getStorageAdapter = (): StorageAdapter => {
  return mmkvAdapter || asyncStorageAdapter;
};
```
Easy to swap MMKV for AsyncStorage, test with mocks, or upgrade later.

---

## 📡 Network Detection

Uses `@react-native-community/netinfo`:
```typescript
NetInfo.addEventListener((state) => {
  dispatch(updateNetworkState({
    isConnected: state.isConnected,
    type: state.type,
    isInternetReachable: state.isInternetReachable
  }));
});
```

Captures both connection AND internet reachability (wifi without internet).

---

## 🧪 Testing Checklist

### Offline Flow
- [ ] Create task offline → stored locally with PENDING status
- [ ] Go online → auto-syncs
- [ ] Status changes to SYNCED

### Edit Behavior
- [ ] PENDING tasks → editable
- [ ] SYNCED tasks → show warning, not editable
- [ ] Changes save locally, sync when online

### Network Changes
- [ ] Offline banner appears when disconnected
- [ ] Auto-sync triggers on reconnect
- [ ] No sync triggered while offline

### Error Handling
- [ ] Invalid form → validation errors shown
- [ ] Failed sync → FAILED status
- [ ] Manual retry button → retries failed sync
- [ ] Max retries exceeded → permanent failure

---

## 📊 Redux State Structure

```typescript
{
  tasks: {
    items: Record<string, Task>,      // All tasks by ID
    loading: boolean,
    error: string | null
  },
  sync: {
    queue: Record<string, SyncQueue>,  // Pending ops
    isSyncing: boolean,
    lastSyncTime: number | null,
    syncError: string | null
  },
  network: {
    isConnected: boolean,
    type: NetworkType,
    isInternetReachable: boolean | null
  }
}
```

---

## 🎯 Interview Talking Points

1. **Offline-First is Different**
   - Not just "cache data", but orchestrate sync intelligently
   - User sees instant feedback, server eventually consistent

2. **Race Conditions Matter**
   - Duplicate sync prevention via Map
   - Sequential processing prevents conflicts
   - Single source of truth in Redux

3. **Error Classification**
   - Retryable (500+, timeout, network) → retry with backoff
   - Non-retryable (400, 401) → mark failed permanently

4. **Optimistic Updates**
   - Better UX for offline-first
   - Works because we control retry logic
   - Rollback on permanent failure

5. **Type Safety Throughout**
   - Redux types prevent mistakes
   - Service layer types prevent bugs
   - Component props fully typed

---

## 🚀 Quick Start

```bash
# Install
npm install

# Environment
cp .env.example .env
# Update API_BASE_URL in .env

# Run
npm start
npx react-native run-android

# See offline by toggling Android developer options
```

---

## 📝 Example Commits

```
feat(offline): implement offline-first redux architecture
- Add tasks, sync, network slices
- Create SyncQueue for pending operations
- Implement optimistic updates

feat(sync): add intelligent sync with retry logic
- Exponential backoff for failed syncs
- In-memory deduplication Map
- Error classification (retryable vs permanent)

feat(ui): create task screens and components
- TaskListScreen with sync status
- CreateTaskScreen with validation
- EditTaskScreen with edit prevention
- Reusable components (TaskCard, FormInput, etc)

feat(network): add offline detection and auto-sync
- useNetworkListener hook
- useSyncOnNetworkRestore hook
- NetworkIndicator component

docs: add comprehensive architecture guide
- Design decisions explained
- Data flow diagrams
- Testing strategy
```

---

## 📚 Architecture Files

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed design decisions, data flow, testing strategy
- **.env.example** - Environment configuration template
- **src/types/** - Domain types (Task, SyncQueue, etc)
- **src/store/** - Redux slices and thunks
- **src/services/** - API and storage layer
- **src/hooks/** - Network listener, sync triggers
- **src/screens/** - UI screens
- **src/components/** - Reusable UI components

---

## ✨ Production-Ready Features

✅ Proper error handling (retryable vs permanent)
✅ Exponential backoff for retries
✅ Duplicate sync prevention
✅ Storage abstraction (swap implementations)
✅ Type-safe throughout
✅ No anti-patterns (no prop drilling, no magic numbers)
✅ No console logs
✅ Clean separation of concerns
✅ Comprehensive documentation

---

## 📋 Form Validation with Formik + Yup

Both Create and Edit screens use the same validation schema:

```typescript
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must be 100 characters or less'),
  amount: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a valid number')
    .positive('Amount must be a positive number')
    .max(999999.99, 'Amount is too large'),
});
```

**Features:**
- Touch-aware error display (errors show only after blur)
- Real-time validation feedback
- Type-safe with TypeScript
- Cleaner code than manual validation

## 🔧 Alert Issue Fix

**Problem**: "Tried to show an alert while not attached to an Activity"

**Solution**: Alerts are shown with 100ms delay to ensure the component is still mounted:

```typescript
setTimeout(() => {
  Alert.alert('Success', 'Task created. It will sync when online.', [
    {
      text: 'OK',
      onPress: () => {
        navigation.goBack();
      },
    },
  ]);
}, 100);
```

Applied to:
- `CreateTaskScreen.tsx` - Success and error alerts
- `EditTaskScreen.tsx` - Success, error, and "No Changes" alerts

## 📚 Key Implementation Details

### Persistence
- Redux store auto-saves to AsyncStorage every 500ms (debounced)
- On app startup, all data is restored from AsyncStorage
- Prevents loss of data on app restart or crash

### Validation
- Formik manages form state efficiently
- Yup schemas provide schema-driven validation
- Errors display only after field blur (better UX)

### Sync
- Operations processed sequentially to maintain order
- Exponential backoff prevents server overload
- Failed operations marked FAILED after 3 retries
- Manual retry button available in TaskListScreen

## 🚀 Installation & Setup

```bash
# Install dependencies (includes formik and yup)
npm install

# Run the app
npm start

# On Android
npm run android

# On iOS
npm run ios
```

**Interview-Ready Implementation**
