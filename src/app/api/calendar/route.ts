import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    // Get events from the past 2 weeks
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const timeMin = twoWeeksAgo.toISOString();
    const timeMax = now.toISOString();

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "100",
        }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.json();
      console.error("Calendar API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch calendar events", details: errorData },
        { status: calendarResponse.status }
      );
    }

    const calendarData = await calendarResponse.json();

    // Process events to extract relevant information
    const events = (calendarData.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || "제목 없음",
      description: event.description || "",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || "",
      attendees: event.attendees?.length || 0,
    }));

    // Categorize events
    const categorizedEvents = categorizeEvents(events);

    return NextResponse.json({
      events,
      categorized: categorizedEvents,
      totalEvents: events.length,
      period: {
        from: timeMin,
        to: timeMax,
      },
    });
  } catch (error) {
    console.error("Calendar API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 }
    );
  }
}

function categorizeEvents(events: any[]) {
  const categories: Record<string, any[]> = {
    meetings: [],
    tasks: [],
    personal: [],
    other: [],
  };

  events.forEach((event) => {
    const title = event.title.toLowerCase();
    const desc = event.description.toLowerCase();

    if (
      title.includes("회의") ||
      title.includes("미팅") ||
      title.includes("meeting") ||
      title.includes("call") ||
      title.includes("sync") ||
      event.attendees > 1
    ) {
      categories.meetings.push(event);
    } else if (
      title.includes("업무") ||
      title.includes("task") ||
      title.includes("작업") ||
      title.includes("프로젝트") ||
      title.includes("개발")
    ) {
      categories.tasks.push(event);
    } else if (
      title.includes("개인") ||
      title.includes("운동") ||
      title.includes("점심") ||
      title.includes("저녁") ||
      title.includes("약속")
    ) {
      categories.personal.push(event);
    } else {
      categories.other.push(event);
    }
  });

  return categories;
}
