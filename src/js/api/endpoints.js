export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },
    expert_system: {
        studyGroups: 'expert_system/study-groups/',
        students: 'expert_system/students/',
        companies: 'expert_system/companies/',
        skills: 'expert_system/skills/',
        userSkills: 'expert_system/user-skills/',
        roles: 'expert_system/roles/',
        trajectorySteps: 'expert_system/trajectory-steps/',
        orientationTests: 'expert_system/orientation-tests/',
        orientationQuestions: 'expert_system/orientation-questions/',
        orientationAnswers: 'expert_system/orientation-answers/',
        skillTests: 'expert_system/skill-tests/',
        skillQuestions: 'expert_system/skill-questions/',
        skillAnswers: 'expert_system/skill-answers/',
        testResults: 'expert_system/test-results/',
        vacancies: 'expert_system/vacancies/',
        vacancySkills: 'expert_system/vacancy-skills/',
        applications: 'expert_system/applications/',
        orientationResults: 'expert_system/orientation-results/',
        orientationUserAnswers: 'expert_system/orientation-answers/'
    }
};