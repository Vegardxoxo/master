"use server";
import { preferencesSchema } from "@/app/lib/server-actions/zod-schemas";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveDashboardPreferences(data: { preferences: any }) {
  const validated = preferencesSchema.parse(data);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to save preferences");
  }
  const result = await prisma.dashboardPreference.upsert({
    where: {
      userId: session.user.id,
    },
    update: {
      preferences: validated.preferences,
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      preferences: validated.preferences,
    },
  });

  // Revalidate all dashboard pages
  revalidatePath("/dashboard");

  return { success: true, id: result.id };
}

export async function loadDashboardPreferences() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  const preferences = await prisma.dashboardPreference.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!preferences) {
    return { success: false, message: "No preferences found" };
  }

  return {
    success: true,
    preferences: preferences.preferences,
  };
}
