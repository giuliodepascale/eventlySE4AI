"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";
import { SafeEvent } from "@/app/types";
import { buildDateFilter, transformMongoDocToSafeEvent, transformMongoEvents } from "@/lib/utils";

export async function getEventsByOrganization(
  organizationId: string,
  limit = 6,
  page = 1
): Promise<{ events: SafeEvent[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const client = await clientPromise;
  const db = client.db();
  const offset = (page - 1) * limit;

  const where = {
    organizationId: ObjectId.createFromHexString(organizationId),
    eventDate: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  };

  const rawEvents = await db
    .collection("events")
    .find(where)
    .sort({ eventDate: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const total = await db.collection("events").countDocuments(where);

  const events = transformMongoEvents(rawEvents);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventById(id: string): Promise<SafeEvent | null> {
  const client = await clientPromise;
  const db = client.db();
  const rawDoc = await db
    .collection("events")
    .findOne({ _id: ObjectId.createFromHexString(id) });

  if (!rawDoc) return null;
  return transformMongoDocToSafeEvent(rawDoc);
}

export async function getEvents(): Promise<SafeEvent[]> {
  const client = await clientPromise;
  const db = client.db();
  const rawDocs = await db.collection("events").find().toArray();
  return transformMongoEvents(rawDocs);
}

export async function getAllEvents(
  query = "",
  limit = 6,
  page = 1,
  category = "",
  dateFilter = ""
): Promise<{ events: SafeEvent[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const client = await clientPromise;
  const db = client.db();
  const offset = (page - 1) * limit;
  const dateFilterCondition = buildDateFilter(dateFilter);

  const filters: any = { ...dateFilterCondition };
  if (query) filters.title = { $regex: query, $options: "i" };
  if (category) filters.category = category;

  const rawEvents = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const total = await db.collection("events").countDocuments(filters);

  const events = transformMongoEvents(rawEvents);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllActiveEvents(
  query = "",
  limit = 6,
  page = 1,
  category = "",
  dateFilter = ""
): Promise<{ events: SafeEvent[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const client = await clientPromise;
  const db = client.db();
  const offset = (page - 1) * limit;
  const dateFilterCondition = buildDateFilter(dateFilter);

  const filters: any = { status: "ACTIVE", ...dateFilterCondition };
  if (query) filters.title = { $regex: query, $options: "i" };
  if (category) filters.category = category;

  const rawEvents = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const total = await db.collection("events").countDocuments(filters);

  const events = transformMongoEvents(rawEvents);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllActiveEventsNoLimits(
  query = "",
  category = "",
  dateFilter = ""
): Promise<SafeEvent[]> {
  const client = await clientPromise;
  const db = client.db();
  const dateFilterCondition = buildDateFilter(dateFilter);

  const filters: any = { status: "ACTIVE", ...dateFilterCondition };
  if (query) filters.title = { $regex: query, $options: "i" };
  if (category) filters.category = category;

  const rawDocs = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .toArray();

  return transformMongoEvents(rawDocs);
}

export async function getRelatedEventsByCategory(
  category: string,
  limit = 5,
  excludeEventId: string | null = null
): Promise<SafeEvent[]> {
  const client = await clientPromise;
  const db = client.db();

  const filters: any = {
    category,
    status: "ACTIVE",
    eventDate: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  };
  if (excludeEventId) {
    filters._id = { $ne: ObjectId.createFromHexString(excludeEventId) };
  }

  const rawDocs = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .limit(limit)
    .toArray();

  return transformMongoEvents(rawDocs);
}
