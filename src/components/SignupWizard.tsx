"use client";

import { useState } from "react";
import { completeSignupAction } from "@/lib/actions";

const WEARABLES = ["Apple Watch", "Garmin", "Oura", "Fitbit", "Glucose monitor", "None"];

const inputClass =
  "rounded-md border border-input bg-transparent px-3 py-2 text-sm w-full";

export default function SignupWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [rxName, setRxName] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxUnit, setRxUnit] = useState("");
  const [rxFrequency, setRxFrequency] = useState("daily");
  const [wearable, setWearable] = useState("Apple Watch");
  const [inviteContact, setInviteContact] = useState("");

  const steps = ["Parent info", "Conditions & prescriptions", "Wearable", "Invite", "Review"];

  return (
    <div className="space-y-6">
      <ol className="flex items-stretch gap-2 text-xs">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex items-center justify-center text-center px-2.5 py-1 rounded-full ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-3">
          <label className="block text-sm">
            Parent name
            <input className={`${inputClass} mt-1`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </label>
          <label className="block text-sm">
            Age
            <input className={`${inputClass} mt-1`} type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" />
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <label className="block text-sm">
            Pre-existing condition
            <input className={`${inputClass} mt-1`} value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="e.g. Heart Disease" />
          </label>
          <p className="text-xs text-muted-foreground pt-2">Add a current prescription (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <input className={inputClass} value={rxName} onChange={(e) => setRxName(e.target.value)} placeholder="Medicine name" />
            <select className={inputClass} value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input className={inputClass} type="number" value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} placeholder="Dosage" />
            <input className={inputClass} value={rxUnit} onChange={(e) => setRxUnit(e.target.value)} placeholder="Unit (mg, ml...)" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <p className="text-sm mb-2">Link a wearable or monitor</p>
          {WEARABLES.map((w) => (
            <label key={w} className="flex items-center gap-2 text-sm">
              <input type="radio" name="wearable" checked={wearable === w} onChange={() => setWearable(w)} />
              {w}
            </label>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <label className="block text-sm">
            Invite your child (email or phone)
            <input className={`${inputClass} mt-1`} value={inviteContact} onChange={(e) => setInviteContact(e.target.value)} placeholder="child@example.com" />
          </label>
          <p className="text-xs text-muted-foreground">
            Demo mode: no invite email is sent — this just documents the intended flow.
          </p>
        </div>
      )}

      {step === 4 && (
        <form action={completeSignupAction} className="space-y-4">
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="age" value={age} />
          <input type="hidden" name="condition" value={condition} />
          <input type="hidden" name="rxName" value={rxName} />
          <input type="hidden" name="rxDosage" value={rxDosage} />
          <input type="hidden" name="rxUnit" value={rxUnit} />
          <input type="hidden" name="rxFrequency" value={rxFrequency} />

          <dl className="text-sm grid grid-cols-2 gap-2 rounded-md bg-muted p-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{name || "—"}</dd>
            <dt className="text-muted-foreground">Age</dt>
            <dd>{age || "—"}</dd>
            <dt className="text-muted-foreground">Condition</dt>
            <dd>{condition || "—"}</dd>
            <dt className="text-muted-foreground">Prescription</dt>
            <dd>{rxName ? `${rxName} · ${rxDosage}${rxUnit} · ${rxFrequency}` : "—"}</dd>
            <dt className="text-muted-foreground">Wearable</dt>
            <dd>{wearable}</dd>
            <dt className="text-muted-foreground">Invite sent to</dt>
            <dd>{inviteContact || "—"}</dd>
          </dl>

          <button className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium">
            Complete signup
          </button>
        </form>
      )}

      {step < 4 && (
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-sm px-4 py-2 rounded-md border border-border disabled:opacity-30"
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
