import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import MobilePageHeader from '../components/MobilePageHeader';
import { PAGE_SHELL } from '../components/Layout';

export default function Compose() {
  const navigate = useNavigate();

  return (
    <div className={PAGE_SHELL}>
      <MobilePageHeader title="New post" showLogo={false} onBack={() => navigate(-1)} />
      <CreatePost onPostCreated={() => navigate('/home')} />
    </div>
  );
}
