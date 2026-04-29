import { useState, useEffect } from "react";
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import api from "../lib/api";

const SocialSidebar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://www.facebook.com/namogangewellness.event",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const fetchSocialLinks = async () => {
      try {
        const response = await api.get("/api/social-media");
        if (response.data && response.data.success) {
          const data = response.data.data;
          setSocialLinks({
            facebook: data.facebook || "https://www.facebook.com/namogangewellness.event",
            instagram: data.instagram || "https://instagram.com",
            twitter: data.twitter || "https://twitter.com",
            youtube: data.youtube || "https://youtube.com",
            linkedin: data.linkedin || "https://linkedin.com",
          });
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    };
    fetchSocialLinks();

    return () => clearTimeout(timer);
  }, []);

  const socialData = [
    { icon: Facebook, url: socialLinks.facebook, color: "#1877F2", label: "Facebook" },
    { icon: Instagram, url: socialLinks.instagram, color: "#E4405F", label: "Instagram" },
    { icon: Twitter, url: socialLinks.twitter, color: "#000000", label: "Twitter" },
    { icon: Youtube, url: socialLinks.youtube, color: "#FF0000", label: "YouTube" },
    { icon: Linkedin, url: socialLinks.linkedin, color: "#0A66C2", label: "LinkedIn" },
  ];

  return (
    <>
      <style>{`
        @keyframes fallIn {
          from { transform: translateY(-100px) rotate(-180deg) scale(0.3); opacity: 0; }
          to { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes iconSpin {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1.1); }
        }
        .social-item {
          animation: fallIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: calc(var(--index) * 0.12s + 0.2s);
          opacity: 0;
        }
        .social-item.visible { opacity: 1; }
        .social-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: white;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1.5px solid;
          transition: all 0.3s;
          overflow: hidden;
        }
        .social-button:hover { transform: scale(1.1); }
        .social-item:hover .social-button { animation: iconSpin 0.6s ease-in-out; }
      `}</style>

      <div className="hidden lg:flex flex-col gap-2 fixed right-2 top-1/2 -translate-y-1/2 z-[1000]">
        {socialData.map((social, index) => {
          const Icon = social.icon;
          return (
            <div
              key={index}
              className={`social-item ${isVisible ? "visible" : ""}`}
              style={{ "--index": index }}
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-button"
                style={{ borderColor: social.color }}
              >
                <Icon size={16} style={{ color: social.color }} />
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default SocialSidebar;
