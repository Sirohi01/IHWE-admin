import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { heroApi, SERVER_URL, FRONTEND_URL } from "../lib/api";

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await heroApi.getAll();
        if (data && data.length > 0) {
          const now = new Date().getTime();
          const activeSlides = data.filter((s) => {
            if (!s.isActive) return false;
            if (s.schedule?.startDate && s.schedule?.startTime) {
              const startDateTime = new Date(s.schedule.startDate + 'T' + s.schedule.startTime).getTime();
              const endDateTime = s.schedule.endDate && s.schedule.endTime
                ? new Date(s.schedule.endDate + 'T' + s.schedule.endTime).getTime()
                : null;
              if (now < startDateTime) return false;
              if (endDateTime && now > endDateTime) return false;
            }
            return true;
          });
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      } catch (error) {
        console.error("Failed to fetch slides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      z: 0,
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http") || image.startsWith("data:")) return image;
    const cleanPath = image.startsWith("/") ? image : "/" + image;
    return `${SERVER_URL}${cleanPath}`;
  };

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden bg-slate-900 flex items-center justify-center rounded-2xl mb-8 shadow-xl" style={{ aspectRatio: '21/7' }}>
        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-black font-inter text-white mb-8 shadow-2xl" style={{ aspectRatio: '16/6' }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 200, damping: 30 },
            opacity: { duration: 0.8 },
            scale: { duration: 1.2 },
          }}
          className="absolute inset-0 z-0"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "easeOut" }}
          >
            <img
              src={getImageUrl(slides[current].image)}
              alt={slides[current].title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 container mx-auto px-10 h-full flex flex-col justify-center items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-10 h-[1px] bg-white/40" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-white/90 flex items-center gap-2">
                <Sparkles size={12} className="text-white/70" />
                {slides[current].subtitle}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9 }}
              className="font-bold leading-[1.05] tracking-tight text-white uppercase text-3xl md:text-4xl lg:text-5xl mb-6"
              dangerouslySetInnerHTML={{ __html: slides[current].title }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9 }}
              className="font-light mb-10 max-w-2xl text-white/85 leading-relaxed tracking-wide text-base"
              dangerouslySetInnerHTML={{ __html: slides[current].description }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9 }}
              className="flex flex-row gap-4 items-center"
            >
              {slides[current].button1Name && (
                <a
                  href={slides[current].button1Url?.startsWith('http') ? slides[current].button1Url : `${FRONTEND_URL}${slides[current].button1Url || '/'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl px-6 py-2.5 bg-[#d26019] text-white hover:bg-[#23471d] transition-all duration-500 uppercase tracking-[0.15em] text-[9px] font-bold border-2 border-white shadow-[0_8px_20px_rgba(210,96,25,0.2)] flex items-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {slides[current].button1Name}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 bg-black/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </a>
              )}

              {slides[current].button3Name && (
                <a
                  href={slides[current].button3Url?.startsWith('http') ? slides[current].button3Url : `${FRONTEND_URL}${slides[current].button3Url || '/'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl px-6 py-2.5 bg-[#134698] text-white hover:bg-black transition-all duration-500 uppercase tracking-[0.15em] text-[9px] font-bold border-2 border-white shadow-[0_8px_20px_rgba(19,70,152,0.2)] flex items-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {slides[current].button3Name}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </a>
              )}

              {slides[current].button2Name && (
                <a
                  href={slides[current].button2Url?.startsWith('http') ? slides[current].button2Url : `${FRONTEND_URL}${slides[current].button2Url || '/'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl px-6 py-2.5 bg-[#23471d] text-white hover:bg-[#d26019] transition-all duration-500 uppercase tracking-[0.15em] text-[9px] font-bold border-2 border-white shadow-[0_8_20px_rgba(35,71,29,0.2)] flex items-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {slides[current].button2Name}
                    <Sparkles size={11} className="group-hover:rotate-180 transition-transform duration-500" />
                  </span>
                  <span className="absolute inset-0 bg-[#d26019] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </a>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </section>
  );
};

export default HeroCarousel;
