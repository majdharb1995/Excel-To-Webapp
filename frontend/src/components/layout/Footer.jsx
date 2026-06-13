import { useAppContext } from '../../context/AppContext';

export default function Footer() {
  const { t } = useAppContext();
  return (
    <footer className="footer">
      {t('footer.text')}
    </footer>
  );
}
