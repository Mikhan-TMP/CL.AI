"use client";
import { useState } from "react";
import MainLoader from "./pages/main-loader";
import Main from "./pages/main";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [loaderFinished, setLoaderFinished] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!loaderFinished ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, transition: { duration: 0.5 } }}
        >
          <MainLoader onFinish={() => setLoaderFinished(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
          exit={{ opacity: 0 }}
        >
          <Main />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
