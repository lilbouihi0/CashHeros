/**
 * Babel plugin to transform react-helmet-async
 */
module.exports = function({ types: t }) {
  return {
    visitor: {
      // Find all instances of componentWillMount
      ClassMethod(path) {
        if (path.node.key.name === 'componentWillMount') {
          // Check if this is in a file related to react-helmet-async
          const filename = path.hub.file.opts.filename;
          if (filename && filename.includes('react-helmet-async')) {
            // Rename to UNSAFE_componentWillMount
            path.node.key.name = 'UNSAFE_componentWillMount';
            
            // Create a componentDidMount method that calls the same code
            const body = path.node.body;
            const didMountMethod = t.classMethod(
              'method',
              t.identifier('componentDidMount'),
              [],
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(
                      t.super(),
                      t.identifier('componentDidMount')
                    ),
                    []
                  )
                ),
                ...body.body
              ])
            );
            
            // Add the new method to the class
            const classPath = path.findParent(p => p.isClassDeclaration());
            if (classPath) {
              classPath.node.body.body.push(didMountMethod);
            }
          }
        }
      }
    }
  };
};