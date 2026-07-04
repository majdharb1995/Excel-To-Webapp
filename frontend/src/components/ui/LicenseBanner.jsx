import { useAppContext } from '../../context/AppContext';

export default function LicenseBanner() {
  const { licenseStatus, daysRemaining, t } = useAppContext();

  if (licenseStatus !== 'active') return null;

  return (
    <div className="license-banner">
      ✅ {t('license.banner.active')} — <strong>{t('license.daysRemaining', { days: daysRemaining })}</strong>
    </div>
  );
}