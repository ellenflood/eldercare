import { Card, CardTitle } from "@/components/Card";
import { uploadDocumentAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { getDocuments } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  const documents = getDocuments();

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Documents</h1>

      <Card>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {documents.map((d) => (
            <li key={d.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  Added {formatDate(d.createdAt)}
                  {d.dueDate ? ` · Due ${formatDate(d.dueDate)}` : ""}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
                {d.type}
              </span>
            </li>
          ))}
          {documents.length === 0 && <p className="text-sm text-black/40 py-6 text-center">No documents yet.</p>}
        </ul>
      </Card>

      <Card>
        <CardTitle>Upload a document</CardTitle>
        <p className="text-xs text-black/40 dark:text-white/40 mb-3">
          Demo mode: the file itself isn&apos;t stored, only its name and the metadata below.
        </p>
        <form action={uploadDocumentAction} className="grid sm:grid-cols-2 gap-3">
          <input name="file" type="file" className="sm:col-span-2 text-sm" />
          <select name="type" className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm">
            <option value="Bill">Bill</option>
            <option value="Results">Results</option>
            <option value="Visit Summary">Visit Summary</option>
            <option value="Others">Others</option>
          </select>
          <input name="dueDate" type="date" placeholder="Due date (bills only)" className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm" />
          <button className="sm:col-span-2 rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium">
            Upload
          </button>
        </form>
      </Card>
    </div>
  );
}
