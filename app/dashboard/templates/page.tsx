import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import TemplateCard from "@/components/TemplateCard"

export default async function TemplatesPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    /* ignore decryption errors */
  }

  if (!session?.user) redirect("/login")

  // Get all events for the user
  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    include: { template: true },
    orderBy: { createdAt: "desc" },
  })

  const safeEvents = events
    .filter((event) => Boolean(event.id))
    .map((event) => ({
    id: event.id,
    name: event.name,
    createdAt: event.createdAt,
    template: event.template
      ? {
          name: event.template.name,
          bgImageUrl: event.template.bgImageUrl,
          fields: Array.isArray(event.template.fields) ? event.template.fields : [],
          eventId: event.template.eventId,
        }
      : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Certificate Templates</h1>
        <p className="text-sm text-[var(--color-neon-muted)] mt-1">
          Create and manage certificate layouts for your events
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-neon-surface)] rounded-xl border border-[var(--color-neon-border)]">
          <p className="text-[var(--color-neon-muted)] text-lg mb-4">No events yet</p>
          <p className="text-sm text-[var(--color-neon-muted)] mb-6">Create an event first to start building templates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeEvents.map((event) => (
            <TemplateCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
