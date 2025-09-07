"use client";

import { useState } from "react";
import { Navbar, NavBody, NavItems, NavbarButton, NavbarLogo, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle } from "../components/navbar";
import { FloatingDock } from "../components/dock";
import { MultiStepLoader as Loader } from "../components/steploader";
import { AnimatePresence, motion } from "framer-motion";
import jsPDF from "jspdf";
import  MultiStepDetailForm  from "../components/multistep-form";
import { IconBulbFilled, IconCopy, IconDownload, IconEdit, IconInputAi, IconLink, IconListLetters, IconRefresh, IconUpload } from "@tabler/icons-react";
import { PlaceholdersAndVanishInput } from "../components/mainform";
import { BackgroundRippleEffect } from "../components/background.ripple";

const navItems = [
    {
    name: "Features",
    link: "#features",
    },
    {
    name: "Pricing",
    link: "#pricing",
    },
    {
    name: "Tools",
    link: "#tools",
    },
];

const placeholders = [
    "Generate a cover letter for a Junior Java Developer role",
    "Write a cover letter highlighting React and Node.js experience",
    "Create a cover letter for a fresh graduate applying to Oracle",
    "Draft a cover letter for a Software Engineer internship",
    "Write a professional cover letter emphasizing teamwork and leadership",
];

const detailSteps = [
    {
        step: 1,
        title: "Personal Information",
        fields: [
        { label: "Full Name", type: "text", placeholder: "e.g., John Doe", required: true },
        { label: "Email Address", type: "email", placeholder: "e.g., johndoe@email.com", required: true },
        { label: "Phone Number", type: "tel", placeholder: "e.g., +1 234 567 8900", required: false },
        { label: "Location", type: "text", placeholder: "e.g., New York, USA", required: false },
        ],
    },
    {
        step: 2,
        title: "Job Application Details",
        fields: [
        { label: "Job Title Applying For", type: "text", placeholder: "e.g., Software Engineer", required: true },
        { label: "Company Name", type: "text", placeholder: "e.g., OpenAI", required: true },
        { label: "Why Do You Want This Role?", type: "textarea", placeholder: "Brief motivation (2–3 sentences)", required: true },
        ],
    },
    {
        step: 3,
        title: "Professional Background",
        fields: [
        { label: "Current Job Title / Status", type: "text", placeholder: "e.g., Junior Developer / Fresh Graduate", required: false },
        { label: "Years of Experience", type: "number", placeholder: "e.g., 3", required: false },
        { label: "Education / Degree", type: "text", placeholder: "e.g., B.S. in Computer Science", required: false },
        { label: "Key Skills", type: "text", placeholder: "e.g., JavaScript, React, SQL", required: true },
        ],
    },
    {
        step: 4,
        title: "Extra Details",
        fields: [
        { label: "Notable Achievements", type: "textarea", placeholder: "e.g., Increased sales by 30% in one year", required: false },
        { label: "Referral / Connection", type: "text", placeholder: "e.g., Referred by Jane Doe", required: false },
        { label: "Availability / Start Date", type: "text", placeholder: "e.g., Immediately / 2 weeks notice", required: false },
        { label: "Preferred Tone", type: "select", options: ["Formal", "Professional", "Enthusiastic", "Casual"], required: true },
        { label: "Custom Closing Line", type: "textarea", placeholder: "e.g., I’d love the chance to discuss how my skills align with your goals.", required: false },
        ],
    },
];



const loadingStates = [
  { text: "Initializing magic ✨" },
  { text: "Warming up the AI engines..." },
  { text: "Analyzing your details..." },
  { text: "Crafting professional wording..." },
  { text: "Polishing your cover letter..." },
  { text: "Done! Your letter is ready 🎉" },
];


export default function Main() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [responseData, setResponseData] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailedModalOpen, setDetailedModalOpen] = useState(false);
    const [urlModalOpen, setUrlModalOpen] = useState(false);
    const [uploadResumeModalOpen, setUploadResumeModalOpen] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [copied, setCopied] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [editedText, setEditedText] = useState<string>(""); 

    type UrlScrapeResult = {
        title?: string;
        company?: string;
        location?: string;
        description?: string;
        [key: string]: any;
    };

    const [urlInput, setUrlInput] = useState(""); // Add this
    const [urlResult, setUrlResult] = useState<string | UrlScrapeResult | null>(null); // Add this
    const [urlLoading, setUrlLoading] = useState(false); // Add this

    const handleDockClick = (title: string) => {
        if (title === "Generated Letter") {
            setModalOpen(true);
        }
        else if (title === "Detailed Input") {
            setDetailedModalOpen(true);
        }
        else if (title === "Enter URL") {
            setUrlModalOpen(true);
        }
        else if (title === "Upload Resume") {
            setUploadResumeModalOpen(true);
        }
    };

    const handleChange = () => {} // If not used
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = (e.target as HTMLFormElement).querySelector("input") as HTMLInputElement;
        const prompt = input?.value;
        if (!prompt) return;
        setShowLoader(true); 
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            setResponseData(data.result || "No output received");
        } catch (err) {
            setResponseData("Error generating letter.");
        } finally {
            setShowLoader(false); 
            setModalOpen(true); 
        }
    }

    const handleDetailFormSubmit = async (formData: Record<string, string>) => {
        const prompt = `
        Generate a cover letter for the position of ${formData["Job Title Applying For"]} at ${formData["Company Name"]}.
        Applicant: ${formData["Full Name"]}, Email: ${formData["Email Address"]}, Phone: ${formData["Phone Number"]}, Location: ${formData["Location"]}.
        Motivation: ${formData["Why Do You Want This Role?"]}
        Current Job: ${formData["Current Job Title / Status"]}, Experience: ${formData["Years of Experience"]}, Education: ${formData["Education / Degree"]}, Skills: ${formData["Key Skills"]}.
        Achievements: ${formData["Notable Achievements"]}, Referral: ${formData["Referral / Connection"]}, Availability: ${formData["Availability / Start Date"]}, Tone: ${formData["Preferred Tone"]}, Closing: ${formData["Custom Closing Line"]}
                `.trim();

        setShowLoader(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            setResponseData(data.result || "No output received");
        } catch (err) {
            setResponseData("Error generating letter.");
        } finally {
            setShowLoader(false);
            setModalOpen(true);
            setDetailedModalOpen(false);
        }
    };

    const handleCopy = async () => {
        if (responseData) {
            try {
                await navigator.clipboard.writeText(responseData);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500); 
            } catch (err) {
            }
        }
    };

    const handleDownload = () => {
        if (!responseData) return;
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
        });

        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(responseData, 500);
        doc.text(splitText, 40, 100);

        doc.save("cover-letter.pdf");
    };

    const handleEdit = () => {
        setEditedText(responseData || "");
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        setResponseData(editedText);
        setIsEditing(false);
    };

    const handleUrlScrape = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!urlInput) return;
        setUrlLoading(true);
        setUrlResult(null);
        try {
            const res = await fetch("/api/scrape-url/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: urlInput }),
            });
            const data = await res.json();
            // Accept both string and object results
            setUrlResult(data.result || "No information found.");
        } catch (err) {
            setUrlResult("Error scraping the URL.");
        } finally {
            setUrlLoading(false);
        }
    };

    return (
        <div className="h-screen w-full relative pt-5 overflow-hidden">
            {showLoader && (
                <Loader loadingStates={loadingStates} loading={true} duration={2000} />
            )}
            <div className=" absolute w-full ">
                <Navbar>
                    {/* Desktop Navigation */}
                    <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        <NavbarButton variant="secondary">Contact</NavbarButton>
                        <NavbarButton variant="primary">Login</NavbarButton>
                    </div>
                    </NavBody>
            
                    {/* Mobile Navigation */}
                    <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                        isOpen={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>
            
                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                        <a
                            key={`mobile-link-${idx}`}
                            href={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="relative text-neutral-600 dark:text-neutral-300"
                        >
                            <span className="block">{item.name}</span>
                        </a>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                        <NavbarButton
                            onClick={() => setIsMobileMenuOpen(false)}
                            variant="primary"
                            className="w-full"
                        >
                            Contact
                        </NavbarButton>
                        <NavbarButton
                            onClick={() => setIsMobileMenuOpen(false)}
                            variant="primary"
                            className="w-full"
                        >
                            Login 
                        </NavbarButton>
                        </div>
                    </MobileNavMenu>
                    </MobileNav>
                </Navbar>
            </div>
            <div className="flex h-screen flex-col justify-center items-center px-4 bg-none"> 
                <h2 className="mb-5 sm:mb-10 text-3xl text-center sm:text-5xl dark:text-white text-black">
                    Create Your Perfect Cover Letter in Seconds
                </h2>
                <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                />
            </div>
            <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
                <div className="px-2 py-2 rounded-md text-black dark:text-white text-center relative ">
                    <div className="px- py-2 rounded-md text-black dark:text-white text-center relative ">
                        <FloatingDock
                            items={[
                                { title: "Generated Letter", icon: <IconListLetters className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
                                { title: "Detailed Input", icon: <IconInputAi className="h-full w-full text-neutral-500 dark:text-neutral-300"/>, href: "#" },
                                { title: "Enter URL", icon: <IconLink className="h-full w-full text-neutral-500 dark:text-neutral-300"/>, href: "#" },
                                { title: "Upload Resume", icon: <IconUpload className="h-full w-full text-neutral-500 dark:text-neutral-300"/>, href: "#" },
                            ]}
                            onItemClick={handleDockClick}
                        />
                    </div>
                    <AnimatePresence>
                    {modalOpen &&
                        <motion.div
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                    backdropFilter: "blur(10px)",
                                }}
                                exit={{
                                    opacity: 0,
                                    backdropFilter: "blur(0px)",
                                }}
                                className="fixed p-3 [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full  flex items-center justify-center z-50"
                                >
                            <motion.div 
                                initial={{
                                opacity: 0,
                                scale: 0.5,
                                rotateX: 40,
                                y: 40,
                                }}
                                animate={{
                                opacity: 1,
                                scale: 1,
                                rotateX: 0,
                                y: 0,
                                }}
                                exit={{
                                opacity: 0,
                                scale: 0.8,
                                rotateX: 10,
                                }}
                                transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 15,
                                }}
                                className="min-h-[50%] max-h-[100%] md:max-w-[40%] bg-white dark:bg-neutral-950 border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden">
                                <div className="flex flex-col flex-1 p-8 md:p-10">
                                    <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                                        {responseData ? "Application Letter Generated" : "Waiting for Inspiration 💡"}
                                    </h4>
                                    <div className="flex justify-center items-center  ">
                                        {responseData ? (
                                            isEditing ? (
                                                <div className="w-full">
                                                    <textarea
                                                        className="w-full h-[40vh] p-2  rounded resize-none text-sm dark:bg-neutral-900 dark:text-white text-black"
                                                        value={editedText}
                                                        onChange={e => setEditedText(e.target.value)}
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <button 
                                                            onClick={() => setIsEditing(false)}
                                                            className="bg-gray-200 text-black dark:bg-neutral-800 dark:text-white px-4 py-1 rounded  border-gray-300 text-sm mr-2"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="bg-black text-white dark:bg-white/80 dark:text-black px-4 py-1 rounded border border-black text-sm"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <pre className="max-h-[60vh] overflow-y-auto overflow-x-auto p-2 whitespace-pre-wrap text-sm text-left dark:text-white text-black w-full">
                                                    {responseData}
                                                </pre>
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full p-6 text-center bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">
                                                <span className="text-4xl mb-2">📝✨</span>
                                                <span className="text-lg font-semibold text-gray-700 dark:text-neutral-200 mb-1">
                                                    No letter generated yet!
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-neutral-400">
                                                    Please enter your details and click <b>Generate</b> to create your cover letter.
                                                </span>
                                                <div className="mt-4 p-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded">
                                                    <IconBulbFilled className="inline mr-2" size={16} />
                                                    <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                                                        Pro Tip: Be specific about the job role and skills you want to highlight!
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="gap-4 flex justify-end p-4 bg-gray-100 dark:bg-neutral-900">
                                    <button 
                                        onClick={() => setModalOpen(false)}
                                        className="cursor-pointer px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
                                        Back
                                    </button>
                                    <button
                                        className={`cursor-pointer bg-black text-white dark:bg-white/80 dark:text-black text-[12px] px-2 py-1 rounded-md border border-black w-28 flex items-center justify-center ${!responseData ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={!responseData}
                                        title={!responseData ? "No letter to refresh" : ""}
                                    >
                                        <IconRefresh className="inline" size={16} />
                                        {!responseData && <span className="text-xs"></span>}
                                    </button>
                                    <button
                                        onClick={handleCopy} 
                                        className={`cursor-pointer bg-black text-white dark:bg-white/80 dark:text-black text-[12px] px-2 py-1 rounded-md border border-black w-28 flex items-center justify-center ${!responseData ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={!responseData}
                                        title={!responseData ? "No letter to copy" : ""}
                                    >
                                        <IconCopy className="inline " size={16} />
                                        <span className="text-xs ml-2">
                                            {copied && responseData ? "Copied!" : ""}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleEdit}
                                        className={`cursor-pointer bg-black text-white dark:bg-white/80 dark:text-black text-[12px] px-2 py-1 rounded-md border border-black w-28 flex items-center justify-center ${!responseData || isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={!responseData || isEditing}
                                        title={!responseData ? "No letter to edit" : ""}
                                    >
                                        <IconEdit className="inline" size={16} />
                                        {!responseData && <span className="text-xs"></span>}
                                    </button>
                                    <button
                                        onClick={handleDownload} // <-- Add this
                                        className={`cursor-pointer justify-center items-center flex bg-black text-white dark:bg-white/80 dark:text-black text-[12px] px-2 py-1 rounded-md border border-black w-28 ${!responseData ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={!responseData}
                                        title={!responseData ? "No letter to download" : ""}
                                    >
                                        <IconDownload className="inline " size={16} />
                                        {!responseData && <span className="text-xs"></span>}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    }
                    {detailedModalOpen && 
                        <motion.div initial={{ opacity: 0, }} animate={{ opacity: 1, backdropFilter: "blur(10px)", }} exit={{ opacity: 0, backdropFilter: "blur(0px)", }} className="fixed p-3 [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full  flex items-center justify-center z-50" >
                            <motion.div  initial={{ opacity: 0, scale: 0.5, rotateX: 40, y: 40, }} animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, }} exit={{ opacity: 0, scale: 0.8, rotateX: 10, }} transition={{ type: "spring", stiffness: 260, damping: 15, }} className="min-h-[50%] max-h-[100%] md:max-w-[40%] bg-white dark:bg-neutral-950 border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden">
                                <div className="flex flex-col flex-1 p-8 md:p-10">
                                    <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                                        Tell Us About You ✍️
                                    </h4>
                                    <div className="flex justify-center items-center  ">
                                        <div className="w-full max-h-[65vh] data-text overflow-y-scroll p-2  rounded resize-none text-sm dark:bg-neutral-900 dark:text-white text-black">
                                        <MultiStepDetailForm 
                                            steps={detailSteps}
                                            onClose={() => setDetailedModalOpen(false)}
                                            onSubmitForm={handleDetailFormSubmit}
                                        />
                                        </div>
                                    </div>
                                </div>
                                <div className="gap-4 flex justify-end p-4 bg-gray-100 dark:bg-neutral-900">
                                    <button 
                                        onClick={() => setDetailedModalOpen(false)}
                                        className="cursor-pointer px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
                                        Back
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    }
                    {urlModalOpen &&
                        <motion.div initial={{ opacity: 0, }} animate={{ opacity: 1, backdropFilter: "blur(10px)", }} exit={{ opacity: 0, backdropFilter: "blur(0px)", }} className="fixed p-3 [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full  flex items-center justify-center z-50" >
                            <motion.div  initial={{ opacity: 0, scale: 0.5, rotateX: 40, y: 40, }} animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, }} exit={{ opacity: 0, scale: 0.8, rotateX: 10, }} transition={{ type: "spring", stiffness: 260, damping: 15, }} className="min-h-[50%] max-h-[100%] md:max-w-[40%] bg-white dark:bg-neutral-950 border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden">
                                <div className="flex flex-col flex-1 p-8 md:p-10">
                                    <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                                        Feed Us the Job Description 📝
                                    </h4>
                                    <div className="flex flex-col items-center justify-center mb-4">
                                        <IconLink size={32} className="mb-2 text-gray-400 dark:text-neutral-500" />
                                        <p className="text-sm text-gray-600 dark:text-neutral-300 text-center">
                                            <span className="font-semibold">Heads up!</span> URL job description extraction is temporarily unavailable.<br />
                                            Please try again soon or use another input method.
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <div className="w-full max-h-[65vh] data-text p-2 rounded resize-none text-sm dark:bg-neutral-900 dark:text-white text-black">
                                            <form onSubmit={handleUrlScrape}>
                                                <input
                                                    type="url"
                                                    className="w-full p-2  rounded dark:bg-neutral-800 dark:text-white text-black"
                                                    placeholder="e.g., https://company.com/job/software-engineer"
                                                    required
                                                    value={urlInput}
                                                    onChange={e => setUrlInput(e.target.value)}
                                                />
                                            </form>
                                            <div>
                                                <span className="text-[10px] text-gray-500 dark:text-neutral-400">
                                                    Please ensure the URL is publicly accessible.
                                                </span>
                                            </div>
                                            <div className="mt-2 max-h-[40vh] overflow-y-auto">
                                                {urlLoading && <span>Scraping...</span>}
                                                {urlResult && (
                                                    typeof urlResult === "string" ? (
                                                        <pre className="bg-gray-100 dark:bg-neutral-800 p-2 rounded text-xs whitespace-pre-wrap">{urlResult}</pre>
                                                    ) : (
                                                        <div className="bg-gray-100 dark:bg-neutral-800 p-2 rounded text-xs whitespace-pre-wrap text-left">
                                                            {urlResult.title && <div><b>Title:</b> {urlResult.title}</div>}
                                                            {urlResult.company && <div><b>Company:</b> {urlResult.company}</div>}
                                                            {urlResult.location && <div><b>Location:</b> {urlResult.location}</div>}
                                                            {urlResult.description && (
                                                                <div className="mt-2">
                                                                    <b>Description:</b>
                                                                    <div>{urlResult.description}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="gap-4 flex justify-end p-4 bg-gray-100 dark:bg-neutral-900">
                                    <button 
                                        onClick={() => setUrlModalOpen(false)}
                                        className="cursor-pointer px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleUrlScrape}
                                        className={`cursor-pointer bg-black text-white dark:bg-white/90 dark:text-black text-[12px] px-2 py-1 rounded-md border border-black w-28 flex items-center justify-center ${!urlInput || urlLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        // disabled={!urlInput || urlLoading}>
                                        disabled={true}>

                                        <span className="text-xs">
                                            {urlLoading ? "Sending..." : "Send"}
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    }
                    {uploadResumeModalOpen &&
                        <motion.div initial={{ opacity: 0, }} animate={{ opacity: 1, backdropFilter: "blur(10px)", }} exit={{ opacity: 0, backdropFilter: "blur(0px)", }} className="fixed p-3 [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full  flex items-center justify-center z-50" >
                            <motion.div  initial={{ opacity: 0, scale: 0.5, rotateX: 40, y: 40, }} animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, }} exit={{ opacity: 0, scale: 0.8, rotateX: 10, }} transition={{ type: "spring", stiffness: 260, damping: 15, }} className="min-h-[50%] max-h-[100%] md:max-w-[40%] bg-white dark:bg-neutral-950 border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden">
                                <div className="flex flex-col flex-1 p-8 md:p-10">
                                    <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                                        Drop Your Resume Here 📂
                                    </h4>
                                    <div className="flex justify-center items-center  ">
                                        <div className="w-full max-h-[65vh] data-text p-2 rounded resize-none text-sm dark:bg-neutral-900 dark:text-white text-black">
                                            <div className="flex flex-col items-center justify-center mb-4">
                                                <IconUpload size={32} className="mb-2 text-gray-400 dark:text-neutral-500" />
                                                <p className="text-sm text-gray-600 dark:text-neutral-300 text-center">
                                                    <span className="font-semibold">Heads up!</span> Resume upload is temporarily unavailable.<br />
                                                    Please try again soon or use another input method.
                                                </p>
                                            </div>
                                            <div className="flex justify-center items-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg h-32">
                                                <span className="text-sm text-gray-500 dark:text-neutral-400">
                                                    Drag & drop your resume here, or click to select a file
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="gap-4 flex justify-end p-4 bg-gray-100 dark:bg-neutral-900">
                                    <button 
                                        onClick={() => setUploadResumeModalOpen(false)}
                                        className="cursor-pointer px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
                                        Back
                                    </button>
                                    <button
                                        className={`cursor-pointer bg-black text-white dark:bg-white/90 dark:text-black text-[12px] px-2 py-1 rounded-md border border-black w-28 flex items-center justify-center }`}>
                                        <span className="text-xs">
                                            Send
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    }
                    </AnimatePresence>
                </div>
            </div>
            <BackgroundRippleEffect  />
        </div>
    )
}