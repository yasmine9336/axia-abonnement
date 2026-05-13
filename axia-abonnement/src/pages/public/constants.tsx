import { BarChart3, Shield, Zap } from "lucide-react";

export const heroFeatures = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Rapide & Intuitif",
    description:
      "Interface pensée pour tous : abonnez-vous ou gérez vos clients en quelques clics.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sécurisé & Fiable",
    description:
      "Vos données et paiements protégés avec un chiffrement de niveau bancaire.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analyses & Alertes",
    description:
      "Tableaux de bord intelligents pour clients et responsables, avec alertes automatiques.",
  },
];

export const offreCardClass =
  "relative rounded-2xl p-8 flex flex-col shrink-0 w-80 border border-gray-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 justify-between";