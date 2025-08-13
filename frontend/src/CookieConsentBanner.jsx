import React from "react";
import CookieConsent from "react-cookie-consent";

const CookieConsentBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Aceito"
      cookieName="recruitmentSaaSCookieConsent"
      style={{ background: "#2B373B" }}
      buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
      expires={150}
    >
      Este site usa cookies para garantir que você obtenha a melhor experiência em nosso site.{" "}
      <span style={{ fontSize: "10px" }}>
        <a href="/privacy-policy">Saiba mais</a>
      </span>
    </CookieConsent>
  );
};

export default CookieConsentBanner;


