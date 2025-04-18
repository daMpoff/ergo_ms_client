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
        DatasetsList: 'bi_analysis/bi_datasets/',
        ConnectionsList: 'bi_analysis/bi_connections/',
        ChartsList: 'bi_analysis/bi_charts/',
        Upload: 'bi_analysis/bi_datasets/upload/',
        UploadedFiles: 'bi_analysis/bi_datasets/user-files/',
    }
}; 