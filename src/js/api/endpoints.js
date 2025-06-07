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
    studentsMe: 'expert_system/students/me/',
    companies: 'expert_system/companies/',
    companiesMe: 'expert_system/companies/me/',
    skills: 'expert_system/skills/',
    userSkills: 'expert_system/user-skills/',
    myVacancies: 'expert_system/companies/my-vacancies/',
    roles: 'expert_system/roles/',
    trajectorySteps: 'expert_system/trajectory-steps/',
    orientationTests: 'expert_system/orientation-tests/',
    orientationQuestions: 'expert_system/orientation-questions/',
    orientationAnswers: 'expert_system/orientation-answers/',
    orientationResults: 'expert_system/orientation-results/',
    orientationUserAnswers: 'expert_system/orientation-user-answers/',

    skillTests: 'expert_system/skill-tests/',
    skillQuestions: 'expert_system/skill-questions/',
    skillAnswers: 'expert_system/skill-answers/',
    testResults: 'expert_system/test-results/',

    vacancies: 'expert_system/vacancies/',
    vacancySkills: 'expert_system/vacancy-skills/',
    applications: 'expert_system/applications/',

    setUserSkills: 'expert_system/set-user-skills',
    getUserSkills: 'expert_system/get-user-skills',

    getAllTests: 'expert_system/get-all-tests',
    createTest: 'expert_system/create-test',
    deleteTest:'expert_system/delete-test',
    getTest:'expert_system/get-test',
    updateTest:'expert_system/patch-test',
    getSkillsForCreate:'expert_system/get-skills-for-create-test',
    getSkillsForRedact:'expert_system/get-skills-for-redact-test',
    getTestIdBySkill:'expert_system/get-test-id-by-skill',
    getTestForRedact:'expert_system/get-test-for-redact',
    evaluateTest: 'expert_system/evaluate-test',
    saveOrientationTestResult: 'expert_system/orientation-test-results/',
    saveBestRoleToStudent: 'expert_system/students/me/set-role/', 
    setStudentRole: 'expert_system/students/me/set-role/'
  }
};
