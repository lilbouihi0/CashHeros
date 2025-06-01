import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';

/**
 * Page transition component for smooth transitions between routes
 */
const PageTransition = ({
  children,
  timeout = 300,
  classNames = {
    enter: styles.enter,
    enterActive: styles.enterActive,
    exit: styles.exit,
    exitActive: styles.exitActive,
  },
  onEnter,
  onEntered,
  onExit,
  onExited,
}) => {
  const location = useLocation();
  const nodeRef = useRef(null);
  const prevPathRef = useRef(location.pathname);
  const [state, setState] = React.useState('entered');
  const [currentChildren, setCurrentChildren] = React.useState(children);

  // Handle route changes
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      // Start exit animation
      setState('exiting');
      if (onExit) onExit();

      // After exit animation, update children and start enter animation
      const exitTimer = setTimeout(() => {
        setState('entering');
        setCurrentChildren(children);
        prevPathRef.current = location.pathname;
        if (onExited) onExited();
        if (onEnter) onEnter();

        // After enter animation, set state to entered
        const enterTimer = setTimeout(() => {
          setState('entered');
          if (onEntered) onEntered();
        }, timeout);

        return () => clearTimeout(enterTimer);
      }, timeout);

      return () => clearTimeout(exitTimer);
    }
  }, [children, location.pathname, onEnter, onEntered, onExit, onExited, timeout]);

  // Determine current class based on state
  const getClassName = () => {
    switch (state) {
      case 'entering':
        return `${classNames.enter || ''} ${classNames.enterActive || ''}`;
      case 'exiting':
        return `${classNames.exit || ''} ${classNames.exitActive || ''}`;
      default:
        return '';
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`${styles.pageTransition} ${getClassName()}`}
      style={{ '--transition-timeout': `${timeout}ms` }}
    >
      {currentChildren}
    </div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  timeout: PropTypes.number,
  classNames: PropTypes.shape({
    enter: PropTypes.string,
    enterActive: PropTypes.string,
    exit: PropTypes.string,
    exitActive: PropTypes.string,
  }),
  onEnter: PropTypes.func,
  onEntered: PropTypes.func,
  onExit: PropTypes.func,
  onExited: PropTypes.func,
};

export default PageTransition;