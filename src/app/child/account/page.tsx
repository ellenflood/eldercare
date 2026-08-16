import { Card } from "@/components/Card";
import { getChild } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function ChildAccountPage() {
  const child = getChild();

  const fields: [string, string][] = [
    ["Name", child.name],
    ["Age", String(child.age)],
    ["Gender", child.gender],
    ["Email", child.email],
    ["Phone", child.phone],
    ["Address", child.address],
    ["Role", child.role],
    ["Unique child ID", child.id],
  ];

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
      <h1 className="text-[1.8rem] font-semibold">Account</h1>
      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
