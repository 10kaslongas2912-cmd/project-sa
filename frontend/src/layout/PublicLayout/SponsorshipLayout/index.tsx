import { Outlet, useParams } from 'react-router-dom';
import { SponsorshipProvider, clearSponsorshipPersisted } from '../../../hooks/sponsorship/useSponsorship';
import { useEffect } from 'react';
import { clearSponsorFormPersisted } from '../../../hooks/sponsorship/useSponsorForm';

const SponsorFlowLayout: React.FC = () => {
  const { id } = useParams();
  const dogId = id ? Number(id) : null;

  // 🧹 เคลียร์ทั้งสองก้อนเมื่อ layout unmount (ออกจาก /sponsor/:id/*)
  useEffect(() => {
    return () => {
      clearSponsorshipPersisted(dogId);
      clearSponsorFormPersisted(dogId);
    };
  }, [dogId]);

  return (
    <SponsorshipProvider dogId={dogId}>
      <Outlet />
    </SponsorshipProvider>
  );
};

export default SponsorFlowLayout;
