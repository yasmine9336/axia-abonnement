import AuthHeader from "../../components/AuthHeader";

export default function DemandeEnCoursHeader() {
  return (
    <AuthHeader
      title="Demande envoyée."
      subtitle="En cours d'examen."
      description="Votre demande est en cours d'examen par l'administrateur."
    />
  );
}