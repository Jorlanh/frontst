import { NavigationProvider } from './contexts/NavigationContext';
import { UIProvider } from './contexts/UIContext';
import { UserProvider } from './contexts/UserContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { PracticeProvider } from './contexts/PracticeContext';
import { MockProvider } from './contexts/MockContext';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <NavigationProvider>
      <UIProvider>
        <UserProvider>
          <GamificationProvider>
            <PracticeProvider>
              <MockProvider>
                <AppRouter />
              </MockProvider>
            </PracticeProvider>
          </GamificationProvider>
        </UserProvider>
      </UIProvider>
    </NavigationProvider>
  );
}