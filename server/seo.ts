import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type SuggestInput } from "@shared/schema";

export async function analyzeUrl(url: string) {
  try {
    const start = Date.now();
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOBot/1.0; +http://example.com)",
      },
    });
    const loadTime = Date.now() - start;

    const $ = cheerio.load(data);
    const title = $("title").text() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1Count = $("h1").length;
    const h1 = $("h1").first().text() || "";
    const h2s: string[] = [];
    $("h2").each((i, el) => {
      h2s.push($(el).text());
    });

    // Image Analysis
    const images: { src: string; alt: string; hasAlt: boolean }[] = [];
    $("img").each((i, el) => {
      const src = $(el).attr("src") || "";
      const alt = $(el).attr("alt") || "";
      images.push({ src, alt, hasAlt: !!alt });
    });

    // Link Analysis
    const links: { href: string; text: string; type: "internal" | "external" }[] = [];
    const domain = new URL(url).hostname;
    $("a").each((i, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      let type: "internal" | "external" = "external";
      if (href.startsWith("/") || href.includes(domain)) {
        type = "internal";
      }
      links.push({ href, text, type });
    });

    // Keyword density (simple implementation)
    const textContent = $("body").text().replace(/\s+/g, " ").toLowerCase();
    const words = textContent.split(" ").filter((w) => w.length > 3);
    const totalWords = words.length;
    const wordCounts: Record<string, number> = {};
    words.forEach((w) => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    const keywordDensity: Record<string, number> = {};
    Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([word, count]) => {
        keywordDensity[word] = parseFloat(((count / totalWords) * 100).toFixed(2));
      });

    // Recommendations & Scoring
    const recommendations: string[] = [];

    // Technical Checks
    if (!title) recommendations.push("Missing Title Tag");
    else if (title.length < 30 || title.length > 60) recommendations.push("Title length should be 30-60 chars");

    if (!metaDescription) recommendations.push("Missing Meta Description");
    else if (metaDescription.length < 50 || metaDescription.length > 160) recommendations.push("Meta Description should be 50-160 chars");

    if (h1Count === 0) recommendations.push("Missing H1 Tag");
    else if (h1Count > 1) recommendations.push("Multiple H1 Tags found (should be exactly one)");

    if (h2s.length === 0) recommendations.push("No H2 Tags found - improve structure");

    const missingAlts = images.filter(img => !img.hasAlt).length;
    if (missingAlts > 0) recommendations.push(`${missingAlts} images missing Alt Text`);

    if (loadTime > 2000) recommendations.push(`Slow load time detected (${loadTime}ms)`);

    // Score calculation
    let score = 100;
    if (!title) score -= 15;
    if (!metaDescription) score -= 15;
    if (h1Count !== 1) score -= 15;
    if (h2s.length === 0) score -= 5;
    if (missingAlts > 0) score -= Math.min(10, missingAlts * 2);
    if (loadTime > 1000) score -= 10;
    if (loadTime > 3000) score -= 10;

    score = Math.max(0, score);
    const performanceScore = Math.max(0, 100 - Math.floor(loadTime / 50)); // Rough estimate

    return {
      url,
      score,
      title,
      metaDescription,
      h1,
      h2s,
      images,
      links,
      loadTime,
      performanceScore,
      keywordDensity,
      recommendations,
    };
  } catch (error: any) {
    console.error("Error analyzing URL:", error.message);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403 || error.response?.status === 429) {
        throw new Error("BOT_PROTECTION");
      }
      if (error.code === 'ENOTFOUND') {
        throw new Error("INVALID_URL");
      }
    }
    throw new Error("Failed to analyze URL");
  }
}

// Initialize Gemini Client

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function clusterKeywords(keywords: string[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an expert SEO strategist. 
      Analyze the following list of keywords and group them into semantic topic clusters.
      For each keyword, determine:
      1. Search Intent (Informational, Navigational, Commercial, or Transactional)
      2. Estimated Difficulty (Easy, Medium, Hard, or Very Hard) - estimate based on keyword length and specificity.
      3. Cluster Name (a short, descriptive name for the group)
      4. Pillar Page Topic (the broader topic this keyword belongs to)

      Return the result as a JSON array of objects with keys: "keyword", "intent", "difficulty", "cluster", "pillarPage".
      Do not include markdown code blocks. Just the raw JSON.

      Keywords:
      ${keywords.join("\n")}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error clustering keywords:", error);
    throw new Error("Failed to cluster keywords");
  }
}

export async function generateContentBrief(keyword: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Create a detailed SEO content brief for the target keyword: "${keyword}".
      Return the result as a JSON object with the following keys:
      - "keyword": "${keyword}"
      - "h1": A compelling H1 header
      - "titleTag": An optimized Title Tag (max 60 chars)
      - "outline": An array of H2 and H3 headings (e.g. ["H2: ...", "H3: ..."])
      - "entities": An array of 5-10 semantic entities (related keywords/concepts) to include.

      Do not include markdown code blocks. Just the raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error generating brief:", error);
    throw new Error("Failed to generate brief");
  }
}

export async function optimizeContent(content: string) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBFvpkHZswFcEEdzt8BB22Hl1EdoHEoqu8";
    const model = new GoogleGenerativeAI(API_KEY).getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert SEO editor using the 'Keyword Map' technique.
      Rewrite the following blog post content to be more SEO-friendly.
      
      Tasks:
      1. Improve keyword density naturally.
      2. Enhance readability and flow.
      3. Insert relevant LSI keywords where appropriate.
      4. Fix any grammatical errors.
      
      Return the result as a JSON object with the following keys:
      - "optimizedContent": The full rewritten text (formatted with markdown if needed, but primarily plain text/paragraphs).
      - "changes": An array of strings describing specifically what keywords were added or what major changes were made (e.g., "Inserted keyword 'organic traffic' in paragraph 2").
      - "usedKeywords": An array of specific keywords that were naturally integrated into the text during this optimization.

      Do not include markdown code blocks for the JSON itself. Just the raw JSON.
      
      Content:
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error optimizing content:", error);
    // Explicitly fail if AI fails - NO MOCK
    throw new Error("AI Optimization Failed: " + (error instanceof Error ? error.message : "Unknown Error"));
  }
}

export async function generateSeoSuggestions(input: SuggestInput) {
  try {


    // Construct Prompt based on Mode
    let systemPrompt = "";
    let userPrompt = "";

    switch (input.mode) {
      case "research":
        systemPrompt = `You are a Senior SEO Strategist acting as a high-end SaaS consultant. Use the user's business context to find high-value opportunities.`;
        userPrompt = `
          Analyze Keyword: "${input.keyword}"
          Market: ${input.country} (${input.language})
          Business Type: ${input.businessType}
          Intent: ${input.intent}

          Return JSON:
          {
            "strategy": ["3 bullet points on high-level strategy"],
            "marketAnalysis": "Brief market overview (2 lines)",
            "primaryKeyword": { "term": "${input.keyword}", "volume": "Est. Monthly Vol", "difficulty": "Low/Med/High" },
            "secondaryKeywords": [{"term": "...", "intent": "...", "difficulty": "..."} (5 items)],
            "longTailKeywords": ["..."] (5 items),
            "contentIdeas": [{"title": "...", "type": "Blog/Landing", "audience": "..."} (3 items)],
            "competitorInsights": ["Insight 1", "Insight 2"]
          }
        `;
        break;

      case "website":
        systemPrompt = `You are a Technical SEO Architect specializing in ${input.techStack} environments. Provide specific, actionable technical advice.`;
        userPrompt = `
          Analyze Website: ${input.url || "General Architecture"}
          Tech Stack: ${input.techStack}

          Return JSON:
          {
            "strategy": ["3 technical priority actions"],
            "technicalAudit": [
              {"issue": "Potential Issue 1", "priority": "High", "fix": "Specific fix for ${input.techStack}"},
              {"issue": "Potential Issue 2", "priority": "Medium", "fix": "Fix instructions"},
              {"issue": "Potential Issue 3", "priority": "Low", "fix": "Fix instructions"}
            ]
          }
        `;
        break;

      case "content":
        systemPrompt = `You are an Expert SEO Editor. precision-edit content for rankings and CTR.`;
        userPrompt = `
          Analyze this content:
          "${input.content?.substring(0, 1500) || ''}..."

          Return JSON:
          {
            "strategy": ["3 editorial directives"],
            "contentAnalysis": {
              "score": 0-100,
              "improvedTitle": "Click-worthy SEO Title",
              "metaDescription": "Optimized Meta Description",
              "contentGaps": ["Missing topic 1", "Missing topic 2"],
              "lsiKeywords": ["LSI 1", "LSI 2", "LSI 3"]
            }
          }
        `;
        break;

      case "page":
        systemPrompt = `You are an On-Page SEO Specialist. Optimize specific page elements.`;
        userPrompt = `
          Optimize Page Type: ${input.pageType}
          Target Keyword: ${input.keyword}

          Return JSON:
          {
            "strategy": ["3 on-page priorities"],
            "onPageOptimizations": [
              {"element": "H1 Tag", "suggestion": "Optimization tip..."},
              {"element": "URL Structure", "suggestion": "Optimization tip..."},
              {"element": "Internal Linking", "suggestion": "Optimization tip..."},
              {"element": "Schema Markup", "suggestion": "Optimization tip..."}
            ]
          }
        `;
        break;
    }

    const finalPrompt = `
      ${systemPrompt}
      
      Task:
      ${userPrompt}

      Output: Strict JSON only. No markdown.
    `;

    // FORCE REAL API CALL - NO MOCKS ALLOWED
    // Using user-provided key directly as fallback if env var fails
    const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBFvpkHZswFcEEdzt8BB22Hl1EdoHEoqu8";
    // Switched to gemini-2.0-flash as 1.5/pro are not available for this key
    const model = new GoogleGenerativeAI(API_KEY).getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(responseText);

  } catch (error) {
    console.error("Error generating suggestions:", error);
    // Return a structured error that the UI can show, rather than a generic throw
    // identifying if it was a key issue or parsing issue could be helpful
    throw new Error("AI Generation Failed: " + (error instanceof Error ? error.message : "Unknown Error"));
  }
}
