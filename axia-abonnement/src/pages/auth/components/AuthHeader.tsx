import type { ReactNode } from "react";
import LogoAxia from "../../../assets/logo-axia.svg";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  description: ReactNode;
}

export default function AuthHeader({
  title,
  subtitle,
  description,
}: AuthHeaderProps) {
  return (
    <div className="mb-6">
      <img src={LogoAxia} alt="AxiaAbonnement" className="h-14 mb-2" />

      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
        {title}
      </h1>

      <h2 className="text-3xl font-bold text-gray-900">{subtitle}</h2>

      <p className="text-gray-400 text-sm mt-3">{description}</p>
    </div>
  );
}