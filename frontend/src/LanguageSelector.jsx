import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Persistir a seleção do idioma
  };

  return (
    <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Idioma" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pt">Português</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;

