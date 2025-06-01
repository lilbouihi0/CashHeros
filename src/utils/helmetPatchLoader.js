/**
 * Webpack loader to patch react-helmet-async
 */
module.exports = function(source) {
  // Replace componentWillMount with UNSAFE_componentWillMount
  let patchedSource = source.replace(
    /componentWillMount\(\)/g,
    'UNSAFE_componentWillMount()'
  );
  
  // Add a componentDidMount method that calls the same code
  patchedSource = patchedSource.replace(
    /UNSAFE_componentWillMount\(\) {([^}]*)}/g,
    function(match, p1) {
      return `UNSAFE_componentWillMount() {${p1}} 
      componentDidMount() { 
        // Added by helmet-patch-loader
        ${p1}
      }`;
    }
  );
  
  return patchedSource;
};