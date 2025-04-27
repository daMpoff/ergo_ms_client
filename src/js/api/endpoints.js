export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },

    learning_analytics: {
        tables: 'learning_analytics/tables/',
        clearTables: 'learning_analytics/tables/clear/',

        employers: {
            get: 'learning_analytics/employers/',
            create: 'learning_analytics/employers/',
            update: (pk) => `learning_analytics/employers/${pk}/`,
            delete: (pk) => `learning_analytics/employers/${pk}/`,
        },

        specialities: {
            get: 'learning_analytics/data_formalization_submodule/specialities/',
            create: 'learning_analytics/data_formalization_submodule/specialities/',
            update: (pk) => `learning_analytics/data_formalization_submodule/specialities/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/specialities/${pk}/`,
        },
        curriculums: {
            get: 'learning_analytics/data_formalization_submodule/curriculums/',
            create: 'learning_analytics/data_formalization_submodule/curriculums/',
            update: (pk) => `learning_analytics/data_formalization_submodule/curriculums/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/curriculums/${pk}/`,
        },
        technologies: {
            get: 'learning_analytics/data_formalization_submodule/technologies/',
            create: 'learning_analytics/data_formalization_submodule/technologies/',
            update: (pk) => `learning_analytics/data_formalization_submodule/technologies/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/technologies/${pk}/`,
        },
        competencies: {
            get: 'learning_analytics/data_formalization_submodule/competencies/',
            create: 'learning_analytics/data_formalization_submodule/competencies/',
            update: (pk) => `learning_analytics/data_formalization_submodule/competencies/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/competencies/${pk}/`,
        },
        baseDisciplines: {
            get: 'learning_analytics/data_formalization_submodule/base_disciplines/',
            create: 'learning_analytics/data_formalization_submodule/base_disciplines/',
            update: (pk) => `learning_analytics/data_formalization_submodule/base_disciplines/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/base_disciplines/${pk}/`,
        },
        disciplines: {
            get: 'learning_analytics/data_formalization_submodule/disciplines/',
            create: 'learning_analytics/data_formalization_submodule/disciplines/',
            update: (pk) => `learning_analytics/data_formalization_submodule/disciplines/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/disciplines/${pk}/`,
        },
        vacancies: {
            get: 'learning_analytics/data_formalization_submodule/vacancies/',
            create: 'learning_analytics/data_formalization_submodule/vacancies/',
            update: (pk) => `learning_analytics/data_formalization_submodule/vacancies/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/vacancies/${pk}/`,
        },
        acms: {
            get: 'learning_analytics/data_formalization_submodule/acms/',
            create: 'learning_analytics/data_formalization_submodule/acms/',
            update: (pk) => `learning_analytics/data_formalization_submodule/acms/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/acms/${pk}/`,
        },
        vcms: {
            get: 'learning_analytics/data_formalization_submodule/vcms/',
            create: 'learning_analytics/data_formalization_submodule/vcms/',
            update: (pk) => `learning_analytics/data_formalization_submodule/vcms/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/vcms/${pk}/`,
        },
        ucms: {
            get: 'learning_analytics/data_formalization_submodule/ucms/',
            create: 'learning_analytics/data_formalization_submodule/ucms/',
            update: (pk) => `learning_analytics/data_formalization_submodule/ucms/${pk}/`,
            delete: (pk) => `learning_analytics/data_formalization_submodule/ucms/${pk}/`,
        },
    },
};