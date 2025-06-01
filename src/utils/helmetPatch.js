/**
 * Helmet Patch
 * 
 * This module provides a function to patch the react-helmet-async library
 * to use modern lifecycle methods instead of deprecated ones.
 */

// Function to patch the SideEffect component
export function patchSideEffect(SideEffect) {
  if (!SideEffect || typeof SideEffect !== 'function') {
    console.warn('Cannot patch SideEffect: not a function');
    return SideEffect;
  }
  
  // Create a patched version of SideEffect
  const PatchedSideEffect = (WrappedComponent) => {
    // Get the original component
    const OriginalComponent = SideEffect(WrappedComponent);
    
    // Create a new component with modern lifecycle methods
    class ModernComponent extends OriginalComponent {
      constructor(props) {
        super(props);
        
        // Initialize state here instead of in componentWillMount
        if (this.componentWillMount) {
          // Save the original method
          this._originalComponentWillMount = this.componentWillMount;
          
          // Remove the deprecated method
          this.componentWillMount = undefined;
          
          // Call the original method in the constructor
          if (typeof this._originalComponentWillMount === 'function') {
            this._originalComponentWillMount.call(this);
          }
        }
      }
      
      // Use componentDidMount instead of componentWillMount
      componentDidMount() {
        // Call the original componentDidMount if it exists
        if (super.componentDidMount) {
          super.componentDidMount();
        }
        
        // Call the original componentWillMount if it wasn't called in the constructor
        if (this._originalComponentWillMount && !this._willMountCalled) {
          this._originalComponentWillMount.call(this);
          this._willMountCalled = true;
        }
      }
    }
    
    // Copy static properties
    if (OriginalComponent.displayName) {
      ModernComponent.displayName = `Patched(${OriginalComponent.displayName})`;
    }
    
    return ModernComponent;
  };
  
  return PatchedSideEffect;
}