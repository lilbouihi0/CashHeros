# React Router Update Guide

This document explains the changes made to address React Router warnings and resource preloading issues.

## Changes Made

### 1. React Router Future Flags

React Router v7 will introduce breaking changes, and we've opted into the new behavior early by enabling future flags:

- `v7_startTransition`: React Router will wrap state updates in `React.startTransition` for better performance
- `v7_relativeSplatPath`: Changes how relative paths are resolved within splat routes

These flags were added to the `<BrowserRouter>` component in `App.js`.

### 2. Resource Preloading Optimization

We've optimized the resource preloading in `index.html` to address the warning:

> The resource was preloaded using link preload but not used within a few seconds from the window's load event.

- Removed preloading of JavaScript files that aren't immediately needed
- Kept preloading only for critical CSS and fonts
- Maintained prefetching for assets that will be needed soon but not immediately

### 3. Updated Dependencies

We've updated the React Router DOM dependency to the latest v6 version:

```json
"react-router-dom": "^6.22.0"
```

## How to Apply These Changes

1. Install the updated dependencies:

```bash
cd CashHeros
npm install
```

2. Start the development server:

```bash
npm run start
```

## Future Considerations

When React Router v7 is released, we should:

1. Review the migration guide
2. Remove the future flags (as they'll be the default behavior)
3. Update any code that might be affected by the breaking changes

## References

- [React Router v6 Future Flags Documentation](https://reactrouter.com/v6/upgrading/future)
- [React Router v7 Migration Guide](https://reactrouter.com/v6/upgrading/v7)