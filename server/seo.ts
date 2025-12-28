import axios from "axios";
import * as cheerio from "cheerio";

export async function analyzeUrl(url: string) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SEOBot/1.0; +http://example.com)",
      },
    });

    const $ = cheerio.load(data);
    const title = $("title").text() || "";
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1").first().text() || "";
    const h2s: string[] = [];
    $("h2").each((i, el) => {
      h2s.push($(el).text());
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

    // Recommendations
    const recommendations: string[] = [];
    if (!title) recommendations.push("Missing Title Tag");
    if (title.length < 30 || title.length > 60) recommendations.push("Title length should be between 30-60 characters");
    if (!metaDescription) recommendations.push("Missing Meta Description");
    if (!h1) recommendations.push("Missing H1 Tag");
    if (h2s.length === 0) recommendations.push("No H2 Tags found - structure content better");

    // Score calculation (simple)
    let score = 100;
    if (!title) score -= 20;
    if (!metaDescription) score -= 20;
    if (!h1) score -= 20;
    if (h2s.length === 0) score -= 10;
    score = Math.max(0, score);

    return {
      url,
      score,
      title,
      metaDescription,
      h1,
      h2s,
      keywordDensity,
      recommendations,
    };
  } catch (error) {
    console.error("Error analyzing URL:", error);
    throw new Error("Failed to analyze URL");
  }
}
