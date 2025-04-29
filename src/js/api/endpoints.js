

export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',

    },
    file: 'cms/file/',
    settings: {
        generalSettings: 'cms/general-settings/',
        mediaSettings: 'cms/media-settings/',
        permalinkSettings: 'cms/permalink-settings/',
        emailSettings: 'cms/email-settings/',
        securitySettings: 'cms/security-settings',
        seoSettings: 'cms/seo-settings',
    }
}; 