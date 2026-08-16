import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { getAppointment, getDocument } from "@/lib/store";
import type {
  BillContent,
  DocumentContent,
  ImagingResultsContent,
  LabResultsContent,
  ResultFlag,
  VisitSummaryContent,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function isVisitSummary(c: DocumentContent): c is VisitSummaryContent {
  return "reasonForVisit" in c;
}

function isBill(c: DocumentContent): c is BillContent {
  return "lineItems" in c;
}

function isLabResults(c: DocumentContent): c is LabResultsContent {
  return "values" in c;
}

function isImagingResults(c: DocumentContent): c is ImagingResultsContent {
  return "findings" in c;
}

const FLAG_STYLES: Record<ResultFlag, string> = {
  Normal: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  High: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Low: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export default async function DocumentDetailPage({ params }: PageProps<"/parent/documents/[id]">) {
  const { id } = await params;
  const document = getDocument(id);
  if (!document) notFound();

  const appointment = document.appointmentId ? getAppointment(document.appointmentId) : undefined;
  const content = document.content;

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
      <Link href="/parent/documents" className="text-sm text-black/40 hover:underline">
        ← Back to documents
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{document.name}</h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">
              Added {formatDate(document.createdAt)}
              {document.dueDate ? ` · Due ${formatDate(document.dueDate)}` : ""}
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
            {document.type}
          </span>
        </div>

        {appointment && (
          <Link
            href={`/parent/appointments/${appointment.id}`}
            className="inline-block mt-3 text-xs text-black/40 dark:text-white/40 hover:underline"
          >
            Related to: {appointment.name} · {formatDate(appointment.appointmentTime)}
          </Link>
        )}
      </Card>

      {!content && (
        <Card>
          <p className="text-sm text-black/40 dark:text-white/40 text-center py-6">
            No detailed content available for this document.
          </p>
        </Card>
      )}

      {content && isVisitSummary(content) && (
        <Card className="space-y-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-black/40 dark:text-white/40">Provider</dt>
              <dd className="font-medium">{content.provider}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Visit date</dt>
              <dd className="font-medium">{formatDateTime(content.visitDate)}</dd>
            </div>
          </dl>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
              Reason for visit
            </h2>
            <p className="text-sm">{content.reasonForVisit}</p>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-2">
              Vitals
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(content.vitals).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2">
                  <div className="text-xs text-black/50 dark:text-white/50">{label}</div>
                  <div className="text-sm font-semibold mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
              Assessment
            </h2>
            <p className="text-sm">{content.assessment}</p>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
              Plan
            </h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {content.plan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
              Follow-up
            </h2>
            <p className="text-sm">{content.followUp}</p>
          </div>
        </Card>
      )}

      {content && isBill(content) && (
        <Card className="space-y-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-black/40 dark:text-white/40">Provider</dt>
              <dd className="font-medium">{content.provider}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Billed to</dt>
              <dd className="font-medium">{content.payer}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Service date</dt>
              <dd className="font-medium">{formatDate(content.serviceDate)}</dd>
            </div>
            {document.dueDate && (
              <div>
                <dt className="text-black/40 dark:text-white/40">Due date</dt>
                <dd className="font-medium">{formatDate(document.dueDate)}</dd>
              </div>
            )}
          </dl>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-2">
              Charges
            </h2>
            <ul className="divide-y divide-black/5 dark:divide-white/10 text-sm">
              {content.lineItems.map((item) => (
                <li key={item.description} className="py-2 flex items-center justify-between gap-3">
                  <span>{item.description}</span>
                  <span className="font-medium shrink-0">{formatCurrency(item.amount)}</span>
                </li>
              ))}
              {content.insuranceAdjustment !== 0 && (
                <li className="py-2 flex items-center justify-between gap-3 text-black/50 dark:text-white/50">
                  <span>Insurance adjustment</span>
                  <span className="font-medium shrink-0">{formatCurrency(content.insuranceAdjustment)}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
            <span className="text-sm font-medium">Amount due</span>
            <span className="text-lg font-semibold">{formatCurrency(content.amountDue)}</span>
          </div>
        </Card>
      )}

      {content && isLabResults(content) && (
        <Card className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-black/40 dark:text-white/40">Panel</dt>
              <dd className="font-medium">{content.panelName}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Ordered by</dt>
              <dd className="font-medium">{content.orderedBy}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Collected</dt>
              <dd className="font-medium">{formatDateTime(content.collectedDate)}</dd>
            </div>
          </dl>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-black/40 dark:text-white/40 border-b border-black/10 dark:border-white/10">
                  <th className="py-2 font-medium">Test</th>
                  <th className="py-2 font-medium">Result</th>
                  <th className="py-2 font-medium">Reference range</th>
                  <th className="py-2 font-medium text-right">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {content.values.map((v) => (
                  <tr key={v.label}>
                    <td className="py-2 pr-2">{v.label}</td>
                    <td className="py-2 pr-2 font-medium whitespace-nowrap">
                      {v.value} {v.unit}
                    </td>
                    <td className="py-2 pr-2 text-black/50 dark:text-white/50 whitespace-nowrap">{v.referenceRange}</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${FLAG_STYLES[v.flag]}`}>
                        {v.flag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {content && isImagingResults(content) && (
        <Card className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-black/40 dark:text-white/40">Study</dt>
              <dd className="font-medium">{content.studyName}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Ordered by</dt>
              <dd className="font-medium">{content.orderedBy}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Performed</dt>
              <dd className="font-medium">{formatDateTime(content.performedDate)}</dd>
            </div>
          </dl>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
              Findings
            </h2>
            <p className="text-sm">{content.findings}</p>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">
              Impression
            </h2>
            <p className="text-sm">{content.impression}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
