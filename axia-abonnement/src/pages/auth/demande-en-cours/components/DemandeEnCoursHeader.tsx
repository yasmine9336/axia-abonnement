import LogoAxia from "../../../../assets/logo-axia.svg";

export default function DemandeEnCoursHeader() {
  return (
    <div className="mb-8">
      <img src={LogoAxia} alt="AxiaAbonnement" className="h-20 mb-4" />

      <h1 className="text-3xl font-bold text-gray-900">Demande envoyée.</h1>

      <h2 className="text-3xl font-bold text-gray-900">
        En cours d'examen.
      </h2>

      <p className="text-gray-400 text-sm mt-3">
        Votre demande est en cours d'examen par l'administrateur.
      </p>
    </div>
  );
}