export const endpoints = {
  auth: {
    login: 'cms/adp/authorization/',
    validateRegistration: 'cms/adp/validate_registration/',
    sendCode: 'cms/adp/send_code/',
    verifyCode: 'cms/adp/verify_code/',
    registration: 'cms/adp/registration/',
    protected: 'cms/adp/protected/',
  },
  cms: {
        checkAccessToPage: 'cms/check_access_to_page/',
        checkAccessToComponent: 'cms/check_access_to_component/',
        checkAccessToAdminPanel: 'cms/check_access_to_admin_panel/',
        
        addGroupCategory: 'cms/post_group_category/',
        changeGroupCategory: 'cms/change_group_category/',
        deleteGroupCategory: 'cms/delete_group_category/',
        getGroupCategories: 'cms/get_group_categories/',
        
        addGroup: 'cms/add_group/',
        deleteGroup: 'cms/delete_group/',
        getGroups: 'cms/get_groups/',
        changeGroup: 'cms/change_group/',

        addPermission: 'cms/add_permission/',
        deletePermission: 'cms/delete_permission/',
        changePermission: 'cms/change_permission/',
        getPermissions: 'cms/get_permissions/',

        addUserPermission: 'cms/add_user_permission/',
        removeUserPermission: 'cms/remove_user_permission/',
        addUserGroup: 'cms/add_user_group/',
        removeUserGroup: 'cms/remove_user_group/',
        getUserGroupsAndPermissions: 'cms/get_user_groups_and_permissions/',
        getUserGroups: 'cms/get_user_groups/',
        getUserPermissions: 'cms/get_user_permissions/',

        addGroupsPermissions: 'cms/add_groups_permissions/',
        removeGroupsPermissions: 'cms/remove_groups_permissions/',
        getPermissionsByCategory: 'cms/get_permissions_by_category/',
        getUserName: 'cms/get_user_name/',
        getpages:'cms/get-cms-pages',
        putpages:'cms/put-cms-pages',
        getClosedPages: 'cms/get-closed-pages/',
        
        addPageComponent: 'cms/add-page-component/',
        removePageComponent: 'cms/remove-page-component/',
        updatePageComponent: 'cms/update-page-component/',
        getPageComponents: 'cms/get-page-components/'
    },
    expert_system: {
        studyGroups: 'expert_system/study-groups/',
        students: 'expert_system/students/',
        studentsMe: 'expert_system/students/me/',
        companies: 'expert_system/companies/',
        companiesMe: 'expert_system/companies/me/',
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
        orientationUserAnswers: 'expert_system/orientation-answers/',
        setUserSkillTest: 'expert_system/set-user-skill-test',
        getUserSkillTest: 'expert_system/get-user-skill-tests',
        getUserSkills: 'expert_system/get-user-skills'

    }
};
