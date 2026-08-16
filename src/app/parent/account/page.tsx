import { Card } from "@/components/Card";
import { getParent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function ParentAccountPage() {
  const parent = getParent();

  const fields: [string, string][] = [
    ["Name", parent.name],
    ["Age", String(parent.age)],
    ["Gender", parent.gender],
    ["Email", parent.email],
    ["Phone", parent.phone],
    ["Address", parent.address],
    ["Condition", parent.condition],
    ["Unique parent ID", parent.id],
  ];

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-black/40 dark:text-white/40">{label}</dt>
              <dd className="font-medium mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
