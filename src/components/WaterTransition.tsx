import { motion } from "framer-motion";
import { ReactNode } from "react";

const WaterTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, filter: "blur(8px)", y: 30, scale: 0.98 }}
    animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
    exit={{ opacity: 0, filter: "blur(6px)", y: -20, scale: 1.02 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default WaterTransition;
