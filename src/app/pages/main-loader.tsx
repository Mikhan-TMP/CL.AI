'use client';


import { useEffect, useState } from "react";
import { Spotlight } from "@/app/components/loader";
import { Highlight } from "../components/text-highlighter";
import { MultiStepLoader as Loader } from "../components/steploader";

export default function MainLoader() {
    const [showLoader, setShowLoader] = useState(false);
    const [loaderFinished, setLoaderFinished] = useState(false);

    // Show loader after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoader(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Hide loader after all steps are done
    useEffect(() => {
        if (showLoader) {
            const finishTimer = setTimeout(() => {
                setLoaderFinished(true);
            }, 2000 * 5);
            return () => clearTimeout(finishTimer);
        }
    }, [showLoader]);

    const loadingStates = [
        { text: "Configuring the User Interface" },
        { text: "Loading the AI Model" },
        { text: "Getting the AI to work" },
        { text: "Finalizing Setup" },
        { text: "Ready to Craft Your Cover Letter!" },
    ];

    if (loaderFinished) {
        return null; // Hide Main (loader page) when finished
    }

    return (
        <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            {showLoader && (
                <Loader loadingStates={loadingStates} loading={true} duration={2000} />
            )}
            <Spotlight />
            <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
                <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                    Craft Smarter Cover Letters <br /> with
                    <Highlight className="text-black dark:text-white">
                        AI Precision
                    </Highlight>
                </h1>
                <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
                    Generate personalized, professional cover letters in seconds — tailored to your skills, the role, and the company. 
                </p>
            </div>
        </div>
    );
}