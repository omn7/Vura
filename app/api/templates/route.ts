import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { nonEmptyString } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (e) {
      console.warn("Session invalid or decryption failed", e)
    }

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    const body = await req.json()
    const { name, eventId, bgImageUrl, fields } = body

    if (!name || !eventId || !bgImageUrl || !fields) {
      return NextResponse.json(
        { error: "Missing required fields: name, eventId, bgImageUrl, fields" },
        { status: 400 }
      )
    }

    const nameValidation = nonEmptyString("Template name").safeParse(name)
    if (!nameValidation.success) {
      return NextResponse.json(
        { error: nameValidation.error.errors[0].message },
        { status: 400 }
      )
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: "fields must be an array" }, { status: 400 })
    }

    // Verify event belongs to current user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const existing = await prisma.template.findUnique({ where: { eventId } })

    // Upsert template (create or update if already exists for this event)
    const trimmedName = name.trim()

    const template = await prisma.template.upsert({
      where: { eventId },
      update: {
        name: trimmedName,
        bgImageUrl,
        fields,
        updatedAt: new Date(),
      },
      create: {
        name: trimmedName,
        eventId,
        bgImageUrl,
        fields,
      },
    })

    return NextResponse.json(template, { status: existing ? 200 : 201 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Template save failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
