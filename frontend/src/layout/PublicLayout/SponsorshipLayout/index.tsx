// src/layout/PublicLayout/SponsorshipLayout/index.tsx
import { Outlet, useParams } from 'react-router-dom';
import { SponsorshipProvider } from '../../../hooks/sponsorship/useSponsorship';

const SponsorFlowLayout: React.FC = () => {
  const { id } = useParams();
  const dogId = id ? Number(id) : null;
  return (
    <SponsorshipProvider dogId={dogId}>
      <Outlet />
    </SponsorshipProvider>
  );
};

export default SponsorFlowLayout;
