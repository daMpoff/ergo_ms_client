export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },
    crm: {
        monthlyStats: 'crm/stats/monthly/',
        priorityStats: 'crm/stats/priority/',
        efficiencyStats: 'crm/stats/efficiency/',
        sectionStats: 'crm/stats/sections/'
    },
};
