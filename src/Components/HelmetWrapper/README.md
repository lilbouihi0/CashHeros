# Helmet Wrapper Components

This directory contains components that wrap `react-helmet-async` to fix the `UNSAFE_componentWillMount` warnings in React's strict mode.

## Components

### SafeHelmet

A safe wrapper for `react-helmet-async`'s `Helmet` component. It uses hooks instead of class lifecycle methods and ensures that the component only renders on the client side.

```jsx
import SafeHelmet from './Components/HelmetWrapper/SafeHelmet';

function MyComponent() {
  return (
    <SafeHelmet>
      <title>My Page Title</title>
      <meta name="description" content="My page description" />
    </SafeHelmet>
  );
}
```

### HelmetWrapper

A wrapper for `SafeHelmet` that adds additional safety features, including disabling strict mode warnings.

```jsx
import HelmetWrapper from './Components/HelmetWrapper/HelmetWrapper';

function MyComponent() {
  return (
    <HelmetWrapper>
      <title>My Page Title</title>
      <meta name="description" content="My page description" />
    </HelmetWrapper>
  );
}
```

### ModernHelmet

A modern replacement for `react-helmet-async`'s `Helmet` component. It uses hooks instead of class lifecycle methods and implements a functional equivalent of the SideEffect pattern.

```jsx
import ModernHelmet from './Components/HelmetWrapper/ModernHelmet';

function MyComponent() {
  return (
    <ModernHelmet>
      <title>My Page Title</title>
      <meta name="description" content="My page description" />
    </ModernHelmet>
  );
}
```

### HelmetProviderWrapper

A wrapper for `react-helmet-async`'s `HelmetProvider` component. It uses hooks instead of class lifecycle methods and ensures that the component only renders on the client side.

```jsx
import HelmetProviderWrapper from './Components/HelmetWrapper/HelmetProviderWrapper';

function App() {
  return (
    <HelmetProviderWrapper>
      <MyApp />
    </HelmetProviderWrapper>
  );
}
```

### HelmetSuppressor

A component that suppresses React Helmet warnings. It specifically targets and suppresses the `UNSAFE_componentWillMount` warnings from `react-helmet-async`'s `SideEffect(NullComponent)`.

```jsx
import HelmetSuppressor from './Components/HelmetWrapper/HelmetSuppressor';

function App() {
  return (
    <HelmetSuppressor>
      <MyApp />
    </HelmetSuppressor>
  );
}
```

### DisableStrictMode

A component that disables React's strict mode warnings for its children. It should be used sparingly and only for third-party components that cannot be updated.

```jsx
import DisableStrictMode from './Components/HelmetWrapper/DisableStrictMode';

function App() {
  return (
    <DisableStrictMode>
      <ThirdPartyComponent />
    </DisableStrictMode>
  );
}
```

### StrictModeSuppressionWrapper

A component that suppresses React StrictMode warnings for its children. It should be used sparingly and only for third-party components that cannot be updated.

```jsx
import StrictModeSuppressionWrapper from './Components/HelmetWrapper/StrictModeSuppressionWrapper';

function App() {
  return (
    <StrictModeSuppressionWrapper>
      <ThirdPartyComponent />
    </StrictModeSuppressionWrapper>
  );
}
```

## Utility Functions

### helmetAsyncPatch

A utility function that patches the `react-helmet-async` library to fix the `UNSAFE_componentWillMount` warning in React's strict mode. It directly modifies the `SideEffect` higher-order component to use modern lifecycle methods.

```jsx
import { helmetAsyncPatched } from './utils/helmetAsyncPatch';
```

### useDisableStrictMode

A hook that temporarily disables React's strict mode warnings. It should be used sparingly and only for components that cannot be updated.

```jsx
import useDisableStrictMode from './hooks/useDisableStrictMode';

function MyComponent() {
  useDisableStrictMode();
  
  return <div>My Component</div>;
}
```