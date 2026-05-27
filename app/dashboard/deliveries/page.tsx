import DeliveriesDashboard from "@/components/DeliveriesDashboard";

export const metadata = {
    title: "Delivery Dashboard | Vura",
    description: "Track delivery status, monitor failures, and retry sending certificates.",
};

export default function DeliveriesPage() {
    return <DeliveriesDashboard />;
}
