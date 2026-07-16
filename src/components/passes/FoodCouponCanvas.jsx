import namoLogo from "../../assets/namogangelogo.webp";

export default function FoodCouponCanvas({
  label = "FOOD COUPON",
  persons = "2 PERSON",
  className = "",
  style = {},
  titleSize = "0.76cm",
  personsSize = "0.43cm",
  logoSrc = namoLogo,
}) {
  return (
    <div
      className={`food-coupon-canvas ${className}`}
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "46% 54%",
        overflow: "hidden",
        background: "#0b3bf4",
        fontFamily: "Arial, Helvetica, sans-serif",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 48% 50%, #ffffff 0%, #fffff4 18%, #ffff00 56%, #f4f100 100%)",
        }}
      >
        <img
          src={logoSrc || namoLogo}
          alt="Namo Gange"
          loading="eager"
          decoding="sync"
          style={{
            width: "76%",
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.95))",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.12cm",
          background: "#083ef5",
          color: "#ffffff",
          textAlign: "center",
          textTransform: "uppercase",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "88%",
            maxWidth: "88%",
            borderBottom: "0.035cm solid #ffffff",
            paddingBottom: "0.04cm",
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "clip",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: personsSize,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0,
            whiteSpace: "nowrap",
            maxWidth: "88%",
            overflow: "hidden",
          }}
        >
          {persons}
        </div>
      </div>
    </div>
  );
}
