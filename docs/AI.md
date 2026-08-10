# AI Integration, Extraction Schemas & Grounded Summaries

## Overview

AI serves strictly as decision support. Material approvals, rejections, and lot release decisions require human reviewer authorization.

## Model Configuration

- **Provider**: Google Gemini API (`@google/genai`)
- **Default Extraction Model**: `gemini-1.5-flash`
- **Reasoning Model**: `gemini-1.5-pro`
- **Key Location**: `backend/.env` -> `GEMINI_API_KEY`

## Extraction Pipeline

1. **Intake**: Multi-file document ingestion & SHA256 hashing.
2. **Multimodal OCR & Structured Field Extraction**: Extracts structured fields based on document type (Collection Slip, Test Report, Tanker Log, Invoice).
3. **Confidence Scoring & Routing**:
   - `confidence >= 0.88`: High confidence (NORMAL)
   - `0.70 <= confidence < 0.88`: Medium confidence (REVIEW RECOMMENDED)
   - `confidence < 0.70`: Low confidence (MANDATORY REVIEW & EXCEPTION GENERATION)
4. **Grounded AI Summaries**: Generates executive summaries strictly citing observed document fields and validation rule outputs. Does NOT invent information or hallucinate facts.
5. **Human Override Auditing**: Manual corrections log `ai_overrides` with `field_key`, `ai_value`, `human_value`, `reason`, and `reviewer_id`.
