import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  // StrictMode 가 dev 모드에서 useEffect 를 2회 호출하는데,
  // 1차에서 navigate('/') 로 URL 이 바뀌면 2차에서는 token 을 못 찾아 /login 으로 튕긴다.
  // ref 가드로 한 번만 실행되게 막는다.
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      useAuthStore.getState().setToken(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-700 text-lg">로그인 중...</p>
    </div>
  );
}
