import { useLocation, useNavigate } from "react-router-dom";

import DemandeEnCoursHeader from "./components/DemandeEnCoursHeader";
import DemandeEnCoursContent from "./components/DemandeEnCoursContent";
import DemandeEnCoursIllustration from "./components/DemandeEnCoursIllustration";

export default function DemandeEnCours() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string } | null)?.email;

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-16 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <DemandeEnCoursHeader />

          <DemandeEnCoursContent
            email={email}
            onBackHome={() => navigate("/")}
          />
        </div>
      </div>

      <DemandeEnCoursIllustration />
    </div>
  );
}