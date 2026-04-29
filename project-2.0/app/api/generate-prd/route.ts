import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { context, businessGoal, targetAudience, proposedSolution, technicalConstraints } = await request.json();

    if (!context || !businessGoal || !targetAudience || !proposedSolution ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set in environment variables.' }, { status: 500 });
    }

    const systemPrompt = `You are an elite senior product manager with 10+ years of experience.

Your task is to generate a comprehensive, highly-structured Product Requirements Document (PRD).

Inputs Provided:
* Problem / Context: ${context}
* Business Goal: ${businessGoal}
* Target Audience: ${targetAudience}
* Proposed Solution: ${proposedSolution}
* Tech & Constraints: ${technicalConstraints || "None specified"}

Instructions:
* You MUST output the PRD using EXACTLY the template structure below.
* Use Markdown headings (H2 or H3) for the headers so they format beautifully.
* Be specific, practical, realistic, and do not use vague fluff.
* Prioritize one persona as requested in the template.

--- OUTPUT TEMPLATE (STRICT) ---

## 🔹 0. Problem Statement
Write the problem statement clearly.

## 🔹 1. Context
Overview of the situation and background
### 1.1 Current Scenario
Existing processes / how the problem is currently handled
### 1.2 Shortcomings
Gaps, inefficiencies, and challenges

## 🔹 2. Objectives / Goals
### 2.1 Business Objectives
Business impact and strategic goals
### 2.2 User Objectives
User benefits and experience improvements

## 🔹 3. User Persona
Persona details including Background, Needs, Frustrations, and Goals.
**➡️ Prioritised Persona Rationale**: Explain why this persona is the highest priority.

## 🔹 4. User Stories
Written for the prioritised persona (Min 5).
Format: As a [user], I want [feature], so that [benefit]

## 🔹 5. User Flow
A clear, step-by-step textual description of the visual user journey.

## 🔹 6. Requirements
### 6.1 Technical Requirements
Tech stack, integrations
### 6.2 Design Requirements
UI/UX, branding
### 6.3 Functional Requirements
Core features
### 6.4 Non-functional Requirements
Performance, security, scalability

## 🔹 7. Wireframe & Prototype
A textual description of what the key screens/wireframes should contain.

## 🔹 8. Edge Cases
List rare, unusual, or error scenarios to build for.

## 🔹 9. Success Metrics
KPIs formatted clearly detailing: Metric, Frequency, Baseline, Target.`;

    // Talk to Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Currently supported Groq model
        messages: [{ role: "system", "content": systemPrompt }],
        temperature: 0.5,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      return NextResponse.json(
        { error: `Groq API error: ${errorText}` },
        { status: groqRes.status }
      );
    }

    const data = await groqRes.json();
    return NextResponse.json({ result: data.choices[0].message.content });
  } catch (error: any) {
    console.error('PRD Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during generation' },
      { status: 500 }
    );
  }
}
