import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function cleanText(text: string) {
    return text
        .replace(/\s+/g, " ")
        .replace(/Show more Show less/gi, "")
        .replace(/(Skip to content|Menu|Sign in|Register|Employer site|Job search|Profile|Career advice|Explore companies|Community|New)/gi, "")
        .replace(/(Salary match|Number of applicants|Skills match|Company profile|COMPANY OVERVIEW)/gi, "")
        .replace(/(Your application will include the following questions:)/gi, "")
        .replace(/(html,body\{.*?\})/gi, "") // Remove CSS
        .replace(/[\r\n]+/g, " ")
        .trim();
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json({ result: "Invalid URL" }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117 Safari/537.36",
            },
        });

        if (!response.ok) {
            return NextResponse.json({ result: "Failed to fetch the URL." }, { status: 400 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Try to extract job title
        let title =
            $("h1").first().text().trim() ||
            $("[class*='job-title'], [class*='topcard__title']").first().text().trim();

        // Try to extract company name
        let company =
            $("[class*='company'], [class*='topcard__flavor'], [data-automation='jobCompany']").first().text().trim();

        // Try to extract location
        let location =
            $("[class*='location'], [class*='topcard__flavor--bullet'], [data-automation='jobLocation']").first().text().trim();

        // Try to extract requirements (look for <ul> or <li> under requirements/qualifications)
        let requirements = "";
        const reqSection = $("section:contains('Requirements'), section:contains('Qualifications'), div:contains('Requirements'), div:contains('Qualifications')");
        if (reqSection.length) {
            requirements = reqSection.find("ul, li").text();
        }
        if (!requirements || requirements.length < 30) {
            // Try to find any <ul> or <li> under description
            requirements = $("[class*='requirement'], [class*='qualification']").find("ul, li").text();
        }

        // Try to extract job description
        let description =
            $("[class*='description__text'], [class*='show-more-less-html__markup'], [data-automation='jobAdDetails']").text();

        // If not enough, fall back to main/article
        if (!description || description.trim().length < 100) {
            description = $("main").text() || $("article").text();
        }

        // Still not enough → get the largest section/div
        if (!description || description.trim().length < 100) {
            let largestBlock = "";
            $("section, div").each((_, el) => {
                const text = $(el).text();
                if (text.length > largestBlock.length) largestBlock = text;
            });
            description = largestBlock;
        }

        // Clean up all fields
        title = cleanText(title);
        company = cleanText(company);
        location = cleanText(location);
        description = cleanText(description).slice(0, 2000);
        requirements = cleanText(requirements).slice(0, 1000);

        // Remove duplicate info from description
        if (description.startsWith(title)) description = description.replace(title, "").trim();
        if (description.startsWith(company)) description = description.replace(company, "").trim();

        const result = {
            title: title || null,
            company: company || null,
            location: location || null,
            description: description || "No description found",
            requirements: requirements || null,
        };

        return NextResponse.json({ result });
    } catch (err) {
        return NextResponse.json({ result: "Failed to scrape the URL." }, { status: 500 });
    }
}
