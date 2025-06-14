// components/SwipeNavigator.js
import { useSwipeable } from 'react-swipeable';
import { useNavigate, useLocation } from 'react-router-dom';

const routes = ['/chatboard', '/moments', '/connect', '/calls'];

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
    trackMouse: true
  });

  return (
    <div {...handlers} style={{ height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

export default SwipeNavigator;