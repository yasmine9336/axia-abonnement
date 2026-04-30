import { BarChart3, Shield, Zap } from "lucide-react";

export const heroFeatures = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Ultra Rapide",
    description:
      "Mises à jour instantanées et synchronisation en temps réel sur tous vos appareils",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sécurisé & Privé",
    description:
      "Chiffrement bancaire pour protéger vos données en toute sécurité",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analyses IA",
    description:
      "Insights intelligents pour optimiser et économiser sur vos abonnements",
  },
];

export const offreCardClass =
  "relative rounded-2xl p-8 flex flex-col shrink-0 w-80 border border-gray-200 bg-white hover:shadow-md transition-all duration-300 justify-between";