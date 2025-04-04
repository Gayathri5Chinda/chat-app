
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import { SignupPage } from './pages/SignInPage';
import { LoginPage }from './pages/LoginPage';
import MainPage from './pages/MainPage';

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  </>
  );
};

export default App;