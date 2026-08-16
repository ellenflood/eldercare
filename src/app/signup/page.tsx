import { Card } from "@/components/Card";
import SignupWizard from "@/components/SignupWizard";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-lg w-full px-4 py-8 space-y-6">
      <div>
        <h1 className="text-[1.8rem] font-semibold">Get started</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A parent or child can start here. This demo writes what you enter onto the seeded
          parent account rather than creating a second one.
        </p>
      </div>
      <Card>
        <SignupWizard />
      </Card>
    </div>
  );
}
