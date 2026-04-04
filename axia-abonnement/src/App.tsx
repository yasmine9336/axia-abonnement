import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/private_layout/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Landing from "./pages/public/Landing";
import ClientDashboard from "./pages/client/ClientDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ResponsableDashboard from "./pages/responsable/ResponsableDashboard";
import PaymentSuccess from "./pages/client/PaymentSuccess";
import PaymentCancel from "./pages/client/PaymentCancel";

function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      {/* Dashboard Client */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute roles={["Client"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard section="dashboard" />} />
        <Route path="payment" element={<ClientDashboard section="payment" />} />
        <Route
          path="subscriptions"
          element={<ClientDashboard section="subscriptions" />}
        />
        <Route path="history" element={<ClientDashboard section="history" />} />
        <Route path="chat" element={<ClientDashboard section="dashboard" />} />
        <Route path="profile" element={<ClientDashboard section="profile" />} />
      </Route>

      {/* Dashboard Responsable */}
      <Route
        path="/dashboard/responsable"
        element={
          <ProtectedRoute roles={["Responsable"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResponsableDashboard section="dashboard" />} />
        <Route
          path="subscriptions"
          element={<ResponsableDashboard section="subscriptions" />}
        />
        <Route
          path="clients"
          element={<ResponsableDashboard section="clients" />}
        />
        <Route
          path="profile"
          element={<ResponsableDashboard section="profile" />}
        />
        <Route
          path="services"
          element={<ResponsableDashboard section="services" />}
        />
        <Route
          path="offres"
          element={<ResponsableDashboard section="offres" />}
        />
        <Route
          path="suivi-clients"
          element={<ResponsableDashboard section="suivi-clients" />}
        />
        <Route
          path="transactions"
          element={<ResponsableDashboard section="transactions" />}
        />
      </Route>

      {/* Dashboard Admin */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard section="dashboard" />} />
        <Route
          path="responsables"
          element={<AdminDashboard section="responsables" />}
        />
        <Route
          path="abonnements"
          element={<AdminDashboard section="abonnements" />}
        />
        <Route
          path="catalogue"
          element={<AdminDashboard section="catalogue" />}
        />
        <Route path="archive" element={<AdminDashboard section="archive" />} />
        <Route path="profile" element={<AdminDashboard section="profile" />} />
        <Route
          path="transactions"
          element={<AdminDashboard section="transactions" />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
