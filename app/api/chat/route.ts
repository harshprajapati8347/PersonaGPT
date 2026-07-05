import { NextRequest, NextResponse } from "next/server";

import { openai } from "@/lib/openai";
import { personas } from "@/lib/personas";

export async function POST(req: NextRequest) {
    try {
        const { persona, messages } = await req.json();

        const response = await openai.chat.completions.create({
            model: "gpt-5.5",
            messages: [
                {
                    role: "system",
                    content: personas[persona as keyof typeof personas],
                },
                ...messages,
            ],
        });

        return NextResponse.json({
            message: response.choices[0].message.content,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Something went wrong.",
            },
            {
                status: 500,
            }
        );
    }
}