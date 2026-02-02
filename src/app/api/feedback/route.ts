import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { rating, comment, okrData, persona } = body;

    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      );
    }

    // Save feedback to Firebase
    const feedbackData = {
      rating,
      comment: comment || "",
      okrObjective: okrData?.objective || "",
      personaCode: persona?.code || "",
      personaName: persona?.name || "",
      userId: session?.user?.id || "anonymous",
      userEmail: session?.user?.email || "anonymous",
      userName: session?.user?.name || "anonymous",
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("feedbacks").add(feedbackData);

    return NextResponse.json({
      success: true,
      feedbackId: docRef.id,
      message: "피드백이 성공적으로 저장되었습니다.",
    });
  } catch (error) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: "피드백 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
