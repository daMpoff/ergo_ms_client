export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },
    bi: {
        uploadStorageData: 'bi_analysis/storage_data/upload/',
        getStorageList: 'bi_analysis/storage_data/',
    }
}; 