import AuthIllustrationPanel from "../../components/AuthIllustrationPanel";
import NewsletterIllustration from "../../../../assets/undraw_newsletter-subscriber_plsr.svg";

export default function DemandeEnCoursIllustration() {
  return (
    <AuthIllustrationPanel
      illustration={NewsletterIllustration}
      alt="Demande en cours"
      imageClassName="w-72"
    />
  );
}