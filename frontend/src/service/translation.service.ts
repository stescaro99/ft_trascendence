import itTranslations from '../utils/lang/it.ts';
import enTranslations from '../utils/lang/en.ts';
import frTranslations from '../utils/lang/fr.ts';

export class TranslationService {
    private translations = {
        en: enTranslations,
        it: itTranslations,
		fr: frTranslations
    };

    private currentLang: string;
    
    // Constructor receives the parameter
    constructor(lang: string) {
        this.currentLang = lang;
    }
    
    // setLanguage(lang: string) {
    //     this.currentLang = lang;
    // }
    
    translateTemplate(template: string): string {
        const translations = this.translations[this.currentLang];
        return template.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
            const value = this.getNestedValue(translations, key);
            return value || match;
        });
    }
    
    private getNestedValue(obj: any, path: string): string | undefined {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}
