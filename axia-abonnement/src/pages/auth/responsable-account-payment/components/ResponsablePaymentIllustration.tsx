import AuthIllustrationPanel from "../../components/AuthIllustrationPanel";
import NewsletterIllustration from "../../../../assets/undraw_newsletter-subscriber_plsr.svg";

export default function ResponsablePaymentIllustration() {
  return (
    <AuthIllustrationPanel
      illustration={NewsletterIllustration}
      alt="Paiement responsable"
      imageClassName="w-72"
    />
  );
}