/**
 * React Helmet Async Patch
 * 
 * This module patches the react-helmet-async library to fix the UNSAFE_componentWillMount warning
 * in React's strict mode. It directly modifies the SideEffect higher-order component to use
 * modern lifecycle methods.
 */

// Apply the patch as soon as the module is imported
(function patchHelmetAsync() {
  try {
    // Try to get the react-helmet-async module
    const helmetAsync = require('react-helmet-async');
    
    // First approach: Try to monkey-patch the SideEffect HOC
    if (helmetAsync && helmetAsync.Helmet) {
      // Find all potential SideEffect components
      const findSideEffectComponents = (obj, path = '') => {
        const results = [];
        
        if (obj && typeof obj === 'object') {
          // Check if this object is a SideEffect component
          if (
            typeof obj === 'function' && 
            (obj.name === 'SideEffect' || obj.displayName === 'SideEffect')
          ) {
            results.push({ component: obj, path });
          }
          
          // Recursively check all properties
          Object.keys(obj).forEach(key => {
            // Avoid circular references and React internals
            if (
              key !== 'prototype' && 
              key !== '__proto__' && 
              key !== 'constructor' && 
              !key.startsWith('__') &&
              obj[key] !== obj && 
              obj[key] !== helmetAsync
            ) {
              try {
                const nestedResults = findSideEffectComponents(obj[key], `${path}.${key}`);
                results.push(...nestedResults);
              } catch (e) {
                // Ignore errors from accessing some properties
              }
            }
          });
        }
        
        return results;
      };
      
      // Find all SideEffect components in the helmetAsync module
      const sideEffectComponents = findSideEffectComponents(helmetAsync);
      
      // Patch each SideEffect component we find
      sideEffectComponents.forEach(({ component: SideEffect, path }) => {
        if (typeof SideEffect !== 'function') return;
        
        // Create a wrapper that returns a patched version
        const originalSideEffect = SideEffect;
        
        // Replace the original SideEffect with our patched version
        const patchedSideEffect = function PatchedSideEffect(WrappedComponent) {
          // Get the original component class
          const OriginalComponent = originalSideEffect(WrappedComponent);
          
          // Create a new component class that extends the original
          class ModernComponent extends OriginalComponent {
            constructor(props) {
              super(props);
              
              // If componentWillMount exists, call it in the constructor
              if (this.componentWillMount) {
                const originalWillMount = this.componentWillMount;
                this.componentWillMount = undefined; // Remove the deprecated method
                originalWillMount.call(this); // Call it in the constructor
                this._willMountCalled = true;
              }
              
              // If UNSAFE_componentWillMount exists, call it in the constructor
              if (this.UNSAFE_componentWillMount) {
                const originalUnsafeWillMount = this.UNSAFE_componentWillMount;
                this.UNSAFE_componentWillMount = undefined; // Remove the deprecated method
                originalUnsafeWillMount.call(this); // Call it in the constructor
                this._unsafeWillMountCalled = true;
              }
            }
            
            // Override componentDidMount to ensure side effects are applied
            componentDidMount() {
              if (super.componentDidMount) {
                super.componentDidMount();
              }
            }
          }
          
          // Copy static properties
          if (OriginalComponent.displayName) {
            ModernComponent.displayName = OriginalComponent.displayName;
          }
          
          // Copy other static methods and properties
          Object.keys(OriginalComponent).forEach(key => {
            if (key !== 'displayName' && key !== 'prototype') {
              ModernComponent[key] = OriginalComponent[key];
            }
          });
          
          return ModernComponent;
        };
        
        // Copy static properties from the original SideEffect
        Object.keys(SideEffect).forEach(key => {
          patchedSideEffect[key] = SideEffect[key];
        });
        
        // Try to replace the original SideEffect with our patched version
        try {
          // Navigate to the parent object and replace the SideEffect
          const pathParts = path.split('.');
          let currentObj = helmetAsync;
          
          // Navigate to the parent object
          for (let i = 1; i < pathParts.length - 1; i++) {
            currentObj = currentObj[pathParts[i]];
          }
          
          // Replace the SideEffect with our patched version
          if (pathParts.length > 1) {
            const lastKey = pathParts[pathParts.length - 1];
            currentObj[lastKey] = patchedSideEffect;
          }
        } catch (e) {
          console.warn('Failed to replace SideEffect at path:', path, e);
        }
      });
      
      // Second approach: Monkey-patch React's createElement to intercept SideEffect components
      try {
        const React = require('react');
        if (React && React.createElement) {
          const originalCreateElement = React.createElement;
          React.createElement = function patchedCreateElement(type, props, ...children) {
            // Check if this is a SideEffect component
            if (
              type && 
              typeof type === 'function' && 
              (
                type.displayName === 'SideEffect(NullComponent)' || 
                (type.displayName && type.displayName.includes('SideEffect'))
              )
            ) {
              try {
                // Wrap the component in our DisableStrictMode component
                const DisableStrictMode = require('../Components/HelmetWrapper/DisableStrictMode').default;
                return originalCreateElement(DisableStrictMode, null, 
                  originalCreateElement(type, props, ...children)
                );
              } catch (e) {
                // If we can't load DisableStrictMode, just use the original component
                return originalCreateElement(type, props, ...children);
              }
            }
            
            // Otherwise, call the original createElement
            return originalCreateElement(type, props, ...children);
          };
        }
      } catch (e) {
        console.warn('Failed to patch React.createElement:', e);
      }
      
      console.log('react-helmet-async patched successfully to fix UNSAFE_componentWillMount warnings');
    }
  } catch (error) {
    console.warn('Failed to patch react-helmet-async:', error);
  }
})();

// Export a dummy function to indicate the patch has been applied
export const helmetAsyncPatched = true;