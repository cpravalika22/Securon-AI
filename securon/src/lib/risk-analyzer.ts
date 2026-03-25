/**
 * @fileOverview A prototype keyword-based risk analyzer for incident reports.
 * 
 * This module provides simple heuristic-based analysis to categorize and 
 * assess the risk level of incident descriptions.
 */

export interface RiskAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Harassment' | 'Bullying' | 'Abuse' | 'Threat' | 'Other';
  suggestedRole: 'mentor' | 'hod' | 'safety';
}

const HIGH_RISK_KEYWORDS = [
  "suicide", "kill", "death", "rape", "attack", "threat", "weapon", "acid", "murder"
];

const MEDIUM_RISK_KEYWORDS = [
  "harassment", "bullying", "abuse", "blackmail", "stalking", "intimidation"
];

const LOW_RISK_KEYWORDS = [
  "rude", "misbehavior", "argument", "noise", "disturbance"
];

/**
 * Analyzes a description to determine risk level and category.
 * @param description The incident description text.
 */
export function analyzeComplaint(description: string): RiskAnalysis {
  const text = description.toLowerCase();
  let riskLevel: RiskAnalysis['riskLevel'] = 'Low';
  let category: RiskAnalysis['category'] = 'Other';

  // 1. Risk Level Detection
  if (HIGH_RISK_KEYWORDS.some(kw => text.includes(kw))) {
    riskLevel = 'Critical';
  } else if (MEDIUM_RISK_KEYWORDS.some(kw => text.includes(kw))) {
    riskLevel = 'High';
  } else if (LOW_RISK_KEYWORDS.some(kw => text.includes(kw))) {
    riskLevel = 'Medium';
  }

  // 2. Category Detection
  if (text.includes("harassment") || text.includes("bullying")) {
    category = 'Harassment';
  } else if (text.includes("abuse") || text.includes("violence") || text.includes("kill") || text.includes("attack")) {
    category = 'Abuse';
  } else if (text.includes("threat") || text.includes("weapon") || text.includes("murder") || text.includes("suicide")) {
    category = 'Threat';
  }

  // 3. Auto-assign Role logic
  let suggestedRole: RiskAnalysis['suggestedRole'] = 'mentor';
  if (riskLevel === 'Critical') suggestedRole = 'safety';
  else if (riskLevel === 'High') suggestedRole = 'hod';
  else if (riskLevel === 'Medium') suggestedRole = 'mentor';

  return { riskLevel, category, suggestedRole };
}
