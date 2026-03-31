import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import {
  Package,
  Truck,
  MapPin,
  ChevronRight,
  CheckCircle2,
  ChartSpline,
  TestTubeDiagonal,
  CircleAlert,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { OrderType } from '@/servers/types'
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getOrders } from "@/servers/order.functions";
import { formattedDatetime } from "@/lib/utils";
import { getSessionFn } from "@/servers/user.functions";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/tracking/")({
  beforeLoad: async () => {
    const session = await getSessionFn();

    if (!session?.user) {
      throw redirect({
        to: "/login",
      });
    }

    if (session?.user.role === "client") {
      throw redirect({
        to: "/dashboard",
      });
    }

    return {
      session,
    };
  },
  validateSearch: (search) => searchSchema.parse(search),
  loader: async ({ context }) => {
    return { session: context.session, orders: await getOrders() };
  },
  component: TrackingComponent,
});

function TrackingComponent() {
  const { orders } = Route.useLoaderData();

  const { q } = useSearch({ from: "/tracking/" });
  const navigate = useNavigate({ from: "/tracking/" });

  const [includeCanceled, setIncludeCanceled] = useState(false);
  const [includeAnalyzed, setIncludeAnalyzed] = useState(false);

  // Handle input changes
  const handleSearch = (val: string) => {
    navigate({
      search: (prev) => ({ ...prev, q: val || undefined }),
      replace: true, // Prevents flooding browser history
    });
  };

  // Filter logic
  // const filteredOrders = (orders ?? [])
  //   .filter((order) => {
  //     // 1. Create a list of statuses we want to HIDE
  //     const hiddenStatuses: string[] = []
  //     if (!includeCanceled) hiddenStatuses.push('canceled')
  //     if (!includeAnalyzed) hiddenStatuses.push('analyzed')

  //     // 2. Only keep the order if its status is NOT in the hidden list
  //     return !hiddenStatuses.includes(order.status)
  //   })
  //   .filter((order) => {
  //     if (!order.lotId) return false

  //     return !q || order.lotId.toUpperCase().includes(q.toUpperCase())
  //   })

  // Apply the 5-item limit only if not searching
  const displayOrders = (orders ?? []).filter((order) => {
    // 1. Prevent crashes: Drop any order that doesn't have a lotId
    if (!order.lotId) return false;

    // 2. Status check
    const hiddenStatuses: string[] = [];
    if (!includeCanceled) hiddenStatuses.push("canceled");
    if (!includeAnalyzed) hiddenStatuses.push("analyzed");

    const isVisibleStatus = !hiddenStatuses.includes(order.status);

    // 3. Search check (We know lotId exists now, so no need for `?.` or `??`)
    const matchesSearch =
      !q || order.lotId.toUpperCase().includes(q.toUpperCase());

    return isVisibleStatus && matchesSearch;
  });

  const statusConfig = {
    shipped: {
      icon: Truck,
      color: "text-blue-500",
      label: "On the Way",
      bg: "bg-blue-50",
    },
    delivered: {
      icon: Package,
      color: "text-blue-500",
      label: "Delivered",
      bg: "bg-slate-50",
    },
    extracted: {
      icon: TestTubeDiagonal,
      color: "text-purple-500",
      label: "Extracted",
      bg: "bg-slate-50",
    },
    distributed: {
      icon: ChartSpline,
      color: "text-purple-500",
      label: "Run distributions",
      bg: "bg-slate-50",
    },
    analyzed: {
      icon: CheckCircle2,
      color: "text-green-500",
      label: "Analyzed",
      bg: "bg-green-50",
    },
    canceled: {
      icon: CircleAlert,
      color: "text-red-500",
      label: "Canceled",
      bg: "bg-red-50",
    },
    default: {
      icon: RefreshCw,
      color: "text-yellow-400",
      label: "Ordered",
      bg: "bg-yellow-40",
    },
  } as const;

  const statusProgress: Record<string, string> = {
    shipped: "5%",
    delivered: "25%",
    extracted: "50%",
    distributed: "75%",
    analyzed: "100%",
    canceled: "0%",
    default: "0%",
  };

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order <span className="italic">Lot ID</span> to see
            real-time updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="canceled-mode"
              checked={includeCanceled}
              onCheckedChange={setIncludeCanceled}
            />
            <Label htmlFor="canceled-mode">Canceled</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="analyzed-mode"
              checked={includeAnalyzed}
              onCheckedChange={setIncludeAnalyzed}
            />
            <Label htmlFor="analyzed-mode">Analyzed</Label>
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="relative group -mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="search-bar"
            placeholder="Search Order Lot ID"
            value={q || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 h-12 text-base shadow-sm focus-visible:ring-primary uppercase"
          />
          {q && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-md"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      {displayOrders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p>No active orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayOrders.map((order) => {
            const config =
              statusConfig[order.status as keyof typeof statusConfig] ??
              statusConfig.default;
            const StatusIcon = config.icon;
            const progressWidth =
              statusProgress[order.status] ?? statusProgress.default;
            return (
              <Card
                key={order.lotId}
                className="overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center p-6">
                  <div className={`p-3 rounded-full ${config.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg uppercase">
                        {order.lotId}
                      </CardTitle>
                      <Badge
                        variant="destructive"
                        className={`${config.bg} ${config.color} text-[16px]`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {order.lastLocation}
                    </CardDescription>
                  </div>
                  <Link
                    to="/tracking/$lotId"
                    params={{ lotId: order.lotId! }}
                    className="block group"
                  >
                    <ChevronRight className="ml-4 mb-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </div>

                {/* Progress Bar Area */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>
                      Order date: {formattedDatetime(order.orderDate)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: progressWidth }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
