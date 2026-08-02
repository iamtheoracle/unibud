/**
 * useMotion — consume the Motion Engine from React Context.
 *
 * Returns the MotionEngine instance injected by MotionProvider.
 * Throws if used outside a MotionProvider tree (fail-fast).
 *
 * Usage:
 *   const motion = useMotion();
 *   <motion.div transition={motion.spring('navigation')}>...</motion.div>
 *   const txnId = motion.createTransaction('Navigation');
 *   ...
 *   motion.cancelTransaction(txnId);
 */

import { useContext } from 'react';
import { MotionContext } from './MotionProvider';

export function useMotion() {
  const engine = useContext(MotionContext);
  if (!engine) {
    throw new Error('useMotion() must be used within a <MotionProvider>. Wrap the app with MotionProvider.');
  }
  return engine;
}

export default useMotion;