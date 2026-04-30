import type { Role } from "../types";

interface RoleSwitchProps {
  role: Role;
  onSelectRole: (role: Role) => void;
}

export default function RoleSwitch({ role, onSelectRole }: RoleSwitchProps) {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-6">
      {(["Client", "Responsable"] as Role[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelectRole(item)}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={
            role === item
              ? { background: "var(--color-primary)", color: "white" }
              : { color: "#6b7280" }
          }
        >
          {item === "Client" ? "Je suis Client" : "Je suis Responsable"}
        </button>
      ))}
    </div>
  );
}