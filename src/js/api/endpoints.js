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
        tasks: {
            sectionTasks: 'crm/tasks/section-tasks/',
            add_task:'crm/tasks/task-new/',
            add_section:'crm/tasks/section-new/',
        },
        projects:
        {
            allprojects:'crm/projects/project-all/',
        }
    },
}; 