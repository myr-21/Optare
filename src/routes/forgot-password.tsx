import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, Field, PrimaryBtn } from "@/components/auth-shell";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a reset link if your email is registered."
      footer={<>Remembered it? <Link to="/login" className="text-primary font-medium hover:underline">Back to login</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="Email" type="email" placeholder="you@domain.com" />
        <PrimaryBtn>Send reset link</PrimaryBtn>
      </form>
    </AuthShell>
  );
}
