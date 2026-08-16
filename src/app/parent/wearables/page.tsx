import Image from "next/image";
import { Card, CardTitle } from "@/components/Card";
import { connectDeviceAction, disconnectDeviceAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { getDevices } from "@/lib/store";

export const dynamic = "force-dynamic";

const WEARABLE_OPTIONS = [
  { brand: "Apple", label: "Apple Watch" },
  { brand: "Garmin", label: "Garmin" },
  { brand: "Oura", label: "Oura" },
  { brand: "Fitbit", label: "Fitbit" },
];

const DEVICE_IMAGE: Record<string, string> = {
  Apple: "/images/devices/apple-watch.png",
  Garmin: "/images/devices/garmin.png",
  Oura: "/images/devices/oura.png",
  Fitbit: "/images/devices/fitbit.png",
};

export default function WearablesPage() {
  const devices = getDevices();
  const connectedBrands = new Set(devices.map((d) => d.brand));

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-[1.8rem] font-semibold">Wearables</h1>

      <div className="space-y-4">
        {devices.map((device) => {
          const image = DEVICE_IMAGE[device.brand];

          return (
            <Card key={device.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {image && (
                    <Image
                      src={image}
                      alt={device.model}
                      width={64}
                      height={64}
                      className="rounded-lg object-contain border border-border bg-white shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-medium">{device.model}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {device.brand} · {device.deviceId} · connected {formatDate(device.createdAt)}
                    </p>
                  </div>
                </div>
                <form action={disconnectDeviceAction}>
                  <input type="hidden" name="id" value={device.id} />
                  <button className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0 whitespace-nowrap">
                    Disconnect
                  </button>
                </form>
              </div>
            </Card>
          );
        })}

        {devices.length === 0 && (
          <Card>
            <p className="text-sm text-muted-foreground text-center py-6">No devices connected yet.</p>
          </Card>
        )}
      </div>

      <Card>
        <CardTitle>Connect a device</CardTitle>
        <div className="grid sm:grid-cols-2 gap-3">
          {WEARABLE_OPTIONS.map(({ brand, label }) => {
            const connected = connectedBrands.has(brand);
            return (
              <form key={brand} action={connectDeviceAction}>
                <input type="hidden" name="brand" value={brand} />
                <button
                  type="submit"
                  disabled={connected}
                  className="w-full rounded-xl border border-border p-4 text-left hover:border-ring/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {connected ? "Connected" : "Tap to connect"}
                  </p>
                </button>
              </form>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
