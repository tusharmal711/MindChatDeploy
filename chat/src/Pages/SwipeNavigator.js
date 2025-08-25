import { useSwipeable } from 'react-swipeable';
import { useNavigate, useLocation } from 'react-router-dom';

const routes = ['/chatboard', '/moments', '/connect', '/calls','/new-calls'];

const SwipeNavigator = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = routes.indexOf(location.pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < routes.length - 1) {
        navigate(routes[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(routes[currentIndex - 1]);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 80,      // 👈 minimum swipe distance in px (default is 10)
    velocity: 0.5   // 👈 minimum swipe speed (default is 0.3)
  });

  return (
    <div {...handlers} style={{ height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

export default SwipeNavigator;
