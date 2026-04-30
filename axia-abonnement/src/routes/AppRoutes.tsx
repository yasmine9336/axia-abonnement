import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/routing/ProtectedRoute";
import DashboardLayout from "../components/layout/Dashboard";
import LoadingState from "../components/common/LoadingState";
import { ErrorBoundary } from "../components/feedback/ErrorBoundary";

/* Pages publiques */
const Landing = lazy(() => import("../pages/public/Landing"));

const Login = lazy(() => import("../pages/auth/login/Login"));

const Register = lazy(() => import("../pages/auth/register/Register"));

const ForgotPassword = lazy(
  () => import("../pages/auth/forgot-password/ForgotPassword"),
);

const ResetPassword = lazy(
  () => import("../pages/auth/reset-password/ResetPassword"),
);

const DemandeEnCours = lazy(() => import("../pages/auth/demande-en-cours/DemandeEnCours"));

const ResponsableAccountPayment = lazy(
  () =>
    import("../pages/auth/responsable-account-payment/ResponsableAccountPayment"),
);

/* Pages résultat paiement */
const PaymentSuccess = lazy(() => import("../features/client/PaymentSuccess"));

const PaymentCancel = lazy(() => import("../features/client/PaymentCancel"));

/* Client */
const ClientDashboardHome = lazy(
  () => import("../features/client/dashboard/ClientDashboardHome"),
);

const SubscriptionSection = lazy(
  () => import("../features/client/subscription/SubscriptionSection"),
);

const MesAbonnementsSection = lazy(
  () => import("../features/client/abonnements/MesAbonnementsSection"),
);

const PaiementsSection = lazy(
  () => import("../features/client/paiements/PaiementsSection"),
);

/* Responsable */
const ResponsableDashboardHome = lazy(
  () => import("../features/responsable/dashboard/ResponsableDashboardHome"),
);

const ArchiveSection = lazy(
  () => import("../features/responsable/clients/ArchiveSection"),
);

const ServicesSection = lazy(
  () => import("../features/responsable/services/ServicesSection"),
);

const OffresSection = lazy(
  () => import("../features/responsable/offres/OffresSection"),
);

const SuiviAbonnementsSection = lazy(
  () => import("../features/responsable/abonnements/SuiviAbonnementsSection"),
);

const StaffInbox = lazy(
  () => import("../features/responsable/messages/StaffInbox"),
);

/* Admin */
const AdminDashboardHome = lazy(
  () => import("../features/admin/dashboard/AdminDashboardHome"),
);

const ResponsablesSection = lazy(
  () => import("../features/admin/responsables/ResponsablesSection"),
);

const AbonnementsAdminSection = lazy(
  () => import("../features/admin/abonnements/AbonnementsAdminSection"),
);

const CatalogueAdminSection = lazy(
  () => import("../features/admin/catalogue/CatalogueAdminSection"),
);

const ArchiveAdminSection = lazy(
  () => import("../features/admin/archive/ArchiveAdminSection"),
);

/* Shared */
const ProfileSection = lazy(() => import("../features/shared/profile/ProfileSection"));

const TransactionsSection = lazy(
  () => import("../features/shared/transactions/TransactionsSection"),
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState heightClassName="min-h-screen" />}>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/register/demande-en-cours" element={<DemandeEnCours />} />

        {/* Paiement activation responsable */}
        <Route
          path="/payment/responsable-account"
          element={<ResponsableAccountPayment />}
        />

        {/* Résultat paiement abonnement client */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Résultat paiement activation responsable */}
        <Route
          path="/payment/responsable-account/success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/payment/responsable-account/cancel"
          element={<PaymentCancel />}
        />

        {/* Dashboard Client */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute roles={["Client"]}>
              <ErrorBoundary>
                <DashboardLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientDashboardHome />} />

          <Route path="subscribe" element={<SubscriptionSection />} />

          <Route
            path="payment"
            element={<Navigate to="/dashboard/client/subscribe" replace />}
          />

          <Route path="subscriptions" element={<MesAbonnementsSection />} />

          <Route path="payments" element={<PaiementsSection />} />

          <Route
            path="history"
            element={<Navigate to="/dashboard/client/payments" replace />}
          />

          <Route path="profile" element={<ProfileSection />} />
        </Route>

        {/* Dashboard Responsable */}
        <Route
          path="/dashboard/responsable"
          element={
            <ProtectedRoute roles={["Responsable"]}>
              <ErrorBoundary>
                <DashboardLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index element={<ResponsableDashboardHome />} />
          <Route path="clients" element={<ArchiveSection />} />
          <Route path="services" element={<ServicesSection />} />
          <Route path="offres" element={<OffresSection />} />

          <Route
            path="suivi-abonnements"
            element={<SuiviAbonnementsSection />}
          />

          <Route path="transactions" element={<TransactionsSection />} />
          <Route path="messages" element={<StaffInbox />} />
          <Route path="profile" element={<ProfileSection />} />
        </Route>

        {/* Dashboard Admin */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <ErrorBoundary>
                <DashboardLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="responsables" element={<ResponsablesSection />} />
          <Route path="abonnements" element={<AbonnementsAdminSection />} />
          <Route path="catalogue" element={<CatalogueAdminSection />} />
          <Route path="archive" element={<ArchiveAdminSection />} />
          <Route path="transactions" element={<TransactionsSection />} />
          <Route path="profile" element={<ProfileSection />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
